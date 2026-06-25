import type { TemplateProps } from "../..";
import type { InnDevPdfPayload } from "./types";
import { PageShell } from "../shared/components/page-shell";
import { GeneralInformationSection } from "../shared/sections/general_information";
import { AllianceAlignmentSection } from "../shared/sections/alliance_alignment";
import { ResultsPartnersSection } from "../shared/sections/results_partners";
import { GeographicScopeSection } from "../shared/sections/geographic_scope";
import { EvidenceSection } from "../shared/sections/evidence";
import { IpRightsSection } from "../shared/sections/ip_rights";
import { InnovationDetailsSection } from "./components/innovation-details-section";
import { shouldRenderTitle } from "../shared/sections/general_information/rules";

export default function InnDevTemplate({ data }: Readonly<TemplateProps>) {
  const payload = data as InnDevPdfPayload | null;
  const general = payload?.general_information;

  const title = shouldRenderTitle(general)
    ? general!.title.trim()
    : "STAR Result";

  return (
    <PageShell
      title={title}
      resultCode={general?.result_code}
      indicator={general?.result_type}
      generatedAt={general?.generated_at}
    >
      <GeneralInformationSection data={general} />
      <AllianceAlignmentSection data={payload?.alliance_alignment} />
      <InnovationDetailsSection data={payload?.innovation_details} />
      <ResultsPartnersSection data={payload?.results_partners} />
      <GeographicScopeSection data={payload?.geographic_scope} />
      <EvidenceSection data={payload?.evidence} />
      <IpRightsSection
        data={payload?.ip_rights}
        indicatorId={general?.indicator_id}
      />
    </PageShell>
  );
}
