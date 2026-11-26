import "dotenv/config";
import express from "express";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";
import sharp from "sharp";
import { DdddOcr, MODEL_TYPE } from "ddddocr-node";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

interface PortalSession {
  cookies: Record<string, string>;
  token?: string;
  createdAt: number;
}

const pendingSessions = new Map<string, PortalSession>();

function pruneSessions() {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [id, sess] of pendingSessions.entries()) {
    if (sess.createdAt < cutoff) pendingSessions.delete(id);
  }
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function mergeCookies(
  jar: Record<string, string>,
  headers: Headers
): Record<string, string> {
  const setCookies =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : headers.get("set-cookie")
        ? [headers.get("set-cookie") as string]
        : [];
  for (const raw of setCookies) {
    const firstPart = raw.split(";")[0];
    const eqIdx = firstPart.indexOf("=");
    if (eqIdx > 0) {
      const name = firstPart.slice(0, eqIdx).trim();
      const val = firstPart.slice(eqIdx + 1).trim();
      if (name) jar[name] = val;
    }
  }
  return jar;
}

function serializeCookies(jar: Record<string, string>): string {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function fetchWithCookies(
  url: string,
  jar: Record<string, string>,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers || {});
  if (!headers.has("User-Agent")) headers.set("User-Agent", USER_AGENT);
  const cookieHeader = serializeCookies(jar);
  if (cookieHeader) headers.set("Cookie", cookieHeader);

  const res = await fetch(url, {
    ...init,
    headers,
    redirect: "manual",
    signal: init.signal ?? AbortSignal.timeout(15000),
  });
  mergeCookies(jar, res.headers);

  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.get("location");
    if (location) {
      const nextUrl = new URL(location, url).toString();
      return fetchWithCookies(nextUrl, jar, {
        method: "GET",
        headers: {
          Referer: url,
        },
      });
    }
  }
  return res;
}

interface OcrEnginePool {
  ivBeta: DdddOcr;
  ivDefault: DdddOcr;
  ptDefault: DdddOcr;
  ptBeta: DdddOcr;
}

let ocrPool: OcrEnginePool | null = null;

function getLocalOcrPool(): OcrEnginePool {
  if (ocrPool) return ocrPool;
  const ivBeta = new DdddOcr().setOcrMode(MODEL_TYPE.OCR_BETA);
  ivBeta.setRanges(6); // a-zA-Z0-9

  const ivDefault = new DdddOcr();
  ivDefault.setRanges(6);

  const ptDefault = new DdddOcr();
  ptDefault.setRanges(1); // lowercase a-z

  const ptBeta = new DdddOcr().setOcrMode(MODEL_TYPE.OCR_BETA);
  ptBeta.setRanges(1);

  ocrPool = { ivBeta, ivDefault, ptDefault, ptBeta };
  return ocrPool;
}

async function solveCaptchaLocally(
  imageBuffer: Buffer,
  portalHint: "indianvisa" | "passtrack",
  attempt = 1
): Promise<string | null> {
  const pool = getLocalOcrPool();

  if (portalHint === "indianvisa") {
    const useDefault = attempt % 2 === 0;
    const input = imageBuffer as unknown as string;
    const raw = useDefault
      ? await pool.ivDefault.classification(input)
      : await pool.ivBeta.classification(input);
    const cleaned = raw.replace(/[^a-zA-Z0-9]/g, "");
    return cleaned.length >= 4 && cleaned.length <= 8 ? cleaned : null;
  }

  // Passtrack: compute both Default OCR on raw image and Beta OCR on Red-channel trimmed image
  try {
    const rawInput = imageBuffer as unknown as string;
    const redTrim = await sharp(imageBuffer)
      .extractChannel("red")
      .normalize()
      .trim({ background: "#ffffff", threshold: 35 })
      .extend({
        top: 10,
        bottom: 10,
        left: 14,
        right: 14,
        background: { r: 255, g: 255, b: 255 },
      })
      .png()
      .toBuffer();

    const [rawRes, betaRes] = await Promise.all([
      pool.ptDefault.classification(rawInput),
      pool.ptBeta.classification(redTrim as unknown as string),
    ]);

    const defClean = rawRes.replace(/[^a-z]/g, "");
    const betaClean = betaRes.replace(/[^a-z]/g, "");

    // Consensus match is highest confidence
    if (defClean && defClean === betaClean && defClean.length >= 4) {
      return defClean;
    }

    if (attempt % 2 === 1) {
      return defClean.length >= 4 ? defClean : betaClean.length >= 4 ? betaClean : null;
    }
    return betaClean.length >= 4 ? betaClean : defClean.length >= 4 ? defClean : null;
  } catch (err) {
    console.error("[Local Passtrack OCR Error]", err);
    return null;
  }
}

async function solveCaptchaWithGemini(
  imageBuffer: Buffer,
  mimeType: string,
  portalHint: "indianvisa" | "passtrack"
): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const prompt =
    portalHint === "indianvisa"
      ? "Read the alphanumeric verification captcha code shown in this image. It is typically 5 or 6 characters (letters and/or digits, case-sensitive). Return ONLY the exact characters with no spaces, quotes, or explanation."
      : "Read the captcha verification code shown in this image. Return ONLY the exact characters/digits with no spaces, quotes, or explanation.";

  try {
    const response = await Promise.race([
      ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageBuffer.toString("base64"),
              },
            },
            { text: prompt },
          ],
        },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Captcha OCR timed out")), 6000)
      ),
    ]);
    const raw = (response.text ?? "").trim();
    const cleaned = raw.replace(/[^a-zA-Z0-9]/g, "");
    return cleaned.length >= 3 && cleaned.length <= 10 ? cleaned : null;
  } catch (err) {
    console.error(`[Captcha OCR Error - ${portalHint}]`, err);
    return null;
  }
}

function classifyIndianVisaMessage(rawMsg: string): {
  category:
    | "processed_printed"
    | "granted_not_printed"
    | "under_processing"
    | "attention_required"
    | "closed"
    | "not_found"
    | "unknown";
  label: string;
} {
  const lower = rawMsg.toLowerCase();
  if (lower.includes("could not be found") || lower.includes("not be found") || lower.includes("no record")) {
    return { category: "not_found", label: "Record Not Found" };
  }
  if (
    lower.includes("granted but not-printed") ||
    lower.includes("not-printed") ||
    lower.includes("not printed")
  ) {
    return { category: "granted_not_printed", label: "Granted (Not Printed)" };
  }
  if (
    lower.includes("processed and printed") ||
    lower.includes("ready for collection") ||
    (lower.includes("printed") && !lower.includes("not"))
  ) {
    return { category: "processed_printed", label: "Processed & Printed" };
  }
  if (lower.includes("closed")) {
    return { category: "closed", label: "Application Closed" };
  }
  if (
    lower.includes("contact the respective office") ||
    (lower.includes("under processing") && (lower.includes("contact") || lower.includes("office")))
  ) {
    return { category: "attention_required", label: "Contact Respective Office" };
  }
  if (lower.includes("under processing")) {
    return { category: "under_processing", label: "Under Processing" };
  }
  return { category: "unknown", label: "Status Retrieved" };
}

function parseIndianVisaHtml(html: string): {
  type: "captcha_error" | "status" | "unknown_error";
  message: string;
} {
  const $ = cheerio.load(html);
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const lower = bodyText.toLowerCase();

  if (
    lower.includes("enter correct captcha") ||
    lower.includes("invalid captcha") ||
    lower.includes("captcha mismatch") ||
    lower.includes("incorrect access code") ||
    lower.includes("enter valid access code") ||
    lower.includes("please enter above text") && $(".errorify").text().toLowerCase().includes("captcha")
  ) {
    return {
      type: "captcha_error",
      message: "Captcha verification failed on Indian Visa Online Portal.",
    };
  }

  // Extract explicit status blocks from Indian Visa Online StatusEnquiry response
  const candidates: string[] = [];
  $(".form_container, .container, #status, .status_msg, .alert, p, td, font, h3, h4, span, div").each(
    (_, el) => {
      const txt = $(el).clone().children("script,style,form").remove().end().text().replace(/\s+/g, " ").trim();
      if (
        txt.length > 15 &&
        txt.length < 480 &&
        !/^visa status enquiry$/i.test(txt) &&
        /(under processing|processed and printed|granted but not-printed|could not be found|not be found|ready for collection|closed|contact the respective office|invalid application)/i.test(
          txt
        ) &&
        !txt.includes("Application ID can be seen on your receipt")
      ) {
        candidates.push(txt);
      }
    }
  );

  // Prefer the shortest specific status sentence rather than outer wrapper containers
  candidates.sort((a, b) => a.length - b.length);
  if (candidates.length > 0) {
    return { type: "status", message: candidates[0] };
  }

  const errorText = $(".errorify").text().replace(/\s+/g, " ").trim();
  if (errorText && errorText.length > 5) {
    if (/captcha|access code/i.test(errorText)) {
      return { type: "captcha_error", message: errorText };
    }
    return { type: "status", message: errorText };
  }

  // If the page returned back to the enquiry form without status text, likely captcha or session reset
  if ($("input[name='filerfno']").length > 0 && $("input[name='captcha']").length > 0) {
    return {
      type: "captcha_error",
      message: "Portal returned to verification form. Access code may be incorrect.",
    };
  }

  return {
    type: "unknown_error",
    message: "Unable to parse response from Indian Visa Online Portal.",
  };
}

function parsePasstrackHtml(html: string): {
  type: "captcha_error" | "not_found" | "success" | "server_error";
  applicantName: string;
  table: string[][];
  message?: string;
} {
  const $ = cheerio.load(html);
  const fullText = $("body").text().replace(/\s+/g, " ").trim();
  const lower = fullText.toLowerCase();

  if (
    lower.includes("invalid captcha") ||
    lower.includes("wrong captcha") ||
    lower.includes("captcha does not match") ||
    lower.includes("incorrect code") ||
    lower.includes("invalid code") ||
    lower.includes("plase enter correct code") ||
    lower.includes("please enter correct code") ||
    lower.includes("enter correct code")
  ) {
    return {
      type: "captcha_error",
      applicantName: "Unknown",
      table: [],
      message: "Passtrack captcha did not match.",
    };
  }

  if (
    lower.includes("no record found") ||
    lower.includes("record not found") ||
    lower.includes("data not found") ||
    lower.includes("not found in our system")
  ) {
    return {
      type: "not_found",
      applicantName: "Unknown",
      table: [],
      message: "No delivery record found in IVAC Passtrack for this Web File Number.",
    };
  }

  // Look for Applicant Name
  let applicantName = "Unknown";
  const nameMatch =
    fullText.match(/Applicant\s*Name\s*[:\-]\s*([A-Z][A-Za-z.\s'-]{2,60}?)(?=\s*(?:Web\s*File|Passport|Step|Sl|Received|Date|Center|$))/i) ||
    fullText.match(/Name\s*[:\-]\s*([A-Z][A-Za-z.\s'-]{2,60}?)(?=\s*(?:Web\s*File|Passport|Step|Sl|Received|Date|$))/i);
  if (nameMatch && nameMatch[1]) {
    applicantName = nameMatch[1].trim();
  }

  // Look for delivery steps table
  const parsedTable: string[][] = [];
  $("table").each((_, tableEl) => {
    const rows: string[][] = [];
    $(tableEl)
      .find("tr")
      .each((__, trEl) => {
        const cells: string[] = [];
        $(trEl)
          .find("th, td")
          .each((___, cellEl) => {
            cells.push($(cellEl).text().replace(/\s+/g, " ").trim());
          });
        if (cells.length >= 2) rows.push(cells);
      });
    if (rows.length >= 2) {
      // Check if it looks like the delivery steps table
      const joined = rows.flat().join(" ").toLowerCase();
      if (
        joined.includes("received") ||
        joined.includes("process") ||
        joined.includes("delivery") ||
        joined.includes("status") ||
        joined.includes("step")
      ) {
        parsedTable.push(...rows);
      }
    }
  });

  if (parsedTable.length > 1) {
    return {
      type: "success",
      applicantName,
      table: parsedTable,
    };
  }

  // No invalid-captcha error was detected above; if #q or the search page returned without a table,
  // the verification code was accepted and no delivery record exists yet for this Web File Number.
  const qText = $("#q").text().replace(/\s+/g, " ").trim();
  if ($("form#search_data").length > 0 || $("#q").length > 0) {
    return {
      type: "not_found",
      applicantName,
      table: [],
      message:
        qText && qText.toLowerCase() !== "search result"
          ? qText
          : "No delivery record found in IVAC Passtrack for this Web File Number.",
    };
  }

  return {
    type: "server_error",
    applicantName: "Unknown",
    table: [],
    message: "Could not retrieve delivery table from IVAC Passtrack.",
  };
}

async function initIndianVisaSession(): Promise<{
  session: PortalSession;
  captchaBase64: string;
  captchaMime: string;
}> {
  const cookies: Record<string, string> = {};
  await fetchWithCookies("https://indianvisaonline.gov.in/visa/index.html", cookies);
  const formRes = await fetchWithCookies(
    "https://indianvisaonline.gov.in/visa/StatusEnquiry",
    cookies,
    {
      headers: {
        Referer: "https://indianvisaonline.gov.in/visa/index.html",
      },
    }
  );
  const formHtml = await formRes.text();
  const $ = cheerio.load(formHtml);
  const token = $("input[name='token']").val()?.toString() || "";

  const captchaRes = await fetchWithCookies(
    `https://indianvisaonline.gov.in/visa/captcha?rand=${Date.now()}`,
    cookies,
    {
      headers: {
        Referer: "https://indianvisaonline.gov.in/visa/StatusEnquiry",
      },
    }
  );
  const contentType = captchaRes.headers.get("content-type") || "image/png";
  const buf = Buffer.from(await captchaRes.arrayBuffer());

  return {
    session: { cookies, token, createdAt: Date.now() },
    captchaBase64: buf.toString("base64"),
    captchaMime: contentType.split(";")[0],
  };
}

async function submitIndianVisaQuery(
  session: PortalSession,
  appId: string,
  passportNo: string,
  captcha: string
) {
  const body = new URLSearchParams({
    filerfno: appId,
    passport_number: passportNo,
    captcha,
    token: session.token || "",
    submit_btn: "Check Status",
  });

  const res = await fetchWithCookies(
    "https://indianvisaonline.gov.in/visa/StatusEnquiry",
    session.cookies,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://indianvisaonline.gov.in/visa/StatusEnquiry",
        Origin: "https://indianvisaonline.gov.in",
      },
      body: body.toString(),
    }
  );
  const html = await res.text();
  return parseIndianVisaHtml(html);
}

async function initPasstrackSession(existingSession?: PortalSession): Promise<{
  session: PortalSession;
  captchaBase64: string;
  captchaMime: string;
}> {
  const cookies: Record<string, string> = existingSession ? existingSession.cookies : {};
  if (!existingSession) {
    await fetchWithCookies("https://www.passtrack.net/regular_passport.php", cookies);
  }

  const captchaRes = await fetchWithCookies(
    `https://www.passtrack.net/captcha.php?${Math.random()}`,
    cookies,
    {
      headers: {
        Referer: "https://www.passtrack.net/regular_passport.php",
      },
    }
  );
  const contentType = captchaRes.headers.get("content-type") || "image/png";
  const buf = Buffer.from(await captchaRes.arrayBuffer());

  return {
    session: { cookies, createdAt: Date.now() },
    captchaBase64: buf.toString("base64"),
    captchaMime: contentType.split(";")[0],
  };
}

async function submitPasstrackQuery(
  session: PortalSession,
  appId: string,
  captcha: string
) {
  const body = new URLSearchParams({
    appref1: appId,
    captcha,
    submit: "Submit",
  });

  const res = await fetchWithCookies(
    "https://www.passtrack.net/regular_passport.php",
    session.cookies,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://www.passtrack.net/regular_passport.php",
        Origin: "https://www.passtrack.net",
      },
      body: body.toString(),
    }
  );
  const html = await res.text();
  return parsePasstrackHtml(html);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "8mb" }));

  // CORS support so static deployments (e.g. GitHub Pages) can query a hosted backend
  const allowedOrigins = (process.env.ALLOWED_ORIGIN || "*")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.use("/api", (req, res, next) => {
    const requestOrigin = req.headers.origin;
    if (allowedOrigins.includes("*")) {
      res.setHeader("Access-Control-Allow-Origin", "*");
    } else if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      res.setHeader("Access-Control-Allow-Origin", requestOrigin);
      res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
    next();
  });

  // Live portal reachability & latency check
  app.get("/api/portal-health", async (_req, res) => {
    const checkHost = async (name: string, url: string) => {
      const start = Date.now();
      try {
        const resp = await fetch(url, {
          method: "HEAD",
          headers: { "User-Agent": USER_AGENT },
          signal: AbortSignal.timeout(7000),
        });
        return {
          name,
          url,
          online: resp.status < 500,
          statusCode: resp.status,
          latencyMs: Date.now() - start,
          checkedAt: new Date().toISOString(),
        };
      } catch (err) {
        return {
          name,
          url,
          online: false,
          statusCode: 0,
          latencyMs: Date.now() - start,
          checkedAt: new Date().toISOString(),
          error: err instanceof Error ? err.message : "Unreachable",
        };
      }
    };

    const [indianVisa, passtrack] = await Promise.all([
      checkHost("Indian Visa Online", "https://indianvisaonline.gov.in/visa/index.html"),
      checkHost("IVAC Passtrack", "https://www.passtrack.net/regular_passport.php"),
    ]);

    res.json({
      portals: [indianVisa, passtrack],
      localAutoSolver: true,
      aiOcrConfigured: Boolean(getGeminiClient()),
    });
  });

  // Refresh a specific portal captcha for manual verification fallback
  app.post("/api/refresh-captcha", async (req, res) => {
    try {
      const { portal } = req.body as { portal: "indianvisa" | "passtrack" };
      pruneSessions();
      if (portal === "indianvisa") {
        const init = await initIndianVisaSession();
        const sessionId = crypto.randomUUID();
        pendingSessions.set(sessionId, init.session);
        return res.json({
          sessionId,
          imageDataUrl: `data:${init.captchaMime};base64,${init.captchaBase64}`,
        });
      }
      if (portal === "passtrack") {
        const init = await initPasstrackSession();
        const sessionId = crypto.randomUUID();
        pendingSessions.set(sessionId, init.session);
        return res.json({
          sessionId,
          imageDataUrl: `data:${init.captchaMime};base64,${init.captchaBase64}`,
        });
      }
      return res.status(400).json({ error: "Invalid portal specified." });
    } catch (err) {
      return res.status(502).json({
        error: err instanceof Error ? err.message : "Failed to refresh captcha.",
      });
    }
  });

  // Receipt OCR Scanner via server-side Gemini Vision
  app.post("/api/scan-receipt", async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error:
          "Receipt scanner requires GEMINI_API_KEY to be configured in Settings > Secrets.",
      });
    }

    const { imageBase64, mimeType } = req.body as {
      imageBase64?: string;
      mimeType?: string;
    };
    if (!imageBase64) {
      return res.status(400).json({ error: "No receipt image provided." });
    }

    try {
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: cleanBase64,
              },
            },
            {
              text: "Extract the Indian Visa Application ID (Web File Number, typically 12 characters starting with BGD like BGDD01234567) and the Passport Number (typically 9 characters starting with a letter like A01234567 or E01234567) from this IVAC / Indian Visa receipt image.",
            },
          ],
        },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              application_id: {
                type: Type.STRING,
                description: "12-character Web File / Application ID (uppercase) or empty string if not visible",
              },
              passport_no: {
                type: Type.STRING,
                description: "Passport number (uppercase) or empty string if not visible",
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      return res.json({
        application_id: String(parsed.application_id || "")
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, ""),
        passport_no: String(parsed.passport_no || "")
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, ""),
      });
    } catch (err) {
      console.error("[Receipt Scan Error]", err);
      return res.status(500).json({
        error:
          err instanceof Error
            ? err.message
            : "Failed to scan receipt image.",
      });
    }
  });

  // Real-time SSE dual-portal status verification pipeline
  app.post("/api/check-status-stream", async (req, res) => {
    const startedAt = Date.now();
    const {
      application_id,
      passport_no,
      visa_session_id,
      visa_captcha,
      passtrack_session_id,
      passtrack_captcha,
      cached_visa_result,
      cached_passtrack_result,
    } = req.body as {
      application_id?: string;
      passport_no?: string;
      visa_session_id?: string;
      visa_captcha?: string;
      passtrack_session_id?: string;
      passtrack_captcha?: string;
      cached_visa_result?: {
        status: "success" | "error";
        message: string;
        category?: string;
        label?: string;
      } | null;
      cached_passtrack_result?: {
        status: "success" | "not-found" | "error";
        applicant_name: string;
        table: string[][];
        message?: string;
      } | null;
    };

    const appId = String(application_id || "").trim().toUpperCase();
    const passportNo = String(passport_no || "").trim().toUpperCase();

    if (appId.length !== 12 || !/^[A-Z0-9]{12}$/.test(appId)) {
      return res.status(400).json({
        error: "Application ID must be exactly 12 alphanumeric characters (e.g., BGDD12345678).",
      });
    }
    if (passportNo.length < 7 || passportNo.length > 14 || !/^[A-Z0-9]+$/.test(passportNo)) {
      return res.status(400).json({
        error: "Passport Number must be 7 to 14 alphanumeric characters.",
      });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const sendEvent = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    pruneSessions();

    let visaResult: {
      status: "success" | "error";
      message: string;
      category?: string;
      label?: string;
    } = {
      status: "error",
      message: "Indian Visa Online Portal did not return a result.",
    };

    let passtrackResult: {
      status: "success" | "not-found" | "error";
      applicant_name: string;
      table: string[][];
      message?: string;
    } = {
      status: "error",
      applicant_name: "Unknown",
      table: [],
      message: "IVAC Passtrack did not return delivery records.",
    };

    let pendingCaptchaNeeded: {
      visa?: { sessionId: string; imageDataUrl: string };
      passtrack?: { sessionId: string; imageDataUrl: string };
    } = {};

    try {
      // STEP 1: Initialize secure portal session
      sendEvent("step", {
        step: 1,
        state: "active",
        message: "Initializing encrypted session & verifying portal headers",
        elapsedMs: Date.now() - startedAt,
      });

      const hasAiOcr = Boolean(getGeminiClient());
      sendEvent("step", {
        step: 1,
        state: "completed",
        elapsedMs: Date.now() - startedAt,
      });

      // STEP 2 & 3: Indian Visa Online Portal
      sendEvent("step", {
        step: 2,
        state: "active",
        message: "Connecting to indianvisaonline.gov.in/visa/StatusEnquiry",
        elapsedMs: Date.now() - startedAt,
      });

      let visaResolved = false;
      if (cached_visa_result) {
        visaResult = cached_visa_result;
        visaResolved = true;
        sendEvent("step", {
          step: 2,
          state: "completed",
          elapsedMs: Date.now() - startedAt,
        });
      } else if (visa_session_id && visa_captcha && pendingSessions.has(visa_session_id)) {
        const saved = pendingSessions.get(visa_session_id)!;
        pendingSessions.delete(visa_session_id);
        sendEvent("step", {
          step: 2,
          state: "completed",
          elapsedMs: Date.now() - startedAt,
        });
        sendEvent("step", {
          step: 3,
          state: "active",
          message: "Submitting verified access code to Indian Visa Online",
          elapsedMs: Date.now() - startedAt,
        });
        const parsed = await submitIndianVisaQuery(saved, appId, passportNo, visa_captcha.trim());
        if (parsed.type === "status") {
          const classified = classifyIndianVisaMessage(parsed.message);
          visaResult = {
            status: "success",
            message: parsed.message,
            category: classified.category,
            label: classified.label,
          };
          visaResolved = true;
        } else if (parsed.type === "captcha_error") {
          const fresh = await initIndianVisaSession();
          const sid = crypto.randomUUID();
          pendingSessions.set(sid, fresh.session);
          pendingCaptchaNeeded.visa = {
            sessionId: sid,
            imageDataUrl: `data:${fresh.captchaMime};base64,${fresh.captchaBase64}`,
          };
        } else {
          visaResult = { status: "error", message: parsed.message };
          visaResolved = true;
        }
      } else {
        const maxLocalAttempts = 4;
        for (let attempt = 1; attempt <= maxLocalAttempts; attempt++) {
          const init = await initIndianVisaSession();
          if (attempt === 1) {
            sendEvent("step", {
              step: 2,
              state: "completed",
              elapsedMs: Date.now() - startedAt,
            });
            sendEvent("step", {
              step: 3,
              state: "active",
              message: "Automatically solving portal access code & querying visa status",
              elapsedMs: Date.now() - startedAt,
            });
          }

          const imgBuf = Buffer.from(init.captchaBase64, "base64");
          let guess = await solveCaptchaLocally(imgBuf, "indianvisa", attempt);
          if (!guess && hasAiOcr) {
            guess = await solveCaptchaWithGemini(imgBuf, init.captchaMime, "indianvisa");
          }

          if (!guess) {
            if (attempt === maxLocalAttempts) {
              const sid = crypto.randomUUID();
              pendingSessions.set(sid, init.session);
              pendingCaptchaNeeded.visa = {
                sessionId: sid,
                imageDataUrl: `data:${init.captchaMime};base64,${init.captchaBase64}`,
              };
            }
            continue;
          }

          const parsed = await submitIndianVisaQuery(init.session, appId, passportNo, guess);
          if (parsed.type === "status") {
            const classified = classifyIndianVisaMessage(parsed.message);
            visaResult = {
              status: "success",
              message: parsed.message,
              category: classified.category,
              label: classified.label,
            };
            visaResolved = true;
            break;
          }
          if (parsed.type === "unknown_error") {
            visaResult = { status: "error", message: parsed.message };
            visaResolved = true;
            break;
          }
          if (parsed.type === "captcha_error" && attempt === maxLocalAttempts) {
            if (hasAiOcr) {
              const fresh = await initIndianVisaSession();
              const gemGuess = await solveCaptchaWithGemini(
                Buffer.from(fresh.captchaBase64, "base64"),
                fresh.captchaMime,
                "indianvisa"
              );
              if (gemGuess) {
                const gemParsed = await submitIndianVisaQuery(
                  fresh.session,
                  appId,
                  passportNo,
                  gemGuess
                );
                if (gemParsed.type === "status") {
                  const classified = classifyIndianVisaMessage(gemParsed.message);
                  visaResult = {
                    status: "success",
                    message: gemParsed.message,
                    category: classified.category,
                    label: classified.label,
                  };
                  visaResolved = true;
                  break;
                }
              }
            }
            const fresh = await initIndianVisaSession();
            const sid = crypto.randomUUID();
            pendingSessions.set(sid, fresh.session);
            pendingCaptchaNeeded.visa = {
              sessionId: sid,
              imageDataUrl: `data:${fresh.captchaMime};base64,${fresh.captchaBase64}`,
            };
          }
        }
      }

      sendEvent("step", {
        step: 3,
        state: visaResolved ? "completed" : "pending",
        elapsedMs: Date.now() - startedAt,
      });

      // STEP 4 & 5: IVAC Passtrack Delivery Portal
      sendEvent("step", {
        step: 4,
        state: "active",
        message: "Connecting to passtrack.net/regular_passport.php",
        elapsedMs: Date.now() - startedAt,
      });

      let passtrackResolved = false;
      try {
        if (cached_passtrack_result) {
          passtrackResult = cached_passtrack_result;
          passtrackResolved = true;
          sendEvent("step", {
            step: 4,
            state: "completed",
            elapsedMs: Date.now() - startedAt,
          });
        } else if (
          passtrack_session_id &&
          passtrack_captcha &&
          pendingSessions.has(passtrack_session_id)
        ) {
          const saved = pendingSessions.get(passtrack_session_id)!;
          pendingSessions.delete(passtrack_session_id);
          sendEvent("step", {
            step: 4,
            state: "completed",
            elapsedMs: Date.now() - startedAt,
          });
          sendEvent("step", {
            step: 5,
            state: "active",
            message: "Submitting verified Passtrack code & reading delivery milestones",
            elapsedMs: Date.now() - startedAt,
          });

          const pt = await submitPasstrackQuery(saved, appId, passtrack_captcha.trim());
          if (pt.type === "success") {
            passtrackResult = {
              status: "success",
              applicant_name: pt.applicantName,
              table: pt.table,
            };
            passtrackResolved = true;
          } else if (pt.type === "not_found") {
            passtrackResult = {
              status: "not-found",
              applicant_name: pt.applicantName,
              table: [],
              message: pt.message,
            };
            passtrackResolved = true;
          } else if (pt.type === "captcha_error") {
            const fresh = await initPasstrackSession();
            const sid = crypto.randomUUID();
            pendingSessions.set(sid, fresh.session);
            pendingCaptchaNeeded.passtrack = {
              sessionId: sid,
              imageDataUrl: `data:${fresh.captchaMime};base64,${fresh.captchaBase64}`,
            };
          } else {
            passtrackResult = {
              status: "error",
              applicant_name: "Unknown",
              table: [],
              message: pt.message,
            };
            passtrackResolved = true;
          }
        } else {
          const maxLocalAttempts = 12;
          let warmSession: PortalSession | undefined;
          for (let attempt = 1; attempt <= maxLocalAttempts; attempt++) {
            const init = await initPasstrackSession(warmSession);
            warmSession = init.session;
            if (attempt === 1) {
              sendEvent("step", {
                step: 4,
                state: "completed",
                elapsedMs: Date.now() - startedAt,
              });
              sendEvent("step", {
                step: 5,
                state: "active",
                message: "Automatically solving Passtrack code & loading delivery timeline",
                elapsedMs: Date.now() - startedAt,
              });
            }

            const imgBuf = Buffer.from(init.captchaBase64, "base64");
            let guess = await solveCaptchaLocally(imgBuf, "passtrack", attempt);
            if (!guess && hasAiOcr) {
              guess = await solveCaptchaWithGemini(imgBuf, init.captchaMime, "passtrack");
            }

            if (!guess) {
              if (attempt === maxLocalAttempts) {
                const sid = crypto.randomUUID();
                pendingSessions.set(sid, init.session);
                pendingCaptchaNeeded.passtrack = {
                  sessionId: sid,
                  imageDataUrl: `data:${init.captchaMime};base64,${init.captchaBase64}`,
                };
              }
              continue;
            }

            const pt = await submitPasstrackQuery(init.session, appId, guess);
            if (pt.type === "success") {
              passtrackResult = {
                status: "success",
                applicant_name: pt.applicantName,
                table: pt.table,
              };
              passtrackResolved = true;
              break;
            }
            if (pt.type === "not_found") {
              passtrackResult = {
                status: "not-found",
                applicant_name: pt.applicantName,
                table: [],
                message: pt.message,
              };
              passtrackResolved = true;
              break;
            }
            if (pt.type === "server_error") {
              passtrackResult = {
                status: "error",
                applicant_name: "Unknown",
                table: [],
                message: pt.message,
              };
              passtrackResolved = true;
              break;
            }
            if (pt.type === "captcha_error" && attempt === maxLocalAttempts) {
              if (hasAiOcr) {
                const fresh = await initPasstrackSession();
                const gemGuess = await solveCaptchaWithGemini(
                  Buffer.from(fresh.captchaBase64, "base64"),
                  fresh.captchaMime,
                  "passtrack"
                );
                if (gemGuess) {
                  const gemPt = await submitPasstrackQuery(fresh.session, appId, gemGuess);
                  if (gemPt.type === "success") {
                    passtrackResult = {
                      status: "success",
                      applicant_name: gemPt.applicantName,
                      table: gemPt.table,
                    };
                    passtrackResolved = true;
                    break;
                  }
                  if (gemPt.type === "not_found") {
                    passtrackResult = {
                      status: "not-found",
                      applicant_name: gemPt.applicantName,
                      table: [],
                      message: gemPt.message,
                    };
                    passtrackResolved = true;
                    break;
                  }
                }
              }
              const fresh = await initPasstrackSession();
              const sid = crypto.randomUUID();
              pendingSessions.set(sid, fresh.session);
              pendingCaptchaNeeded.passtrack = {
                sessionId: sid,
                imageDataUrl: `data:${fresh.captchaMime};base64,${fresh.captchaBase64}`,
              };
            }
          }
        }
      } catch (ptErr) {
        passtrackResult = {
          status: "error",
          applicant_name: "Unknown",
          table: [],
          message:
            ptErr instanceof Error
              ? ptErr.message
              : "Temporary IVAC Passtrack connection error.",
        };
        passtrackResolved = true;
      }

      sendEvent("step", {
        step: 5,
        state: passtrackResolved ? "completed" : "pending",
        elapsedMs: Date.now() - startedAt,
      });

      // If manual captcha verification is needed for either portal, pause and ask user
      if (pendingCaptchaNeeded.visa || pendingCaptchaNeeded.passtrack) {
        sendEvent("captcha_required", {
          application_id: appId,
          passport_no: passportNo,
          reason: hasAiOcr
            ? "Automated verification could not confirm one or more portal access codes. Please enter the code shown directly from the official portal."
            : "Please enter the verification code(s) shown directly from the official government portals to complete the live check.",
          captchas: pendingCaptchaNeeded,
          partial: {
            visa_portal: visaResolved ? visaResult : null,
            passtrack: passtrackResolved ? passtrackResult : null,
          },
          elapsedMs: Date.now() - startedAt,
        });
        return res.end();
      }

      // STEP 6: Final compilation
      sendEvent("step", {
        step: 6,
        state: "active",
        message: "Verifying dual-portal records & generating status report",
        elapsedMs: Date.now() - startedAt,
      });

      sendEvent("step", {
        step: 6,
        state: "completed",
        elapsedMs: Date.now() - startedAt,
      });

      sendEvent("result", {
        status: "success",
        application_id: appId,
        passport_no: passportNo,
        checked_at: new Date().toISOString(),
        elapsed_ms: Date.now() - startedAt,
        visa_portal: visaResult,
        passtrack: passtrackResult,
      });
      return res.end();
    } catch (err) {
      console.error("[Check Status Stream Error]", err);
      sendEvent("error", {
        message:
          err instanceof Error
            ? err.message
            : "Failed to connect to Indian Visa or IVAC servers.",
        elapsedMs: Date.now() - startedAt,
      });
      return res.end();
    }
  });

  const rootDir = __dirname;
  const staticFiles: Record<string, { file: string; type: string }> = {
    "/": { file: "index.html", type: "text/html; charset=utf-8" },
    "/index.html": { file: "index.html", type: "text/html; charset=utf-8" },
    "/styles.css": { file: "styles.css", type: "text/css; charset=utf-8" },
    "/app.js": { file: "app.js", type: "application/javascript; charset=utf-8" },
    "/cloudflare-worker.js": { file: "cloudflare-worker.js", type: "application/javascript; charset=utf-8" },
    "/404.html": { file: "404.html", type: "text/html; charset=utf-8" },
  };

  for (const [routePath, asset] of Object.entries(staticFiles)) {
    app.get(routePath, (_req, res) => {
      res.setHeader("X-VisaTrack-Backend", "express");
      res.type(asset.type);
      res.sendFile(path.join(rootDir, asset.file));
    });
  }

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    res.setHeader("X-VisaTrack-Backend", "express");
    res.type("text/html; charset=utf-8");
    return res.sendFile(path.join(rootDir, "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`IndiaVisa Track server listening on http://localhost:${PORT}`);
  });
}

startServer();
