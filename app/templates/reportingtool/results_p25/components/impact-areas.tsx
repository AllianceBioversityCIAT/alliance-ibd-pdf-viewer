import type { ImpactArea } from "../types";

export function ImpactAreaCard({ area }: { area: ImpactArea }) {
  return (
    <div className="bg-[#e2e0df] flex-1 min-w-0" style={{ padding: "15px 19px" }}>
      <div className="flex items-center gap-[7px] mb-[12px]">
        {area.icon_url && (
          <img
            src={area.icon_url}
            alt=""
            className="w-[22px] h-[22px] object-cover"
          />
        )}
        <p
          className="text-[#02211a] text-[9.5px] leading-[1.15]"
          style={{ fontFamily: "'Noto Serif', serif" }}
        >
          {area.name}
        </p>
      </div>
      <div className="flex flex-col gap-[8px]">
        <p className="text-[9px] leading-[1.15]">
          <span className="font-bold text-[#1d1d1d]">Score:</span>{" "}
          <span className="text-[#393939]">
            {area.score} - {area.score_label}
          </span>
        </p>
      </div>
    </div>
  );
}

export function OECDCriteria() {
  return (
    <div className="text-[#818181] text-[8px] leading-[1.367]">
      <p className="mb-0">
        Following the OECD DAC criteria, Impact Areas scores are defined as
        follows:
      </p>
      <ul className="list-disc ml-[12px]">
        <li className="mb-0">
          <span className="font-medium">0 = Not targeted:</span> The result has
          been screened against the IA but it has not been found to directly
          contribute to any aspect of the IA as it is outlined in the CGIAR 2030
          Research and Innovation Strategy.
        </li>
        <li className="mb-0">
          <span className="font-medium">1 = Significant:</span> The result
          directly contributes to one or more aspects of the IA. However,
          contributing to the IA is not the principal objective of the result.
        </li>
        <li>
          <span className="font-medium">2 = Principal:</span> Contributing to
          one or more aspects of the IA is the principal objective of the
          result. The IA is fundamental to the design of the activity leading to
          the result; the activity would not have been undertaken without this
          objective.
        </li>
      </ul>
    </div>
  );
}
