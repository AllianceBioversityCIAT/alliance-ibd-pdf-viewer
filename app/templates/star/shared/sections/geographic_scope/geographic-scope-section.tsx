import type { GeographicScopePayload, GeoScopeVariant } from "./types";
import { GEO_SCOPE_ICON_SRC, GEO_SCOPE_TO_BE_DETERMINED_ICON_SRC } from "./assets";
import {
  GEO_SCOPE_COLORS,
  GEO_SCOPE_EMPTY_LABELS,
  getCountriesWithSubnationals,
  getCountryDisplayName,
  getCountrySubnationalNames,
  getGeoScopeLabel,
  getGeoScopeVariant,
  getRegionNames,
  shouldRenderComments,
  shouldRenderGeographicScope,
  shouldRenderSubnational,
} from "./rules";
import { SectionTitle } from "../../components/section-title";
import { STAR_COLORS } from "../../tokens";

const CONTENT_WIDTH_CLASS = "w-full max-w-[521px]";

interface GeographicScopeSectionProps {
  data: GeographicScopePayload | null | undefined;
}

function ToBeDeterminedSearchIcon() {
  return (
    <img
      src={GEO_SCOPE_TO_BE_DETERMINED_ICON_SRC}
      alt=""
      width={16}
      height={16}
      className="w-4 h-4 object-contain shrink-0"
      aria-hidden
    />
  );
}

function GeoScopeIcon({
  variant,
}: Readonly<{ variant: Exclude<GeoScopeVariant, "to_be_determined"> }>) {
  return (
    <img
      src={GEO_SCOPE_ICON_SRC[variant]}
      alt=""
      width={48}
      height={48}
      className="w-12 h-12 object-contain shrink-0"
      aria-hidden
    />
  );
}

function FieldLabel({ children }: Readonly<{ children: string }>) {
  return (
    <p
      className="text-[11px] font-bold leading-[1.15] m-0"
      style={{ color: STAR_COLORS.primaryBlue500 }}
    >
      {children}
    </p>
  );
}

function BulletList({ items }: Readonly<{ items: string[] }>) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-[6px] gap-y-1">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="text-[10px] leading-normal inline-flex items-center gap-1"
          style={{ color: STAR_COLORS.bodyText }}
        >
          <span aria-hidden>&bull;</span>
          {item}
        </span>
      ))}
    </div>
  );
}

function EmptyListPlaceholder({ children }: Readonly<{ children: string }>) {
  return (
    <span
      className="text-[10px] leading-normal inline-flex items-center gap-1 italic"
      style={{ color: GEO_SCOPE_COLORS.emptyText }}
    >
      <span aria-hidden>&bull;</span>
      {children}
    </span>
  );
}

function CountryFlag({ isoAlpha2 }: Readonly<{ isoAlpha2: string | undefined }>) {
  if (!isoAlpha2?.trim()) return null;

  return (
    <img
      src={`https://flagcdn.com/w20/${isoAlpha2.trim().toLowerCase()}.png`}
      alt=""
      width={16}
      height={13}
      className="w-4 h-[13px] object-cover rounded-[2px] shrink-0"
      style={{ display: "inline-block" }}
    />
  );
}

function CountryList({
  payload,
}: Readonly<{ payload: GeographicScopePayload }>) {
  const countries = payload.countries ?? [];

  return (
    <div className="flex flex-col gap-[5px]">
      <FieldLabel>Countries specified for this result:</FieldLabel>
      {countries.length > 0 ? (
        <div className="flex flex-wrap gap-x-[6px] gap-y-1">
          {countries.map((country) => {
            const name = getCountryDisplayName(country, payload);
            return (
              <span
                key={`${country.isoAlpha2}-${name}`}
                className="text-[10px] leading-normal inline-flex items-center gap-1"
                style={{ color: STAR_COLORS.bodyText }}
              >
                <span aria-hidden>&bull;</span>
                <CountryFlag isoAlpha2={country.isoAlpha2} />
                {name}
              </span>
            );
          })}
        </div>
      ) : (
        <EmptyListPlaceholder>{GEO_SCOPE_EMPTY_LABELS.noCountries}</EmptyListPlaceholder>
      )}
    </div>
  );
}

function RegionList({
  payload,
}: Readonly<{ payload: GeographicScopePayload }>) {
  const regionNames = getRegionNames(payload.regions, payload);

  return (
    <div className="flex flex-col gap-[5px]">
      <FieldLabel>Regions specified for this result:</FieldLabel>
      {regionNames.length > 0 ? (
        <BulletList items={regionNames} />
      ) : (
        <EmptyListPlaceholder>{GEO_SCOPE_EMPTY_LABELS.noRegions}</EmptyListPlaceholder>
      )}
    </div>
  );
}

function SubnationalGroups({
  payload,
}: Readonly<{ payload: GeographicScopePayload }>) {
  const countries = getCountriesWithSubnationals(payload);
  if (countries.length === 0) return null;

  return (
    <>
      {countries.map((country) => {
        const countryName = getCountryDisplayName(country, payload);
        const subnationals = getCountrySubnationalNames(country);
        if (subnationals.length === 0) return null;

        return (
          <div
            key={`${country.isoAlpha2}-subnationals`}
            className="flex flex-col gap-[5px]"
          >
            <FieldLabel>{`States specified of ${countryName} for this result:`}</FieldLabel>
            <BulletList items={subnationals} />
          </div>
        );
      })}
    </>
  );
}

function CommentsBlock({
  comment,
}: Readonly<{ comment: string }>) {
  return (
    <div className="flex flex-col gap-[5px]">
      <FieldLabel>Comments:</FieldLabel>
      <p
        className="text-[10px] leading-[1.25] m-0 break-words"
        style={{ color: STAR_COLORS.bodyText }}
      >
        {comment}
      </p>
    </div>
  );
}

function GeoScopeLeftPanel({
  variant,
  label,
}: Readonly<{ variant: Exclude<GeoScopeVariant, "to_be_determined">; label: string }>) {
  return (
    <div
      className="flex flex-col items-center justify-center shrink-0 self-stretch gap-[5px]"
      style={{
        width: 106,
        padding: "8px 17px",
        backgroundColor: GEO_SCOPE_COLORS.panelGreen,
      }}
    >
      <GeoScopeIcon variant={variant} />
      <p
        className="text-[10px] font-bold leading-[1.15] text-center m-0"
        style={{ color: STAR_COLORS.white }}
      >
        {label}
      </p>
    </div>
  );
}

function GeoScopeCardContent({
  variant,
  payload,
}: Readonly<{
  variant: Exclude<GeoScopeVariant, "to_be_determined">;
  payload: GeographicScopePayload;
}>) {
  const comment = payload.comment_geo_scope?.trim();

  switch (variant) {
    case "global":
      return (
        <>
          <RegionList payload={payload} />
          <CountryList payload={payload} />
          {shouldRenderComments(payload) && comment && (
            <CommentsBlock comment={comment} />
          )}
        </>
      );
    case "regional":
      return (
        <>
          <RegionList payload={payload} />
          {shouldRenderComments(payload) && comment && (
            <CommentsBlock comment={comment} />
          )}
        </>
      );
    case "national":
      return (
        <>
          <CountryList payload={payload} />
          {shouldRenderComments(payload) && comment && (
            <CommentsBlock comment={comment} />
          )}
        </>
      );
    case "subnational":
      return (
        <>
          <CountryList payload={payload} />
          {shouldRenderSubnational(payload) && <SubnationalGroups payload={payload} />}
          {shouldRenderComments(payload) && comment && (
            <CommentsBlock comment={comment} />
          )}
        </>
      );
    default:
      return null;
  }
}

function GeoScopeCard({
  payload,
  variant,
}: Readonly<{
  payload: GeographicScopePayload;
  variant: Exclude<GeoScopeVariant, "to_be_determined">;
}>) {
  const label = getGeoScopeLabel(payload.geo_scope_id);

  return (
    <div
      data-paginator-block
      className={`flex items-stretch overflow-hidden rounded-[12px] ${CONTENT_WIDTH_CLASS}`}
    >
      <GeoScopeLeftPanel variant={variant} label={label} />
      <div
        className="flex flex-col gap-[18px] py-[15px] px-[22px] flex-1 min-w-0 self-stretch justify-center"
        style={{ backgroundColor: GEO_SCOPE_COLORS.cardBg }}
      >
        <GeoScopeCardContent variant={variant} payload={payload} />
      </div>
    </div>
  );
}

function ToBeDeterminedCard({
  payload,
}: Readonly<{ payload: GeographicScopePayload }>) {
  const comment = payload.comment_geo_scope?.trim();
  const hasComment = shouldRenderComments(payload) && !!comment;

  return (
    <div
      data-paginator-block
      className={`flex rounded-[12px] ${CONTENT_WIDTH_CLASS} ${
        hasComment
          ? "flex-col gap-[18px] py-[15px] px-[22px]"
          : "items-center justify-center gap-2.5 py-3 px-4"
      }`}
      style={{ backgroundColor: GEO_SCOPE_COLORS.cardBg }}
    >
      <div className="flex items-center gap-1">
        <ToBeDeterminedSearchIcon />
        <p
          className="text-[11.5px] font-semibold leading-[1.15] m-0"
          style={{ color: GEO_SCOPE_COLORS.panelGreen }}
        >
          This is yet to be determined
        </p>
      </div>
      {hasComment && comment && <CommentsBlock comment={comment} />}
    </div>
  );
}

function GeoScopeVariantContent({
  payload,
}: Readonly<{ payload: GeographicScopePayload }>) {
  const variant = getGeoScopeVariant(payload.geo_scope_id);

  if (variant === "to_be_determined") {
    return <ToBeDeterminedCard payload={payload} />;
  }

  return <GeoScopeCard payload={payload} variant={variant} />;
}

export function GeographicScopeSection({
  data,
}: Readonly<GeographicScopeSectionProps>) {
  if (!shouldRenderGeographicScope(data) || !data) return null;

  return (
    <section className={`flex flex-col gap-[10px] ${CONTENT_WIDTH_CLASS}`}>
      <SectionTitle>Geographic Location</SectionTitle>
      <GeoScopeVariantContent payload={data} />
    </section>
  );
}

export type { GeographicScopePayload };
