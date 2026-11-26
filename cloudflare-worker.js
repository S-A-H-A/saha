/**
 * IndiaVisa Track — 100% Free Cloudflare Worker Proxy ($0/month, 100,000 requests/day)
 *
 * Deploy free at https://workers.cloudflare.com (no credit card required):
 *   1. Create a Worker, paste this file, and click Deploy.
 *   2. Optional: Add GEMINI_API_KEY (free tier from aistudio.google.com) under Worker Settings -> Variables & Secrets
 *      for automatic CAPTCHA solving & receipt scanning. Without it, official CAPTCHAs appear directly in the app.
 *   3. Paste your Worker URL (e.g. https://indiavisa-proxy.yourname.workers.dev) in IndiaVisa Track -> Settings.
 */

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function corsHeaders(origin = "*") {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
  };
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
      ...extraHeaders,
    },
  });
}

function encodeSession(sessionObj) {
  const bytes = new TextEncoder().encode(JSON.stringify(sessionObj));
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeSession(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const bin = atob(b64 + pad);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== "object" || !parsed.cookies) return null;
    if (Date.now() - (parsed.createdAt || 0) > 15 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

function arrayBufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

function mergeCookies(jar, headers) {
  let setCookies = [];
  if (typeof headers.getSetCookie === "function") {
    setCookies = headers.getSetCookie();
  } else {
    const raw = headers.get("set-cookie");
    if (raw) setCookies = raw.split(/,(?=[^;,=\s]+=[^;,]+)/g);
  }
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

function serializeCookies(jar) {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function fetchWithCookies(url, jar, init = {}, depth = 0) {
  if (depth > 5) throw new Error("Too many redirects from portal.");
  const headers = new Headers(init.headers || {});
  if (!headers.has("User-Agent")) headers.set("User-Agent", USER_AGENT);
  const cookieHeader = serializeCookies(jar);
  if (cookieHeader) headers.set("Cookie", cookieHeader);

  const res = await fetch(url, {
    ...init,
    headers,
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
  mergeCookies(jar, res.headers);

  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.get("location");
    if (location) {
      const nextUrl = new URL(location, url).toString();
      return fetchWithCookies(
        nextUrl,
        jar,
        {
          method: "GET",
          headers: { Referer: url },
        },
        depth + 1
      );
    }
  }
  return res;
}

function decodeHtmlEntities(str) {
  return String(str || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(html) {
  return decodeHtmlEntities(
    String(html || "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

function classifyIndianVisaMessage(rawMsg) {
  const lower = rawMsg.toLowerCase();
  if (lower.includes("could not be found") || lower.includes("not be found") || lower.includes("no record")) {
    return { category: "not_found", label: "Record Not Found" };
  }
  if (lower.includes("granted but not-printed") || lower.includes("not-printed") || lower.includes("not printed")) {
    return { category: "granted_not_printed", label: "Granted (Not Printed)" };
  }
  if (lower.includes("processed and printed") || lower.includes("ready for collection") || (lower.includes("printed") && !lower.includes("not"))) {
    return { category: "processed_printed", label: "Processed & Printed" };
  }
  if (lower.includes("closed")) {
    return { category: "closed", label: "Application Closed" };
  }
  if (lower.includes("contact the respective office") || (lower.includes("under processing") && (lower.includes("contact") || lower.includes("office")))) {
    return { category: "attention_required", label: "Contact Respective Office" };
  }
  if (lower.includes("under processing")) {
    return { category: "under_processing", label: "Under Processing" };
  }
  return { category: "unknown", label: "Status Retrieved" };
}

function parseIndianVisaHtml(html) {
  const bodyText = stripTags(html);
  const lower = bodyText.toLowerCase();

  if (
    lower.includes("enter correct captcha") ||
    lower.includes("invalid captcha") ||
    lower.includes("captcha mismatch") ||
    lower.includes("incorrect access code") ||
    lower.includes("enter valid access code")
  ) {
    return { type: "captcha_error", message: "Captcha verification failed on Indian Visa Online Portal." };
  }

  const blockMatches = html.match(/<(p|td|div|span|font|h3|h4)[^>]*>([\s\S]*?)<\/\1>/gi) || [];
  const candidates = [];
  for (const block of blockMatches) {
    if (/<form/i.test(block)) continue;
    const txt = stripTags(block);
    if (
      txt.length > 15 &&
      txt.length < 480 &&
      !/^visa status enquiry$/i.test(txt) &&
      /(under processing|processed and printed|granted but not-printed|could not be found|not be found|ready for collection|closed|contact the respective office|invalid application)/i.test(txt) &&
      !txt.includes("Application ID can be seen on your receipt")
    ) {
      candidates.push(txt);
    }
  }
  candidates.sort((a, b) => a.length - b.length);
  if (candidates.length > 0) {
    return { type: "status", message: candidates[0] };
  }

  const errMatch = html.match(/class=["'][^"']*errorify[^"']*["'][^>]*>([\s\S]*?)<\/[a-z0-9]+>/i);
  if (errMatch) {
    const errText = stripTags(errMatch[1]);
    if (errText.length > 5) {
      if (/captcha|access code/i.test(errText)) return { type: "captcha_error", message: errText };
      return { type: "status", message: errText };
    }
  }

  if (/name=["']filerfno["']/i.test(html) && /name=["']captcha["']/i.test(html)) {
    return { type: "captcha_error", message: "Portal returned to verification form. Access code may be incorrect." };
  }

  return { type: "unknown_error", message: "Unable to parse response from Indian Visa Online Portal." };
}

function parsePasstrackHtml(html) {
  const fullText = stripTags(html);
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
    return { type: "captcha_error", applicantName: "Unknown", table: [], message: "Passtrack captcha did not match." };
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

  let applicantName = "Unknown";
  const nameMatch =
    fullText.match(/Applicant\s*Name\s*[:\-]\s*([A-Z][A-Za-z.\s'-]{2,60}?)(?=\s*(?:Web\s*File|Passport|Step|Sl|Received|Date|Center|$))/i) ||
    fullText.match(/Name\s*[:\-]\s*([A-Z][A-Za-z.\s'-]{2,60}?)(?=\s*(?:Web\s*File|Passport|Step|Sl|Received|Date|$))/i);
  if (nameMatch && nameMatch[1]) {
    applicantName = nameMatch[1].trim();
  }

  const parsedTable = [];
  const tableMatches = html.match(/<table[\s\S]*?<\/table>/gi) || [];
  for (const tHtml of tableMatches) {
    const rows = [];
    const trMatches = tHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];
    for (const trHtml of trMatches) {
      const cells = [];
      const cellMatches = trHtml.match(/<(th|td)[^>]*>[\s\S]*?<\/\1>/gi) || [];
      for (const cHtml of cellMatches) {
        cells.push(stripTags(cHtml));
      }
      if (cells.length >= 2) rows.push(cells);
    }
    if (rows.length >= 2) {
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
  }

  if (parsedTable.length > 1) {
    return { type: "success", applicantName, table: parsedTable };
  }

  if (/id=["']search_data["']/i.test(html) || /id=["']q["']/i.test(html)) {
    return {
      type: "not_found",
      applicantName,
      table: [],
      message: "No delivery record found in IVAC Passtrack for this Web File Number.",
    };
  }

  return {
    type: "server_error",
    applicantName: "Unknown",
    table: [],
    message: "Could not retrieve delivery table from IVAC Passtrack.",
  };
}

async function initIndianVisaSession() {
  const cookies = {};
  await fetchWithCookies("https://indianvisaonline.gov.in/visa/index.html", cookies);
  const formRes = await fetchWithCookies("https://indianvisaonline.gov.in/visa/StatusEnquiry", cookies, {
    headers: { Referer: "https://indianvisaonline.gov.in/visa/index.html" },
  });
  const formHtml = await formRes.text();
  const tokenMatch =
    formHtml.match(/name=["']token["'][^>]*value=["']([^"']*)["']/i) ||
    formHtml.match(/value=["']([^"']*)["'][^>]*name=["']token["']/i);
  const token = tokenMatch ? tokenMatch[1] : "";

  const captchaRes = await fetchWithCookies(`https://indianvisaonline.gov.in/visa/captcha?rand=${Date.now()}`, cookies, {
    headers: { Referer: "https://indianvisaonline.gov.in/visa/StatusEnquiry" },
  });
  const contentType = (captchaRes.headers.get("content-type") || "image/png").split(";")[0];
  const base64 = arrayBufferToBase64(await captchaRes.arrayBuffer());
  const session = { cookies, token, createdAt: Date.now() };
  return {
    session,
    sessionId: encodeSession(session),
    imageDataUrl: `data:${contentType};base64,${base64}`,
    captchaBase64: base64,
    captchaMime: contentType,
  };
}

async function submitIndianVisaQuery(session, appId, passportNo, captcha) {
  const body = new URLSearchParams({
    filerfno: appId,
    passport_number: passportNo,
    captcha,
    token: session.token || "",
    submit_btn: "Check Status",
  });

  const res = await fetchWithCookies("https://indianvisaonline.gov.in/visa/StatusEnquiry", session.cookies, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: "https://indianvisaonline.gov.in/visa/StatusEnquiry",
      Origin: "https://indianvisaonline.gov.in",
    },
    body: body.toString(),
  });
  return parseIndianVisaHtml(await res.text());
}

async function initPasstrackSession(existingSession) {
  const cookies = existingSession ? { ...existingSession.cookies } : {};
  if (!existingSession) {
    await fetchWithCookies("https://www.passtrack.net/regular_passport.php", cookies);
  }
  const captchaRes = await fetchWithCookies(`https://www.passtrack.net/captcha.php?${Math.random()}`, cookies, {
    headers: { Referer: "https://www.passtrack.net/regular_passport.php" },
  });
  const contentType = (captchaRes.headers.get("content-type") || "image/png").split(";")[0];
  const base64 = arrayBufferToBase64(await captchaRes.arrayBuffer());
  const session = { cookies, createdAt: Date.now() };
  return {
    session,
    sessionId: encodeSession(session),
    imageDataUrl: `data:${contentType};base64,${base64}`,
    captchaBase64: base64,
    captchaMime: contentType,
  };
}

async function submitPasstrackQuery(session, appId, captcha) {
  const body = new URLSearchParams({
    appref1: appId,
    captcha,
    submit: "Submit",
  });
  const res = await fetchWithCookies("https://www.passtrack.net/regular_passport.php", session.cookies, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: "https://www.passtrack.net/regular_passport.php",
      Origin: "https://www.passtrack.net",
    },
    body: body.toString(),
  });
  return parsePasstrackHtml(await res.text());
}

async function solveCaptchaWithGeminiFreeTier(apiKey, base64Data, mimeType, portalHint) {
  if (!apiKey) return null;
  const prompt =
    portalHint === "indianvisa"
      ? "Read the alphanumeric verification captcha code shown in this image. Return ONLY the exact characters with no spaces or quotes."
      : "Read the captcha verification code shown in this image. Return ONLY the exact characters with no spaces or quotes.";

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(7000),
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inline_data: { mime_type: mimeType, data: base64Data } },
                { text: prompt },
              ],
            },
          ],
        }),
      }
    );
    if (!resp.ok) return null;
    const json = await resp.json();
    const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = raw.trim().replace(/[^a-zA-Z0-9]/g, "");
    return cleaned.length >= 3 && cleaned.length <= 10 ? cleaned : null;
  } catch {
    return null;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (url.pathname === "/api/portal-health" && request.method === "GET") {
      const probe = async (name, targetUrl) => {
        const start = Date.now();
        try {
          const resp = await fetch(targetUrl, {
            method: "HEAD",
            headers: { "User-Agent": USER_AGENT },
            signal: AbortSignal.timeout(7000),
          });
          return {
            name,
            url: targetUrl,
            online: resp.status < 500,
            statusCode: resp.status,
            latencyMs: Date.now() - start,
            checkedAt: new Date().toISOString(),
          };
        } catch (err) {
          return {
            name,
            url: targetUrl,
            online: false,
            statusCode: 0,
            latencyMs: Date.now() - start,
            checkedAt: new Date().toISOString(),
            error: err?.message || "Unreachable",
          };
        }
      };

      const [indianVisa, passtrack] = await Promise.all([
        probe("Indian Visa Online", "https://indianvisaonline.gov.in/visa/index.html"),
        probe("IVAC Passtrack", "https://www.passtrack.net/regular_passport.php"),
      ]);

      return jsonResponse({
        portals: [indianVisa, passtrack],
        localAutoSolver: false,
        workerRelay: true,
        aiOcrConfigured: Boolean(env?.GEMINI_API_KEY),
      });
    }

    if (url.pathname === "/api/refresh-captcha" && request.method === "POST") {
      try {
        const { portal } = await request.json();
        if (portal === "indianvisa") {
          const init = await initIndianVisaSession();
          return jsonResponse({ sessionId: init.sessionId, imageDataUrl: init.imageDataUrl });
        }
        if (portal === "passtrack") {
          const init = await initPasstrackSession();
          return jsonResponse({ sessionId: init.sessionId, imageDataUrl: init.imageDataUrl });
        }
        return jsonResponse({ error: "Invalid portal specified." }, 400);
      } catch (err) {
        return jsonResponse({ error: err?.message || "Failed to refresh captcha." }, 502);
      }
    }

    if (url.pathname === "/api/scan-receipt" && request.method === "POST") {
      const apiKey = env?.GEMINI_API_KEY;
      if (!apiKey) {
        return jsonResponse(
          { error: "Receipt OCR requires optional GEMINI_API_KEY in Cloudflare Worker secrets. Enter Application ID & Passport manually for free." },
          503
        );
      }
      try {
        const { imageBase64, mimeType } = await request.json();
        if (!imageBase64) return jsonResponse({ error: "No receipt image provided." }, 400);
        const cleanBase64 = String(imageBase64).replace(/^data:[^;]+;base64,/, "");
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { inline_data: { mime_type: mimeType || "image/jpeg", data: cleanBase64 } },
                    {
                      text: 'Extract the Indian Visa Application ID (12 characters starting with BGD like BGDD01234567) and Passport Number (e.g. A01234567). Return strictly valid JSON: {"application_id":"","passport_no":""}.',
                    },
                  ],
                },
              ],
              generationConfig: { responseMimeType: "application/json" },
            }),
          }
        );
        const json = await resp.json();
        const parsed = JSON.parse(json?.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
        return jsonResponse({
          application_id: String(parsed.application_id || "").toUpperCase().replace(/[^A-Z0-9]/g, ""),
          passport_no: String(parsed.passport_no || "").toUpperCase().replace(/[^A-Z0-9]/g, ""),
        });
      } catch (err) {
        return jsonResponse({ error: err?.message || "Failed to scan receipt." }, 500);
      }
    }

    if (url.pathname === "/api/check-status-stream" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ error: "Invalid JSON payload." }, 400);
      }

      const appId = String(body.application_id || "").trim().toUpperCase();
      const passportNo = String(body.passport_no || "").trim().toUpperCase();

      if (appId.length !== 12 || !/^[A-Z0-9]{12}$/.test(appId)) {
        return jsonResponse({ error: "Application ID must be exactly 12 alphanumeric characters." }, 400);
      }
      if (passportNo.length < 7 || passportNo.length > 14 || !/^[A-Z0-9]+$/.test(passportNo)) {
        return jsonResponse({ error: "Passport Number must be 7 to 14 alphanumeric characters." }, 400);
      }

      const startedAt = Date.now();
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const sendEvent = (event, data) => {
            controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
          };

          let visaResult = { status: "error", message: "Indian Visa Online Portal did not return a result." };
          let passtrackResult = { status: "error", applicant_name: "Unknown", table: [], message: "IVAC Passtrack did not return records." };
          const pendingCaptchaNeeded = {};
          const apiKey = env?.GEMINI_API_KEY || "";

          try {
            sendEvent("step", { step: 1, state: "active", message: "Initializing free Cloudflare edge session", elapsedMs: Date.now() - startedAt });
            sendEvent("step", { step: 1, state: "completed", elapsedMs: Date.now() - startedAt });

            // Indian Visa Online
            sendEvent("step", { step: 2, state: "active", message: "Connecting to indianvisaonline.gov.in", elapsedMs: Date.now() - startedAt });
            let visaResolved = false;

            const savedVisaSession = decodeSession(body.visa_session_id);
            if (body.cached_visa_result) {
              visaResult = body.cached_visa_result;
              visaResolved = true;
              sendEvent("step", { step: 2, state: "completed", elapsedMs: Date.now() - startedAt });
            } else if (savedVisaSession && body.visa_captcha) {
              sendEvent("step", { step: 2, state: "completed", elapsedMs: Date.now() - startedAt });
              sendEvent("step", { step: 3, state: "active", message: "Submitting access code to Indian Visa Online", elapsedMs: Date.now() - startedAt });
              const parsed = await submitIndianVisaQuery(savedVisaSession, appId, passportNo, String(body.visa_captcha).trim());
              if (parsed.type === "status") {
                const c = classifyIndianVisaMessage(parsed.message);
                visaResult = { status: "success", message: parsed.message, category: c.category, label: c.label };
                visaResolved = true;
              } else if (parsed.type === "captcha_error") {
                const fresh = await initIndianVisaSession();
                pendingCaptchaNeeded.visa = { sessionId: fresh.sessionId, imageDataUrl: fresh.imageDataUrl };
              } else {
                visaResult = { status: "error", message: parsed.message };
                visaResolved = true;
              }
            } else if (apiKey) {
              sendEvent("step", { step: 2, state: "completed", elapsedMs: Date.now() - startedAt });
              sendEvent("step", { step: 3, state: "active", message: "Automatically solving access code & querying Indian Visa Online", elapsedMs: Date.now() - startedAt });
              for (let attempt = 1; attempt <= 3; attempt++) {
                const init = await initIndianVisaSession();
                const guess = await solveCaptchaWithGeminiFreeTier(apiKey, init.captchaBase64, init.captchaMime, "indianvisa");
                if (guess) {
                  const parsed = await submitIndianVisaQuery(init.session, appId, passportNo, guess);
                  if (parsed.type === "status") {
                    const c = classifyIndianVisaMessage(parsed.message);
                    visaResult = { status: "success", message: parsed.message, category: c.category, label: c.label };
                    visaResolved = true;
                    break;
                  }
                  if (parsed.type === "unknown_error") {
                    visaResult = { status: "error", message: parsed.message };
                    visaResolved = true;
                    break;
                  }
                }
                if (attempt === 3) {
                  const fresh = await initIndianVisaSession();
                  pendingCaptchaNeeded.visa = { sessionId: fresh.sessionId, imageDataUrl: fresh.imageDataUrl };
                }
              }
            } else {
              const init = await initIndianVisaSession();
              sendEvent("step", { step: 2, state: "completed", elapsedMs: Date.now() - startedAt });
              sendEvent("step", { step: 3, state: "active", message: "Fetching official portal access code", elapsedMs: Date.now() - startedAt });
              pendingCaptchaNeeded.visa = { sessionId: init.sessionId, imageDataUrl: init.imageDataUrl };
            }
            sendEvent("step", { step: 3, state: visaResolved ? "completed" : "pending", elapsedMs: Date.now() - startedAt });

            // IVAC Passtrack
            sendEvent("step", { step: 4, state: "active", message: "Connecting to passtrack.net", elapsedMs: Date.now() - startedAt });
            let passtrackResolved = false;

            try {
              const savedPtSession = decodeSession(body.passtrack_session_id);
              if (body.cached_passtrack_result) {
                passtrackResult = body.cached_passtrack_result;
                passtrackResolved = true;
                sendEvent("step", { step: 4, state: "completed", elapsedMs: Date.now() - startedAt });
              } else if (savedPtSession && body.passtrack_captcha) {
                sendEvent("step", { step: 4, state: "completed", elapsedMs: Date.now() - startedAt });
                sendEvent("step", { step: 5, state: "active", message: "Submitting Passtrack code", elapsedMs: Date.now() - startedAt });
                const pt = await submitPasstrackQuery(savedPtSession, appId, String(body.passtrack_captcha).trim());
                if (pt.type === "success") {
                  passtrackResult = { status: "success", applicant_name: pt.applicantName, table: pt.table };
                  passtrackResolved = true;
                } else if (pt.type === "not_found") {
                  passtrackResult = { status: "not-found", applicant_name: pt.applicantName, table: [], message: pt.message };
                  passtrackResolved = true;
                } else if (pt.type === "captcha_error") {
                  const fresh = await initPasstrackSession();
                  pendingCaptchaNeeded.passtrack = { sessionId: fresh.sessionId, imageDataUrl: fresh.imageDataUrl };
                } else {
                  passtrackResult = { status: "error", applicant_name: "Unknown", table: [], message: pt.message };
                  passtrackResolved = true;
                }
              } else if (apiKey) {
                sendEvent("step", { step: 4, state: "completed", elapsedMs: Date.now() - startedAt });
                sendEvent("step", { step: 5, state: "active", message: "Automatically solving Passtrack code & loading timeline", elapsedMs: Date.now() - startedAt });
                for (let attempt = 1; attempt <= 3; attempt++) {
                  const initPt = await initPasstrackSession();
                  const guessPt = await solveCaptchaWithGeminiFreeTier(apiKey, initPt.captchaBase64, initPt.captchaMime, "passtrack");
                  if (guessPt) {
                    const pt = await submitPasstrackQuery(initPt.session, appId, guessPt);
                    if (pt.type === "success") {
                      passtrackResult = { status: "success", applicant_name: pt.applicantName, table: pt.table };
                      passtrackResolved = true;
                      break;
                    }
                    if (pt.type === "not_found") {
                      passtrackResult = { status: "not-found", applicant_name: pt.applicantName, table: [], message: pt.message };
                      passtrackResolved = true;
                      break;
                    }
                    if (pt.type === "server_error") {
                      passtrackResult = { status: "error", applicant_name: "Unknown", table: [], message: pt.message };
                      passtrackResolved = true;
                      break;
                    }
                  }
                  if (attempt === 3) {
                    const fresh = await initPasstrackSession();
                    pendingCaptchaNeeded.passtrack = { sessionId: fresh.sessionId, imageDataUrl: fresh.imageDataUrl };
                  }
                }
              } else {
                const initPt = await initPasstrackSession();
                sendEvent("step", { step: 4, state: "completed", elapsedMs: Date.now() - startedAt });
                sendEvent("step", { step: 5, state: "active", message: "Fetching official Passtrack code", elapsedMs: Date.now() - startedAt });
                pendingCaptchaNeeded.passtrack = { sessionId: initPt.sessionId, imageDataUrl: initPt.imageDataUrl };
              }
            } catch (ptErr) {
              passtrackResult = { status: "error", applicant_name: "Unknown", table: [], message: ptErr?.message || "Passtrack connection error." };
              passtrackResolved = true;
            }
            sendEvent("step", { step: 5, state: passtrackResolved ? "completed" : "pending", elapsedMs: Date.now() - startedAt });

            if (pendingCaptchaNeeded.visa || pendingCaptchaNeeded.passtrack) {
              sendEvent("captcha_required", {
                application_id: appId,
                passport_no: passportNo,
                reason: "Enter the verification code(s) from the official portals below to complete your free live check.",
                captchas: pendingCaptchaNeeded,
                partial: {
                  visa_portal: visaResolved ? visaResult : null,
                  passtrack: passtrackResolved ? passtrackResult : null,
                },
                elapsedMs: Date.now() - startedAt,
              });
              controller.close();
              return;
            }

            sendEvent("step", { step: 6, state: "active", message: "Generating dual-portal report", elapsedMs: Date.now() - startedAt });
            sendEvent("step", { step: 6, state: "completed", elapsedMs: Date.now() - startedAt });
            sendEvent("result", {
              status: "success",
              application_id: appId,
              passport_no: passportNo,
              checked_at: new Date().toISOString(),
              elapsed_ms: Date.now() - startedAt,
              visa_portal: visaResult,
              passtrack: passtrackResult,
            });
            controller.close();
          } catch (err) {
            sendEvent("error", {
              message: err?.message || "Failed to connect to Indian Visa or IVAC servers.",
              elapsedMs: Date.now() - startedAt,
            });
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          ...corsHeaders(),
        },
      });
    }

    return jsonResponse({ ok: true, service: "IndiaVisa Track Free Worker Proxy" });
  },
};
