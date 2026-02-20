import Image from "next/image";
import type { PRMSResultData } from "../types";
import { SectionTitle, SubSectionTitle } from "./common-sections";
import { DataTable } from "./tables";

export function InnovationDevelopmentSections({
  data,
}: Readonly<{
  data: PRMSResultData;
}>) {
  const hasDevelopers = !!data.innovation_developers?.length;
  const hasCollaborators = !!data.innovation_collaborators?.length;
  const hasInvestments = !!data.innovation_investments?.length;
  const hasActors = !!data.innovation_actors?.length;
  const hasOrgs = !!data.innovation_organizations?.length;

  return (
    <>
      <div className="flex flex-col gap-[10px]">
        <SectionTitle>Innovation Development details</SectionTitle>

        <div className="flex gap-[20px]">
          <div className="flex flex-col gap-[8px] text-[10px] flex-1 min-w-0">
            {hasDevelopers &&
              data.innovation_developers?.map((dev, i) => (
                <p key={`${dev.name}-${i}`} className="leading-normal">
                  <span className="font-bold text-[#1d1d1d]">
                    Innovation Developer:
                  </span>{" "}
                  <span className="text-[#393939]">
                    {dev.name}
                    {dev.email && (
                      <>
                        {" "}
                        <span className="text-[#065f4a]">(</span>
                        <a
                          href={`mailto:${dev.email}`}
                          className="text-[#065f4a] underline"
                        >
                          {dev.email}
                        </a>
                        <span className="text-[#065f4a]">)</span>
                      </>
                    )}
                    {dev.institution && ` ${dev.institution}`}
                  </span>
                </p>
              ))}

            {data.readiness_level && (
              <p className="leading-normal">
                <span className="font-bold text-[#1d1d1d]">
                  Current readiness of this innovation:
                </span>{" "}
                <span className="text-[#393939]">
                  <span className="font-medium">{data.readiness_level}</span>
                  {data.readiness_details && ` - ${data.readiness_details}`}
                </span>
              </p>
            )}

            {data.readiness_justification && (
              <p className="leading-normal">
                <span className="font-bold text-[#1d1d1d]">
                  Innovation readiness justification:
                </span>{" "}
                <span className="text-[#393939]">
                  {data.readiness_justification}
                </span>
              </p>
            )}

            {hasCollaborators && (
              <div className="flex flex-col gap-[5px]">
                <p className="font-bold text-[#1d1d1d] leading-[1.15]">
                  Innovation collaborators:
                </p>
                <ul className="list-disc ml-[15px] text-[#393939]">
                  {data.innovation_collaborators?.map((c, i) => (
                    <li key={`${c.name}-${i}`} className="leading-normal">
                      {c.name}
                      {c.email && `, ${c.email}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.innovation_nature && (
              <p className="leading-normal">
                <span className="font-bold text-[#1d1d1d]">
                  Innovation nature:
                </span>{" "}
                <span className="text-[#393939]">{data.innovation_nature}</span>
              </p>
            )}

            {data.innovation_type && (
              <p className="leading-normal">
                <span className="font-bold text-[#1d1d1d]">
                  Innovation type:
                </span>{" "}
                <span className="text-[#393939]">{data.innovation_type}</span>
              </p>
            )}

            {data.materials_evidence && (
              <div className="flex flex-col gap-[5px]">
                <p className="font-bold text-[#1d1d1d] leading-[1.15]">
                  Reference materials:
                </p>
                <ul className="list-disc ml-[15px]">
                  {data.materials_evidence.map((m, i) => (
                    <li key={`${m.evidence}-${i}`} className="leading-normal">
                      <a
                        href={m.evidence}
                        className="text-[#065f4a] underline break-all"
                      >
                        {m.evidence}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Readiness scale infographic */}
          <div
            className="flex flex-col items-center shrink-0"
            style={{ width: 182 }}
          >
            <Image
              src={
                data.url_readiness ||
                "https://prms-file-storage.s3.amazonaws.com/images/inno-scaling-readiness-not-provided.png"
              }
              alt="Innovation Readiness Scale"
              className="w-full"
              width={182}
              height={400}
            />

            <p className="text-[#818181] text-[8px] leading-[1.367] text-center mt-[4px]">
              Learn more in{" "}
              <a
                href="https://www.scalingreadiness.org"
                className="text-[#065f4a] underline"
              >
                www.scalingreadiness.org
              </a>
            </p>
          </div>
        </div>
      </div>

      {hasInvestments && (
        <div className="flex flex-col gap-[10px]">
          <SubSectionTitle>
            CGIAR and Partners estimated USD investment
          </SubSectionTitle>
          <DataTable
            columns={["Entity", "Name", "USD investment"]}
            rows={(data.innovation_investments ?? []).map((inv) => [
              inv.entity,
              inv.name,
              inv.is_not_determined ? "Not provided" : inv.budget,
            ])}
          />
        </div>
      )}

      {(hasActors || hasOrgs) && (
        <div className="flex flex-col gap-[15px]">
          <SubSectionTitle>Anticipated Innovation users</SubSectionTitle>

          {hasActors && (
            <div className="flex flex-col gap-[5px]">
              <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">
                Actors
              </p>
              <DataTable
                columns={["#", "Type", "Actors"]}
                rows={(data.innovation_actors ?? []).map((a, i) => [
                  String(i + 1),
                  a.actor_name,
                  `Women ${
                    a.women ? "(Non-youth)" : a.women_youth && "(Youth)"
                  }, Men ${a.men ? "(Non-youth)" : a.men_youth && "(Youth)"}`,
                ])}
              />
            </div>
          )}

          {hasOrgs && (
            <div className="flex flex-col gap-[5px]">
              <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15]">
                Organizations
              </p>
              <DataTable
                columns={["#", "Type", "Subtype"]}
                rows={(data.innovation_organizations ?? []).map((o, i) => [
                  String(i + 1),
                  o.organization_name === "Other"
                    ? `${o.organization_name}: ${o.other_type}`
                    : o.organization_name,
                  o.organization_sub_type,
                ])}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
