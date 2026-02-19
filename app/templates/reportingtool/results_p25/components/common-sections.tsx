import Image from "next/image";
import type {
  PRMSResultData,
  ImpactArea,
  TheoryOfChange,
  GeoLocation,
  Evidence,
} from "../types";
import { ImpactAreaCard, OECDCriteria } from "./impact-areas";
import { DataTable } from "./tables";
function SearchIcon({ size, className }: { size: number; className?: string }) {
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
    <p className="text-[#065f4a] text-[14px] font-bold leading-[1.15]">
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
    <div className="flex flex-col gap-[10px]">
      <SectionTitle>Result details</SectionTitle>

      <div className="flex flex-col gap-[8px]">
        {data.title && data.title !== data.result_name && (
          <LabelValue label="Short title" value={data.title} />
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
            <div className="flex flex-col gap-[10px]">
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

function TheoryOfChangeCard({ toc }: Readonly<{ toc: TheoryOfChange }>) {
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
              {toc.program_name}
            </p>
            <p
              className="text-[#02211a] text-[9.5px] leading-[1.15]"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              {toc.area_of_work}
            </p>
          </div>
        </div>
        {toc.toc_url && (
          <a
            href={toc.toc_url}
            className="flex items-center gap-[2px] shrink-0"
          >
            <Image
              src="/assets/prms/icon-link.svg"
              alt=""
              width={10}
              height={7}
            />

            <span className="text-[#065f4a] text-[9px] font-bold">
              Access TOC diagram
            </span>
          </a>
        )}
      </div>
      <div className="flex flex-col gap-[5px] text-[9px]">
        {toc.high_level_output && (
          <p className="leading-[1.15]">
            <span className="font-bold text-[#1d1d1d]">High Level Output:</span>{" "}
            <span className="text-[#393939]">{toc.high_level_output}</span>
          </p>
        )}
        {toc.indicator && (
          <p style={{ lineHeight: 1.5 }}>
            <span className="font-bold text-[#1d1d1d]">Indicator:</span>{" "}
            <span className="text-[#393939]">{toc.indicator}</span>
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
  tocEntries: TheoryOfChange[];
}>) {
  const hasContributingInitiatives = !!data.contributing_initiatives?.length;
  const hasCenters = !!data.contributing_centers?.length;
  const hasProjects = !!data.non_pooled_projects?.length;
  const hasPartners = !!data.non_kp_partner_data?.length;
  const hasBundled = !!data.bundled_innovations?.length;

  const hasAnything =
    tocEntries?.length > 0 ||
    hasContributingInitiatives ||
    hasCenters ||
    hasProjects ||
    hasPartners ||
    hasBundled;

  if (!hasAnything) return null;

  return (
    <div className="flex flex-col gap-[10px]">
      <SectionTitle>Contributors and Partners</SectionTitle>

      {tocEntries?.map((toc, i) => (
        <div
          key={`${toc.program_name}-${i}`}
          className="flex flex-col gap-[10px]"
        >
          <SubSectionTitle>Theory of Change</SubSectionTitle>
          <TheoryOfChangeCard toc={toc} />
        </div>
      ))}

      {(hasContributingInitiatives || hasCenters || hasProjects) && (
        <div className="flex flex-col gap-[10px]">
          <SubSectionTitle>Contributors</SubSectionTitle>
          <div className="flex flex-col gap-[8px] text-[10px]">
            {hasContributingInitiatives &&
              data.contributing_initiatives?.map((init, i) => (
                <LabelValue
                  key={`${init.initiative_short_name}-${i}`}
                  label="Contributing Program"
                  value={init.initiative_short_name}
                />
              ))}

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
                      {c.is_primary_center === 1 && (
                        <span className="text-[#065f4a] font-bold ml-[4px]">
                          (Primary)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasProjects && (
              <div>
                <p className="font-bold text-[#1d1d1d] text-[10px] leading-[1.15] mb-[4px]">
                  Contributing W3 and/or bilateral projects:
                </p>
                <ul className="list-disc ml-[15px] text-[#393939] text-[10px]">
                  {data.non_pooled_projects?.map((p, i) => (
                    <li
                      key={`${p.project_title}-${i}`}
                      className="leading-normal"
                    >
                      {p.project_title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {hasPartners && (
        <div className="flex flex-col gap-[10px]">
          <SubSectionTitle>Partners</SubSectionTitle>
          <DataTable
            columns={["Name", "Country HQ", "Institution type"]}
            rows={(data.non_kp_partner_data ?? []).map((p) => [
              p.partner_name,
              p.country_hq_name,
              p.institution_type,
            ])}
          />
        </div>
      )}

      {hasBundled && (
        <div className="flex flex-col gap-[10px]">
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
            className="bg-[#033529] flex flex-col items-center justify-center shrink-0"
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
                {geo.countries?.length > 0 ? (
                  geo.countries?.map((c, i) => (
                    <span
                      key={`${c}-${i}`}
                      className="text-[#393939] leading-normal"
                    >
                      <span className="mr-[4px]">&bull;</span>
                      {c}
                    </span>
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
        <div className="flex items-center justify-center gap-[10px] py-4 mx-auto">
          <SearchIcon size={16} className="text-[#033529] rotate-y-180" />
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
    <div className="flex flex-col gap-[10px]">
      <SectionTitle>Geographic location</SectionTitle>
      <GeoLocationBox geo={geo} />
    </div>
  );
}

// ── Evidence ──

function EvidenceCard({ evidence }: Readonly<{ evidence: Evidence }>) {
  return (
    <div className="bg-[#e2e0df]" style={{ padding: "15px 19px" }}>
      <div className="flex flex-col gap-[10px]">
        <p
          className="text-[#02211a] text-[9.5px] leading-[1.15]"
          style={{ fontFamily: "'Noto Serif', serif" }}
        >
          {evidence.label}
        </p>
        <p className="text-[9px] leading-normal">
          <span className="font-bold text-[#1d1d1d]">Link:</span>{" "}
          <a
            href={evidence.link}
            className="text-[#065f4a] underline break-all"
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
    <div className="flex flex-col gap-[10px]">
      <SectionTitle>Evidence</SectionTitle>
      <div className="flex flex-col gap-[10px]">
        {evidences.map((ev, i) => (
          <EvidenceCard key={`${ev.label}-${i}`} evidence={ev} />
        ))}
      </div>
    </div>
  );
}
