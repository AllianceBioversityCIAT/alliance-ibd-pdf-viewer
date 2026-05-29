import type { ReactNode } from "react";
import type {
  AllianceAlignmentPayload,
  Contract,
  Lever,
  SdgTargetLineDisplay,
} from "./types";
import {
  getContractDisplayRows,
  getContractLeverDisplay,
  getContractTitle,
  getContributorLeverSdgTargetLines,
  getContributorLeversExcludingPrimary,
  getContractsForPdf,
  getLeverIconFromLever,
  getPrimaryLeverSdgTargetLines,
  getLeverTitle,
  shouldRenderAllianceAlignment,
  shouldRenderContracts,
  shouldRenderContributorLevers,
  shouldRenderContractLever,
  shouldRenderLeverIcon,
  shouldRenderPrimaryLevers,
} from "./rules";
import { LeverIcon } from "../../components/lever-icon";
import { SectionTitle, SubSectionLabel } from "../../components/section-title";
import { InfoCard, PrimaryBadge } from "../../components/info-card";
import { STAR_COLORS } from "../../tokens";

/** Figma content width (Page 111) inside 37px horizontal margins */
const CONTENT_WIDTH_CLASS = "w-full max-w-[521px]";

interface AllianceAlignmentSectionProps {
  data: AllianceAlignmentPayload | null | undefined;
}

function LeverCard({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      data-paginator-block
      className={`rounded-[12px] py-[15px] px-[19px] ${CONTENT_WIDTH_CLASS}`}
      style={{ backgroundColor: STAR_COLORS.cardBg }}
    >
      {children}
    </div>
  );
}

function SdgTargetLine({ line }: Readonly<{ line: SdgTargetLineDisplay }>) {
  return (
    <p className="text-[10px] leading-[1.25] break-words m-0">
      {line.prefix ? (
        <>
          <span
            className="font-bold"
            style={{ color: STAR_COLORS.primaryBlue500 }}
          >
            {line.prefix}
          </span>{" "}
          <span className="font-normal" style={{ color: STAR_COLORS.bodyText }}>
            {line.description}
          </span>
        </>
      ) : (
        <span className="font-normal" style={{ color: STAR_COLORS.bodyText }}>
          {line.description}
        </span>
      )}
    </p>
  );
}

function LeverCardHeader({ lever }: Readonly<{ lever: Lever }>) {
  const iconUrl = getLeverIconFromLever(lever);

  return (
    <div className="flex items-center gap-[6px] w-full">
      {shouldRenderLeverIcon(iconUrl) && <LeverIcon icon={iconUrl} size={24} />}
      <p
        className="text-[12px] font-semibold leading-[1.15] min-w-0"
        style={{ color: STAR_COLORS.cardTitle }}
      >
        {getLeverTitle(lever)}
      </p>
    </div>
  );
}

function LeverCardBody({
  lever,
  sdgLines,
}: Readonly<{ lever: Lever; sdgLines: SdgTargetLineDisplay[] }>) {
  return (
    <div className="flex flex-col gap-[10px]">
      <LeverCardHeader lever={lever} />
      {sdgLines.length > 0 && (
        <div className="flex flex-col gap-[8px]">
          {sdgLines.map((line, i) => (
            <SdgTargetLine key={`${line.prefix ?? ""}-${line.description}-${i}`} line={line} />
          ))}
        </div>
      )}
    </div>
  );
}

function PrimaryLeverCard({
  payload,
  lever,
}: Readonly<{ payload: AllianceAlignmentPayload; lever: Lever }>) {
  const sdgLines = getPrimaryLeverSdgTargetLines(payload, lever);

  return (
    <LeverCard>
      <LeverCardBody lever={lever} sdgLines={sdgLines} />
    </LeverCard>
  );
}

function ContributorLeverCard({
  payload,
  lever,
}: Readonly<{ payload: AllianceAlignmentPayload; lever: Lever }>) {
  const sdgLines = getContributorLeverSdgTargetLines(payload, lever);

  return (
    <LeverCard>
      <LeverCardBody lever={lever} sdgLines={sdgLines} />
    </LeverCard>
  );
}

function ContractCard({
  payload,
  contract,
}: Readonly<{ payload: AllianceAlignmentPayload; contract: Contract }>) {
  const rows = getContractDisplayRows(payload, contract);
  const leverDisplay = getContractLeverDisplay(contract);

  return (
    <InfoCard className={CONTENT_WIDTH_CLASS}>
      <div className="flex flex-col gap-2">
        {contract.is_primary === true && <PrimaryBadge />}
        <p
          className="text-[12px] font-semibold leading-[1.15]"
          style={{ color: STAR_COLORS.cardTitle }}
        >
          {getContractTitle(payload, contract)}
        </p>
        {rows.length > 0 && (
          <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[10px]">
            {rows.map((row) => (
              <span
                key={`${row.label}-${row.value}`}
                style={{ color: STAR_COLORS.bodyText }}
              >
                <span className="font-bold" style={{ color: STAR_COLORS.primaryBlue500 }}>
                  {row.label}:
                </span>{" "}
                {row.value}
              </span>
            ))}
          </div>
        )}

      </div>
    </InfoCard>
  );
}

function PrimaryLeversBlock({
  data,
}: Readonly<{ data: AllianceAlignmentPayload }>) {
  if (!shouldRenderPrimaryLevers(data)) return null;

  return (
    <div className={`flex flex-col gap-[10px] ${CONTENT_WIDTH_CLASS}`}>
      <SubSectionLabel>Primary Levers</SubSectionLabel>
      <div className="flex flex-col gap-[10px]">
        {(data.primary_levers ?? []).map((lever) => (
          <PrimaryLeverCard
            key={lever.result_lever_id}
            payload={data}
            lever={lever}
          />
        ))}
      </div>
    </div>
  );
}

function ContributorLeversBlock({
  data,
  contributorLevers,
}: Readonly<{
  data: AllianceAlignmentPayload;
  contributorLevers: Lever[];
}>) {
  if (!shouldRenderContributorLevers(data)) return null;

  return (
    <div className={`flex flex-col gap-[10px] ${CONTENT_WIDTH_CLASS}`}>
      <SubSectionLabel>Other Contributing Levers</SubSectionLabel>
      <div className="flex flex-col gap-[10px]">
        {contributorLevers.map((lever) => (
          <ContributorLeverCard
            key={lever.result_lever_id}
            payload={data}
            lever={lever}
          />
        ))}
      </div>
    </div>
  );
}

export function AllianceAlignmentSection({
  data,
}: Readonly<AllianceAlignmentSectionProps>) {
  if (!shouldRenderAllianceAlignment(data) || !data) return null;

  const contracts = getContractsForPdf(data);
  const contributorLevers = getContributorLeversExcludingPrimary(
    data.primary_levers ?? [],
    data.contributor_levers ?? [],
  );
  const showLevers =
    shouldRenderPrimaryLevers(data) || shouldRenderContributorLevers(data);

  return (
    <section className={`flex flex-col gap-5 ${CONTENT_WIDTH_CLASS}`}>
      <SectionTitle>Alliance Alignment</SectionTitle>

      {shouldRenderContracts(data) && (
        <div className={`flex flex-col gap-[10px] ${CONTENT_WIDTH_CLASS}`} data-paginator-block>
          <SubSectionLabel>Contributing Projects</SubSectionLabel>
          <div className="flex flex-col gap-[10px]">
            {contracts.map((contract) => (
              <ContractCard
                key={contract.result_contract_id}
                payload={data}
                contract={contract}
              />
            ))}
          </div>
        </div>
      )}

      {showLevers && (
        <div className={`flex flex-col gap-[15px] ${CONTENT_WIDTH_CLASS}`}>
          <PrimaryLeversBlock data={data} />
          <ContributorLeversBlock data={data} contributorLevers={contributorLevers} />
        </div>
      )}
    </section>
  );
}

export type { AllianceAlignmentPayload };
