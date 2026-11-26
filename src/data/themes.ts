import { GlassThemeId } from "../types/visa";

export interface GlassThemeDefinition {
  id: GlassThemeId;
  name: string;
  subtitle: string;
  isDark: boolean;
  metaBg: string;
  swatches: [string, string, string];
}

export const GLASS_THEMES: GlassThemeDefinition[] = [
  {
    id: "light",
    name: "Daylight Glass",
    subtitle: "Light canvas",
    isDark: false,
    metaBg: "#eef1f7",
    swatches: ["#60a5fa", "#c4b5fd", "#fbbf24"],
  },
  {
    id: "dark",
    name: "Night Highway",
    subtitle: "Dark canvas",
    isDark: true,
    metaBg: "#070b18",
    swatches: ["#6d5ef0", "#a78bfa", "#f59e0b"],
  },
  {
    id: "sunrise",
    name: "Sunrise Mix",
    subtitle: "Light canvas",
    isDark: false,
    metaBg: "#fbf0e1",
    swatches: ["#fbbf24", "#fb7185", "#c4b5fd"],
  },
  {
    id: "ocean",
    name: "Ocean Mix",
    subtitle: "Light canvas",
    isDark: false,
    metaBg: "#e4f2f7",
    swatches: ["#22d3ee", "#38bdf8", "#34d399"],
  },
  {
    id: "neon",
    name: "Neon Night",
    subtitle: "Dark canvas",
    isDark: true,
    metaBg: "#140724",
    swatches: ["#d946ef", "#8b5cf6", "#f43f5e"],
  },
  {
    id: "forest",
    name: "Forest Dusk",
    subtitle: "Dark canvas",
    isDark: true,
    metaBg: "#06120d",
    swatches: ["#10b981", "#a3e635", "#f59e0b"],
  },
];

export function isDarkGlassTheme(id: GlassThemeId): boolean {
  return GLASS_THEMES.find((t) => t.id === id)?.isDark ?? false;
}
