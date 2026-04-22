import { Link } from "lucide-react";
import type {
  IPSRResultData,
  IpsrActorEntry,
  IpsrOrganizationEntry,
  IpsrMeasureEntry,
  IpsrInvestmentEntry,
  IpsrComplementaryAssessment,
} from "../types";
import type { GeoLocation } from "../../shared/types";
import {
  SectionTitle,
  SubSectionTitle,
  LabelValue,
} from "../../shared/components/section-primitives";
import { DataTable } from "../../shared/components/tables";
import { GeographicSection } from "../../results_p25/components/common-sections";

// ── Helpers ──

function StepLabel({ children }: Readonly<{ children: string }>) {
  return (
    <p
      className="text-[9px] leading-[1.15] tracking-[0.54px] text-(--theme-deep)"
    >
      {children}
    </p>
  );
}

function EvidenceLink({
  href,
}: Readonly<{ href: string | null | undefined }>) {
  if (!href) return <span className="text-[#818181] italic">Not provided</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-[3px] text-(--theme-mid) font-medium"
    >
      <Link size={10} className="shrink-0" />
      <span className="underline">Access link</span>
    </a>
  );
}

function GenderCell({
  total,
  youth,
  nonYouth,
}: Readonly<{
  total: number | null;
  youth: number | null;
  nonYouth: number | null;
}>) {
  if (total === null) return <span className="text-[#818181] italic">Not provided</span>;
  return (
    <div className="flex flex-col gap-[2px]">
      <span>Total: {total}</span>
      <div className="flex gap-[8px]">
        <span>Youth: {youth ?? 0}</span>
        <span>Non-youth: {nonYouth ?? 0}</span>
      </div>
    </div>
  );
}

// ── Actors Table ──

function IpsrActorsTable({
  actors,
  showEvidence,
}: Readonly<{ actors: IpsrActorEntry[]; showEvidence?: boolean }>) {
  const cols = showEvidence
    ? ["#", "Type", "Evidence", "Women", "Men", "Total"]
    : ["#", "Type", "Women", "Men", "Total"];

  return (
    <table
      className="w-full text-[8.5px] border-collapse"
      style={{ fontFamily: "'Inter', 'Noto Sans', sans-serif" }}
    >
      <thead>
        <tr>
          {cols.map((col) => (
            <th
              key={col}
              className="bg-(--theme-deep) text-white font-bold text-left border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {actors.map((actor, i) => (
          <tr key={`actor-${actor.actor_type}-${i}`} className="bg-white">
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px", borderLeft: "0.5px solid #e8ebed" }}
            >
              {i + 1}
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {actor.other_actor_type
                ? `${actor.actor_type}: ${actor.other_actor_type}`
                : actor.actor_type ?? "Not provided"}
            </td>
            {showEvidence && (
              <td
                className="text-[#4b5563] border-b border-[#e5e7eb]"
                style={{ padding: "7.5px" }}
              >
                <EvidenceLink href={actor.evidence_link} />
              </td>
            )}
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {actor.sex_and_age_disaggregation ? (
                "Not applicable"
              ) : (
                <GenderCell
                  total={actor.women_total}
                  youth={actor.women_youth}
                  nonYouth={actor.women_non_youth}
                />
              )}
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {actor.sex_and_age_disaggregation ? (
                "Not applicable"
              ) : (
                <GenderCell
                  total={actor.men_total}
                  youth={actor.men_youth}
                  nonYouth={actor.men_non_youth}
                />
              )}
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {actor.sex_and_age_disaggregation
                ? actor.how_many ?? <span className="text-[#818181] italic">Not provided</span>
                : actor.total ?? <span className="text-[#818181] italic">Not provided</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Organizations Table ──

function IpsrOrganizationsTable({
  organizations,
  showEvidence,
}: Readonly<{
  organizations: IpsrOrganizationEntry[];
  showEvidence?: boolean;
}>) {
  const cols = showEvidence
    ? ["#", "Type", "Subtype", "How many", "Evidence"]
    : ["#", "Type", "Subtype", "How many"];

  return (
    <table
      className="w-full text-[8.5px] border-collapse"
      style={{ fontFamily: "'Inter', 'Noto Sans', sans-serif" }}
    >
      <thead>
        <tr>
          {cols.map((col) => (
            <th
              key={col}
              className="bg-(--theme-deep) text-white font-bold text-left border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {organizations.map((org, i) => (
          <tr key={`org-${org.type}-${i}`} className="bg-white">
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px", borderLeft: "0.5px solid #e8ebed" }}
            >
              {i + 1}
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {org.type === "Other"
                ? `${org.type}: ${org.other_institution ?? "Not provided"}`
                : org.type ?? "Not provided"}
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {org.subtype
                ? org.subtype
                : org.has_subtypes
                  ? "Not provided"
                  : "Not applicable"}
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {org.how_many ?? "Not provided"}
            </td>
            {showEvidence && (
              <td
                className="text-[#4b5563] border-b border-[#e5e7eb]"
                style={{ padding: "7.5px" }}
              >
                <EvidenceLink href={org.evidence_link} />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Measures Table ──

function IpsrMeasuresTable({
  measures,
}: Readonly<{ measures: IpsrMeasureEntry[] }>) {
  return (
    <table
      className="w-full text-[8.5px] border-collapse"
      style={{ fontFamily: "'Inter', 'Noto Sans', sans-serif" }}
    >
      <thead>
        <tr>
          {["#", "Type", "Evidence", "Unit of measure", "Quantity"].map(
            (col) => (
              <th
                key={col}
                className="bg-(--theme-deep) text-white font-bold text-left border-b border-[#e5e7eb]"
                style={{ padding: "7.5px" }}
              >
                {col}
              </th>
            )
          )}
        </tr>
      </thead>
      <tbody>
        {measures.map((m, i) => (
          <tr key={`measure-${m.type}-${i}`} className="bg-white">
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px", borderLeft: "0.5px solid #e8ebed" }}
            >
              {i + 1}
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {m.type || <span className="text-[#818181] italic">Not provided</span>}
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              <EvidenceLink href={m.evidence_link} />
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {m.unit_of_measure || <span className="text-[#818181] italic">Not provided</span>}
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {m.quantity || <span className="text-[#818181] italic">Not provided</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Evidence-based Scaling Readiness Table ──

type ReadinessRow = {
  type: string;
  short_title: string;
  innovation_readiness: string | null;
  readiness_evidence: string | null;
  innovation_use: string | null;
  use_evidence: string | null;
};

function EvidenceBasedReadinessTable({
  rows,
}: Readonly<{ rows: ReadinessRow[] }>) {
  return (
    <table
      className="w-full text-[8.5px] border-collapse"
      style={{ fontFamily: "'Inter', 'Noto Sans', sans-serif" }}
    >
      <thead>
        <tr>
          {[
            "Type",
            "Short title",
            "Innovation readiness",
            "Evidence",
            "Innovation use",
            "Evidence",
          ].map((col, i) => (
            <th
              key={`${col}-${i}`}
              className="bg-(--theme-deep) text-white font-bold text-left border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={`readiness-${i}`} className="bg-white">
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px", borderLeft: "0.5px solid #e8ebed" }}
            >
              {row.type}
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {row.short_title || <span className="text-[#818181] italic">Not provided</span>}
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {row.innovation_readiness ?? <span className="text-[#818181] italic">Not provided</span>}
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              <EvidenceLink href={row.readiness_evidence} />
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {row.innovation_use ?? <span className="text-[#818181] italic">Not provided</span>}
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              <EvidenceLink href={row.use_evidence} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Investment Table ──

function InvestmentTable({
  title,
  columnHeader,
  entries,
}: Readonly<{
  title: string;
  columnHeader: string;
  entries: IpsrInvestmentEntry[];
}>) {
  return (
    <div className="flex flex-col gap-[5px]">
      <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">
        {title}
      </p>
      <DataTable
        columns={[columnHeader, "Total USD value", "To be determined"]}
        rows={entries.map((inv) => [
          inv.name,
          inv.is_not_determined ? "-" : inv.total_usd_value ?? "Not provided",
          inv.is_not_determined ? "Yes" : "No",
        ])}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// Main IPSR Sections Component
// ══════════════════════════════════════════════════════════

export function IpsrSections({ data, geo }: Readonly<{ data: IPSRResultData; geo?: GeoLocation | null }>) {
  const hasCoreInnovation = !!data.core_innovation;
  const hasScalingAmbition = !!data.scaling_ambition_statement;
  const hasTargetedActors = !!data.targeted_actors?.length;
  const hasTargetedOrgs = !!data.targeted_organizations?.length;
  const hasTargetedInnovationPartners = !!data.targeted_innnovation_partners?.length;
  const hasAspiredOutcomes = !!data.aspired_outcomes_impact?.length;
  const hasInnovationPackagingExperts = !!data.innovation_packaging_experts;
  const hasFacilitators = !!data.innovation_packaging_experts?.facilitators?.length;

  const hasCurrentUseActors = !!data.current_use_actors?.length;
  const hasCurrentUseOrgs = !!data.current_use_organizations?.length;
  const hasCurrentUseMeasures = !!data.current_use_measures?.length;
  const hasAssessmentType = !!data.assessment_type;
  const hasCoreEvidenceAssessment = !!data.evidence_based_assessment_core;
  const hasComplementaryEvidenceAssessment = !!data.evidence_based_assessment_complementary?.length;
  const hasEvidenceReadinessTable = hasCoreEvidenceAssessment || hasComplementaryEvidenceAssessment;
  const hasEvidenceMaterialLinks = !!data.evidence_based_assessment_core?.readiness_evidence_details;

  const hasInvestmentPrograms = !!data.investment_programs?.length;
  const hasInvestmentBilateral = !!data.investment_bilateral?.length;
  const hasInvestmentPartners = !!data.investment_partners?.length;

  const hasStep1 =
    hasCoreInnovation ||
    hasScalingAmbition ||
    hasTargetedActors ||
    hasTargetedOrgs ||
    hasTargetedInnovationPartners ||
    hasAspiredOutcomes ||
    hasInnovationPackagingExperts;

  const hasSteps2and3 =
    hasCurrentUseActors ||
    hasCurrentUseOrgs ||
    hasCurrentUseMeasures ||
    hasAssessmentType ||
    hasEvidenceReadinessTable ||
    hasEvidenceMaterialLinks;

  const hasStep4 =
    hasInvestmentPrograms || hasInvestmentBilateral || hasInvestmentPartners;

  if (!hasStep1 && !hasSteps2and3 && !hasStep4) return null;

  return (
    <>
      {/* ── Package and Assess ── */}
      <SectionTitle>Package and Assess</SectionTitle>

      {/* ── STEP 1 — AMBITION ── */}
      {hasStep1 && (
        <div className="flex flex-col gap-[15px]">
          <StepLabel>STEP 1 - AMBITION</StepLabel>

          {hasCoreInnovation && (
            <div className="flex flex-col gap-[5px]">
              <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.5]">
                Core innovation selected and CGIAR Science
                Program/Accelerator leading the development:
              </p>
              <p className="text-(--theme-mid) text-[10px] leading-[1.5]">
                <span className="font-medium">
                  {data.core_innovation!.result_code}:
                </span>{" "}
                <a
                  href={data.core_innovation!.link}
                  className="underline"
                >
                  {data.core_innovation!.title}
                </a>
              </p>
            </div>
          )}

          {geo?.geo_focus && <GeographicSection geo={geo} />}

          {hasScalingAmbition && (
            <div className="flex flex-col gap-2.5">
              <SubSectionTitle>
                Scaling ambition, experts and consultation
              </SubSectionTitle>
              <LabelValue
                label="2030 Scaling Ambition Statement"
                value={data.scaling_ambition_statement!}
                multiline
              />
            </div>
          )}

          {(hasTargetedActors || hasTargetedOrgs || hasTargetedInnovationPartners) && (
            <div className="flex flex-col gap-[10px]">
              <SubSectionTitle>Targeted Innovation Use</SubSectionTitle>

              {hasTargetedActors && (
                <div className="flex flex-col gap-[5px]" data-paginator-block>
                  <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">
                    Actors
                  </p>
                  <IpsrActorsTable actors={data.targeted_actors!} />
                </div>
              )}

              {hasTargetedOrgs && (
                <div className="flex flex-col gap-[5px]" data-paginator-block>
                  <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">
                    Organizations
                  </p>
                  <IpsrOrganizationsTable
                    organizations={data.targeted_organizations!}
                  />
                </div>
              )}

              {hasTargetedInnovationPartners && (
                <div className="flex flex-col gap-[5px]" data-paginator-block>
                  <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">
                    Innovation partners
                  </p>
                  <DataTable
                    columns={["Name", "Country HQ", "Institution type", "Delivery type"]}
                    rows={(data.targeted_innnovation_partners ?? []).map((p) => [
                      p.partner_name ?? "Not provided",
                      p.partner_country_hq ?? "Not provided",
                      p.partner_type ?? "Not provided",
                      p.partner_delivery_type ?? "Not provided",
                    ])}
                  />
                </div>
              )}
            </div>
          )}

          {hasAspiredOutcomes && (
            <div className="flex flex-col gap-[5px]">
              <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">
                Aspired outcomes and impact:
              </p>
              <ul className="list-disc ml-[15px] text-[#393939] text-[10px]">
                {data.aspired_outcomes_impact!.map((outcome, i) => (
                  <li key={`outcome-${i}`} className="leading-normal">
                    {outcome.eoi_title}
                    {!!outcome.is_contributor && (
                      <span className="text-(--theme-mid) font-bold ml-[4px]">
                        (Contributor)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasInnovationPackagingExperts && (
            <div className="flex flex-col gap-[8px]">
              <LabelValue
                label="Was an Innovation Packaging and Scaling Readiness online or in-person expert workshop organized?"
                value={data.innovation_packaging_experts!.was_workshop_organized}
                multiline
              />

              {hasFacilitators && (
                <div className="flex flex-col gap-[5px]">
                  <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">
                    Facilitators:
                  </p>
                  <ul className="list-disc ml-[15px] text-[#393939] text-[10px]">
                    {data.innovation_packaging_experts!.facilitators!.map((f, i) => (
                      <li key={`facilitator-${i}`} className="leading-normal">
                        {f.first_name} {f.last_name} ({f.email}) - {f.role}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── STEPS 2 & 3 — PACKAGE AND ASSESS ── */}
      {hasSteps2and3 && (
        <div className="flex flex-col gap-[15px]">
          <StepLabel>STEP 2 AND 3 - PACKAGE AND ASSESS</StepLabel>

          {(hasCurrentUseActors || hasCurrentUseOrgs || hasCurrentUseMeasures) && (
            <div className="flex flex-col gap-[10px]">
              <SubSectionTitle>
                Current use of the core innovation
              </SubSectionTitle>

              {hasCurrentUseActors && (
                <div className="flex flex-col gap-[5px]" data-paginator-block>
                  <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">
                    Actors
                  </p>
                  <IpsrActorsTable
                    actors={data.current_use_actors!}
                    showEvidence
                  />
                </div>
              )}

              {hasCurrentUseOrgs && (
                <div className="flex flex-col gap-[5px]" data-paginator-block>
                  <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">
                    Organizations
                  </p>
                  <IpsrOrganizationsTable
                    organizations={data.current_use_organizations!}
                    showEvidence
                  />
                </div>
              )}

              {hasCurrentUseMeasures && (
                <div className="flex flex-col gap-[5px]" data-paginator-block>
                  <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">
                    Quantitative measures
                  </p>
                  <IpsrMeasuresTable measures={data.current_use_measures!} />
                </div>
              )}
            </div>
          )}

          {hasAssessmentType && (
            <LabelValue
              label="What was assessed during the expert workshop?"
              value={data.assessment_type!}
              multiline
            />
          )}

          {hasEvidenceReadinessTable && (() => {
            const rows: ReadinessRow[] = [];
            if (data.evidence_based_assessment_core) {
              const c = data.evidence_based_assessment_core;
              rows.push({
                type: "Core innovation",
                short_title: c.short_name,
                innovation_readiness: c.readiness_level,
                readiness_evidence: c.readiness_evidence,
                innovation_use: c.use_level,
                use_evidence: c.use_evidence,
              });
            }
            (data.evidence_based_assessment_complementary ?? []).forEach(
              (comp: IpsrComplementaryAssessment, i: number) => {
                rows.push({
                  type: `Complementary innovation ${i + 1}`,
                  short_title: comp.short_name,
                  innovation_readiness: comp.readiness_level,
                  readiness_evidence: comp.readiness_evidence,
                  innovation_use: comp.use_level,
                  use_evidence: comp.use_evidence,
                });
              }
            );
            return (
              <div className="flex flex-col gap-[5px]" data-paginator-block>
                <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">
                  Evidence-based Scaling Readiness assessment
                </p>
                <EvidenceBasedReadinessTable rows={rows} />
              </div>
            );
          })()}

          {hasEvidenceMaterialLinks && (
            <div className="flex flex-col gap-[5px]">
              <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">
                Provide details of where evidence can be found within the source link
              </p>
              <p className="text-[#393939] text-[10px] leading-[1.15]">
                {data.evidence_based_assessment_core?.readiness_evidence_details}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 4 — ADDITIONAL INFORMATION ── */}
      {hasStep4 && (
        <div className="flex flex-col gap-[15px]">
          <StepLabel>STEP 4 - ADDITIONAL INFORMATION</StepLabel>

          {hasInvestmentPrograms && (
            <div data-paginator-block>
              <InvestmentTable
                title="Estimation of total USD-value of investment by CGIAR Programs during the reporting period"
                columnHeader="Science program/Accelerator"
                entries={data.investment_programs!}
              />
            </div>
          )}

          {hasInvestmentBilateral && (
            <div data-paginator-block>
              <InvestmentTable
                title="Estimated total USD-value of investment by CGIAR W3 or bilateral projects during the reporting period"
                columnHeader="Bilateral"
                entries={data.investment_bilateral!}
              />
            </div>
          )}

          {hasInvestmentPartners && (
            <div data-paginator-block>
              <InvestmentTable
                title="Estimated total USD-value of (co-)investment by partners during the reporting period"
                columnHeader="Partner"
                entries={data.investment_partners!}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
