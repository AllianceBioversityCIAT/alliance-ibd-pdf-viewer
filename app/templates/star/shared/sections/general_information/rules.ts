import { hasArrayItems, hasText } from "../../utils";
import type { GeneralInformationPayload } from "./types";

export function resolveContactUserId(
  payload: GeneralInformationPayload | null | undefined,
): string | null {
  if (!payload) return null;
  const fromPerson = payload.main_contact_person?.user_id;
  if (hasText(fromPerson)) return fromPerson!.trim();
  if (hasText(payload.user_id)) return payload.user_id!.trim();
  return null;
}

export function shouldRenderKeywords(
  payload: GeneralInformationPayload | null | undefined,
): boolean {
  return hasArrayItems(payload?.keywords);
}

export function shouldRenderDescription(
  payload: GeneralInformationPayload | null | undefined,
): boolean {
  if (!payload) return false;
  if (payload.indicator_id === 5) return false;
  return hasText(payload.description);
}

export function shouldRenderTitle(
  payload: GeneralInformationPayload | null | undefined,
): boolean {
  return hasText(payload?.title);
}

export function shouldRenderYear(
  payload: GeneralInformationPayload | null | undefined,
): boolean {
  return hasText(payload?.year);
}

export function shouldRenderMainContact(
  payload: GeneralInformationPayload | null | undefined,
): boolean {
  return (
    hasText(payload?.main_contact_display) || !!resolveContactUserId(payload)
  );
}

export function shouldRenderSection(
  payload: GeneralInformationPayload | null | undefined,
): boolean {
  if (!payload) return false;
  return (
    shouldRenderTitle(payload) ||
    shouldRenderDescription(payload) ||
    shouldRenderYear(payload) ||
    shouldRenderMainContact(payload) ||
    shouldRenderKeywords(payload)
  );
}

export function getMainContactDisplay(
  payload: GeneralInformationPayload | null | undefined,
): string | null {
  if (!payload) return null;
  if (hasText(payload.main_contact_display)) {
    return payload.main_contact_display!.trim();
  }
  return resolveContactUserId(payload);
}

export function getResultSubtitle(
  payload: GeneralInformationPayload | null | undefined,
): string | null {
  if (!payload) return null;
  const code = payload.result_code;
  const type = payload.result_type;
  if (code != null && hasText(String(type))) {
    return `Result code #${code} - ${type}`;
  }
  if (code != null) return `Result code #${code}`;
  if (hasText(type)) return type!;
  return null;
}
