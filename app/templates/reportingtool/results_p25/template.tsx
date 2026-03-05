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
      {/* Common sections */}
      {d && (
        <section data-paginator-block="section">
          <ResultDetailsSection data={d} impactAreas={impactAreas} />
        </section>
      )}
      {d && (
        <section data-paginator-block="section">
          <ContributorsSection data={d} tocEntries={tocEntries} />
        </section>
      )}
      {geo?.geo_focus && (
        <section data-paginator-block="section">
          <GeographicSection geo={geo} />
        </section>
      )}
      {evidences?.length > 0 && (
        <section data-paginator-block="section">
          <EvidenceSection evidences={evidences} />
        </section>
      )}

      {/* Variant-specific sections based on rt_id */}
      {d?.rt_id === 1 && (
        <section data-paginator-block="section">
          <PolicyChangeSection data={d} />
        </section>
      )}
      {d?.rt_id === 2 && (
        <section data-paginator-block="section">
          <InnovationUseSections data={d} />
        </section>
      )}
      {d?.rt_id === 5 && (
        <section data-paginator-block="section">
          <CapacitySharingSections data={d} />
        </section>
      )}
      {d?.rt_id === 7 && (
        <section data-paginator-block="section">
          <InnovationDevelopmentSections data={d} />
        </section>
      )}
      {d?.rt_id === 6 && (
        <section data-paginator-block="section">
          <KPDetailsSection data={d} />
        </section>
      )}
    </PageShell>
  );
}
