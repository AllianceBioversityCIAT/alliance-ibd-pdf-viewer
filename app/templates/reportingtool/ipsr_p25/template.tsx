import type { TemplateProps } from "../..";
import { formatDateCET } from "../../utils";
import type { IPSRResultData } from "./types";
import type { GeoLocation } from "../shared/types";
import {
  extractImpactAreas,
  extractGeoLocation,
  extractTocEntries,
  extractEvidences,
} from "../shared/transform";
import { getThemeColors, themeVars } from "../shared/color-themes";
import { PageShell } from "../results_p25/components/page-shell";
import { QABox } from "../results_p25/components/qa-box";
import {
  ResultDetailsSection,
  EvidenceSection,
} from "./components/common-sections";
import { IpsrContributorsSection } from "./components/common-sections";
import { IpsrSections } from "./components/ipsr-sections";

export default function IpsrP25({ data }: Readonly<TemplateProps>) {
  const d = data as IPSRResultData | null;
  const theme = getThemeColors(d?.primary_submitter_acronym);

  // Cast to shared type for transform functions (compatible fields)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sharedData = d as any;

  const impactAreas = d ? extractImpactAreas(sharedData) : [];
  const geo = d ? extractGeoLocation(sharedData) : null;
  const tocEntries = d
    ? extractTocEntries(sharedData)
    : {
        toc_primary: [],
        toc_url: "",
        toc_internal_id: "",
        contributor_name: "",
        contributor_can_match_result: false,
      };
  const evidences = d ? extractEvidences(sharedData) : [];

  return (
    <PageShell
      resultType={
        d
          ? `Result code #${d.result_code} - ${d.result_type}`
          : "Innovation Package"
      }
      resultName={d?.result_name ?? d?.title ?? "No title provided"}
      generationDate={formatDateCET(new Date())}
      phaseName={d?.phase_name ?? "—"}
      themeVars={themeVars(theme)}
      primarySubmitterAcronym={d?.primary_submitter_acronym ?? ""}
    >
      {/* QA Box */}
      {d?.qa_info && <QABox qaInfo={d.qa_info} />}

      {/* Common sections */}
      {d && <ResultDetailsSection data={sharedData} impactAreas={impactAreas} />}
      {d && <IpsrContributorsSection data={d} tocEntries={tocEntries} />}
      {evidences?.length > 0 && <EvidenceSection evidences={evidences} />}

      {/* IPSR-specific sections (Steps 1-4) — Geographic location goes inside Step 1 */}
      {d && <IpsrSections data={d} geo={geo} />}
    </PageShell>
  );
}
