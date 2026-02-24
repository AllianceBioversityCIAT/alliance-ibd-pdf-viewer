import type { PRMSResultData } from "../types";
import { SectionTitle } from "./common-sections";
import { KeyValueTable } from "./tables";

export function KPDetailsSection({ data }: Readonly<{ data: PRMSResultData }>) {
  const hasKPDetails =
    data.kp_handle ||
    data.kp_cgspace_metadata?.online_date ||
    data.kp_cgspace_metadata?.issue_date ||
    data.kp_wos_metadata?.issue_date ||
    data.kp_authors ||
    data.kp_knowledge_product_type ||
    data.kp_cgspace_metadata?.peer_reviewed ||
    data.kp_cgspace_metadata?.isi ||
    data.kp_cgspace_metadata?.doi ||
    data.kp_cgspace_metadata?.open_access ||
    data.kp_licence ||
    data.kp_keywords ||
    data.kp_agrovocs ||
    data.kp_comodity ||
    data.kp_sponsors ||
    data.kp_altmetrics_score ||
    data.kp_references ||
    (data.kp_fair_score?.findable &&
      data.kp_fair_score?.accessible &&
      data.kp_fair_score?.interoperable &&
      data.kp_fair_score?.reusable);

  if (!hasKPDetails) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <SectionTitle>Knowledge Product</SectionTitle>
      <KeyValueTable
        rows={[
          {
            label: "Handle",
            value: data.kp_handle ?? "Not provided",
            hideRowIf: !data.kp_handle,
          },
          {
            label: "Online date (CGSpace)",
            value:
              data.kp_cgspace_metadata?.online_date?.toString() ??
              "Not provided",
            hideRowIf: !data.kp_cgspace_metadata?.online_date,
          },
          {
            label: "Issue date (CGSpace)",
            value:
              data.kp_cgspace_metadata?.issue_date?.toString() ??
              "Not provided",
            hideRowIf: !data.kp_cgspace_metadata?.issue_date,
          },
          {
            label: "Issue date (WoS)",
            value:
              data.kp_wos_metadata?.issue_date?.toString() ?? "Not provided",
            hideRowIf: !data.kp_wos_metadata?.issue_date,
          },
          {
            label: "Authors",
            value: data.kp_authors ?? "Not provided",
            hideRowIf: !data.kp_authors,
          },
          {
            label: "Knowledge Product Type",
            value: data.kp_knowledge_product_type ?? "Not provided",
            hideRowIf: !data.kp_knowledge_product_type,
          },
          {
            label: "Peer reviewed (CGSpace)",
            value: data.kp_cgspace_metadata?.peer_reviewed ? "Yes" : "No",
            hideRowIf: !data.kp_cgspace_metadata?.peer_reviewed,
          },
          {
            label: "Web of Science Core Collection (former ISI) (CGSpace)",
            value: data.kp_cgspace_metadata?.isi ? "Yes" : "No",
            hideRowIf: !data.kp_cgspace_metadata?.isi,
          },
          {
            label: "DOI",
            value:
              data.kp_cgspace_metadata?.doi ??
              data.kp_wos_metadata?.doi ??
              "Not provided",
            hideRowIf:
              !data.kp_cgspace_metadata?.doi && !data.kp_wos_metadata?.doi,
          },
          {
            label: "Accessibility (CGSpace)",
            value: data.kp_cgspace_metadata?.open_access ?? "Not provided",
            hideRowIf: !data.kp_cgspace_metadata?.open_access,
          },
          {
            label: "Licence",
            value: data.kp_licence ?? "Not provided",
            hideRowIf: !data.kp_licence,
          },
          {
            label: "Keywords",
            value: data.kp_keywords ?? "Not provided",
            hideRowIf: !data.kp_keywords,
          },
          {
            label: "AGROVOC Keywords",
            value: data.kp_agrovocs ?? "Not provided",
            hideRowIf: !data.kp_agrovocs,
          },
          {
            label: "Commodity",
            value: data.kp_comodity ?? "Not provided",
            hideRowIf: !data.kp_comodity,
          },
          {
            label: "Investors/Sponsors",
            value: data.kp_sponsors ?? "Not provided",
            hideRowIf: !data.kp_sponsors,
          },
          {
            label: "Altmetrics score",
            value: data.kp_altmetrics_score?.toString() ?? "Not provided",
            hideRowIf: !data.kp_altmetrics_score,
          },
          {
            label: "Reference to other knowledge products",
            value: data.kp_references ?? "Not provided",
            hideRowIf: !data.kp_references,
          },
          {
            label: "FAIR score for this knowledge product",
            value: `${data.kp_fair_score?.findable ?? "Not provided"} | ${
              data.kp_fair_score?.accessible ?? "Not provided"
            } | ${data.kp_fair_score?.interoperable ?? "Not provided"} | ${
              data.kp_fair_score?.reusable ?? "Not provided"
            }`,
            hideRowIf:
              !data.kp_fair_score?.findable &&
              !data.kp_fair_score?.accessible &&
              !data.kp_fair_score?.interoperable &&
              !data.kp_fair_score?.reusable,
          },
        ]}
      />
    </div>
  );
}
