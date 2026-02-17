import type { TemplateProps } from "..";

interface SummaryData {
  title: string;
}

export default function Summary({ data }: TemplateProps) {
  const d = data as SummaryData | null;

  return (
    <div className="flex font-sans text-[11px] leading-[1.4] bg-white h-full">
      <div className="flex-1 flex flex-col">
        {/* Header with green left border */}
        <div className="border-l-4 border-[#11D4B3] px-6 py-5 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] font-bold text-[#1a7a5a] tracking-wide uppercase">
              CGIAR Result Summary
            </div>
            <div className="text-[8px] text-gray-400">Report generated from PRMS</div>
          </div>

          <h1 className="text-[#02211A] text-[20px] font-bold leading-tight">
            {d?.title ?? "No title provided"}
          </h1>
        </div>

        {/* Main content */}
        <div className="flex-1 px-6 pt-4">
          {/* Info grid 2 columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5">
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">
                Reporting Phase
              </p>
              <p className="text-gray-800 font-medium">Reporting 2025</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">
                Result Type
              </p>
              <p className="text-gray-800 font-medium">Policy Change</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">Submitter</p>
              <p className="text-gray-800 font-medium">SP 02 - Sustainable Farming</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">
                Lead Contact
              </p>
              <p className="text-gray-800 font-medium">Obilo Chinyere</p>
            </div>
          </div>

          <div className="border-t border-gray-200 mb-4" />

          {/* Short title */}
          <div className="mb-4">
            <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-1">Short Title</p>
            <p className="text-gray-700">
              Planting Date Advisories disseminated in Africa.
            </p>
          </div>

          {/* Description */}
          <div className="mb-5">
            <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-1">Description</p>
            <p className="text-gray-600 text-[10px] leading-[1.5]">
              The content of the Planting Date Advisories was developed into messages and
              disseminated to farmers across Bihar through the dissemination platforms of BAU,
              JEEVIKA and IFFCO kisan. The advisories were approved and accepted by the Convergence
              Platform in the form of text and audio to be disseminated to farmers across the state.
            </p>
          </div>

          <div className="border-t border-gray-200 mb-4" />

          {/* Impact Areas as badges */}
          <div className="mb-4">
            <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-2">
              Impact Areas Targeted
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 bg-[#11D4B3]/10 border border-[#11D4B3]/30 rounded-full px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-[#11D4B3]" />
                <span className="text-[10px] font-medium text-[#02211A]">
                  Nutrition, health &amp; food security
                </span>
                <span className="text-[8px] text-[#1a7a5a] font-bold ml-1">Principal</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-[#11D4B3]/10 border border-[#11D4B3]/30 rounded-full px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-[#11D4B3]/50" />
                <span className="text-[10px] font-medium text-[#02211A]">
                  Environment health &amp; biodiversity
                </span>
                <span className="text-[8px] text-[#1a7a5a] font-bold ml-1">Significant</span>
              </div>
            </div>
          </div>

          {/* QA status */}
          <div className="bg-[#02211A]/5 rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#11D4B3] shrink-0" />
            <p className="text-[9px] text-gray-600">
              <span className="font-bold text-gray-800">Quality Assured</span> — Reviewed by two
              assessors and a senior third-party expert.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 px-6 py-2 flex justify-between items-center text-[8px] text-gray-500">
          <p>
            <span className="font-bold">PRMS Summary</span> | Page 1 of 1
          </p>
          <p className="font-bold text-[#1a7a5a]">CGIAR</p>
        </div>
      </div>
    </div>
  );
}
