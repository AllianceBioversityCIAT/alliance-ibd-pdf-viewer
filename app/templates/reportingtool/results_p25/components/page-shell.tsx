import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { Paginator } from "./paginator";
import { getSPLabel } from "@/app/templates/utils";

interface PageShellProps {
  resultType: string;
  resultName: string;
  generationDate: string;
  phaseName: string;
  primarySubmitterAcronym: string;
  themeVars?: Record<string, string>;
  children: ReactNode;
}

export function PageShell({
  resultType,
  resultName,
  generationDate,
  phaseName,
  themeVars,
  primarySubmitterAcronym,
  children,
}: Readonly<PageShellProps>) {
  return (
    <div
      className="bg-white relative"
      style={
        {
          fontFamily: "'Noto Sans', sans-serif",
          ...themeVars,
        } as CSSProperties
      }
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;700&family=Noto+Serif:wght@400;500&display=swap');`}</style>

      {/* Right sidebar decorative strip */}
      <div
        className="absolute top-0 right-0 h-full overflow-hidden"
        style={{
          width: 13,
          zIndex: 10,
          backgroundImage: getSPLabel(primarySubmitterAcronym)
            ? `url('/assets/prms/sidebar-patterns/sidebar-pattern-${primarySubmitterAcronym}.png')`
            : "url('/assets/prms/sidebar-patterns/sidebar-pattern.png')",
          backgroundPosition: "left",
          backgroundRepeat: "repeat",
          backgroundSize: "auto 850px",
        }}
      />

      {/* Header */}
      <div
        className="bg-(--theme-header-bg)"
        style={{ padding: "42px 43px 30px" }}
      >
        <div className="flex items-center gap-[3px]">
          <Image
            src="/assets/prms/cgiar-logo-1.png"
            alt="CGIAR"
            width={44}
            height={44}
            className="object-contain h-11 w-11"
          />
          <Image
            src="/assets/prms/cgiar-logo-2.png"
            alt="CGIAR"
            width={75}
            height={44}
            className="object-contain h-11"
          />
          {getSPLabel(primarySubmitterAcronym) && (
            <div className="h-11 bg-(--theme-mid) w-max flex items-end justify-center">
              <p className="text-[7px] p-1.5 text-[#033529] font-bold leading-[1.15]">
                {getSPLabel(primarySubmitterAcronym)}
              </p>
            </div>
          )}
        </div>

        <div
          className="flex flex-col gap-[5px] mb-[14px] mt-4"
          style={{ maxWidth: 509 }}
        >
          <p className="text-white text-[10px] leading-[1.15]">{resultType}</p>
          <p
            className="text-(--theme-accent) text-[18px] font-medium leading-[1.15]"
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
              className="text-(--theme-accent) underline"
            >
              Technical Reporting Arrangement (TRA) 2025-2030
            </a>
            . Each result contributes to the{" "}
            <a
              href="https://docs.google.com/document/d/1sgDrMxZP081SV1hXgDO2Y6lKjZXfwNu7/edit"
              className="text-(--theme-accent) underline"
            >
              CGIAR Results Framework
            </a>
            , linking Program and Accelerator outputs and outcomes to
            System-level Impact Areas and Sustainable Development Goals (SDGs),
            and these contributions are reflected in the{" "}
            <a
              href="https://www.cgiar.org/food-security-impact/results-dashboard"
              className="text-(--theme-accent) underline"
            >
              CGIAR Results Dashboard.
            </a>
          </p>
        </div>
      </div>

      {/* Body — Paginator reads paperHeight from URL and handles page breaks */}
      <Paginator className="flex flex-col gap-[20px] pt-5 pb-10 px-11 max-w-[calc(100%-13px)]">
        {children}
      </Paginator>
    </div>
  );
}
