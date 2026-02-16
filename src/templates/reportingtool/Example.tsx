import type { TemplateProps } from '../index';

interface ExampleData {
  title: string;
}

export default function Example({ data }: TemplateProps) {
  const d = data as ExampleData | null;

  return (
    <div className="flex font-sans text-[11px] leading-[1.4] h-full">
      <div className="flex-1 flex flex-col">
        {/* Dark header */}
        <div className="bg-[#02211A] px-6 py-5">
          <div className="w-[80px] h-[40px] bg-white/20 rounded flex items-center justify-center text-white text-[10px] font-bold tracking-wide">
            CGIAR
          </div>

          <p className="text-[10px] text-[#E2E0DF] mt-4 mb-1">Policy Change</p>
          <h1 className="text-[#11D4B3] text-[18px] font-bold leading-tight mb-3">
            {d?.title ?? 'No title provided'}
          </h1>

          <p className="text-[#E2E0DF] text-[8px] mb-2">
            This report was generated from the CGIAR Performance and Results Management System
            (PRMS) on Tuesday, June 18th, 2025, at 21:18 CET. Please note that the contents of
            this report are subject to change as future updates are made to the result metadata.
          </p>
          <p className="text-[#E2E0DF] text-[8px] mb-4">
            The present result summary presents a standalone result reported for the 2025 Technical
            Reporting cycle through the CGIAR Performance and Results Management System (PRMS) –
            the central platform for reporting and validating results under the{' '}
            <span className="text-[#11D4B3] underline">
              Technical Reporting Arrangement (TRA) 2025-2030
            </span>
            . Each result contributes to the{' '}
            <span className="text-[#11D4B3] underline">CGIAR Results Framework</span>, linking
            Program and Accelerator outputs and outcomes to System-level Impact Areas and
            Sustainable Development Goals (SDGs), and these contributions are reflected in the{' '}
            <span className="text-[#11D4B3] underline">CGIAR Results Dashboard</span>.
          </p>
        </div>

        {/* Main content */}
        <div className="flex-1 px-6 pt-4">
          {/* Quality assurance box */}
          <div className="bg-gray-100 rounded-lg p-4 mb-5 flex gap-3">
            <div className="w-[36px] h-[36px] bg-[#1a7a5a]/10 rounded-full shrink-0" />
            <div>
              <p className="font-bold text-[10px] text-gray-800 mb-1">
                Result quality assured by two assessors and subsequently reviewed by a senior third
                party
              </p>
              <p className="text-gray-500 text-[8px]">
                This result underwent two rounds of quality assurance, including review by a senior
                third-party subject matter expert following the CGIAR standard{' '}
                <span className="text-[#1a7a5a] underline">QA process</span>.
              </p>
            </div>
          </div>

          {/* Result details */}
          <h2 className="text-[#1a7a5a] text-[14px] font-bold mb-3">Result details</h2>

          <p className="mb-2">
            <span className="font-bold text-gray-800">Short title:</span>{' '}
            <span className="text-gray-600">
              Planting Date Advisories disseminated in Africa.
            </span>
          </p>

          <p className="mb-2">
            <span className="font-bold text-gray-800">Result description:</span>{' '}
            <span className="text-gray-600">
              The content of the Planting Date Advisories was developed into messages and
              disseminated to farmers across Bihar through the dissemination platforms of BAU,
              JEEVIKA and IFFCO kisan. The advisories were approved and accepted by the Convergence
              Platform in the form of text and audio to be disseminated to farmers across the state.
            </span>
          </p>

          <p className="mb-1">
            <span className="font-bold text-gray-800">
              Performance and Results Management System (PRMS) Reporting phase:
            </span>{' '}
            <span className="text-gray-600">Reporting 2025</span>
          </p>
          <p className="mb-1">
            <span className="font-bold text-gray-800">Submitter of result:</span>{' '}
            <span className="text-gray-600">
              Science Program (SP) 02 - Sustainable Farming
            </span>
          </p>
          <p className="mb-3">
            <span className="font-bold text-gray-800">Lead contact person:</span>{' '}
            <span className="text-gray-600">Obilo Chinyere (o.chinyere@cgiar.org)</span>
          </p>

          <p className="font-bold text-gray-800 mb-2">Impact Areas targeted</p>

          {/* Impact area cards */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 border border-gray-200 rounded-lg p-3">
              <p className="font-bold text-[10px] text-gray-800 mb-1">
                Nutrition, health &amp; food security
              </p>
              <p className="text-gray-600 text-[9px]">
                <span className="font-bold">Score:</span> 2 - Principal
              </p>
              <p className="text-gray-600 text-[9px]">
                <span className="font-bold">Component(s):</span> Nutrition, health
              </p>
            </div>
            <div className="flex-1 border border-gray-200 rounded-lg p-3">
              <p className="font-bold text-[10px] text-gray-800 mb-1">
                Environment health &amp; biodiversity
              </p>
              <p className="text-gray-600 text-[9px]">
                <span className="font-bold">Score:</span> 1 - Significant
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[7px] text-gray-400 leading-[1.3]">
            <p className="mb-1">
              Following the OECD DAC criteria, Impact Areas scores are defined as follows:
            </p>
            <ul className="list-disc pl-3 space-y-0.5">
              <li>
                0 = Not targeted: The result has been screened against the IA but it has not been
                found to directly contribute to any aspect of the IA as it is outlined in the CGIAR
                2030 Research and Innovation Strategy.
              </li>
              <li>
                1 = Significant: The result directly contributes to one or more aspects of the IA.
                However, contributing to the IA is not the principal objective of the result.
              </li>
              <li>
                2 = Principal: Contributing to one or more aspects of the IA is the principal
                objective of the result. The IA is fundamental to the design of the activity leading
                to the result; the activity would not have been undertaken without this objective.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 px-6 py-2 flex justify-between items-center text-[8px] text-gray-500">
          <p>
            <span className="font-bold">PRMS Result</span> | Page 1 of 4
          </p>
          <p className="font-bold text-gray-700">CGIAR</p>
        </div>
      </div>

      {/* Right green strip */}
      <img src="/img.png" className="w-[20px] h-full object-cover" alt="" />
    </div>
  );
}
