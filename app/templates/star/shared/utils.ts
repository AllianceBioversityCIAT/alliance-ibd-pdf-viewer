export function hasText(value: unknown): boolean {
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
