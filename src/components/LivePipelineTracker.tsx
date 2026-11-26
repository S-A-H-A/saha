import React, { useState } from "react";
import { Check, Loader2, RefreshCw, ShieldCheck, Waves } from "lucide-react";
import { PendingCaptchaPrompt, PipelineStepState } from "../types/visa";
import { IconTile } from "./IconTile";

interface LivePipelineTrackerProps {
  steps: PipelineStepState[];
  isRunning: boolean;
  elapsedMs: number;
  captchaPrompt: PendingCaptchaPrompt | null;
  onSubmitManualCaptcha: (payload: {
    visaCaptcha?: string;
    passtrackCaptcha?: string;
    visaSessionId?: string;
    passtrackSessionId?: string;
  }) => void;
  onCancel: () => void;
}

export const LivePipelineTracker: React.FC<LivePipelineTrackerProps> = ({
  steps,
  isRunning,
  elapsedMs,
  captchaPrompt,
  onSubmitManualCaptcha,
  onCancel,
}) => {
  const [visaCode, setVisaCode] = useState("");
  const [ptCode, setPtCode] = useState("");
  const [visaImageOverride, setVisaImageOverride] = useState<{
    sessionId: string;
    imageDataUrl: string;
  } | null>(null);
  const [ptImageOverride, setPtImageOverride] = useState<{
    sessionId: string;
    imageDataUrl: string;
  } | null>(null);
  const [refreshingPortal, setRefreshingPortal] = useState<string | null>(null);

  const completedCount = steps.filter((s) => s.state === "completed").length;
  const pct = Math.round((completedCount / steps.length) * 100);

  const activeVisaCaptcha = visaImageOverride || captchaPrompt?.captchas.visa;
  const activePtCaptcha = ptImageOverride || captchaPrompt?.captchas.passtrack;

  const handleRefreshCaptcha = async (portal: "indianvisa" | "passtrack") => {
    setRefreshingPortal(portal);
    try {
      const resp = await fetch("/api/refresh-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portal }),
      });
      const json = await resp.json();
      if (resp.ok && json.sessionId && json.imageDataUrl) {
        if (portal === "indianvisa") {
          setVisaImageOverride(json);
          setVisaCode("");
        } else {
          setPtImageOverride(json);
          setPtCode("");
        }
      }
    } finally {
      setRefreshingPortal(null);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitManualCaptcha({
      visaCaptcha: activeVisaCaptcha ? visaCode.trim() : undefined,
      visaSessionId: activeVisaCaptcha?.sessionId,
      passtrackCaptcha: activePtCaptcha ? ptCode.trim() : undefined,
      passtrackSessionId: activePtCaptcha?.sessionId,
    });
    setVisaCode("");
    setPtCode("");
    setVisaImageOverride(null);
    setPtImageOverride(null);
  };

  return (
    <section
      aria-label="Live Dual-Portal Verification Pipeline"
      className="glass-panel p-5 sm:p-6 animate-rise"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <IconTile hue={captchaPrompt ? "amber" : "violet"} size={40}>
            {isRunning ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Waves className="h-5 w-5" />
            )}
          </IconTile>
          <div>
            <h3 className="font-display text-base font-bold text-[var(--ink)]">
              {captchaPrompt
                ? "Portal Captcha Verification Required"
                : "Live Dual-Portal Stream"}
            </h3>
            <p className="text-xs text-[var(--mut)]">
              {isRunning
                ? "Automatic local neural verification running across both portals"
                : "Pipeline status"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold tabular-nums text-[var(--mut)]">
          <span className="font-mono">{(elapsedMs / 1000).toFixed(1)}s</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono font-bold text-[var(--ink)]">{pct}%</span>
          {isRunning && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-glass-ghost rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Gradient Progress Track */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="mb-5 h-2 w-full overflow-hidden rounded-full"
        style={{ background: "var(--srf2)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #ffc14d, #f43f5e, #8b5cf6)",
          }}
        />
      </div>

      {/* 6-Stage Stepper Grid */}
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {steps.map((step) => {
          const isDone = step.state === "completed";
          const isActive = step.state === "active";
          return (
            <li
              key={step.step}
              className="flex items-start gap-3 rounded-2xl border p-3.5 transition-colors"
              style={{
                background: isDone
                  ? "rgba(var(--c-emerald), 0.12)"
                  : isActive
                    ? "rgba(var(--c-sky), 0.12)"
                    : "var(--inset)",
                borderColor: isDone
                  ? "rgba(var(--c-emerald), 0.42)"
                  : isActive
                    ? "rgba(var(--c-sky), 0.48)"
                    : "var(--line2)",
              }}
            >
              <div
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-mono font-bold"
                style={{
                  background: isDone
                    ? "linear-gradient(135deg, #4ade80, #0d9488)"
                    : isActive
                      ? "linear-gradient(135deg, #38bdf8, #8b5cf6)"
                      : "var(--srf2)",
                  color: isDone || isActive ? "#ffffff" : "var(--mut)",
                }}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5" />
                ) : isActive ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  step.step
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-display text-xs font-bold text-[var(--ink)]">
                    {step.title}
                  </span>
                  {typeof step.elapsedMs === "number" && (
                    <span className="font-mono text-[11px] tabular-nums text-[var(--mut2)]">
                      {(step.elapsedMs / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-[var(--mut)]">
                  {step.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Manual Captcha Verification Fallback */}
      {captchaPrompt && (
        <form
          onSubmit={handleManualSubmit}
          className="mt-6 border-t pt-5"
          style={{ borderColor: "var(--line2)" }}
        >
          <div className="mb-4 flex items-start gap-2.5 text-sm text-[var(--ink)]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tx-info)]" />
            <p>{captchaPrompt.reason}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {activeVisaCaptcha && (
              <div className="glass-inset p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--ink)]">
                    Indian Visa Online Access Code
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRefreshCaptcha("indianvisa")}
                    disabled={refreshingPortal === "indianvisa"}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[var(--tx-info)] hover:underline cursor-pointer"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${
                        refreshingPortal === "indianvisa" ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </button>
                </div>
                <div
                  className="mb-3 flex h-16 items-center justify-center rounded-xl border bg-white p-2"
                  style={{ borderColor: "var(--line)" }}
                >
                  <img
                    src={activeVisaCaptcha.imageDataUrl}
                    alt="Indian Visa Portal Access Code"
                    referrerPolicy="no-referrer"
                    className="max-h-12 object-contain"
                  />
                </div>
                <input
                  type="text"
                  required
                  value={visaCode}
                  onChange={(e) => setVisaCode(e.target.value)}
                  placeholder="Enter access code shown above"
                  autoComplete="off"
                  className="glass-input h-11 w-full px-3.5 font-mono text-sm"
                />
              </div>
            )}

            {activePtCaptcha && (
              <div className="glass-inset p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--ink)]">
                    IVAC Passtrack Verification Code
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRefreshCaptcha("passtrack")}
                    disabled={refreshingPortal === "passtrack"}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[var(--tx-info)] hover:underline cursor-pointer"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${
                        refreshingPortal === "passtrack" ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </button>
                </div>
                <div
                  className="mb-3 flex h-16 items-center justify-center rounded-xl border bg-white p-2"
                  style={{ borderColor: "var(--line)" }}
                >
                  <img
                    src={activePtCaptcha.imageDataUrl}
                    alt="IVAC Passtrack Verification Code"
                    referrerPolicy="no-referrer"
                    className="max-h-12 object-contain"
                  />
                </div>
                <input
                  type="text"
                  required
                  value={ptCode}
                  onChange={(e) => setPtCode(e.target.value)}
                  placeholder="Enter verification code shown above"
                  autoComplete="off"
                  className="glass-input h-11 w-full px-3.5 font-mono text-sm"
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="btn-glass-ghost rounded-xl px-4 py-2 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-glass-primary rounded-xl px-5 py-2 text-xs font-bold cursor-pointer"
            >
              Verify &amp; Complete Check
            </button>
          </div>
        </form>
      )}
    </section>
  );
};
