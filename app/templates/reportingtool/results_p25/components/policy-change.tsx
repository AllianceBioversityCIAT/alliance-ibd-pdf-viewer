import type { PRMSResultData } from "../types";
import { SectionTitle } from "./common-sections";
import { KeyValueTable } from "./tables";

export function PolicyChangeSection({ data }: { data: PRMSResultData }) {
  const rows: { label: string; value: string }[] = [];

  if (data.policy_type_name) {
    rows.push({ label: "Type", value: data.policy_type_name });
  }
  if (data.policy_amount) {
    rows.push({ label: "USD amount", value: data.policy_amount });
  }
  if (data.policy_stage) {
    rows.push({ label: "Stage", value: data.policy_stage });
  }
  if (data.policy_implementing_organizations) {
    rows.push({
      label: "Whose policy is this? (Implementing organizations)",
      value: data.policy_implementing_organizations,
    });
  }

  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-[10px]">
      <SectionTitle>Policy Change</SectionTitle>
      <KeyValueTable rows={rows} />
    </div>
  );
}
