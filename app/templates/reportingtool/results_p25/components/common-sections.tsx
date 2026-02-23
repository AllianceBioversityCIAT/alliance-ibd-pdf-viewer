import Image from "next/image";
import type {
  PRMSResultData,
  ImpactArea,
  TheoryOfChange,
  GeoLocation,
  Evidence,
  TocPrimaryEntry,
} from "../types";
import { ImpactAreaCard, OECDCriteria } from "./impact-areas";
import { DataTable } from "./tables";
import { Link } from "lucide-react";
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

export function SectionTitle({ children }: Readonly<{ children: string }>) {
  return (
    <p className="text-(--theme-mid) text-[14px] font-bold leading-[1.15]">
      {children}
    </p>
  );
}

export function SubSectionTitle({ children }: Readonly<{ children: string }>) {
  return (
    <p className="text-[#555554] text-[12px] leading-[1.15]">{children}</p>
  );
}

export function LabelValue({
  label,
  value,
  multiline,
}: Readonly<{
  label: string;
  value: string;
  multiline?: boolean;
}>) {
  return (
    <p className="text-[10px]" style={{ lineHeight: multiline ? 1.5 : 1.15 }}>
      <span className="font-bold text-[#1d1d1d]">{label}:</span>{" "}
      <span className="text-[#393939]">{value}</span>
    </p>
  );
}

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
        {data.primary_submitter_name && (
          <LabelValue
            label="Submitter of result"
            value={data.primary_submitter_name}
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

        {impactAreas?.length > 0 && (
          <div className="flex flex-col gap-[5px]">
            <p className="text-[#1d1d1d] text-[10px] font-bold leading-[1.15]">
              Impact Areas targeted
            </p>
            <div className="flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                {impactAreas.map((area) => (
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
  const hasPartners =
    data.non_kp_partner_data && data.non_kp_partner_data.length > 0;
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

      {(hasContributingInitiatives || hasCenters || hasBilateralProjects) && (
        <div className="flex flex-col gap-2.5">
          <SubSectionTitle>Contributors</SubSectionTitle>
          <div className="flex flex-col gap-[8px] text-[10px]">
            <LabelValue
              label="Contributing Program"
              value={data
                .contributing_initiatives!.map((i) => i.initiative_short_name)
                .join(", ")}
            />

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
            rows={(data.non_kp_partner_data ?? []).map((p) => [
              p.partner_name,
              p.partner_country_hq,
              p.partner_type,
            ])}
          />
        </div>
      )}

      {hasBundled && (
        <div className="flex flex-col gap-2.5">
          <SubSectionTitle>Bundled innovations</SubSectionTitle>
          <DataTable
            columns={["Portfolio", "Phase", "Code", "Indicator", "Title"]}
            rows={(data.bundled_innovations ?? []).map((b) => [
              b.portfolio,
              b.phase,
              b.code,
              b.indicator,
              b.title,
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
      {geo?.geo_focus ? (
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
                WebkitMaskImage: `url(/assets/prms/${geo.geo_focus.toLowerCase()}-mask.svg)`,
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskImage: `url(/assets/prms/${geo.geo_focus.toLowerCase()}-mask.svg)`,
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                margin: "0",
              }}
            />
          </div>
          <div className="flex flex-col gap-[18px] py-[15px] px-[22px] flex-1 min-w-0 text-[10px]">
            <div className="flex flex-col gap-[5px]">
              <p className="font-bold text-[#1d1d1d] leading-[1.15]">
                Regions specified for this result:
              </p>
              <div className="flex flex-wrap gap-[6px]">
                {geo.regions?.length > 0 ? (
                  geo.regions?.map((r, i) => (
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

            <div className="flex flex-col gap-[5px]">
              <p className="font-bold text-[#1d1d1d] leading-[1.15]">
                Countries specified for this result:
              </p>
              <div className="flex flex-wrap gap-[6px]">
                {geo.countries.length > 0 ? (
                  geo.countries.map((c, i) => (
                    <div
                      key={`${c.name}-${i}`}
                      className="text-[#393939] leading-normal flex items-center gap-1"
                    >
                      <span>&bull;</span>
                      <Image
                        src={`https://flagsapi.com/${c.code}/flat/64.png`}
                        alt={c.name}
                        width={16}
                        height={16}
                        className="w-[16px] h-[16px] object-cover rounded-md"
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
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center gap-2.5 py-4 mx-auto">
          <SearchIcon size={16} className="text-(--theme-deep) rotate-y-180" />
          <p className="text-[#393939] text-[10px] leading-[1.15] font-semibold">
            This is yet to be determined
          </p>
        </div>
      )}
    </div>
  );
}

export function GeographicSection({
  geo,
}: Readonly<{ geo: GeoLocation | null }>) {
  return (
    <div className="flex flex-col gap-2.5">
      <SectionTitle>Geographic location</SectionTitle>
      <GeoLocationBox geo={geo} />
    </div>
  );
}

// ── Evidence ──

function EvidenceCard({ evidence }: Readonly<{ evidence: Evidence }>) {
  return (
    <div className="bg-[#e2e0df]" style={{ padding: "15px 19px" }}>
      <div className="flex flex-col gap-2.5">
        <p
          className="text-(--theme-header-bg) text-[9.5px] leading-[1.15]"
          style={{ fontFamily: "'Noto Serif', serif" }}
        >
          {evidence.label}
        </p>
        <p className="text-[9px] leading-normal">
          <span className="font-bold text-[#1d1d1d]">Link:</span>{" "}
          <a
            href={evidence.link}
            className="text-(--theme-mid) underline break-all"
          >
            {evidence.link}
          </a>
        </p>
        {evidence.description && (
          <p className="text-[9px] leading-normal">
            <span className="font-bold text-[#1d1d1d]">Description:</span>{" "}
            <span className="text-[#393939]">{evidence.description}</span>
          </p>
        )}
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
      <div className="flex flex-col gap-2.5">
        {evidences.map((ev, i) => (
          <EvidenceCard key={`${ev.label}-${i}`} evidence={ev} />
        ))}
      </div>
    </div>
  );
}
