/**
 * Dynamic color theming for the PRMS results template.
 *
 * Each Science Program (SP) can define its own palette. The template
 * resolves the theme from `primary_submitter_name` and injects CSS
 * custom properties that cascade to every component:
 *
 *   --theme-header-bg   Header background, dark text accents
 *   --theme-accent      Highlighted links, badges (header area)
 *   --theme-mid         Section titles, inline links, footer label
 *   --theme-deep        QA sidebar, table headers, emphasis text
 *
 * To add a new theme, add an entry to `SP_THEMES` keyed by the SP
 * code (e.g. "SP03"). The key is matched against the prefix of
 * `primary_submitter_name` (case-insensitive).
 */

export interface ThemeColors {
  headerBg: string;
  accent: string;
  mid: string;
  deep: string;
}

export const DEFAULT_THEME: ThemeColors = {
  headerBg: "#03211a",
  accent: "#11d4b3",
  mid: "#065f4a",
  deep: "#033529",
};

export const SP_THEMES: Record<string, ThemeColors> = {
  SP01: {
    headerBg: "#CA3245",
    accent: "#FFDEE3",
    mid: "#F37E92",
    deep: "#CA3245",
  },
  SP02: {
    headerBg: "#494C33",
    accent: "#A79F7E",
    mid: "#A79F7E",
    deep: "#494C33",
  },
  SP03: {
    headerBg: "#E56C4C",
    accent: "#FFDB80",
    mid: "#FED15D",
    deep: "#E56C4C",
  },
  SP04: {
    headerBg: "#154D30",
    accent: "#65C192",
    mid: "#65C192",
    deep: "#154D30",
  },
  SP05: {
    headerBg: "#79634B",
    accent: "#D0B58F",
    mid: "#D0B58F",
    deep: "#79634B",
  },
  SP06: {
    headerBg: "#1F56A4",
    accent: "#AEC9E4",
    mid: "#72A3D5",
    deep: "#1F56A4",
  },
  SP07: {
    headerBg: "#CC9D3D",
    accent: "#FFF6C7",
    mid: "#FBE98C",
    deep: "#CC9D3D",
  },
  SP08: {
    headerBg: "#0F727F",
    accent: "#6DCDE6",
    mid: "#6DCDE6",
    deep: "#0F727F",
  },
  SP09: {
    headerBg: "#743C94",
    accent: "#E1A0FF",
    mid: "#D787FC",
    deep: "#743C94",
  },
  SP10: {
    headerBg: "#DB3E42",
    accent: "#FFC19C",
    mid: "#F89962",
    deep: "#DB3E42",
  },
  SP11: {
    headerBg: "#313080",
    accent: "#9F9AC9",
    mid: "#9F9AC9",
    deep: "#313080",
  },
  SP12: {
    headerBg: "#93246C",
    accent: "#E493BD",
    mid: "#E493BD",
    deep: "#93246C",
  },
  SP13: {
    headerBg: "#5D864E",
    accent: "#C0EBAA",
    mid: "#AAD495",
    deep: "#5D864E",
  },
};

export function getThemeColors(
  primarySubmitterName?: string | null
): ThemeColors {
  if (!primarySubmitterName) return DEFAULT_THEME;

  const match = /^(SP\d+)/i.exec(primarySubmitterName);
  if (match) {
    const code = match[1].toUpperCase();
    if (SP_THEMES[code]) return SP_THEMES[code];
  }

  return DEFAULT_THEME;
}

/**
 * Returns a CSSProperties-compatible object that sets all theme
 * custom properties. Spread this on the root element of the template.
 */
export function themeVars(theme: ThemeColors): Record<string, string> {
  return {
    "--theme-header-bg": theme.headerBg,
    "--theme-accent": theme.accent,
    "--theme-mid": theme.mid,
    "--theme-deep": theme.deep,
  };
}
