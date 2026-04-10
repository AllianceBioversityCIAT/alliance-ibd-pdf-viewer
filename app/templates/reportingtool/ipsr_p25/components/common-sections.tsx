/**
 * IPSR variant of common sections.
 *
 * - ResultDetailsSection, GeographicSection, EvidenceSection → re-exported
 *   from the results_p25 template (identical rendering).
 * - ContributorsSection → modified to include "Delivery type(s)" column
 *   in the Partners table and exclude Bundled Innovations.
 */

export {
  ResultDetailsSection,
  GeographicSection,
  EvidenceSection,
} from "../../results_p25/components/common-sections";

import Image from "next/image";
import { Link } from "lucide-react";
import type { IPSRResultData } from "../types";
import type {
  TheoryOfChange,
  TocPrimaryEntry,
} from "../../shared/types";
import { DataTable } from "../../shared/components/tables";
import {
  SectionTitle,
  SubSectionTitle,
  LabelValue,
} from "../../shared/components/section-primitives";

// ── Theory of Change Card (same as results_p25) ──

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

// ── Contributors and Partners (IPSR variant with Delivery type) ──

export function IpsrContributorsSection({
  data,
  tocEntries,
}: Readonly<{
  data: IPSRResultData;
  tocEntries: TheoryOfChange;
}>) {
  const hasContributingInitiatives =
    data.contributing_initiatives && data.contributing_initiatives.length > 0;
  const hasCenters =
    data.contributing_centers && data.contributing_centers.length > 0;
  const hasBilateralProjects =
    data.bilateral_projects && data.bilateral_projects.length > 0;
  const allPartners = data.non_kp_partner_data ?? [];
  const hasPartners = allPartners.length > 0;

  const hasAnything =
    tocEntries.toc_primary.length > 0 ||
    hasContributingInitiatives ||
    hasCenters ||
    hasBilateralProjects ||
    hasPartners;

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
        <div className="flex flex-col gap-2.5" data-paginator-block>
          <SubSectionTitle>Partners</SubSectionTitle>
          <DataTable
            columns={[
              "Name",
              "Country HQ",
              "Institution type",
              "Delivery type(s)",
            ]}
            rows={allPartners.map((p) => [
              p.partner_name ?? "Not provided",
              p.partner_country_hq ?? "Not provided",
              p.partner_type ?? "Not provided",
              p.partner_delivery_type ?? "Not provided",
            ])}
          />
        </div>
      )}
    </div>
  );
}
