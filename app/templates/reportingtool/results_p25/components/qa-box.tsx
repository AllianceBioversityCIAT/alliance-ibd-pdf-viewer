import Image from "next/image";
import type { QAInfo } from "../types";

const BADGE_IMAGES: Record<string, { src: string; invert?: boolean }> = {
  kp: { src: "/assets/prms/figma-badge-kp.png", invert: true },
  mqap: { src: "/assets/prms/figma-badge-mqap.png" },
  "two-assessors": { src: "/assets/prms/badge-two-assessors.png", invert: true },
  senior: { src: "/assets/prms/badge-two-assessors.png", invert: true },
  "senior-innovation": { src: "/assets/prms/shield-badge.png" },
  "in-progress": { src: "/assets/prms/badge-qa-in-progress.png" },
};

function ArrowRight() {
  return (
    <svg
      width="11"
      height="8"
      viewBox="0 0 11 8"
      fill="none"
      className="text-[#033529] shrink-0"
    >
      <path
        d="M7 1L10 4M10 4L7 7M10 4H1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BadgeImage({ badge }: Readonly<{ badge: string }>) {
  const entry = BADGE_IMAGES[badge] ?? { src: "/assets/prms/shield-badge.png" };
  return (
    <Image
      src={entry.src}
      alt="Quality Assured"
      width={57}
      height={57}
      className="w-[57px] h-[57px] object-contain"
      style={entry.invert ? { filter: "brightness(0) invert(1)" } : undefined}
    />
  );
}

export function QABox({ qaInfo }: Readonly<{ qaInfo: QAInfo }>) {
  return (
    <div className="bg-[#e2e0df] flex overflow-hidden">
      <div
        className="bg-[#033529] flex items-center justify-center shrink-0"
        style={{ width: 106, padding: "8px 17px" }}
      >
        <BadgeImage badge={qaInfo.badge} />
      </div>
      <div className="flex flex-col gap-[12px] py-[15px] px-[22px] flex-1 min-w-0">
        <div className="flex flex-col gap-[8px]">
          <p className="text-[#02211a] text-[11px] font-bold leading-[1.15]">
            {qaInfo.title}
          </p>
          <p className="text-[#818181] text-[8px] leading-normal">
            {qaInfo.description}
            {qaInfo.qa_url && (
              <>
                {" "}
                <a href={qaInfo.qa_url} className="text-[#065f4a] underline">
                  QA process.
                </a>
              </>
            )}
          </p>
        </div>
        {!!qaInfo.adjustments?.length && (
          <div className="flex flex-col gap-[5px]">
            {qaInfo.adjustments_title && (
              <p className="text-[#1d1d1d] text-[9px] font-bold leading-[1.15]">
                {qaInfo.adjustments_title}
              </p>
            )}
            <div className="flex flex-col gap-[3px]">
              {qaInfo.adjustments.map((adj, i) =>
                adj.from_value ? (
                  <div
                    key={`qa-adj-${adj.label}-${i}`}
                    className="flex items-center gap-[5px] text-[9px]"
                  >
                    <span className="text-[#393939]">
                      <span className="font-medium">{adj.label}:</span>{" "}
                      {adj.from_value}
                    </span>
                    <ArrowRight />
                    <span className="text-[#033529] font-medium">
                      {adj.to_value}
                    </span>
                  </div>
                ) : (
                  <div
                    key={`qa-adj-${adj.label}-${i}`}
                    className="flex items-center gap-[5px] text-[9px] text-[#393939]"
                  >
                    <span>•</span>
                    <span>
                      {adj.label}:{" "}
                      <span className="text-[#033529] font-medium">
                        {adj.to_value}
                      </span>
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
