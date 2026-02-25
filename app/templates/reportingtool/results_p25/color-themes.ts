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
  iconBg: string;
  iconAccent: string;
  iconMid: string;
}

export const DEFAULT_THEME: ThemeColors = {
  headerBg: "#03211a",
  accent: "#11d4b3",
  mid: "#065f4a",
  deep: "#033529",
  iconBg: "#043629",
  iconAccent: "#82AFA5",
  iconMid: "#58F8D2",
};

export const SP_THEMES: Record<string, ThemeColors> = {
  SP01: {
    headerBg: "#CA3245",
    accent: "#FFDEE3",
    mid: "#F37E92",
    deep: "#CA3245",

    iconBg: "#72292B",
    iconAccent: "#BD888C",
    iconMid: "#E58F89",
  },
  SP02: {
    headerBg: "#494C33",
    accent: "#A79F7E",
    mid: "#A79F7E",
    deep: "#494C33",

    iconBg: "#4B593D",
    iconAccent: "#A3A49D",
    iconMid: "#96AF49",
  },
  SP03: {
    headerBg: "#E56C4C",
    accent: "#FFDB80",
    mid: "#FED15D",
    deep: "#E56C4C",

    iconBg: "#E67A58",
    iconAccent: "#CCC",
    iconMid: "#FBE967",
  },
  SP04: {
    headerBg: "#154D30",
    accent: "#65C192",
    mid: "#65C192",
    deep: "#154D30",

    iconBg: "#06382C",
    iconAccent: "#90A7A2",
    iconMid: "#A2DF9A",
  },
  SP05: {
    headerBg: "#79634B",
    accent: "#D0B58F",
    mid: "#D0B58F",
    deep: "#79634B",

    iconBg: "#806F5A",
    iconAccent: "#DECDB3",
    iconMid: "#C2A881",
  },
  SP06: {
    headerBg: "#1F56A4",
    accent: "#AEC9E4",
    mid: "#72A3D5",
    deep: "#1F56A4",

    iconBg: "#1F56A4",
    iconAccent: "#A8A5A9",
    iconMid: "#94CBE8",
  },
  SP07: {
    headerBg: "#CC9D3D",
    accent: "#FFF6C7",
    mid: "#FBE98C",
    deep: "#CC9D3D",

    iconBg: "#C6A15E",
    iconAccent: "#A4A4A4",
    iconMid: "#FFF5B4",
  },
  SP08: {
    headerBg: "#0F727F",
    accent: "#6DCDE6",
    mid: "#6DCDE6",
    deep: "#0F727F",

    iconBg: "#054146",
    iconAccent: "#83ABA4",
    iconMid: "#80D0EE",
  },
  SP09: {
    headerBg: "#743C94",
    accent: "#E1A0FF",
    mid: "#D787FC",
    deep: "#743C94",

    iconBg: "#61446E",
    iconAccent: "#BFB0B8",
    iconMid: "#F7BCC9",
  },
  SP10: {
    headerBg: "#DB3E42",
    accent: "#FFC19C",
    mid: "#F89962",
    deep: "#DB3E42",

    iconBg: "#B44844",
    iconAccent: "#B3B3B3",
    iconMid: "#F09542",
  },
  SP11: {
    headerBg: "#313080",
    accent: "#9F9AC9",
    mid: "#9F9AC9",
    deep: "#313080",

    iconBg: "#2B2960",
    iconAccent: "#BAADD6",
    iconMid: "#822287",
  },
  SP12: {
    headerBg: "#93246C",
    accent: "#E493BD",
    mid: "#E493BD",
    deep: "#93246C",

    iconBg: "#64254B",
    iconAccent: "#BBADCD",
    iconMid: "#FC87A2",
  },
  SP13: {
    headerBg: "#5D864E",
    accent: "#C0EBAA",
    mid: "#AAD495",
    deep: "#5D864E",

    iconBg: "#326E5A",
    iconAccent: "#A3AFAB",
    iconMid: "#AAEA77",
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
    "--theme-icon-bg": theme.iconBg,
    "--theme-icon-accent": theme.iconAccent,
    "--theme-icon-mid": theme.iconMid,
  };
}
