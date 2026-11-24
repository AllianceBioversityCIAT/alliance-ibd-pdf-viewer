export function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** Resolves `icon` from STAR JSON — non-empty absolute URL (e.g. S3) */
export function getLeverIconUrl(icon: string | null | undefined): string | null {
  if (typeof icon !== "string") return null;
  const trimmed = icon.trim();
  if (!trimmed) return null;
  return trimmed;
}

export function shouldRenderLeverIcon(icon: string | null | undefined): boolean {
  return getLeverIconUrl(icon) !== null;
}

/** ISO 3166-1 alpha-2 code, lowercased ("ke"), or null when the value is not a 2-letter code. */
export function normalizeIsoAlpha2(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const iso = value.trim().toLowerCase();
  return /^[a-z]{2}$/.test(iso) ? iso : null;
}

/** Absolute http(s) URL, trimmed; anything else (ids, relative paths, text with spaces) is null. */
export function normalizeHttpUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const url = value.trim();
  return /^https?:\/\/\S+$/i.test(url) ? url : null;
}

export function hasArrayItems<T>(value: T[] | null | undefined): boolean {
  return Array.isArray(value) && value.length > 0;
}

export function formatDate(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toLocaleDateString("en-GB");
  }
  const trimmed = String(value).trim();
  if (trimmed.length === 0) return null;
  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toLocaleDateString("en-GB");
  }
  return trimmed;
}

export function formatBoolean(
  value: boolean | number | null | undefined,
): string | null {
  if (value === true || value === 1) return "Yes";
  if (value === false || value === 0) return "No";
  return null;
}

export function joinNonEmpty(parts: (string | null | undefined)[], sep = ", "): string | null {
  const filtered = parts.filter((p): p is string => hasText(p));
  return filtered.length > 0 ? filtered.join(sep) : null;
}
