import Image from "next/image";
import type { QAAdjustment } from "../types";
import { ArrowRightIcon } from "lucide-react";

export function QABox({
  adjustments,
}: Readonly<{ adjustments?: QAAdjustment[] }>) {
  return (
    <div className="bg-[#e2e0df] flex overflow-hidden">
      <div
        className="bg-[#033529] flex items-center justify-center shrink-0"
        style={{ width: 106, padding: "8px 17px" }}
      >
        <Image
          src="/public/assets/prms/shield-badge.png"
          alt="Quality Assured"
          width={57}
          height={57}
          className="w-[57px] h-[57px] object-contain"
        />
      </div>
      <div className="flex flex-col gap-[12px] py-[15px] px-[22px] flex-1 min-w-0">
        <div className="flex flex-col gap-[8px]">
          <p className="text-[#02211a] text-[11px] font-bold leading-[1.15]">
            Result quality assured by two assessors and subsequently reviewed by
            a senior third party
          </p>
          <p className="text-[#818181] text-[8px] leading-normal">
            This result underwent two rounds of quality assurance, including
            review by a senior third-party subject matter expert following the
            CGIAR standard{" "}
            <a
              href="https://www.cgiar.org/news-events/news/cgiars-quality-assurance-process-a-snapshot-of-what-it-is-and-what-is-does"
              className="text-[#065f4a] underline"
            >
              QA process.
            </a>
          </p>
        </div>
        {adjustments && adjustments.length > 0 && (
          <div className="flex flex-col gap-[5px]">
            <p className="text-[#1d1d1d] text-[9px] font-bold leading-[1.15]">
              Core data points that were adjusted during the QA process:
            </p>
            <div className="flex flex-col gap-[3px]">
              {adjustments.map((adj, i) => (
                <div
                  key={`qa-adjustment-${adj.label}-${i}`}
                  className="flex items-center gap-[5px] text-[9px]"
                >
                  <span className="text-[#393939]">
                    <span className="font-medium">{adj.label}:</span>{" "}
                    {adj.from_value}
                  </span>
                  <ArrowRightIcon className="w-[11px] h-[8px] text-[#033529]" />
                  <span className="text-[#033529] font-medium">
                    {adj.to_value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function KPQABox() {
  return (
    <div className="bg-[#e2e0df] flex overflow-hidden">
      <div
        className="bg-[#033529] flex items-center justify-center shrink-0"
        style={{ width: 106, padding: "8px 17px" }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: 57,
            height: 57,
            borderRadius: "50%",
            border: "2.5px solid white",
          }}
        >
          <span
            className="text-white font-bold"
            style={{ fontSize: 20, lineHeight: 1 }}
          >
            KP
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-[8px] py-[15px] px-[22px] flex-1 min-w-0">
        <p className="text-[#02211a] text-[11px] font-bold leading-[1.15]">
          Result quality assured by CGIAR Center knowledge manager
        </p>
        <p className="text-[#818181] text-[8px] leading-normal">
          Quality Assurance is provided by CGIAR Center librarians for knowledge
          products not processed through the QA Platform.
        </p>
      </div>
    </div>
  );
}
