import { Fragment } from "react";
import { READINESS_SCALE_STEPS } from "../catalogs";
import { STAR_COLORS } from "../../shared/tokens";

interface ReadinessLevelScaleProps {
  selectedLevel: number;
  caption: string | null;
  description: string | null;
}

export function ReadinessLevelScale({
  selectedLevel,
  caption,
  description,
}: Readonly<ReadinessLevelScaleProps>) {
  return (
    <div
      className="flex flex-col gap-[10px] w-full max-w-[521px]"
      data-paginator-block
    >
      <p
        className="text-[11px] font-bold leading-[1.25] m-0 pb-1"
        style={{ color: STAR_COLORS.primaryBlue500 }}
      >
        Readiness level:
      </p>

      <div className="flex items-center w-full">
        {READINESS_SCALE_STEPS.map((step, index) => {
          const isSelected = step === selectedLevel;

          return (
            <Fragment key={step}>
              <div className="flex shrink-0 flex-col items-center">
                <div
                  className="flex items-center justify-center rounded-full border-2 font-normal leading-none"
                  style={{
                    width: isSelected ? 26 : 22,
                    height: isSelected ? 26 : 22,
                    fontSize: 10,
                    borderColor: STAR_COLORS.lightBlue300,
                    backgroundColor: isSelected
                      ? STAR_COLORS.lightBlue300
                      : STAR_COLORS.white,
                    color: isSelected
                      ? STAR_COLORS.white
                      : STAR_COLORS.lightBlue300,
                  }}
                >
                  {step}
                </div>
              </div>

              {index < READINESS_SCALE_STEPS.length - 1 && (
                <div
                  className="flex-1"
                  style={{
                    minWidth: 6,
                    height: 2.5,
                    backgroundColor: STAR_COLORS.grey300,
                  }}
                />
              )}
            </Fragment>
          );
        })}
      </div>

      {(caption || description) && (
        <div
          className="flex flex-col gap-1 border-l-[3.5px] pl-3 mt-3 mb-1.5"
          style={{ borderColor: STAR_COLORS.lightBlue300 }}
        >
          {caption && (
            <p
              className="text-[11px] font-bold leading-[1.25] m-0"
              style={{ color: STAR_COLORS.cardTitle }}
            >
              {caption}
            </p>
          )}
          {description && (
            <p
              className="text-[10px] font-normal leading-[1.35] m-0"
              style={{ color: STAR_COLORS.grey700 }}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
