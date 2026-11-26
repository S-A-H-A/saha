import React from "react";
import {
  BookmarkCheck,
  FileText,
  Palette,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";
import { IconTile, TileHue } from "./IconTile";

export type AppSection = "tracker" | "requirements" | "history" | "appearance";

interface NavigationItem {
  id: AppSection;
  label: string;
  shortLabel: string;
  tabletLabel: string;
  hue: TileHue;
  rgbVar: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavigationItem[] = [
  {
    id: "tracker",
    label: "Status Tracker",
    shortLabel: "Tracker",
    tabletLabel: "Tracker",
    hue: "amber",
    rgbVar: "var(--c-amber)",
    Icon: SearchCheck,
  },
  {
    id: "requirements",
    label: "Visa Requirements",
    shortLabel: "Docs",
    tabletLabel: "Requirements",
    hue: "emerald",
    rgbVar: "var(--c-emerald)",
    Icon: FileText,
  },
  {
    id: "history",
    label: "Saved Enquiries",
    shortLabel: "Saved",
    tabletLabel: "Saved",
    hue: "violet",
    rgbVar: "var(--c-violet)",
    Icon: BookmarkCheck,
  },
  {
    id: "appearance",
    label: "Themes & Glass",
    shortLabel: "Themes",
    tabletLabel: "Themes",
    hue: "cyan",
    rgbVar: "var(--c-cyan)",
    Icon: Palette,
  },
];

interface SidebarProps {
  activeSection: AppSection;
  historyCount: number;
  lang: "en" | "bn";
  onChangeLang: (lang: "en" | "bn") => void;
  onNavigate: (section: AppSection) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  historyCount,
  lang,
  onChangeLang,
  onNavigate,
}) => {
  return (
    <aside
      aria-label="Primary Sidebar Navigation"
      className="glass-sidebar fixed bottom-0 left-0 top-0 z-20 hidden w-[258px] flex-col p-4 lg:flex"
    >
      {/* Brand lockup inside sidebar */}
      <a
        href="#tracker"
        onClick={(e) => {
          e.preventDefault();
          onNavigate("tracker");
        }}
        className="mb-6 flex items-center gap-3 px-1.5 py-1 whitespace-nowrap shrink-0"
      >
        <IconTile hue="multi" size={38}>
          <ShieldCheck className="h-5 w-5" />
        </IconTile>
        <span className="font-display text-lg font-bold tracking-tight title-grad">
          IndiaVisa Track
        </span>
      </a>

      <nav className="space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.Icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`group relative flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? "text-[var(--ink)]"
                  : "border-transparent text-[var(--mut)] hover:bg-[var(--srf)] hover:text-[var(--ink)] hover:translate-x-0.5"
              }`}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, rgba(${item.rgbVar}, 0.18), rgba(${item.rgbVar}, 0.05))`,
                      borderColor: `rgba(${item.rgbVar}, 0.42)`,
                    }
                  : undefined
              }
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-2.5 left-0 top-2.5 w-1 rounded-full"
                  style={{
                    background: `linear-gradient(180deg, rgba(${item.rgbVar}, 1), rgba(${item.rgbVar}, 0.45))`,
                  }}
                />
              )}
              <IconTile hue={item.hue} size={36}>
                <Icon className="h-[18px] w-[18px]" />
              </IconTile>
              <span className="truncate whitespace-nowrap">{item.label}</span>
              {item.id === "history" && historyCount > 0 && (
                <span className="ml-auto font-mono text-xs tabular-nums text-[var(--mut2)]">
                  {historyCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div
        className="mt-auto space-y-3 rounded-2xl border p-3.5"
        style={{ background: "var(--srf)", borderColor: "var(--line2)" }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-[var(--ink)]">
            Guidance Language
          </span>
          <div
            role="group"
            aria-label="Guidance Language"
            className="flex items-center rounded-full border p-0.5"
            style={{
              background: "var(--inset)",
              borderColor: "var(--line)",
            }}
          >
            <button
              type="button"
              onClick={() => onChangeLang("en")}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                lang === "en"
                  ? "bg-gradient-to-r from-sky-400 to-violet-500 text-white shadow-sm"
                  : "text-[var(--mut)] hover:text-[var(--ink)]"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onChangeLang("bn")}
              className={`font-bn rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                lang === "bn"
                  ? "bg-gradient-to-r from-sky-400 to-violet-500 text-white shadow-sm"
                  : "text-[var(--mut)] hover:text-[var(--ink)]"
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>
        <p className="text-[11px] leading-relaxed text-[var(--mut)]">
          Queries Indian Visa Online and IVAC Passtrack directly with automated
          local verification.
        </p>
      </div>
    </aside>
  );
};

interface BottomNavProps {
  activeSection: AppSection;
  historyCount?: number;
  onNavigate: (section: AppSection) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeSection,
  historyCount = 0,
  onNavigate,
}) => {
  const activeIdx = Math.max(
    0,
    NAV_ITEMS.findIndex((i) => i.id === activeSection)
  );
  const activeItem = NAV_ITEMS[activeIdx];

  return (
    <nav
      aria-label="Mobile and Tablet Navigation"
      className="glass-bar fixed bottom-2.5 left-3 right-3 z-30 grid grid-cols-4 rounded-3xl border p-1.5 shadow-xl sm:bottom-4 sm:left-1/2 sm:right-auto sm:w-[480px] sm:-translate-x-1/2 lg:hidden"
      style={{ borderColor: "var(--line)" }}
    >
      {/* Sliding active pill indicator */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-2 h-8 w-12 -translate-x-1/2 rounded-xl border transition-all duration-300 ease-out sm:w-16"
        style={{
          left: `calc(${activeIdx * 25}% + 12.5%)`,
          background: `rgba(${activeItem.rgbVar}, 0.20)`,
          borderColor: `rgba(${activeItem.rgbVar}, 0.50)`,
          boxShadow: `0 6px 16px -6px rgba(${activeItem.rgbVar}, 0.65)`,
        }}
      />

      {NAV_ITEMS.map((item) => {
        const isActive = activeSection === item.id;
        const Icon = item.Icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`relative z-10 flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl py-1 transition-colors cursor-pointer ${
              isActive ? "text-[var(--ink)]" : "text-[var(--mut2)]"
            }`}
          >
            <span className="relative flex h-7 w-11 items-center justify-center">
              <Icon className="h-[19px] w-[19px]" />
              {item.id === "history" && historyCount > 0 && (
                <span className="absolute -right-1 top-0 font-mono text-[10px] font-bold tabular-nums text-[var(--tx-info)]">
                  {historyCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-bold whitespace-nowrap sm:hidden">
              {item.shortLabel}
            </span>
            <span className="hidden text-[11px] font-bold whitespace-nowrap sm:inline">
              {item.tabletLabel}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
