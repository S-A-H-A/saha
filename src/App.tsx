import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { Backdrop } from "./components/Backdrop";
import { IconTile } from "./components/IconTile";
import { AppSection, BottomNav, Sidebar } from "./components/Header";
import { EnquiryForm } from "./components/EnquiryForm";
import { LivePipelineTracker } from "./components/LivePipelineTracker";
import { StatusReportView } from "./components/StatusReportView";
import { RequirementsSection } from "./components/RequirementsSection";
import { HistorySection } from "./components/HistorySection";
import { AppearanceSection } from "./components/AppearanceSection";
import { GLASS_THEMES, isDarkGlassTheme } from "./data/themes";
import {
  GlassThemeId,
  PendingCaptchaPrompt,
  PipelineStepState,
  SearchHistoryEntry,
  VisaCheckResponse,
} from "./types/visa";

const HISTORY_STORAGE_KEY = "indiavisa_track_history_v1";
const THEME_STORAGE_KEY = "indiavisa_glass_theme_v1";
const LANG_STORAGE_KEY = "indiavisa_lang_v1";

const INITIAL_STEPS: PipelineStepState[] = [
  {
    step: 1,
    title: "Session Setup",
    detail: "Initialize encrypted portal cookie jars",
    state: "pending",
  },
  {
    step: 2,
    title: "Visa Portal Connect",
    detail: "Connect to indianvisaonline.gov.in",
    state: "pending",
  },
  {
    step: 3,
    title: "Visa Status Query",
    detail: "Verify access code & read decision",
    state: "pending",
  },
  {
    step: 4,
    title: "Passtrack Connect",
    detail: "Connect to passtrack.net",
    state: "pending",
  },
  {
    step: 5,
    title: "Delivery Timeline",
    detail: "Verify captcha & extract IVAC steps",
    state: "pending",
  },
  {
    step: 6,
    title: "Report Synthesis",
    detail: "Compile dual-portal status report",
    state: "pending",
  },
];

function cloneInitialSteps(): PipelineStepState[] {
  return INITIAL_STEPS.map((s) => ({ ...s }));
}

export default function App() {
  const [activeSection, setActiveSection] = useState<AppSection>("tracker");

  const [theme, setTheme] = useState<GlassThemeId>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as GlassThemeId;
      if (GLASS_THEMES.some((item) => item.id === saved)) return saved;
    } catch {
      // ignore storage errors
    }
    return "light";
  });

  const [lang, setLang] = useState<"en" | "bn">(() => {
    try {
      return localStorage.getItem(LANG_STORAGE_KEY) === "bn" ? "bn" : "en";
    } catch {
      return "en";
    }
  });

  const [applicationId, setApplicationId] = useState("");
  const [passportNo, setPassportNo] = useState("");
  const [maskAppId, setMaskAppId] = useState(false);
  const [maskPassport, setMaskPassport] = useState(false);
  const [submissionDate, setSubmissionDate] = useState("");

  const [isRunning, setIsRunning] = useState(false);
  const [showPipeline, setShowPipeline] = useState(false);
  const [steps, setSteps] = useState<PipelineStepState[]>(cloneInitialSteps);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [captchaPrompt, setCaptchaPrompt] =
    useState<PendingCaptchaPrompt | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [result, setResult] = useState<VisaCheckResponse | null>(null);

  const [autoRefreshMin, setAutoRefreshMin] = useState<number>(0);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState<number | null>(
    null
  );
  const [statusChangedNotice, setStatusChangedNotice] = useState<string | null>(
    null
  );

  const [history, setHistory] = useState<SearchHistoryEntry[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const abortRef = useRef<AbortController | null>(null);
  const previousResultRef = useRef<VisaCheckResponse | null>(null);

  // Sync HTML data-theme + dark class + theme-color meta tag
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    if (isDarkGlassTheme(theme)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    const themeDef = GLASS_THEMES.find((item) => item.id === theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme && themeDef) {
      metaTheme.setAttribute("content", themeDef.metaBg);
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore storage errors
    }
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore storage errors
    }
  }, [history]);

  const handleSelectTheme = useCallback(
    (nextTheme: GlassThemeId, coords?: { x: number; y: number }) => {
      if (nextTheme === theme) return;
      const prefersReduced =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const docWithVt = document as Document & {
        startViewTransition?: (cb: () => void) => { ready: Promise<void> };
      };

      if (docWithVt.startViewTransition && !prefersReduced && coords) {
        try {
          const cx = coords.x || window.innerWidth - 60;
          const cy = coords.y || 80;
          const vt = docWithVt.startViewTransition(() => setTheme(nextTheme));
          vt.ready
            .then(() => {
              const r = Math.hypot(
                Math.max(cx, window.innerWidth - cx),
                Math.max(cy, window.innerHeight - cy)
              );
              document.documentElement.animate(
                {
                  clipPath: [
                    `circle(0px at ${cx}px ${cy}px)`,
                    `circle(${r}px at ${cx}px ${cy}px)`,
                  ],
                },
                {
                  duration: 600,
                  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                  pseudoElement: "::view-transition-new(root)",
                }
              );
            })
            .catch(() => {});
          return;
        } catch {
          // fallback below
        }
      }
      setTheme(nextTheme);
    },
    [theme]
  );

  const saveToHistory = useCallback((res: VisaCheckResponse) => {
    const rows =
      res.passtrack.table.length > 1 ? res.passtrack.table.slice(1) : [];
    const doneRows = rows.filter(
      (r) => r[2] && r[2].toLowerCase().includes("done")
    );
    const pct =
      rows.length > 0 ? Math.round((doneRows.length / rows.length) * 100) : undefined;
    const latestStep =
      doneRows.length > 0 ? doneRows[doneRows.length - 1][1] : undefined;

    setHistory((prev) => {
      const filtered = prev.filter(
        (item) => item.application_id !== res.application_id
      );
      const entry: SearchHistoryEntry = {
        id: res.application_id,
        application_id: res.application_id,
        passport_no: res.passport_no,
        applicant_name:
          res.passtrack.applicant_name &&
          res.passtrack.applicant_name !== "Unknown"
            ? res.passtrack.applicant_name
            : undefined,
        last_checked_at: res.checked_at,
        visa_category: res.visa_portal.category,
        visa_label: res.visa_portal.label,
        visa_message: res.visa_portal.message,
        passtrack_progress_pct: pct,
        latest_delivery_step: latestStep,
      };
      return [entry, ...filtered].slice(0, 20);
    });
  }, []);

  const runLiveCheck = useCallback(
    async (opts: {
      appId: string;
      passNo: string;
      visaCaptcha?: string;
      visaSessionId?: string;
      passtrackCaptcha?: string;
      passtrackSessionId?: string;
      cachedVisaResult?: VisaCheckResponse["visa_portal"] | null;
      cachedPasstrackResult?: VisaCheckResponse["passtrack"] | null;
      isResume?: boolean;
    }) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setActiveSection("tracker");
      setIsRunning(true);
      setShowPipeline(true);
      setStreamError(null);
      setCaptchaPrompt(null);
      if (!opts.isResume) {
        setSteps(cloneInitialSteps());
        setElapsedMs(0);
        setStatusChangedNotice(null);
      }

      try {
        const resp = await fetch("/api/check-status-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            application_id: opts.appId,
            passport_no: opts.passNo,
            visa_captcha: opts.visaCaptcha,
            visa_session_id: opts.visaSessionId,
            passtrack_captcha: opts.passtrackCaptcha,
            passtrack_session_id: opts.passtrackSessionId,
            cached_visa_result: opts.cachedVisaResult,
            cached_passtrack_result: opts.cachedPasstrackResult,
          }),
        });

        if (!resp.ok) {
          const errJson = await resp.json().catch(() => ({}));
          throw new Error(
            errJson.error || `Server returned HTTP ${resp.status}.`
          );
        }

        if (!resp.body) {
          throw new Error("Streaming response unavailable from server.");
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() || "";

          for (const block of blocks) {
            const lines = block.split("\n");
            let eventName = "message";
            let dataStr = "";
            for (const line of lines) {
              if (line.startsWith("event:")) {
                eventName = line.slice(6).trim();
              } else if (line.startsWith("data:")) {
                dataStr += line.slice(5).trim();
              }
            }
            if (!dataStr) continue;
            const payload = JSON.parse(dataStr);

            if (eventName === "step") {
              if (typeof payload.elapsedMs === "number") {
                setElapsedMs(payload.elapsedMs);
              }
              setSteps((prev) =>
                prev.map((s) =>
                  s.step === payload.step
                    ? {
                        ...s,
                        state: payload.state,
                        detail: payload.message || s.detail,
                        elapsedMs: payload.elapsedMs,
                      }
                    : s
                )
              );
            } else if (eventName === "captcha_required") {
              if (typeof payload.elapsedMs === "number") {
                setElapsedMs(payload.elapsedMs);
              }
              setCaptchaPrompt(payload);
              setIsRunning(false);
            } else if (eventName === "result") {
              const finalRes = payload as VisaCheckResponse;
              if (
                previousResultRef.current &&
                previousResultRef.current.application_id ===
                  finalRes.application_id
              ) {
                const prevMsg = previousResultRef.current.visa_portal.message;
                const prevPtLen =
                  previousResultRef.current.passtrack.table.filter((r) =>
                    r[2]?.toLowerCase().includes("done")
                  ).length;
                const currPtLen = finalRes.passtrack.table.filter((r) =>
                  r[2]?.toLowerCase().includes("done")
                ).length;

                if (
                  prevMsg !== finalRes.visa_portal.message ||
                  prevPtLen !== currPtLen
                ) {
                  setStatusChangedNotice(
                    `Live Watch detected an update at ${new Date(
                      finalRes.checked_at
                    ).toLocaleTimeString()}: ${
                      finalRes.visa_portal.label || "Status updated"
                    }.`
                  );
                }
              }

              previousResultRef.current = finalRes;
              setResult(finalRes);
              setElapsedMs(finalRes.elapsed_ms);
              setIsRunning(false);
              setShowPipeline(false);
              saveToHistory(finalRes);
            } else if (eventName === "error") {
              throw new Error(payload.message || "Dual-portal lookup failed.");
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setIsRunning(false);
          setShowPipeline(false);
          return;
        }
        setStreamError(
          err instanceof Error
            ? err.message
            : "Could not complete live status enquiry."
        );
        setIsRunning(false);
      }
    },
    [saveToHistory]
  );

  // Live Auto-Watch countdown timer
  useEffect(() => {
    if (autoRefreshMin <= 0 || !result || isRunning || captchaPrompt) {
      setSecondsUntilRefresh(null);
      return;
    }

    let remaining = autoRefreshMin * 60;
    setSecondsUntilRefresh(remaining);

    const timer = window.setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        window.clearInterval(timer);
        setSecondsUntilRefresh(0);
        runLiveCheck({
          appId: result.application_id,
          passNo: result.passport_no,
        });
      } else {
        setSecondsUntilRefresh(remaining);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [autoRefreshMin, result, isRunning, captchaPrompt, runLiveCheck]);

  return (
    <div className="relative min-h-screen">
      <Backdrop />

      <Sidebar
        activeSection={activeSection}
        historyCount={history.length}
        lang={lang}
        onChangeLang={setLang}
        onNavigate={setActiveSection}
      />

      <main className="relative z-10 mx-auto max-w-[1280px] px-4 pb-28 pt-5 sm:px-7 sm:pt-7 md:px-9 lg:ml-[258px] lg:px-8 lg:pt-8 lg:pb-14">
        {/* Hero Header */}
        {activeSection === "tracker" && (
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-rise">
            <div className="flex items-start gap-3.5 sm:items-center">
              <IconTile hue="amber" size={48}>
                <ShieldCheck className="h-6 w-6" />
              </IconTile>
              <div className="max-w-2xl">
                <h1 className="font-display text-2xl font-bold tracking-tight title-grad sm:text-3xl [text-wrap:balance]">
                  Indian Visa &amp; Passtrack Status
                </h1>
                <p className="mt-1 text-xs leading-relaxed text-[var(--mut)] sm:text-sm">
                  Real-time dual-portal verification with automatic access code
                  solving, delivery ring analytics, and saved enquiry history.
                </p>
              </div>
            </div>

            <div
              role="group"
              aria-label="Guidance Language"
              className="inline-flex self-start rounded-full border p-1 sm:self-center lg:hidden"
              style={{
                background: "var(--srf)",
                borderColor: "var(--line)",
              }}
            >
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  lang === "en"
                    ? "bg-gradient-to-r from-sky-400 to-violet-500 text-white shadow-sm"
                    : "text-[var(--mut)] hover:text-[var(--ink)]"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("bn")}
                className={`font-bn rounded-full px-3 py-1 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  lang === "bn"
                    ? "bg-gradient-to-r from-sky-400 to-violet-500 text-white shadow-sm"
                    : "text-[var(--mut)] hover:text-[var(--ink)]"
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>
        )}

        {activeSection === "tracker" && (
          <div className="space-y-5">
            <EnquiryForm
              applicationId={applicationId}
              passportNo={passportNo}
              maskAppId={maskAppId}
              maskPassport={maskPassport}
              isSubmitting={isRunning}
              recentSearches={history}
              onChangeAppId={setApplicationId}
              onChangePassport={setPassportNo}
              onToggleMaskAppId={() => setMaskAppId((prev) => !prev)}
              onToggleMaskPassport={() => setMaskPassport((prev) => !prev)}
              onSubmit={(app, pass) =>
                runLiveCheck({
                  appId: app || applicationId,
                  passNo: pass || passportNo,
                })
              }
            />

            {streamError && (
              <div
                role="alert"
                className="glass-panel flex items-start gap-3 px-5 py-4 text-sm"
                style={{
                  borderColor: "rgba(var(--c-rose), 0.55)",
                  color: "var(--tx-neg)",
                }}
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <div className="font-display font-bold">
                    Live Enquiry Failed
                  </div>
                  <p className="mt-0.5 text-xs opacity-90">{streamError}</p>
                </div>
              </div>
            )}

            {showPipeline && (
              <LivePipelineTracker
                steps={steps}
                isRunning={isRunning}
                elapsedMs={elapsedMs}
                captchaPrompt={captchaPrompt}
                onSubmitManualCaptcha={(payload) => {
                  if (!captchaPrompt) return;
                  runLiveCheck({
                    appId: captchaPrompt.application_id,
                    passNo: captchaPrompt.passport_no,
                    visaCaptcha: payload.visaCaptcha,
                    visaSessionId: payload.visaSessionId,
                    passtrackCaptcha: payload.passtrackCaptcha,
                    passtrackSessionId: payload.passtrackSessionId,
                    cachedVisaResult: captchaPrompt.partial.visa_portal,
                    cachedPasstrackResult: captchaPrompt.partial.passtrack,
                    isResume: true,
                  });
                }}
                onCancel={() => {
                  abortRef.current?.abort();
                  setIsRunning(false);
                  setShowPipeline(false);
                  setCaptchaPrompt(null);
                }}
              />
            )}

            {result ? (
              <StatusReportView
                result={result}
                lang={lang}
                maskAppId={maskAppId}
                maskPassport={maskPassport}
                submissionDate={submissionDate}
                autoRefreshIntervalMin={autoRefreshMin}
                secondsUntilRefresh={secondsUntilRefresh}
                statusChangedNotice={statusChangedNotice}
                isRefreshing={isRunning}
                onChangeLang={setLang}
                onChangeSubmissionDate={setSubmissionDate}
                onChangeAutoRefresh={setAutoRefreshMin}
                onRefreshNow={() =>
                  runLiveCheck({
                    appId: result.application_id,
                    passNo: result.passport_no,
                  })
                }
              />
            ) : (
              !showPipeline && (
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-rise">
                  <div className="glass-panel flex h-full flex-col p-5 hover:-translate-y-0.5">
                    <div className="mb-3 flex items-center justify-between">
                      <IconTile hue="amber" size={40}>
                        <ShieldCheck className="h-5 w-5" />
                      </IconTile>
                      <span className="font-mono text-xs font-bold tabular-nums text-[var(--mut2)]">
                        01
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-[var(--ink)]">
                      Indian Visa Online Status
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--mut)] sm:text-sm">
                      Queries the official Status Enquiry portal automatically
                      to detect Under Processing, Granted, or Printed states.
                    </p>
                  </div>

                  <div className="glass-panel flex h-full flex-col p-5 hover:-translate-y-0.5">
                    <div className="mb-3 flex items-center justify-between">
                      <IconTile hue="sky" size={40}>
                        <Clock className="h-5 w-5" />
                      </IconTile>
                      <span className="font-mono text-xs font-bold tabular-nums text-[var(--mut2)]">
                        02
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-[var(--ink)]">
                      Passtrack Delivery Ring
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--mut)] sm:text-sm">
                      Extracts applicant identity and renders the 4-stage
                      passport movement progress from submission through
                      collection readiness.
                    </p>
                  </div>

                  <div className="glass-panel flex h-full flex-col p-5 hover:-translate-y-0.5 sm:col-span-2 lg:col-span-1">
                    <div className="mb-3 flex items-center justify-between">
                      <IconTile hue="emerald" size={40}>
                        <Sparkles className="h-5 w-5" />
                      </IconTile>
                      <span className="font-mono text-xs font-bold tabular-nums text-[var(--mut2)]">
                        03
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-[var(--ink)]">
                      Live Watch &amp; Export
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--mut)] sm:text-sm">
                      Track Sun–Thu working days elapsed, enable automatic
                      background polling, and download privacy-masked PNG cards.
                    </p>
                  </div>
                </section>
              )
            )}
          </div>
        )}

        {activeSection === "requirements" && (
          <RequirementsSection lang={lang} onChangeLang={setLang} />
        )}

        {activeSection === "history" && (
          <HistorySection
            entries={history}
            maskAppId={maskAppId}
            onRecheck={(entry) => {
              setApplicationId(entry.application_id);
              setPassportNo(entry.passport_no);
              runLiveCheck({
                appId: entry.application_id,
                passNo: entry.passport_no,
              });
            }}
            onDelete={(id) =>
              setHistory((prev) => prev.filter((item) => item.id !== id))
            }
            onClearAll={() => setHistory([])}
          />
        )}

        {activeSection === "appearance" && (
          <AppearanceSection
            theme={theme}
            lang={lang}
            maskAppId={maskAppId}
            maskPassport={maskPassport}
            onSelectTheme={handleSelectTheme}
            onChangeLang={setLang}
            onToggleMaskAppId={() => setMaskAppId((prev) => !prev)}
            onToggleMaskPassport={() => setMaskPassport((prev) => !prev)}
          />
        )}

        <footer
          className="mt-12 border-t pt-6"
          style={{ borderColor: "var(--line2)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--mut)]">
            <span>
              IndiaVisa Track <span aria-hidden="true">·</span> Live queries
              routed directly to Indian Visa Online &amp; Passtrack
            </span>
            <div className="flex items-center gap-4">
              <a
                href="https://indianvisaonline.gov.in/visa/StatusEnquiry"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:text-[var(--tx-info)]"
              >
                indianvisaonline.gov.in
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="https://www.passtrack.net/regular_passport.php"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:text-[var(--tx-info)]"
              >
                passtrack.net
              </a>
            </div>
          </div>
        </footer>
      </main>

      <BottomNav
        activeSection={activeSection}
        historyCount={history.length}
        onNavigate={setActiveSection}
      />
    </div>
  );
}
