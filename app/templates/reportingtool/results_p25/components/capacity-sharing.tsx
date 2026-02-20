import React from "react";
import { PRMSResultData } from "../types";
import { SectionTitle } from "./common-sections";
import { KeyValueTable } from "./tables";

export default function CapacitySharingSections({
  data,
}: Readonly<{ data: PRMSResultData }>) {
  return (
    <div className="flex flex-col gap-2.5">
      <SectionTitle>Capacity Sharing for Development</SectionTitle>
      <KeyValueTable
        rows={[
          {
            label: "Number of people trained",
            value: `Female: ${data.capdev_female_using} | Male: ${data.capdev_male_using}`,
          },
          {
            label: "Length of training",
            value: data.capdev_term ?? "Not provided",
          },
          {
            label: "Delivery Method",
            value: data.capdev_delivery_method_name ?? "Not provided",
          },
          {
            label: "Were the trainees attending on behalf of an organization?",
            value:
              (data.capdev_organizations?.length &&
                data.capdev_organizations.length > 0 &&
                data.capdev_organizations?.join(", ")) ||
              "Not provided",
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
