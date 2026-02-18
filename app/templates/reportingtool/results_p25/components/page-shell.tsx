import Image from "next/image";
import type { ReactNode } from "react";

interface PageShellProps {
  resultType: string;
  resultName: string;
  generationDate: string;
  phaseName: string;
  children: ReactNode;
}

export function PageShell({
  resultType,
  resultName,
  generationDate,
  phaseName,
  children,
}: Readonly<PageShellProps>) {
  return (
    <div
      className="bg-white relative"
      style={{ fontFamily: "'Noto Sans', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;700&family=Noto+Serif:wght@400;500&display=swap');`}</style>

      {/* Right sidebar decorative strip */}
      <div
        className="absolute top-0 right-0 h-full overflow-hidden"
        style={{ width: 13, zIndex: 10 }}
      >
        <Image
          src="/public/assets/prms/sidebar-pattern.png"
          alt=""
          width={13}
          height={100}
          className="h-full object-cover "
        />
      </div>

      {/* Header */}
      <div className="bg-[#03211A]" style={{ padding: "42px 43px 30px" }}>
        <Image
          src="/public/assets/prms/cgiar-logo.png"
          alt="CGIAR"
          width={120}
          height={44}
          className="object-contain mb-[15px]"
        />

        <div
          className="flex flex-col gap-[5px] mb-[14px]"
          style={{ maxWidth: 509 }}
        >
          <p className="text-white text-[10px] leading-[1.15]">{resultType}</p>
          <p
            className="text-[#11d4b3] text-[18px] font-medium leading-[1.15]"
            style={{ fontFamily: "'Noto Serif', serif" }}
          >
            {resultName}
          </p>
        </div>

        <div
          className="text-[#e2e0df] text-[8px] font-light leading-[1.367]"
          style={{ maxWidth: 509 }}
        >
          <p className="mb-[8px]">
            This report was generated from the CGIAR Performance and Results
            Management System (PRMS) on {generationDate}. Please note that the
            contents of this report are subject to change as future updates are
            made to the result metadata.
          </p>
          <p>
            The present result summary presents a standalone result reported for
            the {phaseName} cycle through the CGIAR Performance and Results
            Management System (PRMS) - the central platform for reporting and
            validating results under the{" "}
            <a
              href="https://storage.googleapis.com/cgiarorg/2025/06/CGIAR-Technical-Reporting-Arrangement-2025-30.pdf"
              className="text-[#11d4b3] underline"
            >
              Technical Reporting Arrangement (TRA) 2025-2030
            </a>
            . Each result contributes to the{" "}
            <a
              href="https://docs.google.com/document/d/1sgDrMxZP081SV1hXgDO2Y6lKjZXfwNu7/edit"
              className="text-[#11d4b3] underline"
            >
              CGIAR Results Framework
            </a>
            , linking Program and Accelerator outputs and outcomes to
            System-level Impact Areas and Sustainable Development Goals (SDGs),
            and these contributions are reflected in the{" "}
            <a
              href="https://www.cgiar.org/food-security-impact/results-dashboard"
              className="text-[#11d4b3] underline"
            >
              CGIAR Results Dashboard.
            </a>
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-[20px] pt-5 pb-10 px-11 max-w-[calc(100%-13px)]">
        {children}
      </div>
    </div>
  );
}
