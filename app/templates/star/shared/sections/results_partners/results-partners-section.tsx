import type { Institution, ResultsPartnersPayload } from "./types";
import {
  getPartnerDisplayName,
  isPartnersNotApplicable,
  shouldRenderPartnerCards,
  shouldRenderResultsPartners,
} from "./rules";
import { SectionTitle } from "../../components/section-title";
import {
  PARTNER_CARD_WIDTH_CLASS,
  PartnerInstitutionCard,
} from "../../components/partner-institution-card";
import { STAR_COLORS } from "../../tokens";

interface ResultsPartnersSectionProps {
  data: ResultsPartnersPayload | null | undefined;
}

export function ResultsPartnersSection({
  data,
}: Readonly<ResultsPartnersSectionProps>) {
  if (!shouldRenderResultsPartners(data) || !data) return null;

  return (
    <section
      className={`flex flex-col gap-[10px] ${PARTNER_CARD_WIDTH_CLASS}`}
    >
      <SectionTitle>Results Partners</SectionTitle>

      {isPartnersNotApplicable(data) && (
        <p className="text-[11px]" style={{ color: STAR_COLORS.bodyText }}>
          This section is not applicable.
        </p>
      )}

      {shouldRenderPartnerCards(data) && (
        <div className="flex flex-col gap-[8px]">
          {(data.institutions ?? [])
            .filter((institution) => getPartnerDisplayName(institution))
            .map((institution) => (
              <PartnerInstitutionCard
                key={`${institution.institution_id}-${institution.institution_role_id}`}
                institution={institution}
              />
            ))}
        </div>
      )}
    </section>
  );
}

export type { ResultsPartnersPayload, Institution };
