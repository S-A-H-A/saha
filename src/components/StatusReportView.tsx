import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileCheck2,
  Gauge,
  PackageCheck,
  Printer,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { VisaCheckResponse, VisaStatusCategory } from "../types/visa";
import { getBilingualVisaGuidance, resolveIvacCenter } from "../data/ivacData";
import { downloadStatusCardPng } from "../utils/exportStatusCard";
import { IconTile, TileHue } from "./IconTile";

interface StatusReportViewProps {
  result: VisaCheckResponse;
  lang: "en" | "bn";
  maskAppId: boolean;
  maskPassport: boolean;
  submissionDate: string;
  autoRefreshIntervalMin: number;
  secondsUntilRefresh: number | null;
  statusChangedNotice: string | null;
  isRefreshing: boolean;
  onChangeLang: (lang: "en" | "bn") => void;
  onChangeSubmissionDate: (date: string) => void;
  onChangeAutoRefresh: (minutes: number) => void;
  onRefreshNow: () => void;
}

function getYesterdayIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function countWorkingDays(
  startIso: string,
  endDate = new Date()
): {
  calendarDays: number;
  workingDays: number;
} {
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );
  const diffMs = end.getTime() - start.getTime();
  const calendarDays = Math.max(0, Math.round(diffMs / 86400000));

  let workingDays = 0;
  const cursor = new Date(start);
  while (cursor < end) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    // Bangladesh IVAC working days: Sunday (0) through Thursday (4)
    if (day >= 0 && day <= 4) workingDays++;
  }
  return { calendarDays, workingDays };
}

function getStatusVisuals(category?: VisaStatusCategory): {
  hue: TileHue;
  rgb: string;
  textVar: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
} {
  switch (category) {
    case "processed_printed":
      return {
        hue: "emerald",
        rgb: "var(--c-emerald)",
        textVar: "var(--tx-pos)",
        Icon: CheckCircle2,
      };
    case "granted_not_printed":
      return {
        hue: "emerald",
        rgb: "var(--c-emerald)",
        textVar: "var(--tx-pos)",
        Icon: Printer,
      };
    case "under_processing":
      return {
        hue: "amber",
        rgb: "var(--c-amber)",
        textVar: "var(--tx-warn)",
        Icon: Clock,
      };
    case "attention_required":
    case "closed":
      return {
        hue: "rose",
        rgb: "var(--c-rose)",
        textVar: "var(--tx-neg)",
        Icon: XCircle,
      };
    case "not_found":
      return {
        hue: "sky",
        rgb: "var(--c-sky)",
        textVar: "var(--tx-info)",
        Icon: AlertTriangle,
      };
    default:
      return {
        hue: "violet",
        rgb: "var(--c-violet)",
        textVar: "var(--tx-violet)",
        Icon: FileCheck2,
      };
  }
}

export const StatusReportView: React.FC<StatusReportViewProps> = ({
  result,
  lang,
  maskAppId,
  maskPassport,
  submissionDate,
  autoRefreshIntervalMin,
  secondsUntilRefresh,
  statusChangedNotice,
  isRefreshing,
  onChangeLang,
  onChangeSubmissionDate,
  onChangeAutoRefresh,
  onRefreshNow,
}) => {
  const [maskName, setMaskName] = useState(false);

  const center = resolveIvacCenter(result.application_id);
  const guidance = getBilingualVisaGuidance(result.visa_portal.category);
  const visuals = getStatusVisuals(result.visa_portal.category);
  const StatusIcon = visuals.Icon;

  const deliveryData = useMemo(() => {
    const rawTable = result.passtrack.table || [];
    const headerRow =
      rawTable.length > 0 ? rawTable[0] : ["Step", "Process", "Status"];
    const rows = rawTable.length > 1 ? rawTable.slice(1) : [];
    const total = rows.length;
    const doneCount = rows.filter(
      (r) => r[2] && String(r[2]).toLowerCase().includes("done")
    ).length;
    const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
    const latestDone = [...rows]
      .reverse()
      .find((r) => r[2] && String(r[2]).toLowerCase().includes("done"));
    return {
      headerRow,
      rows,
      total,
      doneCount,
      pct,
      latestStepText: latestDone?.[1] || (rows[0]?.[1] ?? ""),
    };
  }, [result.passtrack.table]);

  const elapsedStats = useMemo(() => {
    if (!submissionDate) return null;
    return countWorkingDays(submissionDate);
  }, [submissionDate]);

  const isUnknownApplicant =
    !result.passtrack.applicant_name ||
    result.passtrack.applicant_name.trim().toLowerCase() === "unknown";

  const displayName = isUnknownApplicant
    ? "Unavailable"
    : maskName
      ? result.passtrack.applicant_name.replace(/[A-Za-z0-9]/g, "•")
      : result.passtrack.applicant_name;

  // Radial SVG ring geometry
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (deliveryData.pct / 100) * circumference;

  // Visa portal 4-stage lifecycle progress
  const visaLifecycle = [
    { label: "Submitted", done: true },
    {
      label: "Consular Review",
      done:
        result.visa_portal.category === "under_processing" ||
        result.visa_portal.category === "granted_not_printed" ||
        result.visa_portal.category === "processed_printed" ||
        result.visa_portal.category === "attention_required" ||
        result.visa_portal.category === "closed",
    },
    {
      label: "Decision / Granted",
      done:
        result.visa_portal.category === "granted_not_printed" ||
        result.visa_portal.category === "processed_printed",
    },
    {
      label: "Visa Printed",
      done: result.visa_portal.category === "processed_printed",
    },
  ];

  const completedStages = visaLifecycle.filter((s) => s.done).length;

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-5 animate-rise">
      {/* Live Watch & Actions Glass Toolbar */}
      <div className="glass-panel flex flex-col gap-3.5 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[var(--mut)]">
          <span className="font-mono font-bold text-[var(--tx-info)]">
            {maskAppId
              ? `${result.application_id.slice(0, 4)}••••••••`
              : result.application_id}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-[var(--ink)]">
            {center ? center.name : "Indian Mission / IVAC"}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            Checked {new Date(result.checked_at).toLocaleTimeString()}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            {(result.elapsed_ms / 1000).toFixed(1)}s
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:justify-start xl:justify-end">
          {/* Auto-Refresh Segmented Selector */}
          <div
            role="group"
            aria-label="Live Auto-Refresh Interval"
            className="flex items-center gap-1 rounded-2xl border p-1"
            style={{ background: "var(--srf)", borderColor: "var(--line2)" }}
          >
            <span className="px-2 text-[11px] font-bold text-[var(--mut)]">
              Auto-Watch
            </span>
            {[0, 5, 15].map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => onChangeAutoRefresh(min)}
                className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  autoRefreshIntervalMin === min
                    ? "bg-gradient-to-r from-amber-400/30 to-rose-400/25 text-[var(--ink)] shadow-xs"
                    : "text-[var(--mut)] hover:text-[var(--ink)]"
                }`}
              >
                {min === 0 ? "Off" : `${min}m`}
              </button>
            ))}
          </div>

          {secondsUntilRefresh !== null && autoRefreshIntervalMin > 0 && (
            <span className="font-mono text-xs font-bold tabular-nums text-[var(--tx-info)]">
              Next: {formatCountdown(secondsUntilRefresh)}
            </span>
          )}

          <button
            type="button"
            onClick={onRefreshNow}
            disabled={isRefreshing}
            className="btn-glass-ghost inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh Now</span>
          </button>

          <button
            type="button"
            onClick={() =>
              downloadStatusCardPng({
                result,
                maskAppId,
                maskPassport,
                maskName,
                submissionDate,
              })
            }
            className="btn-glass-emerald inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Save Status Image</span>
          </button>
        </div>
      </div>

      {statusChangedNotice && (
        <div
          role="status"
          className="glass-panel px-5 py-3.5 text-sm font-semibold"
          style={{
            borderColor: "rgba(var(--c-emerald), 0.55)",
            color: "var(--tx-pos)",
          }}
        >
          {statusChangedNotice}
        </div>
      )}

      {/* 4-Column KPI Stat Grid matching Uploaded HTML */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="glass-panel flex flex-col justify-between gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[var(--mut)]">
              Visa Portal Decision
            </span>
            <IconTile hue={visuals.hue} size={40}>
              <StatusIcon className="h-5 w-5" />
            </IconTile>
          </div>
          <div>
            <div
              className="font-display text-lg font-bold leading-tight"
              style={{ color: visuals.textVar }}
            >
              {result.visa_portal.label || guidance.enTitle}
            </div>
            <div className="mt-1 font-mono text-[11px] tabular-nums text-[var(--mut2)]">
              Stage {completedStages}/4 Consular Lifecycle
            </div>
          </div>
        </div>

        <div className="glass-panel flex flex-col justify-between gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[var(--mut)]">
              Passtrack Delivery
            </span>
            <IconTile hue="sky" size={40}>
              <PackageCheck className="h-5 w-5" />
            </IconTile>
          </div>
          <div>
            <div className="font-display text-2xl font-bold tabular-nums text-[var(--ink)]">
              {deliveryData.pct}%
            </div>
            <div className="mt-1 text-[11px] text-[var(--mut2)]">
              {deliveryData.rows.length > 0
                ? `${deliveryData.doneCount} of ${deliveryData.total} milestones done`
                : "Awaiting Passtrack milestones"}
            </div>
          </div>
        </div>

        <div className="glass-panel flex flex-col justify-between gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[var(--mut)]">
              Working Days Elapsed
            </span>
            <IconTile hue="violet" size={40}>
              <Calendar className="h-5 w-5" />
            </IconTile>
          </div>
          <div>
            <div className="font-display text-2xl font-bold tabular-nums text-[var(--ink)]">
              {elapsedStats ? `${elapsedStats.workingDays} days` : "—"}
            </div>
            <div className="mt-1 text-[11px] text-[var(--mut2)]">
              {elapsedStats
                ? `${elapsedStats.calendarDays} calendar days total (Sun–Thu)`
                : "Set submission date below"}
            </div>
          </div>
        </div>

        <div className="glass-panel flex flex-col justify-between gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[var(--mut)]">
              Live Verification
            </span>
            <IconTile hue="gold" size={40}>
              <Gauge className="h-5 w-5" />
            </IconTile>
          </div>
          <div>
            <div className="font-display text-2xl font-bold tabular-nums text-[var(--ink)]">
              {(result.elapsed_ms / 1000).toFixed(1)}s
            </div>
            <div className="mt-1 text-[11px] text-[var(--mut2)]">
              Direct dual-portal automatic query
            </div>
          </div>
        </div>
      </div>

      {/* Dual-Portal Primary Split */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 xl:items-stretch">
        {/* Left: Indian Visa Online Portal Decision */}
        <section
          aria-label="Indian Visa Online Portal Status"
          className="glass-panel flex flex-col justify-between p-5 sm:p-6 xl:col-span-5"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-12 xl:grid-cols-1">
            <div className="md:col-span-6 xl:col-span-1">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <IconTile hue={visuals.hue} size={40}>
                    <ShieldCheck className="h-5 w-5" />
                  </IconTile>
                  <h3 className="font-display text-base font-bold text-[var(--ink)]">
                    Indian Visa Online
                  </h3>
                </div>

                <div
                  className="flex items-center rounded-full border p-0.5"
                  style={{
                    background: "var(--srf)",
                    borderColor: "var(--line2)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onChangeLang("en")}
                    className={`rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap cursor-pointer ${
                      lang === "en"
                        ? "bg-gradient-to-r from-sky-400 to-violet-500 text-white"
                        : "text-[var(--mut)]"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeLang("bn")}
                    className={`font-bn rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap cursor-pointer ${
                      lang === "bn"
                        ? "bg-gradient-to-r from-sky-400 to-violet-500 text-white"
                        : "text-[var(--mut)]"
                    }`}
                  >
                    বাংলা
                  </button>
                </div>
              </div>

              {/* Semantic Status Panel */}
              <div
                className="rounded-2xl border p-4"
                style={{
                  background: `rgba(${visuals.rgb}, 0.12)`,
                  borderColor: `rgba(${visuals.rgb}, 0.45)`,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <StatusIcon
                    className="h-5 w-5 shrink-0"
                    style={{ color: visuals.textVar }}
                  />
                  <span
                    className="font-display text-lg font-bold"
                    style={{ color: visuals.textVar }}
                  >
                    {result.visa_portal.label || guidance.enTitle}
                  </span>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--ink)]">
                  {result.visa_portal.message}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between md:col-span-6 md:border-l md:pl-5 xl:col-span-1 xl:border-l-0 xl:pl-0" style={{ borderColor: "var(--line2)" }}>
              <p
                className={`text-sm leading-relaxed text-[var(--mut)] ${
                  lang === "bn" ? "font-bn" : ""
                }`}
              >
                {lang === "en" ? guidance.enDetail : guidance.bnDetail}
              </p>

              {/* 4-Stage Visa Processing Lifecycle Chart */}
              <div
                className="mt-5 border-t pt-4 xl:mt-6 xl:pt-5"
                style={{ borderColor: "var(--line2)" }}
              >
                <div className="mb-3 text-xs font-bold text-[var(--mut)]">
                  Consular Decision Lifecycle
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {visaLifecycle.map((stage, idx) => (
                    <div key={stage.label} className="flex flex-col gap-1.5">
                      <div
                        className="h-2 w-full rounded-full"
                        style={{
                          background: stage.done
                            ? "linear-gradient(90deg, #34d399, #2dd4bf)"
                            : "var(--srf2)",
                        }}
                      />
                      <span className="font-mono text-[11px] font-semibold tabular-nums text-[var(--mut2)]">
                        0{idx + 1}
                      </span>
                      <span
                        className={`text-xs font-semibold leading-tight ${
                          stage.done ? "text-[var(--ink)]" : "text-[var(--mut2)]"
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right: IVAC Passtrack Delivery Tracker & Visualizations */}
        <section
          aria-label="IVAC Passtrack Delivery Tracker"
          className="glass-panel p-5 sm:p-6 xl:col-span-7"
        >
          <div
            className="flex flex-wrap items-start justify-between gap-4 border-b pb-5"
            style={{ borderColor: "var(--line2)" }}
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <IconTile hue="amber" size={40}>
                  <PackageCheck className="h-5 w-5" />
                </IconTile>
                <h3 className="font-display text-base font-bold text-[var(--ink)]">
                  {center
                    ? `${center.name} Delivery Tracker`
                    : "IVAC Passtrack Delivery"}
                </h3>
              </div>

              <div className="flex items-center gap-2 pt-1 text-sm text-[var(--mut)]">
                <span>Applicant:</span>
                <span className="font-bold text-[var(--ink)]">
                  {displayName}
                </span>
                {!isUnknownApplicant && (
                  <button
                    type="button"
                    onClick={() => setMaskName((prev) => !prev)}
                    aria-label={
                      maskName ? "Show Applicant Name" : "Hide Applicant Name"
                    }
                    className="rounded-lg p-1 text-[var(--mut)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    {maskName ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>

              {deliveryData.latestStepText && (
                <div className="text-xs text-[var(--mut)]">
                  Current Milestone:{" "}
                  <span className="font-bold text-[var(--ink)]">
                    {deliveryData.latestStepText}
                  </span>
                </div>
              )}
            </div>

            {/* SVG Radial Progress Gauge with Gradient Stroke */}
            <div className="relative h-24 w-24 shrink-0">
              <svg viewBox="0 0 96 96" className="h-24 w-24 -rotate-90">
                <defs>
                  <linearGradient
                    id="radialProgressGrad"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#ffd166" />
                    <stop offset="55%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  fill="none"
                  stroke="var(--srf2)"
                  strokeWidth="8"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  fill="none"
                  stroke="url(#radialProgressGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-lg font-bold tabular-nums text-[var(--ink)]">
                  {deliveryData.pct}%
                </span>
                <span className="font-mono text-[10px] font-semibold tabular-nums text-[var(--mut2)]">
                  {deliveryData.doneCount}/{deliveryData.total || 4}
                </span>
              </div>
            </div>
          </div>

          {/* Submission Date & Elapsed Working Days */}
          <div
            className="my-5 flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: "var(--line2)" }}
          >
            <div className="flex items-center gap-3">
              <label
                htmlFor="submissionDatePicker"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--mut)]"
              >
                <Calendar className="h-3.5 w-3.5 text-[var(--tx-info)]" />
                <span>Submission Date</span>
              </label>
              <input
                id="submissionDatePicker"
                type="date"
                max={getYesterdayIso()}
                value={submissionDate}
                onChange={(e) => onChangeSubmissionDate(e.target.value)}
                className="glass-input px-3 py-1.5 font-mono text-xs"
              />
            </div>

            {elapsedStats ? (
              <div className="flex items-center gap-3 text-xs tabular-nums text-[var(--mut)]">
                <span>
                  <strong className="font-mono text-[var(--ink)]">
                    {elapsedStats.workingDays}
                  </strong>{" "}
                  working days elapsed
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  <strong className="font-mono text-[var(--ink)]">
                    {elapsedStats.calendarDays}
                  </strong>{" "}
                  calendar days total
                </span>
              </div>
            ) : (
              <span className="text-xs text-[var(--mut2)]">
                Select submission date to compute Sun–Thu working days
              </span>
            )}
          </div>

          {/* Passtrack Server Notice or Table */}
          {result.passtrack.status !== "success" ||
          deliveryData.rows.length === 0 ? (
            <div
              className="rounded-2xl border p-4 text-sm"
              style={{
                background: "rgba(var(--c-amber), 0.11)",
                borderColor: "rgba(var(--c-amber), 0.42)",
              }}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--tx-warn)]" />
                <div className="space-y-2">
                  <div className="font-display font-bold text-[var(--tx-warn)]">
                    {result.passtrack.status === "not-found"
                      ? "Passtrack Record Not Listed Yet"
                      : "IVAC Passtrack Notice"}
                  </div>
                  <p className="text-xs leading-relaxed text-[var(--ink)]">
                    {result.passtrack.message ||
                      "Delivery steps could not be loaded from IVAC Passtrack right now. You can also verify directly on the official Passtrack portal."}
                  </p>
                  <a
                    href="https://www.passtrack.net/regular_passport.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--tx-info)] hover:underline"
                  >
                    <span>Open Official Passtrack</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Visual Stepper Cards */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {deliveryData.rows.map((row, idx) => {
                  const isDone =
                    row[2] && String(row[2]).toLowerCase().includes("done");
                  return (
                    <div
                      key={`${row[0]}-${idx}`}
                      className="rounded-2xl border p-3"
                      style={{
                        background: isDone
                          ? "rgba(var(--c-emerald), 0.12)"
                          : "var(--inset)",
                        borderColor: isDone
                          ? "rgba(var(--c-emerald), 0.45)"
                          : "var(--line2)",
                      }}
                    >
                      <div className="flex items-center justify-between font-mono text-[11px] tabular-nums">
                        <span className="text-[var(--mut2)]">0{idx + 1}</span>
                        <span
                          className="font-bold"
                          style={{
                            color: isDone ? "var(--tx-pos)" : "var(--mut2)",
                          }}
                        >
                          {isDone ? "DONE" : "PENDING"}
                        </span>
                      </div>
                      <div className="mt-1.5 line-clamp-2 font-display text-xs font-bold leading-snug text-[var(--ink)]">
                        {row[1] || row[0]}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tabular Delivery Process Table */}
              <div
                className="overflow-x-auto rounded-2xl border"
                style={{ borderColor: "var(--line2)" }}
              >
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr
                      className="border-b text-[var(--mut)]"
                      style={{
                        background: "var(--inset)",
                        borderColor: "var(--line2)",
                      }}
                    >
                      {deliveryData.headerRow.map((h, i) => (
                        <th key={i} className="px-4 py-2.5 font-bold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryData.rows.map((row, rIdx) => {
                      const isDone =
                        row[2] && String(row[2]).toLowerCase().includes("done");
                      return (
                        <tr
                          key={rIdx}
                          className="border-t transition-colors hover:bg-[var(--srf)]"
                          style={{ borderColor: "var(--line2)" }}
                        >
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`px-4 py-2.5 ${
                                cIdx === 0
                                  ? "font-mono tabular-nums text-[var(--mut2)]"
                                  : ""
                              } ${
                                cIdx === 2
                                  ? "font-mono font-bold"
                                  : "font-medium text-[var(--ink)]"
                              }`}
                              style={
                                cIdx === 2
                                  ? {
                                      color: isDone
                                        ? "var(--tx-pos)"
                                        : "var(--mut2)",
                                    }
                                  : undefined
                              }
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
