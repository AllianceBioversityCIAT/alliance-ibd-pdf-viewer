// ── Shared UI primitives used across templates ──

export function SectionTitle({ children }: Readonly<{ children: string }>) {
  return (
    <p className="text-(--theme-mid) text-[14px] font-bold leading-[1.15]">
      {children}
    </p>
  );
}

export function SubSectionTitle({ children }: Readonly<{ children: string }>) {
  return (
    <p className="text-[#555554] text-[12px] leading-[1.15]">{children}</p>
  );
}

export function LabelValue({
  label,
  value,
  multiline,
}: Readonly<{
  label: string;
  value: string;
  multiline?: boolean;
}>) {
  return (
    <p className="text-[10px]" style={{ lineHeight: multiline ? 1.5 : 1.15 }}>
      <span className="font-bold text-[#1d1d1d]">{label}:</span>{" "}
      <span className="text-[#393939]">{value}</span>
    </p>
  );
}
