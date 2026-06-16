"use client";

import { useState } from "react";

interface CopyButtonProps {
  /** Text written to the clipboard on click. */
  text: string;
  /** Idle button label. Defaults to "Copy". */
  label?: string;
}

/**
 * Small green-accent button that copies `text` and flashes "Copied!" for ~1.5s.
 */
export default function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable (e.g. insecure context) — fail silently.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        copied
          ? "inline-flex items-center rounded-md border border-[#11d4b3] bg-[#11d4b3]/10 px-2.5 py-1 text-[11px] font-medium text-[#065f4a] transition-colors"
          : "inline-flex items-center rounded-md border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-500 hover:border-[#065f4a] hover:text-[#065f4a] transition-colors"
      }
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
