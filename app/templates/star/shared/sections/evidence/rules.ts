import { hasText } from "../../utils";
import type { Evidence, EvidencePayload, NotableReference } from "./types";

export function shouldShowAccessLink(
  evidence: Evidence | null | undefined,
): boolean {
  if (!evidence || evidence.is_private === true) return false;
  return hasText(evidence.evidence_url);
}

export function shouldShowEvidenceDescription(
  evidence: Evidence | null | undefined,
): boolean {
  return hasText(evidence?.evidence_description);
}

export function getEvidenceNumberLabel(index: number): string {
  return `EVIDENCE #${index + 1}`;
}

export function getNormalizedEvidenceUrl(
  evidence: Evidence | null | undefined,
): string | null {
  if (!evidence || !hasText(evidence.evidence_url)) return null;
  const raw = evidence.evidence_url.trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

export function shouldRenderEvidenceList(
  payload: EvidencePayload | null | undefined,
): boolean {
  return getActiveEvidence(payload).length > 0;
}

export function shouldRenderNotableReferences(
  payload: EvidencePayload | null | undefined,
): boolean {
  return getVisibleNotableReferences(payload).length > 0;
}

export function shouldRenderSection(
  payload: EvidencePayload | null | undefined,
): boolean {
  if (!payload) return false;
  return shouldRenderEvidenceList(payload) || shouldRenderNotableReferences(payload);
}

export function getActiveEvidence(
  payload: EvidencePayload | null | undefined,
): Evidence[] {
  return (payload?.evidence ?? []).filter(
    (item) =>
      item.is_active !== false &&
      (hasText(item.evidence_url) || hasText(item.evidence_description)),
  );
}

export function getVisibleNotableReferences(
  payload: EvidencePayload | null | undefined,
): NotableReference[] {
  return (payload?.notable_references ?? []).filter((ref) => hasText(ref.link));
}
