import type { PRMSResultData } from "../types";
import { SectionTitle } from "./common-sections";
import { KeyValueTable } from "./tables";

export function KPDetailsSection({ data }: Readonly<{ data: PRMSResultData }>) {
  return (
    <div className="flex flex-col gap-2.5">
      <SectionTitle>Knowledge Product</SectionTitle>
      <KeyValueTable
        rows={[
          { label: "Handle", value: data.kp_handle ?? "Not provided" },
          {
            label: "Online date (CGSpace)",
            value:
              data.kp_cgspace_metadata?.online_date?.toString() ??
              "Not provided",
          },
          {
            label: "Issue date (CGSpace)",
            value:
              data.kp_cgspace_metadata?.issue_date?.toString() ??
              "Not provided",
          },
          {
            label: "Issue date (WoS)",
            value:
              data.kp_wos_metadata?.issue_date?.toString() ?? "Not provided",
          },
          { label: "Authors", value: data.kp_authors ?? "Not provided" },
          {
            label: "Knowledge Product Type",
            value: data.kp_knowledge_product_type ?? "Not provided",
          },
          {
            label: "Peer reviewed (CGSpace)",
            value: data.kp_cgspace_metadata?.peer_reviewed ? "Yes" : "No",
          },
          {
            label: "Web of Science Core Collection (former ISI) (CGSpace)",
            value: data.kp_cgspace_metadata?.isi ? "Yes" : "No",
          },
          {
            label: "DOI",
            value:
              data.kp_cgspace_metadata?.doi ??
              data.kp_wos_metadata?.doi ??
              "Not provided",
          },
          {
            label: "Accessibility (CGSpace)",
            value: data.kp_cgspace_metadata?.open_access ?? "Not provided",
          },
          { label: "Licence", value: data.kp_licence ?? "Not provided" },
          { label: "Keywords", value: data.kp_keywords ?? "Not provided" },
          {
            label: "AGROVOC Keywords",
            value: data.kp_agrovocs ?? "Not provided",
          },
          { label: "Commodity", value: data.kp_comodity ?? "Not provided" },
          {
            label: "Investors/Sponsors",
            value: data.kp_sponsors ?? "Not provided",
          },
          {
            label: "Altmetrics score",
            value: data.kp_altmetrics_score?.toString() ?? "Not provided",
          },
          {
            label: "Reference to other knowledge products",
            value: data.kp_references ?? "Not provided",
          },
          {
            label: "FAIR score for this knowledge product",
            value: `${data.kp_fair_score?.findable ?? "Not provided"} | ${
              data.kp_fair_score?.accessible ?? "Not provided"
            } | ${data.kp_fair_score?.interoperable ?? "Not provided"} | ${
              data.kp_fair_score?.reusable ?? "Not provided"
            }`,
          },
        ]}
      />
    </div>
  );
}
