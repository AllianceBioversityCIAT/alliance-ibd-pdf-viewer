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
  QABox,
  type ImpactArea,
  type TheoryOfChange,
  type Partner,
  type BundledInnovation,
  type GeoLocation,
  type Evidence,
  type QAAdjustment,
} from "./components";

interface InnovationCollaborator {
  name: string;
  email?: string;
}

interface InnovationDevelopment {
  developer_name: string;
  developer_email?: string;
  developer_institution?: string;
  current_readiness_level?: string;
  current_readiness_label?: string;
  readiness_justification?: string;
  collaborators?: InnovationCollaborator[];
  innovation_nature?: string;
  innovation_type?: string;
  reference_materials?: string[];
}

interface Investment {
  entity: string;
  name: string;
  usd_investment: string;
}

interface InnovationActor {
  type: string;
  actors: string;
}

interface InnovationOrganization {
  type: string;
  subtype: string;
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
  theory_of_change?: TheoryOfChange;
  contributing_program?: string;
  contributing_centers?: string[];
  contributing_projects?: string[];
  partners?: Partner[];
  bundled_innovations?: BundledInnovation[];
  geo_location?: GeoLocation;
  evidences?: Evidence[];
  innovation_development?: InnovationDevelopment;
  investments?: Investment[];
  innovation_actors?: InnovationActor[];
  innovation_organizations?: InnovationOrganization[];
}

function InnovationDevelopmentSection({ innovation }: { innovation: InnovationDevelopment }) {
  return (
    <div className="flex gap-[20px]">
      <div className="flex flex-col gap-[8px] text-[10px] flex-1 min-w-0">
        {/* Developer */}
        <p style={{ lineHeight: 1.5 }}>
          <span className="font-bold text-[#1d1d1d]">Innovation Developer:</span>{" "}
          <span className="text-[#393939]">
            {innovation.developer_name}
            {innovation.developer_email && (
              <>
                {" "}
                <span className="text-[#065f4a]">(</span>
                <a href={`mailto:${innovation.developer_email}`} className="text-[#065f4a] underline">
                  {innovation.developer_email}
                </a>
                <span className="text-[#065f4a]">)</span>
              </>
            )}
            {innovation.developer_institution && ` ${innovation.developer_institution}`}
          </span>
        </p>

        {/* Readiness level */}
        {innovation.current_readiness_level && (
          <p style={{ lineHeight: 1.5 }}>
            <span className="font-bold text-[#1d1d1d]">Current readiness of this innovation:</span>{" "}
            <span className="text-[#393939]">
              <span className="font-medium">{innovation.current_readiness_level}</span>
              {innovation.current_readiness_label && ` - ${innovation.current_readiness_label}`}
            </span>
          </p>
        )}

        {/* Readiness justification */}
        {innovation.readiness_justification && (
          <p style={{ lineHeight: 1.5 }}>
            <span className="font-bold text-[#1d1d1d]">Innovation readiness justification:</span>{" "}
            <span className="text-[#393939]">{innovation.readiness_justification}</span>
          </p>
        )}

        {/* Collaborators */}
        {innovation.collaborators && innovation.collaborators.length > 0 && (
          <div className="flex flex-col gap-[5px]">
            <p className="font-bold text-[#1d1d1d] leading-[1.15]">Innovation collaborators:</p>
            <ul className="list-disc ml-[15px] text-[#393939]">
              {innovation.collaborators.map((c, i) => (
                <li key={i} className="leading-[1.5]">
                  {c.name}{c.email && `, ${c.email}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Innovation nature */}
        {innovation.innovation_nature && (
          <p style={{ lineHeight: 1.5 }}>
            <span className="font-bold text-[#1d1d1d]">Innovation nature:</span>{" "}
            <span className="text-[#393939]">{innovation.innovation_nature}</span>
          </p>
        )}

        {/* Innovation type */}
        {innovation.innovation_type && (
          <p style={{ lineHeight: 1.5 }}>
            <span className="font-bold text-[#1d1d1d]">Innovation type:</span>{" "}
            <span className="text-[#393939]">{innovation.innovation_type}</span>
          </p>
        )}

        {/* Reference materials */}
        {innovation.reference_materials && innovation.reference_materials.length > 0 && (
          <div className="flex flex-col gap-[5px]">
            <p className="font-bold text-[#1d1d1d] leading-[1.15]">Reference materials:</p>
            <ul className="list-disc ml-[15px]">
              {innovation.reference_materials.map((url, i) => (
                <li key={i} className="leading-[1.5]">
                  <a href={url} className="text-[#065f4a] underline break-all">{url}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Readiness scale infographic */}
      <div className="flex flex-col items-center shrink-0" style={{ width: 182 }}>
        <img
          src="/assets/prms/readiness-scale.png"
          alt="Innovation Readiness Scale"
          className="w-full"
        />
        <p className="text-[#818181] text-[8px] leading-[1.367] text-center mt-[4px]">
          Learn more in{" "}
          <a href="https://www.scalingreadiness.org" className="text-[#065f4a] underline">
            www.scalingreadiness.org
          </a>
        </p>
      </div>
    </div>
  );
}

export default function ResultSummary({ data }: TemplateProps) {
  const d = data as ResultSummaryData | null;

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
        {/* QA Assessment box */}
        <QABox adjustments={d?.qa_adjustments ?? []} />

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
        {(d?.theory_of_change || d?.contributing_program || d?.partners?.length || d?.bundled_innovations?.length) && (
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

            {/* Bundled innovations table */}
            {d?.bundled_innovations && d.bundled_innovations.length > 0 && (
              <div className="flex flex-col gap-[10px]">
                <SubSectionTitle>Bundled innovations</SubSectionTitle>
                <DataTable
                  columns={["Portfolio", "Phase", "Code", "Indicator", "Title"]}
                  rows={d.bundled_innovations.map((b) => [b.portfolio, b.phase, b.code, b.indicator, b.title])}
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

        {/* Innovation Development details section */}
        {d?.innovation_development && (
          <div className="flex flex-col gap-[10px]">
            <SectionTitle>Innovation Development details</SectionTitle>
            <InnovationDevelopmentSection innovation={d.innovation_development} />
          </div>
        )}

        {/* CGIAR and Partners estimated USD investment */}
        {d?.investments && d.investments.length > 0 && (
          <div className="flex flex-col gap-[10px]">
            <SubSectionTitle>CGIAR and Partners estimated USD investment</SubSectionTitle>
            <DataTable
              columns={["Entity", "Name", "USD investment"]}
              rows={d.investments.map((inv) => [inv.entity, inv.name, inv.usd_investment])}
            />
          </div>
        )}

        {/* Anticipated Innovation users */}
        {(d?.innovation_actors?.length || d?.innovation_organizations?.length) && (
          <div className="flex flex-col gap-[15px]">
            <SubSectionTitle>Anticipated Innovation users</SubSectionTitle>

            {/* Actors table */}
            {d?.innovation_actors && d.innovation_actors.length > 0 && (
              <div className="flex flex-col gap-[5px]">
                <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">Actors</p>
                <DataTable
                  columns={["#", "Type", "Actors"]}
                  rows={d.innovation_actors.map((a, i) => [String(i + 1), a.type, a.actors])}
                />
              </div>
            )}

            {/* Organizations table */}
            {d?.innovation_organizations && d.innovation_organizations.length > 0 && (
              <div className="flex flex-col gap-[5px]">
                <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">Organizations</p>
                <DataTable
                  columns={["#", "Type", "Subtype"]}
                  rows={d.innovation_organizations.map((o, i) => [String(i + 1), o.type, o.subtype])}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
