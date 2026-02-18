export interface ImpactArea {
  name: string;
  icon_url?: string;
  score: number;
  score_label: string;
  components?: string;
}

export interface TheoryOfChange {
  program_name: string;
  area_of_work: string;
  toc_url?: string;
  high_level_output?: string;
  indicator?: string;
}

export interface Partner {
  name: string;
  country_hq: string;
  institution_type: string;
}

export interface BundledInnovation {
  portfolio: string;
  phase: string;
  code: string;
  indicator: string;
  title: string;
}

export interface GeoLocation {
  geo_focus: string;
  regions: string[];
  countries: string[];
}

export interface Evidence {
  label: string;
  link: string;
  description?: string;
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <p className="text-[#065f4a] text-[14px] font-bold leading-[1.15]">{children}</p>
  );
}

export function SubSectionTitle({ children }: { children: string }) {
  return (
    <p className="text-[#555554] text-[12px] leading-[1.15]">{children}</p>
  );
}

export function LabelValue({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <p className="text-[10px]" style={{ lineHeight: multiline ? 1.5 : 1.15 }}>
      <span className="font-bold text-[#1d1d1d]">{label}:</span>{" "}
      <span className="text-[#393939]">{value}</span>
    </p>
  );
}

export function ImpactAreaCard({ area }: { area: ImpactArea }) {
  return (
    <div className="bg-[#e2e0df] flex-1 min-w-0" style={{ padding: "15px 19px" }}>
      <div className="flex items-center gap-[7px] mb-[12px]">
        {area.icon_url && (
          <img src={area.icon_url} alt="" className="w-[22px] h-[22px] object-cover" />
        )}
        <p
          className="text-[#02211a] text-[9.5px] leading-[1.15]"
          style={{ fontFamily: "'Noto Serif', serif" }}
        >
          {area.name}
        </p>
      </div>
      <div className="flex flex-col gap-[8px]">
        <p className="text-[9px] leading-[1.15]">
          <span className="font-bold text-[#1d1d1d]">Score:</span>{" "}
          <span className="text-[#393939]">
            {area.score} - {area.score_label}
          </span>
        </p>
        {area.components && (
          <p className="text-[9px] leading-[1.15]">
            <span className="font-bold text-[#1d1d1d]">Component(s):</span>{" "}
            <span className="text-[#393939]">{area.components}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export function DataTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <table className="w-full text-[7.5px] border-collapse" style={{ fontFamily: "'Inter', 'Noto Sans', sans-serif" }}>
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th
              key={i}
              className="bg-[#033529] text-white font-bold text-left border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="bg-white">
            {row.map((cell, j) => (
              <td
                key={j}
                className="text-[#4b5563] border-b border-[#e5e7eb]"
                style={{ padding: "7.5px", borderLeft: j === 0 ? "0.5px solid #e8ebed" : undefined }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function TheoryOfChangeCard({ toc }: { toc: TheoryOfChange }) {
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
          <a href={toc.toc_url} className="flex items-center gap-[2px] shrink-0">
            <img src="/assets/prms/icon-link.svg" alt="" className="w-[13px] h-[13px]" />
            <span className="text-[#065f4a] text-[9px] font-bold">Access TOC diagram</span>
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

export function GeoLocationBox({ geo }: { geo: GeoLocation }) {
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
                  <span className="mr-[4px]">&bull;</span>{r}
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
                  <span className="mr-[4px]">&bull;</span>{c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function EvidenceCard({ evidence }: { evidence: Evidence }) {
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
          <a href={evidence.link} className="text-[#065f4a] underline break-all">
            {evidence.link}
          </a>
        </p>
        {evidence.description && (
          <p className="text-[9px] leading-[1.5]">
            <span className="font-bold text-[#1d1d1d]">Description:</span>{" "}
            <span className="text-[#393939]">{evidence.description}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export interface QAAdjustment {
  label: string;
  from_value: string;
  to_value: string;
}

export function QABox({ adjustments }: { adjustments?: QAAdjustment[] }) {
  return (
    <div className="bg-[#e2e0df] flex overflow-hidden">
      <div
        className="bg-[#033529] flex items-center justify-center shrink-0"
        style={{ width: 106, padding: "8px 17px" }}
      >
        <img
          src="/assets/prms/shield-badge.png"
          alt="Quality Assured"
          className="w-[57px] h-[57px] object-contain"
        />
      </div>
      <div className="flex flex-col gap-[12px] py-[15px] px-[22px] flex-1 min-w-0">
        <div className="flex flex-col gap-[8px]">
          <p className="text-[#02211a] text-[11px] font-bold leading-[1.15]">
            Result quality assured by two assessors and subsequently reviewed by a senior third party
          </p>
          <p className="text-[#818181] text-[8px] leading-[1.5]">
            This result underwent two rounds of quality assurance, including review by a senior
            third-party subject matter expert following the CGIAR standard{" "}
            <a
              href="https://www.cgiar.org/news-events/news/cgiars-quality-assurance-process-a-snapshot-of-what-it-is-and-what-is-does"
              className="text-[#065f4a] underline"
            >
              QA process
            </a>
            .
          </p>
        </div>
        {adjustments && adjustments.length > 0 && (
          <div className="flex flex-col gap-[5px]">
            <p className="text-[#1d1d1d] text-[9px] font-bold leading-[1.15]">
              Core data points that were adjusted during the QA process:
            </p>
            <div className="flex flex-col gap-[3px]">
              {adjustments.map((adj, i) => (
                <div key={i} className="flex items-center gap-[5px] text-[9px]">
                  <span className="text-[#393939]">
                    <span className="font-medium">{adj.label}:</span> {adj.from_value}
                  </span>
                  <img src="/assets/prms/arrow-right.svg" alt="→" className="w-[11px] h-[8px]" />
                  <span className="text-[#033529] font-medium">{adj.to_value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function KeyValueTable({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <table className="w-full text-[7.5px] border-collapse" style={{ fontFamily: "'Inter', 'Noto Sans', sans-serif" }}>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            <td
              className="bg-[#033529] text-white font-normal border-b border-[#e8ebed]"
              style={{ padding: "7.5px", width: 208 }}
            >
              {row.label}
            </td>
            <td
              className="bg-white text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
