import React from "react";
import { Check, Eye, EyeOff, Globe, Palette, Shield } from "lucide-react";
import { GLASS_THEMES } from "../data/themes";
import { GlassThemeId } from "../types/visa";
import { IconTile } from "./IconTile";

interface AppearanceSectionProps {
  theme: GlassThemeId;
  lang: "en" | "bn";
  maskAppId: boolean;
  maskPassport: boolean;
  onSelectTheme: (
    theme: GlassThemeId,
    coords?: { x: number; y: number }
  ) => void;
  onChangeLang: (lang: "en" | "bn") => void;
  onToggleMaskAppId: () => void;
  onToggleMaskPassport: () => void;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  theme,
  lang,
  maskAppId,
  maskPassport,
  onSelectTheme,
  onChangeLang,
  onToggleMaskAppId,
  onToggleMaskPassport,
}) => {
  return (
    <div className="space-y-5 animate-rise">
      <div className="flex items-start gap-3.5">
        <IconTile hue="cyan" size={46}>
          <Palette className="h-6 w-6" />
        </IconTile>
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--ink)] sm:text-2xl">
            {lang === "bn" ? "থিম ও প্রাইভেসি সেটিংস" : "Themes & Preferences"}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--mut)] sm:text-sm">
            {lang === "bn"
              ? "পছন্দের গ্লাস থিম, নির্দেশনার ভাষা এবং প্রাইভেসি মাস্কিং নির্ধারণ করুন।"
              : "Pick a glass color mixture applied live across the entire tracker and saved on this device."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* 6 Glass Themes Grid */}
        <section
          aria-label="Theme Picker"
          className="glass-panel p-5 sm:p-6 xl:col-span-7"
        >
          <div className="mb-1 flex items-center gap-2.5">
            <Palette className="h-5 w-5 text-[var(--tx-info)]" />
            <h3 className="font-display text-base font-bold text-[var(--ink)]">
              Theme &amp; Appearance
            </h3>
          </div>
          <p className="mb-4 text-xs text-[var(--mut)]">
            Six glass palettes crafted for daylight clarity and night tracking.
            Default is Daylight Glass.
          </p>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
            {GLASS_THEMES.map((item) => {
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={(e) =>
                    onSelectTheme(item.id, { x: e.clientX, y: e.clientY })
                  }
                  className="flex items-center gap-3 rounded-2xl border p-3 text-left transition-all cursor-pointer hover:-translate-y-0.5"
                  style={{
                    background: isSelected
                      ? "rgba(var(--c-amber), 0.11)"
                      : "var(--srf)",
                    borderColor: isSelected
                      ? "rgba(var(--c-amber), 0.72)"
                      : "var(--line2)",
                    boxShadow: isSelected
                      ? "0 8px 20px -10px rgba(var(--c-amber), 0.55)"
                      : undefined,
                  }}
                >
                  <span
                    className="relative h-9 w-12 shrink-0 overflow-hidden rounded-xl border"
                    style={{
                      background: item.metaBg,
                      borderColor: "var(--line)",
                    }}
                  >
                    <span
                      className="absolute -left-1 -top-1 h-5 w-5 rounded-full blur-[5px]"
                      style={{ background: item.swatches[0] }}
                    />
                    <span
                      className="absolute -right-1 top-0.5 h-5 w-5 rounded-full blur-[5px]"
                      style={{ background: item.swatches[1] }}
                    />
                    <span
                      className="absolute -bottom-2 left-2.5 h-5 w-5 rounded-full blur-[5px]"
                      style={{ background: item.swatches[2] }}
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-xs font-bold text-[var(--ink)]">
                      {item.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium text-[var(--mut2)]">
                      {item.subtitle}
                    </span>
                  </span>

                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-[var(--tx-pos)]" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Language & Privacy Defaults */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1 xl:col-span-5">
          <section
            aria-label="Guidance Language"
            className="glass-panel p-5 sm:p-6"
          >
            <div className="mb-1 flex items-center gap-2.5">
              <Globe className="h-5 w-5 text-[var(--tx-info)]" />
              <h3 className="font-display text-base font-bold text-[var(--ink)]">
                Language / ভাষা
              </h3>
            </div>
            <p className="mb-4 text-xs text-[var(--mut)]">
              Controls guidance explanations and Tourist Visa checklist language.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onChangeLang("en")}
                className="flex items-center gap-2.5 rounded-2xl border p-3.5 text-left transition-all cursor-pointer"
                style={{
                  background:
                    lang === "en" ? "rgba(var(--c-amber), 0.13)" : "var(--srf)",
                  borderColor:
                    lang === "en"
                      ? "rgba(var(--c-amber), 0.68)"
                      : "var(--line2)",
                }}
              >
                <IconTile hue="sky" size={36}>
                  <Globe className="h-4 w-4" />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-sm font-bold text-[var(--ink)]">
                    English
                  </div>
                  <div className="text-[11px] text-[var(--mut)]">Default</div>
                </div>
                {lang === "en" && (
                  <Check className="h-4 w-4 shrink-0 text-[var(--tx-pos)]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onChangeLang("bn")}
                className="flex items-center gap-2.5 rounded-2xl border p-3.5 text-left transition-all cursor-pointer"
                style={{
                  background:
                    lang === "bn" ? "rgba(var(--c-amber), 0.13)" : "var(--srf)",
                  borderColor:
                    lang === "bn"
                      ? "rgba(var(--c-amber), 0.68)"
                      : "var(--line2)",
                }}
              >
                <IconTile hue="amber" size={36}>
                  <Globe className="h-4 w-4" />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <div className="font-bn text-sm font-bold text-[var(--ink)]">
                    বাংলা
                  </div>
                  <div className="font-bn text-[11px] text-[var(--mut)]">
                    বাংলাদেশ
                  </div>
                </div>
                {lang === "bn" && (
                  <Check className="h-4 w-4 shrink-0 text-[var(--tx-pos)]" />
                )}
              </button>
            </div>
          </section>

          <section
            aria-label="Privacy Masking Defaults"
            className="glass-panel p-5 sm:p-6"
          >
            <div className="mb-1 flex items-center gap-2.5">
              <Shield className="h-5 w-5 text-[var(--tx-pos)]" />
              <h3 className="font-display text-base font-bold text-[var(--ink)]">
                Privacy Masking
              </h3>
            </div>
            <p className="mb-4 text-xs text-[var(--mut)]">
              Automatically hide sensitive identifiers on screen and exported
              status images.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={onToggleMaskAppId}
                className="flex w-full items-center justify-between rounded-2xl border px-3.5 py-2.5 text-left text-xs font-semibold transition-colors cursor-pointer"
                style={{
                  background: "var(--srf)",
                  borderColor: "var(--line2)",
                }}
              >
                <span className="text-[var(--ink)]">
                  Mask Application ID (Web File)
                </span>
                <span className="inline-flex items-center gap-1.5 text-[var(--mut)]">
                  {maskAppId ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-[var(--tx-warn)]" />
                      <span>Masked</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5 text-[var(--tx-pos)]" />
                      <span>Visible</span>
                    </>
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={onToggleMaskPassport}
                className="flex w-full items-center justify-between rounded-2xl border px-3.5 py-2.5 text-left text-xs font-semibold transition-colors cursor-pointer"
                style={{
                  background: "var(--srf)",
                  borderColor: "var(--line2)",
                }}
              >
                <span className="text-[var(--ink)]">Mask Passport Number</span>
                <span className="inline-flex items-center gap-1.5 text-[var(--mut)]">
                  {maskPassport ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-[var(--tx-warn)]" />
                      <span>Masked</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5 text-[var(--tx-pos)]" />
                      <span>Visible</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
