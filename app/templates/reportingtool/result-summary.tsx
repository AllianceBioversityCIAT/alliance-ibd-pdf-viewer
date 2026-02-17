import type { TemplateProps } from "..";

interface ImpactArea {
  name: string;
  icon_url?: string;
  score: number;
  score_label: string;
  components?: string;
}

interface QAAdjustment {
  label: string;
  from_value: string;
  to_value: string;
}

interface ResultSummaryData {
  result_type: string;
  title: string;
  generated_date: string;
  short_title: string;
  result_description: string;
  reporting_phase: string;
  submitter: string;
  lead_contact_person: string;
  lead_contact_email: string;
  impact_areas: ImpactArea[];
  qa_adjustments: QAAdjustment[];
}

function ImpactAreaCard({ area }: { area: ImpactArea }) {
  return (
    <div className="bg-[#e2e0df] flex-1 min-w-0" style={{ padding: "15px 19px" }}>
      <div className="flex items-center gap-[7px] mb-[12px]">
        {area.icon_url && (
          <img src={area.icon_url} alt="" className="w-[22px] h-[22px] object-cover" />
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
        {area.components && (
          <p className="text-[9px] leading-[1.15]">
            <span className="font-bold text-[#1d1d1d]">Component(s):</span>{" "}
            <span className="text-[#393939]">{area.components}</span>
          </p>
        )}
      </div>
    </div>
  );
}

function QABox({ adjustments }: { adjustments: QAAdjustment[] }) {
  return (
    <div className="bg-[#e2e0df] flex overflow-hidden">
      <div
        className="bg-[#033529] flex items-center justify-center shrink-0"
        style={{ width: 106, padding: "8px 17px" }}
      >
        <img
          src="/assets/prms/shield-badge.png"
          alt="Quality Assured"
          className="w-[57px] h-[57px] object-contain"
        />
      </div>
      <div className="flex flex-col gap-[12px] py-[15px] px-[22px] flex-1 min-w-0">
        <div className="flex flex-col gap-[8px]">
          <p className="text-[#02211a] text-[11px] font-bold leading-[1.15]">
            Result quality assured by two assessors and subsequently reviewed by a senior third party
          </p>
          <p className="text-[#818181] text-[8px] leading-[1.5]">
            This result underwent two rounds of quality assurance, including review by a senior
            third-party subject matter expert following the CGIAR standard{" "}
            <a
              href="https://www.cgiar.org/news-events/news/cgiars-quality-assurance-process-a-snapshot-of-what-it-is-and-what-is-does"
              className="text-[#065f4a] underline"
            >
              QA process
            </a>
            .
          </p>
        </div>
        {adjustments.length > 0 && (
          <div className="flex flex-col gap-[5px]">
            <p className="text-[#1d1d1d] text-[9px] font-bold leading-[1.15]">
              Core data points that were adjusted during the QA process:
            </p>
            <div className="flex flex-col gap-[3px]">
              {adjustments.map((adj, i) => (
                <div key={i} className="flex items-center gap-[5px] text-[9px]">
                  <span className="text-[#393939]">
                    <span className="font-medium">{adj.label}:</span> {adj.from_value}
                  </span>
                  <img src="/assets/prms/arrow-right.svg" alt="→" className="w-[11px] h-[8px]" />
                  <span className="text-[#033529] font-medium">{adj.to_value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LabelValue({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <p className="text-[10px]" style={{ lineHeight: multiline ? 1.5 : 1.15 }}>
      <span className="font-bold text-[#1d1d1d]">{label}:</span>{" "}
      <span className="text-[#393939]">{value}</span>
    </p>
  );
}

export default function ResultSummary({ data }: TemplateProps) {
  const d = data as ResultSummaryData | null;

  return (
    <div className="bg-white" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;700&family=Noto+Serif:wght@400;500&display=swap');`}</style>

      {/* Header */}
      <div className="bg-[#02211a] relative overflow-hidden" style={{ padding: "42px 43px 30px" }}>
        {/* Right sidebar decorative strip */}
        <div className="absolute top-0 right-0 h-full overflow-hidden" style={{ width: 13 }}>
          <img src="/assets/prms/sidebar-pattern.png" alt="" className="h-full object-cover" style={{ width: 844 }} />
        </div>

        {/* Logo */}
        <img
          src="/assets/prms/cgiar-logo.png"
          alt="CGIAR"
          className="object-contain mb-[15px]"
          style={{ width: 120, height: 44 }}
        />

        {/* Result type + Title */}
        <div className="flex flex-col gap-[5px] mb-[14px]" style={{ maxWidth: 509 }}>
          <p className="text-white text-[10px] leading-[1.15]">
            {d?.result_type ?? "Result Type"}
          </p>
          <p
            className="text-[#11d4b3] text-[18px] font-medium leading-[1.15]"
            style={{ fontFamily: "'Noto Serif', serif" }}
          >
            {d?.title ?? "No title provided"}
          </p>
        </div>

        {/* Intro text */}
        <div
          className="text-[#e2e0df] text-[8px] font-light leading-[1.367]"
          style={{ maxWidth: 509 }}
        >
          <p className="mb-[8px]">
            This report was generated from the CGIAR Performance and Results Management System
            (PRMS) on {d?.generated_date ?? "—"}. Please note that the contents of this report are
            subject to change as future updates are made to the result metadata.
          </p>
          <p>
            The present result summary presents a standalone result reported for the{" "}
            {d?.reporting_phase ?? "—"} cycle through the CGIAR Performance and Results Management
            System (PRMS) – the central platform for reporting and validating results under the{" "}
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
            , linking Program and Accelerator outputs and outcomes to System-level Impact Areas and
            Sustainable Development Goals (SDGs), and these contributions are reflected in the{" "}
            <a
              href="https://www.cgiar.org/food-security-impact/results-dashboard"
              className="text-[#11d4b3] underline"
            >
              CGIAR Results Dashboard
            </a>
            .
          </p>
        </div>
      </div>

      {/* Body content */}
      <div className="flex flex-col gap-[20px]" style={{ padding: "20px 43px 40px", maxWidth: 552 }}>
        {/* QA Assessment box */}
        <QABox adjustments={d?.qa_adjustments ?? []} />

        {/* Result details section */}
        <div className="flex flex-col gap-[10px]">
          <p className="text-[#065f4a] text-[14px] font-bold leading-[1.15]">
            Result details
          </p>

          <div className="flex flex-col gap-[8px]">
            {d?.short_title && <LabelValue label="Short title" value={d.short_title} />}
            {d?.result_description && (
              <LabelValue label="Result description" value={d.result_description} multiline />
            )}
            {d?.reporting_phase && (
              <LabelValue
                label="Performance and Results Management System (PRMS) Reporting phase"
                value={d.reporting_phase}
              />
            )}
            {d?.submitter && <LabelValue label="Submitter of result" value={d.submitter} />}
            {d?.lead_contact_person && (
              <LabelValue
                label="Lead contact person"
                value={`${d.lead_contact_person}${d.lead_contact_email ? ` (${d.lead_contact_email})` : ""}`}
              />
            )}

            {/* Impact Areas */}
            {d?.impact_areas && d.impact_areas.length > 0 && (
              <div className="flex flex-col gap-[5px]">
                <p className="text-[#1d1d1d] text-[10px] font-bold leading-[1.15]">
                  Impact Areas targeted
                </p>
                <div className="flex flex-col gap-[10px]">
                  <div className="flex gap-[10px]">
                    {d.impact_areas.map((area, i) => (
                      <ImpactAreaCard key={i} area={area} />
                    ))}
                  </div>

                  {/* OECD DAC criteria */}
                  <div className="text-[#818181] text-[8px] leading-[1.367]">
                    <p className="mb-0">
                      Following the OECD DAC criteria, Impact Areas scores are defined as follows:
                    </p>
                    <ul className="list-disc ml-[12px]">
                      <li className="mb-0">
                        <span className="font-medium">0 = Not targeted:</span> The result has been
                        screened against the IA but it has not been found to directly contribute to
                        any aspect of the IA as it is outlined in the CGIAR 2030 Research and
                        Innovation Strategy.
                      </li>
                      <li className="mb-0">
                        <span className="font-medium">1 = Significant:</span> The result directly
                        contributes to one or more aspects of the IA. However, contributing to the
                        IA is not the principal objective of the result.
                      </li>
                      <li>
                        <span className="font-medium">2 = Principal:</span> Contributing to one or
                        more aspects of the IA is the principal objective of the result. The IA is
                        fundamental to the design of the activity leading to the result; the activity
                        would not have been undertaken without this objective.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
