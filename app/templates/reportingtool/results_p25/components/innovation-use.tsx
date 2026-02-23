import Image from "next/image";
import type { PRMSResultData, InnovationUseActor } from "../types";
import { SectionTitle } from "./common-sections";
import { DataTable } from "./tables";
import readinessScale from "../../../../../public/assets/prms/current_readiness_scale.svg";

function GenderCell({
  total,
  youth,
  nonYouth,
}: Readonly<{
  total: number | null;
  youth: number | null;
  nonYouth: number | null;
}>) {
  if (total === null) {
    return <span>Not provided</span>;
  }
  return (
    <div className="flex flex-col gap-[2px]">
      <span>Total: {total}</span>
      <div className="flex gap-[8px]">
        <span>Youth: {youth ?? 0}</span>
        <span>Non-youth: {nonYouth ?? 0}</span>
      </div>
    </div>
  );
}

function ActorsTable({ actors }: Readonly<{ actors: InnovationUseActor[] }>) {
  return (
    <table
      className="w-full text-[8.5px] border-collapse"
      style={{ fontFamily: "'Inter', 'Noto Sans', sans-serif" }}
    >
      <thead>
        <tr>
          {["Type", "Subtype", "Women", "Men", "Total"].map((col) => (
            <th
              key={col}
              className="bg-(--theme-deep) text-white font-bold text-left border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {actors.map((actor, i) => (
          <tr
            key={`${actor.actor_type}-${actor.subtype}-${i}`}
            className="bg-white"
          >
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px", borderLeft: "0.5px solid #e8ebed" }}
            >
              {actor.other_actor_type
                ? `${actor.actor_type}: ${
                    actor.other_actor_type ?? "Not provided"
                  }`
                : actor.actor_type ?? "Not provided"}
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {actor.subtype || "-"}
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {actor.sex_and_age_disaggregation ? (
                "Not applicable"
              ) : (
                <GenderCell
                  total={actor.women_total}
                  youth={actor.women_youth}
                  nonYouth={actor.women_non_youth}
                />
              )}
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {actor.sex_and_age_disaggregation ? (
                "Not applicable"
              ) : (
                <GenderCell
                  total={actor.men_total}
                  youth={actor.men_youth}
                  nonYouth={actor.men_non_youth}
                />
              )}
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {actor.total ?? "Not provided"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function InnovationUseSections({
  data,
}: Readonly<{ data: PRMSResultData }>) {
  return (
    <div className="flex flex-col gap-[15px]">
      <SectionTitle>Innovation Use</SectionTitle>

      <div className="flex flex-col gap-2.5">
        <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">
          Actors - Number of people using the innovation, disaggregated by
          gender:
        </p>
        <ActorsTable actors={data.innovation_use_actors ?? []} />
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">
          Organizations
        </p>
        <DataTable
          columns={["Type", "Subtype", "How many"]}
          rows={(data.innovation_use_organizations ?? []).map((o) => [
            o.type ?? "Not provided",
            o.subtype ?? "Not provided",
            o.how_many ?? "Not provided",
          ])}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">
          Other quantitative measures of innovation use
        </p>
        <DataTable
          columns={[
            "#Unit of measure",
            ...(data.innovation_use_measures ?? []).map(
              (m) => m.unit_of_measure
            ),
          ]}
          rows={[
            [
              "Value",
              ...(data.innovation_use_measures ?? []).map(
                (m) => m.value ?? "Not provided"
              ),
            ],
          ]}
        />
      </div>

      <div className="flex items-center gap-1 mb-4">
        <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">
          Current readiness of this innovation:
        </p>
        <p className="text-[#393939] text-[10px] leading-[1.15]">
          {data.readiness_level}
        </p>
      </div>

      <Image
        src={readinessScale}
        alt="Innovation Use Readiness Scale"
        width={100}
        height={500}
        className="w-full"
      />
    </div>
  );
}
