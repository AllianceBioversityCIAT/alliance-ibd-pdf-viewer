import type { TemplateProps } from "../..";
import type { PRMSResultData } from "./types";
import {
  extractImpactAreas,
  extractGeoLocation,
  extractTocEntries,
  extractEvidences,
} from "./transform";
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
import { PolicyChangePlaceholder } from "./components/policy-change";
import { InnovationUsePlaceholder } from "./components/innovation-use";

export default function ResultsP25({ data }: Readonly<TemplateProps>) {
  const d = data as PRMSResultData | null;

  const impactAreas = d ? extractImpactAreas(d) : [];
  const geo = d ? extractGeoLocation(d) : null;
  const tocEntries = d ? extractTocEntries(d) : [];
  const evidences = d ? extractEvidences(d) : [];

  return (
    <PageShell
      resultType={d?.result_type ?? "Result Type"}
      resultName={d?.result_name ?? d?.title ?? "No title provided"}
      generationDate={d?.generation_date_footer ?? "—"}
      phaseName={d?.phase_name ?? "—"}
    >
      {/* QA Box — KPQABox for Knowledge Products, standard QABox otherwise */}
      {d?.rt_id === 6 ? <KPQABox /> : <QABox adjustments={d?.qa_adjustments} />}

      {/* Common sections */}
      {d && <ResultDetailsSection data={d} impactAreas={impactAreas} />}
      {d && <ContributorsSection data={d} tocEntries={tocEntries} />}
      <GeographicSection geo={geo} />
      <EvidenceSection evidences={evidences} />

      {/* Variant-specific sections based on rt_id */}
      {d?.rt_id === 7 && <InnovationDevelopmentSections data={d} />}
      {d?.rt_id === 6 && <KPDetailsSection data={d} />}
      {d?.rt_id === 1 && <PolicyChangePlaceholder />}
      {d?.rt_id === 2 && <InnovationUsePlaceholder />}
      {/* rt_id === 5 (Capacity Sharing) — common sections only, no extra content */}
    </PageShell>
  );
}
