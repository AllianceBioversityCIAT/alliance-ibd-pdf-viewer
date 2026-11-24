import { STAR_COLORS } from "../tokens";

function LinkIcon({ size = 10 }: Readonly<{ size?: number }>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 11 11"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M4.5 1.5H2.75C2.06 1.5 1.5 2.06 1.5 2.75V8.25C1.5 8.94 2.06 9.5 2.75 9.5H8.25C8.94 9.5 9.5 8.94 9.5 8.25V6.5"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
      />
      <path
        d="M6 1.5H9.5V5M9.5 1.5L5 6"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** "↗ Access link" in STAR light blue. Opens in a new tab. `iconOnly` drops the text. */
export function AccessLink({
  href,
  iconOnly = false,
}: Readonly<{ href: string; iconOnly?: boolean }>) {
  if (iconOnly) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center shrink-0"
        style={{ color: STAR_COLORS.lightBlue300 }}
        aria-label="Access link"
        title="Access link"
      >
        <LinkIcon size={12} />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-[3px] hover:underline  text-[10px] font-medium leading-normal"
      style={{ color: STAR_COLORS.lightBlue300 }}
    >
      <LinkIcon />
      <span className="pb-0.5"> Access link</span>
    </a>
  );
}
