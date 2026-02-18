import type {
  PRMSResultData,
  ImpactArea,
  TheoryOfChange,
  GeoLocation,
  Evidence,
} from "../types";
import { ImpactAreaCard, OECDCriteria } from "./impact-areas";
import { DataTable } from "./tables";

// ── Shared primitives ──

export function SectionTitle({ children }: { children: string }) {
  return (
    <p className="text-[#065f4a] text-[14px] font-bold leading-[1.15]">
      {children}
    </p>
  );
}

export function SubSectionTitle({ children }: { children: string }) {
  return (
    <p className="text-[#555554] text-[12px] leading-[1.15]">{children}</p>
  );
}

export function LabelValue({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
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
}: {
  data: PRMSResultData;
  impactAreas: ImpactArea[];
}) {
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
            value={`${data.lead_contact_person}${data.result_lead ? ` (${data.result_lead})` : ""}`}
          />
        )}

        {impactAreas.length > 0 && (
          <div className="flex flex-col gap-[5px]">
            <p className="text-[#1d1d1d] text-[10px] font-bold leading-[1.15]">
              Impact Areas targeted
            </p>
            <div className="flex flex-col gap-[10px]">
              <div className="flex gap-[10px]">
                {impactAreas.map((area, i) => (
                  <ImpactAreaCard key={i} area={area} />
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

function TheoryOfChangeCard({ toc }: { toc: TheoryOfChange }) {
  return (
    <div className="bg-[#e2e0df]" style={{ padding: "15px 19px" }}>
      <div className="flex items-center justify-between mb-[16px]">
        <div className="flex flex-col gap-[3px]">
          <p className="text-[#02211a] text-[11px] font-bold leading-[1.15]">
            {toc.program_name}
          </p>
          <p
            className="text-[#02211a] text-[9.5px] leading-[1.15]"
            style={{ fontFamily: "'Noto Serif', serif" }}
          >
            {toc.area_of_work}
          </p>
        </div>
        {toc.toc_url && (
          <a
            href={toc.toc_url}
            className="flex items-center gap-[2px] shrink-0"
          >
            <img
              src="/assets/prms/icon-link.svg"
              alt=""
              className="w-[13px] h-[13px]"
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
            <span className="font-bold text-[#1d1d1d]">
              High Level Output:
            </span>{" "}
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
}: {
  data: PRMSResultData;
  tocEntries: TheoryOfChange[];
}) {
  const hasContributingInitiatives =
    data.contributing_initiatives && data.contributing_initiatives.length > 0;
  const hasCenters =
    data.contributing_centers && data.contributing_centers.length > 0;
  const hasProjects =
    data.non_pooled_projects && data.non_pooled_projects.length > 0;
  const hasPartners =
    data.non_kp_partner_data && data.non_kp_partner_data.length > 0;
  const hasBundled =
    data.bundled_innovations && data.bundled_innovations.length > 0;

  const hasAnything =
    tocEntries.length > 0 ||
    hasContributingInitiatives ||
    hasCenters ||
    hasProjects ||
    hasPartners ||
    hasBundled;

  if (!hasAnything) return null;

  return (
    <div className="flex flex-col gap-[10px]">
      <SectionTitle>Contributors and Partners</SectionTitle>

      {tocEntries.map((toc, i) => (
        <div key={i} className="flex flex-col gap-[10px]">
          <SubSectionTitle>Theory of Change</SubSectionTitle>
          <TheoryOfChangeCard toc={toc} />
        </div>
      ))}

      {(hasContributingInitiatives || hasCenters || hasProjects) && (
        <div className="flex flex-col gap-[10px]">
          <SubSectionTitle>Contributors</SubSectionTitle>
          <div className="flex flex-col gap-[8px] text-[10px]">
            {hasContributingInitiatives &&
              data.contributing_initiatives!.map((init, i) => (
                <LabelValue
                  key={i}
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
                  {data.contributing_centers.map((c, i) => (
                    <li key={i} className="leading-[1.5]">
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
                  {data.non_pooled_projects!.map((p, i) => (
                    <li key={i} className="leading-[1.5]">
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
            rows={data.non_kp_partner_data!.map((p) => [
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
            rows={data.bundled_innovations!.map((b) => [
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

function GeoLocationBox({ geo }: { geo: GeoLocation }) {
  return (
    <div className="bg-[#e2e0df] flex overflow-hidden">
      <div
        className="bg-[#033529] flex flex-col items-center justify-center shrink-0"
        style={{ width: 106, padding: "8px 17px" }}
      >
        <div
          className="bg-white mb-[5px]"
          style={{
            width: 60,
            height: 52,
            WebkitMaskImage: "url(/assets/prms/globe-mask.png)",
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskImage: "url(/assets/prms/globe-mask.png)",
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }}
        />
        <p className="text-white text-[11px] font-bold text-center leading-[1.15]">
          {geo.geo_focus}
        </p>
      </div>
      <div className="flex flex-col gap-[18px] py-[15px] px-[22px] flex-1 min-w-0 text-[10px]">
        {geo.regions.length > 0 && (
          <div className="flex flex-col gap-[5px]">
            <p className="font-bold text-[#1d1d1d] leading-[1.15]">
              Regions specified for this result:
            </p>
            <div className="flex flex-wrap gap-[6px]">
              {geo.regions.map((r, i) => (
                <span key={i} className="text-[#393939] leading-[1.5]">
                  <span className="mr-[4px]">&bull;</span>
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}
        {geo.countries.length > 0 && (
          <div className="flex flex-col gap-[5px]">
            <p className="font-bold text-[#1d1d1d] leading-[1.15]">
              Countries specified for this result:
            </p>
            <div className="flex flex-wrap gap-[6px]">
              {geo.countries.map((c, i) => (
                <span key={i} className="text-[#393939] leading-[1.5]">
                  <span className="mr-[4px]">&bull;</span>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function GeographicSection({ geo }: { geo: GeoLocation }) {
  return (
    <div className="flex flex-col gap-[10px]">
      <SectionTitle>Geographic location</SectionTitle>
      <GeoLocationBox geo={geo} />
    </div>
  );
}

// ── Evidence ──

function EvidenceCard({ evidence }: { evidence: Evidence }) {
  return (
    <div className="bg-[#e2e0df]" style={{ padding: "15px 19px" }}>
      <div className="flex flex-col gap-[10px]">
        <p
          className="text-[#02211a] text-[9.5px] leading-[1.15]"
          style={{ fontFamily: "'Noto Serif', serif" }}
        >
          {evidence.label}
        </p>
        <p className="text-[9px] leading-[1.5]">
          <span className="font-bold text-[#1d1d1d]">Link:</span>{" "}
          <a
            href={evidence.link}
            className="text-[#065f4a] underline break-all"
          >
            {evidence.link}
          </a>
        </p>
        {evidence.description && (
          <p className="text-[9px] leading-[1.5]">
            <span className="font-bold text-[#1d1d1d]">Description:</span>{" "}
            <span className="text-[#393939]">{evidence.description}</span>
          </p>
        )}
        {evidence.tags && evidence.tags.length > 0 && (
          <div className="flex flex-wrap gap-[4px]">
            {evidence.tags.map((tag, i) => (
              <span
                key={i}
                className="text-[8px] bg-[#11d4b3]/15 text-[#02211a] px-[6px] py-[2px] rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function EvidenceSection({ evidences }: { evidences: Evidence[] }) {
  if (evidences.length === 0) return null;
  return (
    <div className="flex flex-col gap-[10px]">
      <SectionTitle>Evidence</SectionTitle>
      <div className="flex flex-col gap-[10px]">
        {evidences.map((ev, i) => (
          <EvidenceCard key={i} evidence={ev} />
        ))}
      </div>
    </div>
  );
}
