import { normalizeIsoAlpha2 } from "../utils";

/** Country flag from flagcdn (PNG renders reliably in Gotenberg). Renders nothing for an invalid code. */
export function CountryFlag({ isoAlpha2 }: Readonly<{ isoAlpha2: string | null | undefined }>) {
  const iso = normalizeIsoAlpha2(isoAlpha2);
  if (!iso) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w20/${iso}.png`}
      alt=""
      width={16}
      height={13}
      className="inline-block w-4 h-[13px] object-cover rounded-[2px] shrink-0"
      aria-hidden
    />
  );
}
