import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { Paginator } from "./paginator";
import { getSPLabel } from "@/app/templates/utils";

interface PageShellProps {
  resultType: string;
  resultName: string;
  generationDate: string;
  projectName: string;
  primarySubmitterAcronym: string;
  themeVars?: Record<string, string>;
  children: ReactNode;
  leadCenterAcronym: string;
}

export function PageShell({
  resultType,
  resultName,
  generationDate,
  projectName,
  themeVars,
  primarySubmitterAcronym,
  leadCenterAcronym,
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
        data-sidebar-strip
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
          <img
            src={`/assets/prms/centers-logos/${leadCenterAcronym
              .toLowerCase()
              .replace(" ", "-")}-logo.svg`}
            alt={`${leadCenterAcronym} Logo`}
            className="object-contain h-11 bg-white p-2"
          />
        </div>

        <div className="flex flex-col gap-[5px] mb-[14px] mt-4">
          <p className="text-white text-[10px] leading-[1.15]">{resultType}</p>
          <p
            className="text-(--theme-accent) text-[18px] font-medium leading-[1.15]"
            style={{ fontFamily: "'Noto Serif', serif" }}
          >
            {resultName}
          </p>
          <p className="text-white text-[11px] font-medium leading-[1.15] mt-2">
            Bilateral Project - {projectName}
          </p>
        </div>

        <div className="text-[#e2e0df] text-[8px] font-light leading-[1.367]">
          <p className="mb-[8px]">
            This report was generated from the CGIAR Performance and Results
            Management System (PRMS) on {generationDate}. Please note that the
            contents of this report are subject to change as future updates are
            made to the result metadata.
          </p>
          <p>
            This result has undergone the CGIAR Quality Assurance (QA) process.
            For more details on the quality assessed metadata, see{" "}
            <a
              href="https://www.cgiar.org/news-events/news/cgiars-quality-assurance-process-a-snapshot-of-what-it-is-and-what-is-does"
              className="text-(--theme-accent) underline"
            >
              here
            </a>
            {""}. The result has been quality-assessed at the Center level,
            which may apply different standards compared to the{" "}
            <a
              href="https://www.cgiar.org/news-events/news/cgiars-quality-assurance-process-a-snapshot-of-what-it-is-and-what-is-does"
              className="text-(--theme-accent) underline"
            >
              CGIAR QA process
            </a>
            {""}, and reviewed by the relevant Programs/Accelerators to ensure
            alignment with their Theory of Change (TOC) and compliance with the
            technical reporting minimum data standards requirements.
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
