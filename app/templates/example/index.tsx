import type { TemplateProps } from "..";

interface LinkedEvidence {
  details: string | null;
  evidence: string;
  gender_related: boolean;
  climate_related: boolean;
  poverty_related: boolean;
  nutrition_related: boolean;
  environmental_biodiversity_related: boolean;
}

interface ContributingCenter {
  center_name: string;
  is_primary_center: number;
}

interface ExampleData {
  title: string;
  rt_id: number;
  is_krs: string;
  regions: string[] | null;
  krs_link: string | null;
  countries: string[] | null;
  geo_focus: string;
  actor_data: unknown;
  gender_tag: string;
  phase_name: string;
  climate_tag: string;
  poverty_tag: string;
  result_code: number;
  result_lead: string;
  result_name: string;
  result_type: string;
  subnational: string | null;
  result_level: string;
  nutrition_tag: string;
  has_actor_data: string;
  linked_results: unknown[];
  kp_partner_data: unknown;
  submission_data: string;
  linked_evidences: LinkedEvidence[];
  environmental_tag: string;
  portfolio_acronym: string;
  submission_status: string;
  previous_portfolio: unknown[];
  result_description: string;
  lead_contact_person: string;
  non_kp_partner_data: unknown;
  non_pooled_projects: unknown;
  partners_applicable: string;
  contributing_centers: ContributingCenter[];
  primary_submitter_name: string;
  contributing_initiatives: unknown;
}

function TagBadge({ label, value }: { label: string; value: string }) {
  const isSignificant = value.includes("Significant");
  const isPrincipal = value.includes("Principal");
  const color = isPrincipal
    ? "bg-[#11D4B3] text-[#02211A]"
    : isSignificant
      ? "bg-[#11D4B3]/20 text-[#02211A]"
      : "bg-gray-100 text-gray-500";

  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-gray-500 w-[90px] shrink-0">{label}</span>
      <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${color}`}>{value}</span>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="mb-2">
      <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-gray-700 text-[10px]">{value}</p>
    </div>
  );
}

export default function Example({ data }: TemplateProps) {
  const d = data as ExampleData | null;

  return (
    <div className="flex font-sans text-[11px] leading-[1.4] h-full">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-[#02211A] px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-[80px] h-[28px] bg-white/20 rounded flex items-center justify-center text-white text-[9px] font-bold tracking-wider">
              CGIAR
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-[#E2E0DF]/60 bg-white/10 px-2 py-0.5 rounded">
                {d?.result_level ?? "—"}
              </span>
              <span className="text-[8px] text-[#11D4B3] bg-[#11D4B3]/10 px-2 py-0.5 rounded font-medium">
                {d?.result_type ?? "—"}
              </span>
            </div>
          </div>

          <p className="text-[9px] text-[#E2E0DF]/60 mb-1">
            Result #{d?.result_code} &middot; {d?.phase_name}
          </p>
          <h1 className="text-[#11D4B3] text-[16px] font-bold leading-tight mb-2">
            {d?.result_name ?? d?.title ?? "No title provided"}
          </h1>
          <p className="text-[#E2E0DF]/80 text-[9px]">
            {d?.result_lead}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pt-4 overflow-hidden">
          {/* Description */}
          {d?.result_description && (
            <div className="mb-4">
              <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-1">Description</p>
              <p className="text-gray-600 text-[10px] leading-[1.5]">{d.result_description}</p>
            </div>
          )}

          <div className="border-t border-gray-200 mb-3" />

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-3">
            <Field label="Lead Contact" value={d?.lead_contact_person} />
            <Field label="Submitter" value={d?.primary_submitter_name} />
            <Field label="Portfolio" value={d?.portfolio_acronym} />
            <Field label="Geographic Focus" value={d?.geo_focus} />
            <Field label="Submission Status" value={d?.submission_status} />
            <Field label="Partners Applicable" value={d?.partners_applicable} />
            <Field label="KRS" value={d?.is_krs} />
            <Field
              label="Regions"
              value={d?.regions?.join(", ") ?? "—"}
            />
            <Field
              label="Countries"
              value={d?.countries?.join(", ") ?? "—"}
            />
            <Field label="Subnational" value={d?.subnational ?? "—"} />
          </div>

          <div className="border-t border-gray-200 mb-3" />

          {/* Impact tags */}
          <div className="mb-3">
            <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-2">
              Impact Area Tags
            </p>
            <div className="grid grid-cols-2 gap-2">
              {d?.gender_tag && <TagBadge label="Gender" value={d.gender_tag} />}
              {d?.climate_tag && <TagBadge label="Climate" value={d.climate_tag} />}
              {d?.nutrition_tag && <TagBadge label="Nutrition" value={d.nutrition_tag} />}
              {d?.poverty_tag && <TagBadge label="Poverty" value={d.poverty_tag} />}
              {d?.environmental_tag && (
                <TagBadge label="Environment" value={d.environmental_tag} />
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 mb-3" />

          {/* Contributing centers */}
          {d?.contributing_centers && d.contributing_centers.length > 0 && (
            <div className="mb-3">
              <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-1.5">
                Contributing Centers
              </p>
              <div className="space-y-1">
                {d.contributing_centers.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#11D4B3] shrink-0" />
                    <span className="text-[10px] text-gray-700">{c.center_name}</span>
                    {c.is_primary_center === 1 && (
                      <span className="text-[8px] text-[#1a7a5a] font-bold">Primary</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linked evidences */}
          {d?.linked_evidences && d.linked_evidences.length > 0 && (
            <div className="mb-3">
              <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-1.5">
                Linked Evidence
              </p>
              {d.linked_evidences.map((ev, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 mb-1.5">
                  <a
                    href={ev.evidence}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1a7a5a] text-[10px] underline break-all"
                  >
                    {ev.evidence}
                  </a>
                  {ev.details && (
                    <p className="text-gray-500 text-[9px] mt-1">{ev.details}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {ev.gender_related && (
                      <span className="text-[8px] bg-[#11D4B3]/15 text-[#02211A] px-1.5 py-0.5 rounded">Gender</span>
                    )}
                    {ev.climate_related && (
                      <span className="text-[8px] bg-[#11D4B3]/15 text-[#02211A] px-1.5 py-0.5 rounded">Climate</span>
                    )}
                    {ev.nutrition_related && (
                      <span className="text-[8px] bg-[#11D4B3]/15 text-[#02211A] px-1.5 py-0.5 rounded">Nutrition</span>
                    )}
                    {ev.poverty_related && (
                      <span className="text-[8px] bg-[#11D4B3]/15 text-[#02211A] px-1.5 py-0.5 rounded">Poverty</span>
                    )}
                    {ev.environmental_biodiversity_related && (
                      <span className="text-[8px] bg-[#11D4B3]/15 text-[#02211A] px-1.5 py-0.5 rounded">Environment</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 px-6 py-2 flex justify-between items-center text-[8px] text-gray-400">
          <p>
            <span className="font-bold text-gray-500">PRMS Result</span> &middot; #{d?.result_code}
          </p>
          <p className="font-bold text-[#1a7a5a]">CGIAR</p>
        </div>
      </div>

      {/* Right green strip */}
      <img src="/img.png" className="w-[20px] h-full object-cover" alt="" />
    </div>
  );
}
