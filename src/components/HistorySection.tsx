import React, { useMemo, useState } from "react";
import { BookmarkCheck, RefreshCw, Search, Trash2 } from "lucide-react";
import { SearchHistoryEntry } from "../types/visa";
import { resolveIvacCenter } from "../data/ivacData";
import { IconTile } from "./IconTile";

interface HistorySectionProps {
  entries: SearchHistoryEntry[];
  maskAppId: boolean;
  onRecheck: (entry: SearchHistoryEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#f59e0b,#db2777)",
  "linear-gradient(135deg,#38bdf8,#7c3aed)",
  "linear-gradient(135deg,#34d399,#0d9488)",
  "linear-gradient(135deg,#fb7185,#f59e0b)",
  "linear-gradient(135deg,#a78bfa,#2563eb)",
];

function getGradientFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  entries,
  maskAppId,
  onRecheck,
  onDelete,
  onClearAll,
}) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((item) =>
      [
        item.application_id,
        item.applicant_name || "",
        item.visa_label || "",
        resolveIvacCenter(item.application_id)?.name || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [entries, query]);

  return (
    <div className="space-y-5 animate-rise">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <IconTile hue="violet" size={46}>
            <BookmarkCheck className="h-6 w-6" />
          </IconTile>
          <div>
            <h2 className="font-display text-xl font-bold text-[var(--ink)] sm:text-2xl">
              Saved Visa Enquiries
            </h2>
            <p className="mt-0.5 text-xs text-[var(--mut)] sm:text-sm">
              Stored locally on your device for instant one-click status
              re-verification.
            </p>
          </div>
        </div>

        {entries.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="btn-glass-ghost rounded-xl px-3.5 py-2 text-xs font-bold cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {entries.length > 0 && (
        <div className="glass-panel p-3.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mut2)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Application ID, applicant name, or decision..."
              aria-label="Search saved visa enquiries"
              className="glass-input h-11 w-full pl-10 pr-4 text-sm"
            />
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center px-6 py-14 text-center">
          <IconTile hue="violet" size={64}>
            <BookmarkCheck className="h-8 w-8" />
          </IconTile>
          <h3 className="mt-4 font-display text-lg font-bold text-[var(--ink)]">
            No saved enquiries yet
          </h3>
          <p className="mt-1 max-w-sm text-xs text-[var(--mut)] sm:text-sm">
            Run a live visa status check in the Status Tracker tab to store and
            monitor your application here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel px-6 py-10 text-center text-sm text-[var(--mut)]">
          No saved enquiries match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((item) => {
            const center = resolveIvacCenter(item.application_id);
            const pct =
              typeof item.passtrack_progress_pct === "number"
                ? item.passtrack_progress_pct
                : 0;
            const label = item.applicant_name
              ? item.applicant_name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
              : item.application_id.slice(0, 2);

            return (
              <article
                key={item.id}
                className="glass-panel flex flex-col justify-between p-5 hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3.5">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/40 font-display text-sm font-bold text-white shadow-md"
                    style={{ background: getGradientFor(item.application_id) }}
                  >
                    {label}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-bold text-[var(--tx-info)]">
                        {maskAppId
                          ? `${item.application_id.slice(0, 4)}••••••••`
                          : item.application_id}
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-[var(--mut2)]">
                        {new Date(item.last_checked_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-1 truncate font-display text-base font-bold text-[var(--ink)]">
                      {item.applicant_name || (center ? center.name : "Indian Visa Applicant")}
                    </div>

                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[var(--mut)]">
                      <span>{center ? center.shortName : "IVAC"}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[var(--ink)]">
                        {item.visa_label || "Checked"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery progress bar */}
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-[var(--mut)]">
                    <span>
                      {item.latest_delivery_step || "Delivery Progress"}
                    </span>
                    <span className="font-mono tabular-nums text-[var(--ink)]">
                      {typeof item.passtrack_progress_pct === "number"
                        ? `${pct}%`
                        : "—"}
                    </span>
                  </div>
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full"
                    style={{ background: "var(--srf2)" }}
                  >
                    <div
                      className="h-full rounded-full animate-bar-grow"
                      style={{
                        width: `${Math.max(4, pct)}%`,
                        background:
                          pct >= 75
                            ? "linear-gradient(90deg, #34d399, #a3e635)"
                            : "linear-gradient(90deg, #38bdf8, #8b5cf6)",
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] tabular-nums text-[var(--mut2)]">
                    Checked {new Date(item.last_checked_at).toLocaleTimeString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onRecheck(item)}
                      className="btn-glass-primary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Re-check</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      aria-label={`Remove ${item.application_id}`}
                      className="btn-glass-ghost flex h-8 w-8 items-center justify-center rounded-xl text-[var(--tx-neg)] cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
