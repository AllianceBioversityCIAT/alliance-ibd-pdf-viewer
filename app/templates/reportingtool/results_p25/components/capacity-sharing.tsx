import type { PRMSResultData } from "../types";
import { SectionTitle } from "./common-sections";
import { KeyValueTable } from "./tables";

export default function CapacitySharingSections({
  data,
}: Readonly<{ data: PRMSResultData }>) {
  const hasCapDevData =
    data.capdev_female_using ||
    data.capdev_male_using ||
    data.capdev_non_binary_using ||
    data.capdev_unkown_using ||
    data.capdev_term ||
    data.capdev_delivery_method_name ||
    data.capdev_organizations?.length;

  if (!hasCapDevData) return null;

  const getNumberOfPeopleTrained = () => {
    const segments: string[] = [];

    if (data.capdev_female_using) {
      segments.push(`Female: ${data.capdev_female_using}`);
    }

    if (data.capdev_male_using) {
      segments.push(`Male: ${data.capdev_male_using}`);
    }

    if (data.capdev_non_binary_using) {
      segments.push(`Non-binary: ${data.capdev_non_binary_using}`);
    }

    if (data.capdev_unkown_using) {
      segments.push(`Unknown: ${data.capdev_unkown_using}`);
    }

    if (!segments.length) {
      return null;
    }

    return segments.join(" | ");
  };

  return (
    <div className="flex flex-col gap-2.5">
      <SectionTitle>Capacity Sharing for Development</SectionTitle>
      <KeyValueTable
        rows={[
          {
            label: "Number of people trained",
            value: getNumberOfPeopleTrained() ?? "Not provided",
            hideRowIf: !getNumberOfPeopleTrained(),
          },
          {
            label: "Length of training",
            value: data.capdev_term ?? "Not provided",
            hideRowIf: !data.capdev_term,
          },
          {
            label: "Delivery Method",
            value: data.capdev_delivery_method_name ?? "Not provided",
            hideRowIf: !data.capdev_delivery_method_name,
          },
          {
            label: "Were the trainees attending on behalf of an organization?",
            value: data.capdev_organizations?.join(", ") ?? "Not provided",
            hideRowIf: !data.capdev_organizations?.length,
          },
        ]}
      />
      <ul className="text-[8px] list-disc list-inside text-[#818181]">
        <li>
          Long-term training refers to training that goes for 3 or more months.
        </li>
        <li>
          Short-term training refers to training that goes for less than 3
          months.
        </li>
      </ul>
    </div>
  );
}
