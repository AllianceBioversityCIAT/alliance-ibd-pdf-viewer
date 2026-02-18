import type { PRMSResultData, InnovationUseActor } from "../types";
import { SectionTitle, SubSectionTitle } from "./common-sections";
import { DataTable } from "./tables";

const READINESS_DESCRIPTIONS: Record<number, string> = {
  9: "The innovation is commonly used at a large scale in non-initial locations by entities for whom the innovation was not initially developed",
  8: "The innovation is used by some end-users or beneficiaries, at an intermediate scale, in non-initial locations",
  7: "The innovation is commonly used by organizations not connected to the initial innovation development",
  6: "The innovation is used by some organizations not connected to the initial innovation development",
  5: "The innovation is commonly used by organizations connected to members in the initial innovation development",
  4: "The innovation is used by some organizations connected to members in the initial innovation development",
  3: "The innovation is commonly used by partners in the initial innovation development",
  2: "The innovation is used by some partners to initiate innovation development",
  1: "The innovation is used only for implementing innovation development",
  0: "The innovation is not used",
};

function GenderCell({
  total,
  youth,
  nonYouth,
}: {
  total: number | null;
  youth: number | null;
  nonYouth: number | null;
}) {
  if (total === null) {
    return <span>Not applicable</span>;
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

function ActorsTable({ actors }: { actors: InnovationUseActor[] }) {
  return (
    <table
      className="w-full text-[7.5px] border-collapse"
      style={{ fontFamily: "'Inter', 'Noto Sans', sans-serif" }}
    >
      <thead>
        <tr>
          {["Type", "Subtype", "Women", "Men", "Total"].map((col) => (
            <th
              key={col}
              className="bg-[#033529] text-white font-bold text-left border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {actors.map((actor, i) => (
          <tr key={i} className="bg-white">
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px", borderLeft: "0.5px solid #e8ebed" }}
            >
              {actor.actor_type}
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
              <GenderCell
                total={actor.women_total}
                youth={actor.women_youth}
                nonYouth={actor.women_non_youth}
              />
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              <GenderCell
                total={actor.men_total}
                youth={actor.men_youth}
                nonYouth={actor.men_non_youth}
              />
            </td>
            <td
              className="text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {actor.total}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReadinessScale({ currentLevel }: { currentLevel: number }) {
  const levels = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

  return (
    <div className="flex flex-col gap-[15px]">
      <p className="text-[10px] leading-[1.15]">
        <span className="font-bold text-[#1d1d1d]">
          Current readiness of this innovation:
        </span>{" "}
        <span className="text-[#393939]">Level {currentLevel}</span>
      </p>
      <div className="relative">
        {/* Gradient bar behind circles */}
        <div
          className="absolute left-[20px] right-[20px] h-[12px]"
          style={{
            top: 14,
            background:
              "linear-gradient(to right, #176028, #1f6838, #27984a, #45a85a, #5cb86c, #6cb88b, #5a9fc1, #7bb8d0, #a0c8d8, #c1c5ca)",
            borderRadius: 6,
          }}
        />
        {/* Circles */}
        <div className="relative flex justify-between">
          {levels.map((level) => {
            const isCurrent = level === currentLevel;
            const isActive = level >= currentLevel;

            return (
              <div
                key={level}
                className="flex flex-col items-center"
                style={{ width: `${100 / 10}%` }}
              >
                <div
                  className="flex items-center justify-center rounded-full z-10"
                  style={{
                    width: isCurrent ? 36 : 30,
                    height: isCurrent ? 36 : 30,
                    backgroundColor: isCurrent ? "#065f4a" : "white",
                    color: isCurrent
                      ? "white"
                      : isActive
                        ? "#065f4a"
                        : "#9ca3af",
                    border: `${isCurrent ? 3 : 2}px solid ${isActive ? "#065f4a" : "#9ca3af"}`,
                    fontSize: isCurrent ? 14 : 11,
                    fontWeight: 700,
                    marginTop: isCurrent ? -3 : 0,
                  }}
                >
                  {level}
                </div>
                <p
                  className="text-[#818181] text-center leading-[1.3]"
                  style={{ fontSize: 5, marginTop: 6, maxWidth: 50 }}
                >
                  {READINESS_DESCRIPTIONS[level]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function InnovationUseSections({ data }: { data: PRMSResultData }) {
  const hasActors =
    data.innovation_use_actors && data.innovation_use_actors.length > 0;
  const hasOrgs =
    data.innovation_use_organizations &&
    data.innovation_use_organizations.length > 0;
  const hasMeasures =
    data.innovation_use_measures && data.innovation_use_measures.length > 0;
  const currentLevel = data.readiness_level
    ? parseInt(data.readiness_level.replace(/\D/g, ""), 10)
    : null;

  const hasAnything =
    hasActors || hasOrgs || hasMeasures || currentLevel !== null;
  if (!hasAnything) return null;

  return (
    <div className="flex flex-col gap-[15px]">
      <SectionTitle>Innovation Use</SectionTitle>

      {hasActors && (
        <div className="flex flex-col gap-[10px]">
          <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">
            Actors - Number of people using the innovation, disaggregated by
            gender:
          </p>
          <ActorsTable actors={data.innovation_use_actors!} />
        </div>
      )}

      {hasOrgs && (
        <div className="flex flex-col gap-[10px]">
          <SubSectionTitle>Organizations</SubSectionTitle>
          <DataTable
            columns={["Type", "Subtype", "How many"]}
            rows={data.innovation_use_organizations!.map((o) => [
              o.type,
              o.subtype,
              o.how_many,
            ])}
          />
        </div>
      )}

      {hasMeasures && (
        <div className="flex flex-col gap-[10px]">
          <SubSectionTitle>
            Other quantitative measures of innovation use
          </SubSectionTitle>
          <DataTable
            columns={[
              "#Unit of measure",
              ...data.innovation_use_measures!.map((m) => m.unit_of_measure),
            ]}
            rows={[
              ["Value", ...data.innovation_use_measures!.map((m) => m.value)],
            ]}
          />
        </div>
      )}

      {currentLevel !== null && !isNaN(currentLevel) && (
        <ReadinessScale currentLevel={currentLevel} />
      )}
    </div>
  );
}
