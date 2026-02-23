import type { TemplateProps } from "../..";
import { formatDateCET } from "../../utils";
import type { PRMSResultData } from "./types";
import {
  extractImpactAreas,
  extractGeoLocation,
  extractTocEntries,
  extractEvidences,
} from "./transform";
import { getThemeColors, themeVars } from "./color-themes";
import { PageShell } from "./components/page-shell";
import { QABox, KPQABox } from "./components/qa-box";
import {
  ResultDetailsSection,
  ContributorsSection,
  GeographicSection,
  EvidenceSection,
} from "./components/common-sections";
import { InnovationDevelopmentSections } from "./components/innovation-development";
import { KPDetailsSection } from "./components/knowledge-product";
import { PolicyChangeSection } from "./components/policy-change";
import { InnovationUseSections } from "./components/innovation-use";
import CapacitySharingSections from "./components/capacity-sharing";

export default function ResultsP25({ data }: Readonly<TemplateProps>) {
  const d = data as PRMSResultData | null;
  const theme = getThemeColors(d?.primary_submitter_acronym);

  const impactAreas = d ? extractImpactAreas(d) : [];
  const geo = d ? extractGeoLocation(d) : null;
  const tocEntries = d
    ? extractTocEntries(d)
    : {
        toc_primary: [],
        toc_url: "",
        toc_internal_id: "",
        contributor_name: "",
        contributor_can_match_result: false,
      };
  const evidences = d ? extractEvidences(d) : [];

  return (
    <PageShell
      resultType={d?.result_type ?? "Result Type"}
      resultName={d?.result_name ?? d?.title ?? "No title provided"}
      generationDate={formatDateCET(new Date())}
      phaseName={d?.phase_name ?? "—"}
      themeVars={themeVars(theme)}
      primarySubmitterAcronym={d?.primary_submitter_acronym ?? ""}
    >
      {/* QA Box — KPQABox for Knowledge Products, standard QABox otherwise */}
      {d?.rt_id === 6 ? (
        <KPQABox />
      ) : (
        <QABox
          adjustments={d?.qa_adjustments}
          readinessTransition={
            d?.rt_id === 2 &&
            d?.innovation_readiness_from &&
            d?.innovation_readiness_to
              ? {
                  from: d.innovation_readiness_from,
                  to: d.innovation_readiness_to,
                }
              : undefined
          }
        />
      )}

      {/* Common sections */}
      {d && <ResultDetailsSection data={d} impactAreas={impactAreas} />}
      {d && <ContributorsSection data={d} tocEntries={tocEntries} />}
      <GeographicSection geo={geo} />
      <EvidenceSection evidences={evidences} />

      <div style={{ breakAfter: "always" }}></div>
      {/* Variant-specific sections based on rt_id */}
      {d?.rt_id === 1 && <PolicyChangeSection data={d} />}
      {d?.rt_id === 2 && <InnovationUseSections data={d} />}
      {d?.rt_id === 5 && <CapacitySharingSections data={d} />}
      {d?.rt_id === 7 && <InnovationDevelopmentSections data={d} />}
      {d?.rt_id === 6 && <KPDetailsSection data={d} />}
    </PageShell>
  );
}
