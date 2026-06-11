import { SCALING_SCALE_STEPS } from "../catalogs";
import { STAR_COLORS } from "../../shared/tokens";

const SCALE_MAX = SCALING_SCALE_STEPS.length;

interface ScalingScaleBarProps {
  value: number;
}

export function ScalingScaleBar({ value }: Readonly<ScalingScaleBarProps>) {
  const filled = Math.min(Math.max(Math.round(value), 0), SCALE_MAX);

  return (
    <div className="flex items-center gap-2">
      <span
        className="text-[10px] font-semibold leading-none tabular-nums shrink-0"
        style={{ color: STAR_COLORS.bodyText }}
      >
        {filled}/{SCALE_MAX}
      </span>
      <div className="flex items-center gap-px" aria-hidden>
        {SCALING_SCALE_STEPS.map((step) => (
          <span
            key={step}
            className="inline-block"
            style={{
              width: 11,
              height: 9,
              borderRadius: 1,
              backgroundColor:
                step <= filled
                  ? STAR_COLORS.lightBlue300
                  : STAR_COLORS.grey300,
            }}
          />
        ))}
      </div>
    </div>
  );
}
