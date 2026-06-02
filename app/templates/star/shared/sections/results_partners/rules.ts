import { hasArrayItems, hasText } from "../../utils";
import type { Institution, ResultsPartnersPayload } from "./types";

export function stripHtml(value: string | null | undefined): string | null {
  if (!hasText(value)) return null;

  const text = value!
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > 0 ? text : null;
}

export function getPartnerDisplayName(
  institution: Institution | null | undefined,
): string {
  if (!institution) return "";

  const htmlName = stripHtml(institution.html_full_name);
  if (htmlName) return htmlName;

  if (hasText(institution.full_name)) {
    return institution.full_name!.trim();
  }

  const acronym = institution.acronym?.trim();
  const name = institution.name?.trim();
  if (acronym && name) return `${acronym} - ${name}`;
  if (name) return name;

  return String(institution.institution_id);
}

export function getInstitutionType(
  institution: Institution | null | undefined,
): string | null {
  if (!institution) return null;
  if (hasText(institution.institution_type_name)) {
    return institution.institution_type_name!.trim();
  }
  if (hasText(institution.institution_type)) {
    return institution.institution_type!.trim();
  }
  if (hasText(institution.type)) return institution.type!.trim();
  return null;
}

export function getInstitutionHeadquarter(
  institution: Institution | null | undefined,
): string | null {
  if (!institution) return null;
  if (hasText(institution.headquarters)) {
    return institution.headquarters!.trim();
  }
  if (hasText(institution.headquarter)) {
    return institution.headquarter!.trim();
  }
  if (hasText(institution.country_name)) {
    return institution.country_name!.trim();
  }
  if (hasText(institution.country)) return institution.country!.trim();
  return null;
}

export function isPartnersNotApplicable(
  payload: ResultsPartnersPayload | null | undefined,
): boolean {
  return payload?.is_partner_not_applicable === true;
}

export function shouldRenderPartnerCards(
  payload: ResultsPartnersPayload | null | undefined,
): boolean {
  if (!payload || isPartnersNotApplicable(payload)) return false;
  return hasArrayItems(payload.institutions);
}

export function shouldRenderResultsPartners(
  payload: ResultsPartnersPayload | null | undefined,
): boolean {
  if (!payload) return false;
  return isPartnersNotApplicable(payload) || hasArrayItems(payload.institutions);
}
