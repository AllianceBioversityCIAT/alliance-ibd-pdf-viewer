import type { TemplateProps } from "../..";
import { formatDateCET } from "../../utils";
import type { PRMSResultData } from "../shared/types";
import {
  extractImpactAreas,
  extractGeoLocation,
  extractTocEntries,
  extractEvidences,
} from "../shared/transform";
import { getThemeColors, themeVars } from "../shared/color-themes";
import { PageShell } from "./components/page-shell";
import { QABox } from "./components/qa-box";
import {
  ResultDetailsSection,
  ContributorsSection,
  GeographicSection,
  EvidenceSection,
} from "./components/common-sections";
import { InnovationDevelopmentSections } from "../shared/components/innovation-development";
import { KPDetailsSection } from "../shared/components/knowledge-product";
import { PolicyChangeSection } from "../shared/components/policy-change";
import { InnovationUseSections } from "../shared/components/innovation-use";
import CapacitySharingSections from "../shared/components/capacity-sharing";

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
      {/* QA Box — rendered from backend qa_info */}
      {d?.qa_info && <QABox qaInfo={d.qa_info} />}

      {/* Common sections */}
      {d && <ResultDetailsSection data={d} impactAreas={impactAreas} />}
      {d && <ContributorsSection data={d} tocEntries={tocEntries} />}
      {geo?.geo_focus && <GeographicSection geo={geo} />}
      {evidences?.length > 0 && <EvidenceSection evidences={evidences} />}

      {/* Variant-specific sections based on rt_id */}
      {d?.rt_id === 1 && <PolicyChangeSection data={d} />}
      {d?.rt_id === 2 && <InnovationUseSections data={d} />}
      {d?.rt_id === 5 && <CapacitySharingSections data={d} />}
      {d?.rt_id === 7 && <InnovationDevelopmentSections data={d} />}
      {d?.rt_id === 6 && <KPDetailsSection data={d} />}
    </PageShell>
  );
}
