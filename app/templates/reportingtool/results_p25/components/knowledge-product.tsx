import type { PRMSResultData } from "../types";
import { SectionTitle } from "./common-sections";
import { KeyValueTable } from "./tables";

export function KPDetailsSection({ data }: { data: PRMSResultData }) {
  if (!data.kp_partner_data || data.kp_partner_data.length === 0) return null;

  return (
    <div className="flex flex-col gap-[10px]">
      <SectionTitle>Knowledge Product</SectionTitle>
      <KeyValueTable rows={data.kp_partner_data} />
    </div>
  );
}
