import Image from "next/image";
import type {
  PRMSResultData,
  ImpactArea,
  TheoryOfChange,
  GeoLocation,
  Evidence,
  TocPrimaryEntry,
} from "../../shared/types";
import { ImpactAreaCard, OECDCriteria } from "../../shared/components/impact-areas";
import { DataTable } from "../../shared/components/tables";
import { Dot, Link } from "lucide-react";
import { ImpactAreaIcon } from "../../shared/components/impact-area-icons";

function SearchIcon({
  size,
  className,
}: Readonly<{ size: number; className?: string }>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

// ── Shared primitives ──

import { SectionTitle, SubSectionTitle, LabelValue } from "../../shared/components/section-primitives";
export { SectionTitle, SubSectionTitle, LabelValue };

// ── Result Details ──

export function ResultDetailsSection({
  data,
  impactAreas,
}: Readonly<{
  data: PRMSResultData;
  impactAreas: ImpactArea[];
}>) {
  return (
    <div className="flex flex-col gap-2.5">
      <SectionTitle>Result details</SectionTitle>

      <div className="flex flex-col gap-[8px]">
        {data.short_title && (
          <LabelValue label="Short title" value={data.short_title} />
        )}
        {data.result_description && (
          <LabelValue
            label="Result description"
            value={data.result_description}
            multiline
          />
        )}
        {data.phase_name && (
          <LabelValue
            label="Performance and Results Management System (PRMS) Reporting phase"
            value={data.phase_name}
          />
        )}

        {data.lead_contact_person && (
          <LabelValue
            label="Lead contact person"
            value={`${data.lead_contact_person}${
              data.result_lead ? ` (${data.result_lead})` : ""
            }`}
          />
        )}
        {data.lead_center_name && (
          <LabelValue
            label="Submitter of result (lead center)"
            value={`${data.lead_center_acronym} - ${data.lead_center_name}`}
          />
        )}

        {impactAreas?.length > 0 &&
          impactAreas.some((area) => !!area.score && area.score !== "") && (
            <div className="flex flex-col gap-[5px]">
              <p className="text-[#1d1d1d] text-[10px] font-bold leading-[1.15]">
                Impact Areas targeted
              </p>
              <div className="flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-2.5" data-paginator-block>
                  {impactAreas
                    .filter((area) => !!area.score && area.score !== "")
                    .map((area) => (
                      <ImpactAreaCard key={area.name} area={area} />
                    ))}
                </div>
                <OECDCriteria />
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

// ── Theory of Change Card ──

function TheoryOfChangeCard({
  tocAllDAta,
  tocEntry,
}: Readonly<{ tocAllDAta: TheoryOfChange; tocEntry: TocPrimaryEntry }>) {
  return (
    <div className="bg-[#e2e0df]" style={{ padding: "15px 19px" }}>
      <div className="flex items-center justify-between mb-[16px]">
        <div className="flex items-center justify-center gap-1.5">
          <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center">
            <Image
              src="/assets/prms/icon-toc.png"
              alt=""
              width={18}
              height={8}
              className="w-[18px] h-[8px] object-cover"
            />
          </div>
          <div className="flex flex-col gap-[3px]">
            <p className="text-[#041b15] text-[11px] font-bold leading-[1.15]">
              {tocAllDAta.contributor_name}
            </p>
            <p
              className="text-[#041b15] text-[9.5px] leading-[1.15]"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              {tocEntry.toc_work_package_acronym}
            </p>
          </div>
        </div>
        {tocAllDAta.toc_url && (
          <a
            href={tocAllDAta.toc_url}
            className="flex items-center gap-[2px] shrink-0"
          >
            <Link size={10} className="text-(--theme-deep)" />
            <span className="text-(--theme-deep) text-[9px] font-bold">
              Access TOC diagram
            </span>
          </a>
        )}
      </div>
      <div className="flex flex-col gap-[5px] text-[9px]">
        {tocEntry.toc_level_name && (
          <p className="leading-[1.15]">
            <span className="font-bold text-[#1d1d1d]">
              {tocEntry.toc_level_name}:
            </span>{" "}
            <span className="text-[#393939]">{tocEntry.toc_result_title}</span>
          </p>
        )}
        {tocEntry.toc_indicator && (
          <p style={{ lineHeight: 1.5 }}>
            <span className="font-bold text-[#1d1d1d]">Indicator:</span>{" "}
            <span className="text-[#393939]">{tocEntry.toc_indicator}</span>
          </p>
        )}
      </div>
    </div>
  );
}

// ── Contributors and Partners ──

export function ContributorsSection({
  data,
  tocEntries,
}: Readonly<{
  data: PRMSResultData;
  tocEntries: TheoryOfChange;
}>) {
  const hasContributingInitiatives =
    data.contributing_initiatives && data.contributing_initiatives.length > 0;
  const hasCenters =
    data.contributing_centers && data.contributing_centers.length > 0;
  const hasBilateralProjects =
    data.bilateral_projects && data.bilateral_projects.length > 0;
  const allPartners = [
    ...(data.non_kp_partner_data ?? []),
    ...(data.kp_partner_data ?? []),
  ];
  const hasPartners = allPartners?.length > 0;
  const hasBundled =
    data.bundled_innovations && data.bundled_innovations.length > 0;

  const hasAnything =
    tocEntries.toc_primary.length > 0 ||
    hasContributingInitiatives ||
    hasCenters ||
    hasBilateralProjects ||
    hasPartners ||
    hasBundled;

  if (!hasAnything) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <SectionTitle>Contributors and Partners</SectionTitle>

      {tocEntries.toc_primary.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <SubSectionTitle>Theory of Change</SubSectionTitle>
          {tocEntries.toc_primary.map((toc, i) => (
            <TheoryOfChangeCard
              key={`${toc.toc_work_package_acronym}-${toc.toc_result_title}-${i}`}
              tocAllDAta={tocEntries}
              tocEntry={toc}
            />
          ))}
        </div>
      )}

      {(hasContributingInitiatives || hasCenters || hasBilateralProjects) && (
        <div className="flex flex-col gap-2.5">
          <SubSectionTitle>Contributors</SubSectionTitle>
          <div className="flex flex-col gap-[8px] text-[10px]">
            {!!data.contributing_initiatives?.length && (
              <LabelValue
                label="Contributing Program"
                value={data.contributing_initiatives
                  .map((i) => i.initiative_short_name)
                  .join(", ")}
              />
            )}

            {hasCenters && (
              <div>
                <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15] mb-[4px]">
                  Contributing CGIAR Centers:
                </p>
                <ul className="list-disc ml-[15px] text-[#393939] text-[10px]">
                  {data.contributing_centers?.map((c, i) => (
                    <li
                      key={`${c.center_name}-${i}`}
                      className="leading-normal"
                    >
                      {c.center_name}
                      {!!c.is_primary_center && (
                        <span className="text-(--theme-mid) font-bold ml-[4px]">
                          (Primary)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasBilateralProjects && (
              <div>
                <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15] mb-[4px]">
                  Contributing W3 and/or bilateral projects:
                </p>
                <ul className="list-disc ml-[15px] text-[#393939] text-[10px]">
                  {data.bilateral_projects!.map((bp, i) => (
                    <li
                      key={`${bp.project_title}-${i}`}
                      className="leading-normal"
                    >
                      {bp.project_title}
                      {!!bp.is_lead_project && (
                        <span className="text-(--theme-mid) font-bold ml-[4px]">
                          (Lead)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {hasPartners && (
        <div className="flex flex-col gap-2.5">
          <SubSectionTitle>Partners</SubSectionTitle>
          <DataTable
            columns={["Name", "Country HQ", "Institution type"]}
            rows={
              allPartners?.map((p) => [
                p.partner_name ?? "Not provided",
                p.partner_country_hq ?? "Not provided",
                p.partner_type ?? "Not provided",
              ]) ?? []
            }
          />
        </div>
      )}

      {hasBundled && (
        <div className="flex flex-col gap-2.5">
          <SubSectionTitle>Bundled innovations</SubSectionTitle>
          <DataTable
            columns={["Portfolio", "Phase", "Code", "Indicator", "Title"]}
            rows={(data.bundled_innovations ?? []).map((b) => [
              b.portfolio ?? "Not provided",
              b.phase ?? "Not provided",
              b.code ?? "Not provided",
              b.indicator ?? "Not provided",
              b.title ?? "Not provided",
            ])}
          />
        </div>
      )}
    </div>
  );
}

// ── Geographic Location ──

function GeoLocationBox({ geo }: Readonly<{ geo: GeoLocation | null }>) {
  return (
    <div className="bg-[#e2e0df] flex overflow-hidden">
      {geo?.geo_focus === "This is yet to be determined" ? (
        <div className="flex items-center justify-center gap-2.5 py-4 mx-auto">
          <SearchIcon size={16} className="text-(--theme-deep) rotate-y-180" />
          <p className="text-[#393939] text-[10px] leading-[1.15] font-semibold">
            This is yet to be determined
          </p>
        </div>
      ) : (
        <>
          <div
            className="bg-(--theme-deep) flex flex-col items-center justify-center shrink-0"
            style={{ width: 106, padding: "8px 17px" }}
          >
            <div
              className="bg-white mb-[5px]"
              style={{
                width: 70,
                height: 70,
                WebkitMaskImage: `url(/assets/prms/${geo?.geo_focus
                  .trim()
                  .toLowerCase()}-mask.svg)`,
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskImage: `url(/assets/prms/${geo?.geo_focus
                  .trim()
                  .toLowerCase()}-mask.svg)`,
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                margin: "0",
              }}
            />
          </div>
          <div className="flex flex-col gap-[18px] py-[15px] px-[22px] flex-1 min-w-0 text-[10px]">
            {geo?.geo_focus !== "National" &&
              geo?.geo_focus !== "Sub-national" && (
                <div className="flex flex-col gap-[5px]">
                  <p className="font-bold text-[#1d1d1d] leading-[1.15]">
                    Regions specified for this result:
                  </p>
                  <div className="flex flex-wrap gap-[6px]">
                    {geo?.regions?.length && geo?.regions?.length > 0 ? (
                      geo?.regions?.map((r, i) => (
                        <span
                          key={`${r}-${i}`}
                          className="text-[#393939] leading-normal"
                        >
                          <span className="mr-[4px]">&bull;</span>
                          {r}
                        </span>
                      ))
                    ) : (
                      <p className="text-[#707070] text-[10px] leading-[1.15] italic font-normal">
                        No regions specified
                      </p>
                    )}
                  </div>
                </div>
              )}

            <div className="flex flex-col gap-[5px]">
              <p className="font-bold text-[#1d1d1d] leading-[1.15]">
                Countries specified for this result:
              </p>
              <div className="flex flex-wrap gap-[6px]">
                {geo?.countries?.length && geo?.countries?.length > 0 ? (
                  geo?.countries?.map((c, i) => (
                    <div
                      key={`${c.name}-${i}`}
                      className="text-[#393939] leading-normal flex items-center gap-1"
                    >
                      <span>&bull;</span>
                      <Image
                        src={`https://flagcdn.com/${c.code.toLowerCase()}.svg`}
                        alt={c.name}
                        width={16}
                        height={13}
                        className="w-[16px] h-[13px] object-cover rounded-[2px]"
                      />
                      {c.name}
                    </div>
                  ))
                ) : (
                  <p className="text-[#707070] text-[10px] leading-[1.15] italic font-normal">
                    No countries specified
                  </p>
                )}
              </div>
            </div>

            {geo?.geo_focus === "Sub-national" &&
              !!geo?.subnational?.length &&
              geo?.subnational?.length > 0 && (
                <>
                  {geo?.subnational.map((s) => (
                    <div key={s.country}>
                      <p className="font-bold text-[#1d1d1d] leading-[1.15]">
                        States specified of {s.country} for this result:
                      </p>
                      <div className="text-[#393939] text-[10px] flex flex-wrap gap-x-2 gap-y-1 mt-1">
                        {s.subnationals.map((sn) => (
                          <div
                            key={`${s.country}-${sn}`}
                            className="leading-normal flex items-center gap-0.5"
                          >
                            <Dot size={15} />
                            {sn}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
          </div>
        </>
      )}
    </div>
  );
}

export function GeographicSection({
  geo,
}: Readonly<{ geo: GeoLocation | null }>) {
  return (
    <div className="flex flex-col gap-2.5" data-paginator-block>
      <SectionTitle>Geographic location</SectionTitle>
      <GeoLocationBox geo={geo} />
    </div>
  );
}

// ── Evidence ──

function SharepointIcon({
  size,
  className,
}: Readonly<{ size: number; className?: string }>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 11 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5.10167 0.917814C5.27635 0.911029 5.45128 0.921156 5.62402 0.948053C6.30183 1.06022 6.90744 1.43672 7.30794 1.99493C7.6118 2.41222 7.77968 2.91301 7.78872 3.42912C7.79175 3.54525 7.79259 3.66656 7.77399 3.7811C8.01577 3.78034 8.25613 3.81803 8.48606 3.89279C9.07256 4.08703 9.55968 4.50322 9.84308 5.05222C10.1103 5.58858 10.1563 6.20836 9.97131 6.77831C9.77287 7.37146 9.34575 7.8608 8.78484 8.13758C8.38044 8.33989 7.92344 8.4124 7.47627 8.3452C7.38933 8.33296 7.29359 8.32103 7.21082 8.29325C7.09939 9.09826 6.62286 9.69944 5.85731 9.97935C5.65607 10.0732 5.25294 10.1018 5.03144 10.0792C4.49393 10.0248 3.99964 9.76036 3.65616 9.34336C3.2867 8.88779 3.16642 8.37125 3.22634 7.79645L3.22057 7.79674C2.85168 7.81233 2.42058 7.78859 2.04382 7.79821C1.9078 7.80169 1.34376 7.80496 1.24052 7.78729C1.15691 7.77354 1.0794 7.7349 1.0181 7.6764C0.922039 7.58494 0.915229 7.45037 0.914311 7.3265L0.915369 4.7498L0.915102 3.98604C0.914934 3.77696 0.874276 3.45167 1.03843 3.30516C1.19245 3.16768 1.55143 3.20391 1.7498 3.20403L2.64342 3.20466C2.67114 3.07874 2.68655 2.96018 2.71982 2.83044C2.82079 2.4422 3.01347 2.08388 3.28166 1.78556C3.76344 1.25337 4.38387 0.953586 5.10167 0.917814ZM6.07837 6.25975C6.56073 6.54807 6.84437 6.79494 7.07199 7.33569C7.12148 7.45326 7.1437 7.56562 7.18397 7.67654C7.45153 7.76604 7.59985 7.79421 7.8847 7.78846C8.39447 7.74228 8.78897 7.55416 9.12144 7.15555C9.40785 6.81064 9.54464 6.36564 9.5014 5.91941C9.46063 5.46452 9.23999 5.04471 8.88842 4.75318C8.53427 4.4611 8.16906 4.3516 7.71608 4.36571C7.2282 4.39904 6.82982 4.57032 6.50229 4.94654C6.19273 5.30116 6.03922 5.76561 6.07645 6.23486C6.07703 6.24316 6.07767 6.25146 6.07837 6.25975ZM3.31242 4.07723C2.95721 4.08952 2.53624 4.23413 2.36522 4.58825C2.30078 4.72166 2.29435 4.93371 2.32325 5.07607C2.40328 5.39351 2.66898 5.56119 2.94229 5.70877C3.15823 5.82539 3.60817 5.90566 3.6747 6.17233C3.68056 6.21385 3.64843 6.26408 3.62085 6.2939C3.53145 6.39053 3.4232 6.42129 3.29512 6.42283C2.86007 6.42806 2.66251 6.32265 2.31153 6.10059C2.30994 6.31417 2.30099 6.60291 2.31068 6.81092C2.58024 6.90901 2.84244 6.97602 3.13191 6.98365C3.49841 6.99035 3.86747 6.96399 4.14111 6.70061C4.42842 6.42409 4.42603 5.86017 4.13789 5.5878C4.03627 5.49173 3.94228 5.41981 3.81601 5.36003C3.62487 5.24264 3.00918 5.11327 2.99321 4.87332C2.99015 4.82737 3.0443 4.75446 3.08346 4.7247C3.22102 4.6202 3.46139 4.62145 3.62313 4.63567C3.85458 4.65604 4.04157 4.74366 4.24092 4.85377C4.23426 4.62824 4.24169 4.40318 4.23462 4.17839C3.8406 4.07482 3.71533 4.06037 3.31242 4.07723ZM5.50074 5.23061C5.5 5.29413 5.48867 5.42774 5.52899 5.47299C5.5916 5.46709 5.71182 5.10578 5.74996 5.03053C6.04291 4.46061 6.55951 4.03803 7.17621 3.86388C7.21337 3.72093 7.21887 3.55577 7.21554 3.40835C7.19248 2.38661 6.2556 1.46097 5.2215 1.49819C4.15967 1.51428 3.43017 2.17777 3.22971 3.2055C3.65976 3.19966 4.09124 3.20713 4.52155 3.20588C4.73456 3.20525 4.96604 3.19431 5.1764 3.21639C5.31623 3.23107 5.46476 3.36118 5.48576 3.50101C5.51126 3.69783 5.50139 3.90901 5.50131 4.10831L5.50074 5.23061ZM5.5051 6.67351C5.49384 6.92876 5.52783 7.31499 5.46983 7.5556C5.38127 7.92299 4.60552 7.76627 4.31603 7.79836C4.2162 7.80943 3.94441 7.80715 3.84884 7.8026C3.83545 7.8019 3.82206 7.80096 3.8087 7.79975C3.67385 8.60516 4.14014 9.3119 4.94301 9.48343C5.73275 9.61591 6.49229 9.11165 6.62421 8.31319C6.68449 7.93869 6.59596 7.55547 6.37752 7.24537C6.1439 6.91958 5.87273 6.78655 5.5051 6.67351Z"
        fill="currentColor"
      />
    </svg>
  );
}

function EvidenceCard({ evidence }: Readonly<{ evidence: Evidence }>) {
  return (
    <div className="bg-[#e2e0df]" style={{ padding: "15px 19px" }}>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <p
            className="text-[9.5px] leading-[1.15]"
            style={{ fontFamily: "'Noto Serif', serif" }}
          >
            {evidence.label}
          </p>

          <div className="flex items-center gap-0.5">
            {evidence.file_name ? (
              <SharepointIcon
                size={13}
                className={`${
                  evidence.is_public_file
                    ? "text-(--theme-deep)"
                    : "text-[#393939]"
                } w-[13px] h-[13px] object-cover`}
              />
            ) : (
              <Link size={10} className="text-(--theme-deep)" />
            )}
            {evidence.is_public_file ? (
              <a
                href={evidence.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-(--theme-deep) text-[9px] leading-normal font-medium break-all cursor-pointer max-w-[200px] truncate"
              >
                {evidence.file_name ?? "Access link"}
              </a>
            ) : (
              <p className="text-[#393939] text-[9px] leading-normal font-medium break-all">
                {evidence.file_name ?? "Access link"}
              </p>
            )}
          </div>
        </div>

        {!evidence.is_public_file && (
          <p className="text-[#818181] text-[9px] leading-normal">
            Evidence supporting this result is not publicly available. If you
            would like access to the evidence, please contact{" "}
            <a
              href="mailto:performanceandresults@cgiar.org"
              className="text-(--theme-deep) underline"
            >
              performanceandresults@cgiar.org
            </a>
          </p>
        )}

        {evidence.description && (
          <p className="text-[9px] leading-normal">
            <span className="font-bold">Details:</span>{" "}
            <span className="text-[#393939]"> {evidence.description}</span>
          </p>
        )}

        {evidence.is_public_file ? (
          <>
            {!!evidence.tags?.length && evidence.tags?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[9px] leading-normal font-bold text-[#1d1d1d]">
                  Impact Area related:
                </p>
                <div className="flex flex-wrap gap-2">
                  {evidence.tags.map((t) => (
                    <div
                      key={t.icon_key}
                      className="text-[#393939] text-[9px] flex items-center gap-1"
                    >
                      <ImpactAreaIcon
                        iconKey={t.icon_key}
                        className="w-[20px] h-[20px] shrink-0"
                      />
                      {t.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

export function EvidenceSection({
  evidences,
}: Readonly<{ evidences: Evidence[] }>) {
  if (!evidences?.length) return null;
  return (
    <div className="flex flex-col gap-2.5">
      <SectionTitle>Evidence</SectionTitle>
      <div className="flex flex-col gap-2.5" data-paginator-block>
        {evidences.map((ev, i) => (
          <EvidenceCard key={`${ev.label}-${i}`} evidence={ev} />
        ))}
      </div>
    </div>
  );
}
