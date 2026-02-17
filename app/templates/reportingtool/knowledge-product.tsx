import type { TemplateProps } from "..";
import {
  SectionTitle,
  SubSectionTitle,
  LabelValue,
  ImpactAreaCard,
  DataTable,
  TheoryOfChangeCard,
  GeoLocationBox,
  EvidenceCard,
  KeyValueTable,
  type ImpactArea,
  type TheoryOfChange,
  type Partner,
  type GeoLocation,
  type Evidence,
} from "./components";

interface KnowledgeProductField {
  label: string;
  value: string;
}

interface KnowledgeProductData {
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
  theory_of_change?: TheoryOfChange;
  contributing_program?: string;
  contributing_centers?: string[];
  contributing_projects?: string[];
  partners?: Partner[];
  geo_location?: GeoLocation;
  evidences?: Evidence[];
  knowledge_product_fields?: KnowledgeProductField[];
}

function KPQABox() {
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
        <p className="text-[#818181] text-[8px] leading-[1.5]">
          Quality Assurance is provided by CGIAR Center librarians for knowledge products not
          processed through the QA Platform.
        </p>
      </div>
    </div>
  );
}

export default function KnowledgeProduct({ data }: TemplateProps) {
  const d = data as KnowledgeProductData | null;

  return (
    <div className="bg-white relative" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;700&family=Noto+Serif:wght@400;500&display=swap');`}</style>

      {/* Right sidebar decorative strip — full page height */}
      <div className="absolute top-0 right-0 h-full overflow-hidden" style={{ width: 13, zIndex: 10 }}>
        <img src="/assets/prms/sidebar-pattern.png" alt="" className="h-full object-cover" style={{ width: 844 }} />
      </div>

      {/* Header */}
      <div className="bg-[#02211a]" style={{ padding: "42px 43px 30px" }}>

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
        {/* KP QA Assessment box */}
        <KPQABox />

        {/* Result details section */}
        <div className="flex flex-col gap-[10px]">
          <SectionTitle>Result details</SectionTitle>

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

        {/* Contributors and Partners section */}
        {(d?.theory_of_change || d?.contributing_program || d?.partners?.length) && (
          <div className="flex flex-col gap-[10px]">
            <SectionTitle>Contributors and Partners</SectionTitle>

            {/* Theory of Change */}
            {d?.theory_of_change && (
              <div className="flex flex-col gap-[10px]">
                <SubSectionTitle>Theory of Change</SubSectionTitle>
                <TheoryOfChangeCard toc={d.theory_of_change} />
              </div>
            )}

            {/* Contributors */}
            {(d?.contributing_program || d?.contributing_centers?.length || d?.contributing_projects?.length) && (
              <div className="flex flex-col gap-[10px]">
                <SubSectionTitle>Contributors</SubSectionTitle>
                <div className="flex flex-col gap-[8px] text-[10px]">
                  {d?.contributing_program && (
                    <LabelValue label="Contributing Program" value={d.contributing_program} />
                  )}
                  {d?.contributing_centers && d.contributing_centers.length > 0 && (
                    <div>
                      <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15] mb-[4px]">
                        Contributing CGIAR Centers:
                      </p>
                      <ul className="list-disc ml-[15px] text-[#393939] text-[10px]">
                        {d.contributing_centers.map((c, i) => (
                          <li key={i} className="leading-[1.5]">{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {d?.contributing_projects && d.contributing_projects.length > 0 && (
                    <div>
                      <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15] mb-[4px]">
                        Contributing W3 and/or bilateral projects:
                      </p>
                      <ul className="list-disc ml-[15px] text-[#393939] text-[10px]">
                        {d.contributing_projects.map((p, i) => (
                          <li key={i} className="leading-[1.5]">{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Partners table */}
            {d?.partners && d.partners.length > 0 && (
              <div className="flex flex-col gap-[10px]">
                <SubSectionTitle>Partners</SubSectionTitle>
                <DataTable
                  columns={["Name", "Country HQ", "Institution type"]}
                  rows={d.partners.map((p) => [p.name, p.country_hq, p.institution_type])}
                />
              </div>
            )}
          </div>
        )}

        {/* Geographic location section */}
        {d?.geo_location && (
          <div className="flex flex-col gap-[10px]">
            <SectionTitle>Geographic location</SectionTitle>
            <GeoLocationBox geo={d.geo_location} />
          </div>
        )}

        {/* Evidence section */}
        {d?.evidences && d.evidences.length > 0 && (
          <div className="flex flex-col gap-[10px]">
            <SectionTitle>Evidence</SectionTitle>
            <div className="flex flex-col gap-[10px]">
              {d.evidences.map((ev, i) => (
                <EvidenceCard key={i} evidence={ev} />
              ))}
            </div>
          </div>
        )}

        {/* Knowledge Product details section */}
        {d?.knowledge_product_fields && d.knowledge_product_fields.length > 0 && (
          <div className="flex flex-col gap-[10px]">
            <SectionTitle>Knowledge Product</SectionTitle>
            <KeyValueTable rows={d.knowledge_product_fields} />
          </div>
        )}
      </div>
    </div>
  );
}
