import type { PRMSResultData } from "../types";
import { SectionTitle } from "./common-sections";
import { KeyValueTable } from "./tables";

export function PolicyChangeSection({
  data,
}: Readonly<{ data: PRMSResultData }>) {
  return (
    <div className="flex flex-col gap-2.5">
      <SectionTitle>Policy Change</SectionTitle>
      <KeyValueTable
        rows={[
          {
            label: "Type",
            value: data.policy_type_name ?? "Not provided",
          },
          {
            label: "USD Amount",
            value: data.policy_amount ?? "Not provided",
            hideRowIf:
              data.policy_type_name === "Program, budget or investment",
          },
          {
            label: "Stage",
            value: data.policy_stage ?? "Not provided",
          },
          {
            label: "Whose policy is this? (Implementing organizations)",
            value:
              data.policy_implementing_organizations?.join(", ") ??
              "Not provided",
          },
        ]}
      />
    </div>
  );
}
