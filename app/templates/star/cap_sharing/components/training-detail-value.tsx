import type { ReactNode } from "react";
import { SUPERVISOR_AVATAR_COLOR } from "../assets";
import { STAR_COLORS } from "../../shared/tokens";

interface TrainingDetailIconValueProps {
  iconSrc: string;
  children: ReactNode;
  iconWidth?: number;
  iconHeight?: number;
}

export function TrainingDetailIconValue({
  iconSrc,
  children,
  iconWidth = 13,
  iconHeight = 13,
}: Readonly<TrainingDetailIconValueProps>) {
  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={iconSrc}
        alt=""
        width={iconWidth}
        height={iconHeight}
        className="shrink-0"
        aria-hidden
      />
      <span className="break-words">{children}</span>
    </span>
  );
}

interface SupervisorDetailValueProps {
  initials: string;
  display: string;
}

export function SupervisorDetailValue({
  initials,
  display,
}: Readonly<SupervisorDetailValueProps>) {
  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      <span
        className="inline-flex items-center justify-center shrink-0 rounded-full text-[9px] font-semibold leading-none uppercase"
        style={{
          width: 22,
          height: 22,
          backgroundColor: SUPERVISOR_AVATAR_COLOR,
          color: STAR_COLORS.white,
        }}
        aria-hidden
      >
        {initials}
      </span>
      <span className="break-words">{display}</span>
    </span>
  );
}

function CountryFlag({ isoAlpha2 }: Readonly<{ isoAlpha2: string }>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w20/${isoAlpha2.trim().toLowerCase()}.png`}
      alt=""
      width={16}
      height={13}
      className="w-4 h-[13px] object-cover rounded-[2px] shrink-0"
      aria-hidden
    />
  );
}

interface TraineeNationalityValueProps {
  isoAlpha2?: string | null;
  label: string;
}

export function TraineeNationalityValue({
  isoAlpha2,
  label,
}: Readonly<TraineeNationalityValueProps>) {
  const iso = isoAlpha2?.trim();

  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      {iso && <CountryFlag isoAlpha2={iso} />}
      <span className="break-words">{label}</span>
    </span>
  );
}
