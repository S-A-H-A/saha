import React from "react";
import {
  Banknote,
  Briefcase,
  Camera,
  Check,
  FileText,
  Fingerprint,
  ScrollText,
} from "lucide-react";
import { TOURIST_VISA_REQUIREMENTS } from "../data/ivacData";
import { IconTile, TileHue } from "./IconTile";

interface RequirementsSectionProps {
  lang: "en" | "bn";
  onChangeLang: (lang: "en" | "bn") => void;
}

const STEP_VISUALS: { hue: TileHue; Icon: React.ComponentType<{ className?: string }> }[] = [
  { hue: "amber", Icon: ScrollText },
  { hue: "sky", Icon: Camera },
  { hue: "violet", Icon: Fingerprint },
  { hue: "emerald", Icon: Banknote },
  { hue: "rose", Icon: Briefcase },
  { hue: "cyan", Icon: FileText },
];

export const RequirementsSection: React.FC<RequirementsSectionProps> = ({
  lang,
  onChangeLang,
}) => {
  const sections = TOURIST_VISA_REQUIREMENTS[lang];

  return (
    <div className={`space-y-5 animate-rise ${lang === "bn" ? "font-bn" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <IconTile hue="emerald" size={46}>
            <FileText className="h-6 w-6" />
          </IconTile>
          <div>
            <h2 className="font-display text-xl font-bold text-[var(--ink)] sm:text-2xl">
              {lang === "en"
                ? "India Tourist Visa Requirements"
                : "বাংলাদেশিদের জন্য ভারতীয় ট্যুরিস্ট ভিসার প্রয়োজনীয় কাগজপত্র"}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--mut)] sm:text-sm">
              {lang === "en"
                ? "Standard document checklist for Bangladeshi passport holders."
                : "ভারতীয় ট্যুরিস্ট ভিসা আবেদনের প্রয়োজনীয় কাগজপত্রের পূর্ণাঙ্গ তালিকা।"}
            </p>
          </div>
        </div>

        <div
          role="group"
          aria-label="Requirements Language"
          className="flex items-center rounded-full border p-1"
          style={{ background: "var(--srf)", borderColor: "var(--line)" }}
        >
          <button
            type="button"
            onClick={() => onChangeLang("en")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              lang === "en"
                ? "bg-gradient-to-r from-sky-400 to-violet-500 text-white shadow-sm"
                : "text-[var(--mut)] hover:text-[var(--ink)]"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => onChangeLang("bn")}
            className={`font-bn rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              lang === "bn"
                ? "bg-gradient-to-r from-sky-400 to-violet-500 text-white shadow-sm"
                : "text-[var(--mut)] hover:text-[var(--ink)]"
            }`}
          >
            বাংলা
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sections.map((sec, idx) => {
          const vis = STEP_VISUALS[idx % STEP_VISUALS.length];
          const StepIcon = vis.Icon;
          return (
            <section
              key={sec.step}
              className="glass-panel p-5 hover:-translate-y-0.5"
            >
              <div className="mb-3.5 flex items-center gap-3">
                <IconTile hue={vis.hue} size={40}>
                  <StepIcon className="h-5 w-5" />
                </IconTile>
                <div>
                  <span className="font-mono text-[11px] font-bold text-[var(--mut2)] tabular-nums">
                    {sec.step}
                  </span>
                  <h3 className="font-display text-base font-bold text-[var(--ink)]">
                    {sec.title}
                  </h3>
                </div>
              </div>

              <ul className="space-y-2.5 text-sm leading-relaxed text-[var(--mut)]">
                {sec.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2.5">
                    <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-[var(--tx-pos)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
};
