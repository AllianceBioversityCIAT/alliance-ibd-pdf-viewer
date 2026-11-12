import type { ReactNode } from "react";
import type {
  AllianceAlignmentPayload,
  AllianceAlignmentView,
  CatalogItemDisplay,
  Contract,
  LeverDisplay,
  SdgDisplay,
  SdgTargetGroupDisplay,
  SdgTargetLineDisplay,
} from "./types";
import {
  getAllianceAlignmentView,
  getContractDisplayRows,
  getContractTitle,
  hasAllianceAlignmentContent,
} from "./rules";
import { LeverIcon } from "../../components/lever-icon";
import { SectionTitle, SubSectionBlock } from "../../components/section-title";
import { InfoCard, PrimaryBadge } from "../../components/info-card";
import { STAR_COLORS } from "../../tokens";

/** Figma content width (Page 111) inside 37px horizontal margins */
const CONTENT_WIDTH_CLASS = "w-full max-w-[521px]";

interface AllianceAlignmentSectionProps {
  data: AllianceAlignmentPayload | null | undefined;
}

// ── Primitives ──

function Card({
  children,
  compact = false,
}: Readonly<{ children: ReactNode; compact?: boolean }>) {
  return (
    <div
      data-paginator-block
      className={`rounded-[12px] ${compact ? "py-[10px] px-[14px]" : "py-[15px] px-[19px]"} ${CONTENT_WIDTH_CLASS}`}
      style={{ backgroundColor: STAR_COLORS.cardBg }}
    >
      {children}
    </div>
  );
}

function CardTitle({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <p
      className="text-[12px] font-semibold leading-[1.15] min-w-0 break-words m-0"
      style={{ color: STAR_COLORS.cardTitle }}
    >
      {children}
    </p>
  );
}

function Description({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <p
      className="text-[10px] leading-[1.3] break-words m-0"
      style={{ color: STAR_COLORS.greyMuted }}
    >
      {children}
    </p>
  );
}

/** Small uppercase label used inside cards (e.g. "Strategic Outcome(s)") */
function FieldLabel({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <p
      className="text-[9px] font-semibold leading-[1.15] uppercase tracking-[0.04em] m-0"
      style={{ color: STAR_COLORS.primaryBlue500 }}
    >
      {children}
    </p>
  );
}

function CodeTag({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span
      className="inline-flex w-max items-center rounded-full px-[7px] py-[2px] text-[8px] font-semibold leading-none whitespace-nowrap"
      style={{ backgroundColor: STAR_COLORS.white, color: STAR_COLORS.primaryBlue500 }}
    >
      {children}
    </span>
  );
}

function PortfolioTag({ label }: Readonly<{ label: string }>) {
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full border px-[8px] py-[3px] text-[8px] font-medium leading-none whitespace-nowrap"
      style={{ borderColor: STAR_COLORS.lightBlue300, color: STAR_COLORS.primaryBlue500 }}
    >
      {label}
    </span>
  );
}

function Divider() {
  return <div className="h-px w-full" style={{ backgroundColor: STAR_COLORS.grey300 }} />;
}

function SdgTargetLine({ line }: Readonly<{ line: SdgTargetLineDisplay }>) {
  return (
    <div className="flex items-start gap-[6px]">
      {line.icon && <LeverIcon icon={line.icon} size={14} className="mt-px rounded-[2px]" />}
      <p className="text-[10px] leading-[1.3] break-words m-0 min-w-0">
        {line.prefix && (
          <>
            <span className="font-bold" style={{ color: STAR_COLORS.primaryBlue500 }}>
              {line.prefix}
            </span>{" "}
          </>
        )}
        <span style={{ color: STAR_COLORS.bodyText }}>{line.description}</span>
      </p>
    </div>
  );
}

function BulletLine({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <p className="text-[10px] leading-[1.3] break-words m-0 flex gap-[5px]">
      <span aria-hidden style={{ color: STAR_COLORS.lightBlue300 }}>
        &bull;
      </span>
      <span style={{ color: STAR_COLORS.bodyText }}>{children}</span>
    </p>
  );
}

// ── Contracts ──

function ContractCard({
  payload,
  contract,
}: Readonly<{ payload: AllianceAlignmentPayload; contract: Contract }>) {
  const rows = getContractDisplayRows(payload, contract);

  return (
    <InfoCard className={CONTENT_WIDTH_CLASS}>
      <div className="flex flex-col gap-2">
        {contract.is_primary === true && <PrimaryBadge />}
        <CardTitle>{getContractTitle(payload, contract)}</CardTitle>
        {rows.length > 0 && (
          <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[10px]">
            {rows.map((row) => (
              <span key={`${row.label}-${row.value}`} style={{ color: STAR_COLORS.bodyText }}>
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

// ── Levers (P1) / Research Areas (P2) ──

function LeverCard({ lever }: Readonly<{ lever: LeverDisplay }>) {
  const hasOutcomes = lever.showStrategicOutcomes && lever.strategicOutcomes.length > 0;
  const hasTargets = lever.showSdgTargets && lever.sdgTargets.length > 0;

  return (
    <Card>
      <div className="flex flex-col gap-[10px]">
        <div className="flex items-center gap-[8px] w-full">
          {lever.icon && <LeverIcon icon={lever.icon} size={28} />}
          <div className="flex flex-col gap-[3px] min-w-0">
            <CardTitle>{lever.title}</CardTitle>
            {lever.description && <Description>{lever.description}</Description>}
          </div>
        </div>

        {lever.customName && (
          <p className="text-[10px] leading-[1.3] break-words m-0">
            <span className="font-bold" style={{ color: STAR_COLORS.primaryBlue500 }}>
              Name of the team or area creating the result:
            </span>{" "}
            <span style={{ color: STAR_COLORS.bodyText }}>{lever.customName}</span>
          </p>
        )}

        {(hasOutcomes || hasTargets) && <Divider />}

        {hasOutcomes && (
          <div className="flex flex-col gap-[5px]">
            <FieldLabel>Strategic Outcome(s)</FieldLabel>
            {lever.strategicOutcomes.map((line, i) => (
              <BulletLine key={`${line.prefix ?? ""}-${line.description}-${i}`}>
                {line.prefix && (
                  <>
                    <span className="font-bold" style={{ color: STAR_COLORS.primaryBlue500 }}>
                      {line.prefix}
                    </span>{" "}
                  </>
                )}
                {line.description}
              </BulletLine>
            ))}
          </div>
        )}

        {hasTargets && (
          <div className="flex flex-col gap-[6px]">
            <FieldLabel>SDG target(s)</FieldLabel>
            {lever.sdgTargets.map((line, i) => (
              <SdgTargetLine key={`${line.prefix ?? ""}-${line.description}-${i}`} line={line} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function LeverList({ title, levers }: Readonly<{ title: string; levers: LeverDisplay[] }>) {
  if (levers.length === 0) return null;
  return (
    <SubSectionBlock title={title}>
      {levers.map((lever) => (
        <LeverCard key={lever.key} lever={lever} />
      ))}
    </SubSectionBlock>
  );
}

// ── Portfolio 2 catalogs ──

function CatalogCard({ item }: Readonly<{ item: CatalogItemDisplay }>) {
  return (
    <Card compact>
      <div className="flex items-start gap-[8px] w-full">
        {item.icon && <LeverIcon icon={item.icon} size={24} />}
        <div className="flex flex-col gap-[4px] min-w-0">
          {item.code && <CodeTag>{item.code}</CodeTag>}
          <CardTitle>{item.title}</CardTitle>
          {item.description && <Description>{item.description}</Description>}
        </div>
      </div>
    </Card>
  );
}

function CatalogList({ title, items }: Readonly<{ title: string; items: CatalogItemDisplay[] }>) {
  if (items.length === 0) return null;
  return (
    <SubSectionBlock title={title}>
      {items.map((item) => (
        <CatalogCard key={item.key} item={item} />
      ))}
    </SubSectionBlock>
  );
}

function SdgTargetGroupCard({ group }: Readonly<{ group: SdgTargetGroupDisplay }>) {
  return (
    <Card compact>
      <div className="flex flex-col gap-[8px]">
        {(group.title || group.icon) && (
          <div className="flex items-center gap-[8px]">
            {group.icon && <LeverIcon icon={group.icon} size={28} className="rounded-[3px]" />}
            {group.title && <CardTitle>{group.title}</CardTitle>}
          </div>
        )}
        <div className="flex flex-col gap-[6px]">
          {group.lines.map((line, i) => (
            <SdgTargetLine key={`${line.prefix ?? ""}-${line.description}-${i}`} line={line} />
          ))}
        </div>
      </div>
    </Card>
  );
}

// ── Contribution to SDG ──

function SdgCard({ sdg }: Readonly<{ sdg: SdgDisplay }>) {
  return (
    <Card compact>
      <div className="flex items-center gap-[10px] w-full">
        {sdg.icon && <LeverIcon icon={sdg.icon} size={34} className="rounded-[3px]" />}
        <div className="flex flex-col gap-[3px] min-w-0">
          <p className="text-[12px] font-semibold leading-[1.15] break-words m-0">
            {sdg.code && (
              <span style={{ color: sdg.color ?? STAR_COLORS.primaryBlue500 }}>{sdg.code} · </span>
            )}
            <span style={{ color: STAR_COLORS.cardTitle }}>{sdg.title}</span>
          </p>
          {sdg.description && <Description>{sdg.description}</Description>}
        </div>
      </div>
    </Card>
  );
}

// ── Variant bodies ──

function Portfolio1Body({ view }: Readonly<{ view: AllianceAlignmentView }>) {
  return (
    <>
      <LeverList title={view.primaryLeversTitle} levers={view.primaryLevers} />
      <LeverList title={view.contributorLeversTitle} levers={view.contributorLevers} />
    </>
  );
}

function Portfolio2Body({ view }: Readonly<{ view: AllianceAlignmentView }>) {
  return (
    <>
      <LeverList title="Research Areas" levers={view.researchAreas} />
      <CatalogList title="Strategic Objectives" items={view.strategicObjectives} />
      <CatalogList title="Impact Outcomes" items={view.impactOutcomes} />
      {view.sdgTargetGroups.length > 0 && (
        <SubSectionBlock title="SDG Targets">
          {view.sdgTargetGroups.map((group) => (
            <SdgTargetGroupCard key={group.key} group={group} />
          ))}
        </SubSectionBlock>
      )}
    </>
  );
}

// ── Section ──

export function AllianceAlignmentSection({ data }: Readonly<AllianceAlignmentSectionProps>) {
  const view = getAllianceAlignmentView(data);
  if (!data || !view || !hasAllianceAlignmentContent(view)) return null;

  return (
    <section className={`flex flex-col gap-2 ${CONTENT_WIDTH_CLASS}`}>
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 min-w-0">
          <SectionTitle>Alliance Alignment</SectionTitle>
        </div>
        {view.portfolioLabel && <PortfolioTag label={view.portfolioLabel} />}
      </div>

      {view.contracts.length > 0 && (
        <SubSectionBlock title="Contributing Projects" paginatorBlock>
          {view.contracts.map((contract, i) => (
            <ContractCard
              key={contract.result_contract_id ?? `${contract.contract_id}-${i}`}
              payload={data}
              contract={contract}
            />
          ))}
        </SubSectionBlock>
      )}

      <div className={`flex flex-col gap-2.5 ${CONTENT_WIDTH_CLASS}`}>
        {view.variant === "P2" ? <Portfolio2Body view={view} /> : <Portfolio1Body view={view} />}

        {view.sdgs.length > 0 && (
          <SubSectionBlock title="Contribution to SDG">
            {view.sdgs.map((sdg) => (
              <SdgCard key={sdg.key} sdg={sdg} />
            ))}
          </SubSectionBlock>
        )}
      </div>
    </section>
  );
}

export type { AllianceAlignmentPayload };
