import type {
  PRMSResultData,
  ImpactArea,
  GeoLocation,
  TheoryOfChange,
  Evidence,
} from "./types";

const IMPACT_AREA_MAP: Record<string, { name: string; icon_url?: string }> = {
  nutrition_tag: {
    name: "Nutrition, health & food security",
    icon_url: "/assets/prms/icon-nutrition.png",
  },
  environmental_tag: {
    name: "Environment health & biodiversity",
    icon_url: "/assets/prms/icon-environment.png",
  },
  climate_tag: { name: "Climate change adaptation & mitigation" },
  gender_tag: { name: "Gender equality, youth & social inclusion" },
  poverty_tag: { name: "Poverty reduction, livelihoods & jobs" },
};

function parseTag(tag: string): { score: number; label: string } | null {
  const match = tag.match(/^\((\d+)\)\s*(.+)$/);
  if (!match) return null;
  return { score: parseInt(match[1], 10), label: match[2] };
}

export function extractImpactAreas(data: PRMSResultData): ImpactArea[] {
  const areas: ImpactArea[] = [];
  const tagKeys = [
    "nutrition_tag",
    "environmental_tag",
    "climate_tag",
    "gender_tag",
    "poverty_tag",
  ] as const;

  for (const key of tagKeys) {
    const tag = data[key];
    if (!tag) continue;
    const parsed = parseTag(tag);
    if (!parsed) continue;
    const mapping = IMPACT_AREA_MAP[key];
    areas.push({
      name: mapping.name,
      icon_url: mapping.icon_url,
      score: parsed.score,
      score_label: parsed.label,
    });
  }

  return areas;
}

export function extractGeoLocation(
  data: PRMSResultData,
): GeoLocation | null {
  if (!data.geo_focus) return null;
  const regions = data.regions ?? [];
  const countries = data.countries ?? [];
  if (!regions.length && !countries.length) return null;
  return { geo_focus: data.geo_focus, regions, countries };
}

export function extractTocEntries(data: PRMSResultData): TheoryOfChange[] {
  if (!data.toc_primary || data.toc_primary.length === 0) return [];
  const tocUrl = data.primary_submitter_data?.toc_url;

  return data.toc_primary.map((entry) => ({
    program_name: entry.initiative_short_name,
    area_of_work: entry.action_area,
    toc_url: tocUrl,
    high_level_output: entry.toc_result_title,
    indicator: entry.indicator,
  }));
}

export function extractEvidences(data: PRMSResultData): Evidence[] {
  const evidences: Evidence[] = [];

  if (data.linked_evidences) {
    data.linked_evidences.forEach((ev, i) => {
      const tags: string[] = [];
      if (ev.gender_related) tags.push("Gender");
      if (ev.climate_related) tags.push("Climate");
      if (ev.nutrition_related) tags.push("Nutrition");
      if (ev.poverty_related) tags.push("Poverty");
      if (ev.environmental_biodiversity_related) tags.push("Environment");

      evidences.push({
        label: `Evidence #${i + 1}`,
        link: ev.evidence,
        description: ev.details ?? undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
    });
  }

  if (data.materials_evidence) {
    data.materials_evidence.forEach((ev, i) => {
      evidences.push({
        label: `Material Evidence #${i + 1}`,
        link: ev.evidence,
        description: ev.details ?? undefined,
      });
    });
  }

  return evidences;
}
