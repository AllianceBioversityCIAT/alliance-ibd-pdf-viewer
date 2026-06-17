import { STAR_COLORS } from "../tokens";

interface LabelValueRowProps {
  label: string;
  value: string;
}

export function LabelValueRow({ label, value }: Readonly<LabelValueRowProps>) {
  return (
    <p className="text-[11px] leading-[1.25] w-full">
      <span className="font-bold" style={{ color: STAR_COLORS.primaryBlue500 }}>
        {label}:
      </span>{" "}
      <span style={{ color: STAR_COLORS.bodyText }}>{value}</span>
    </p>
  );
}

interface FieldLabelProps {
  label: string;
}

/** Bold blue field label without a value — e.g. "Actors:" before repeated cards. */
export function FieldLabel({ label }: Readonly<FieldLabelProps>) {
  return (
    <p className="text-[11px] leading-[1.25] w-full m-0">
      <span className="font-bold" style={{ color: STAR_COLORS.primaryBlue500 }}>
        {label}:
      </span>
    </p>
  );
}

interface KeywordListProps {
  keywords: string[];
}

export function KeywordList({ keywords }: Readonly<KeywordListProps>) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {keywords.map((keyword) => (
        <span
          key={keyword}
          className="text-[10px] px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: STAR_COLORS.grey300,
            color: STAR_COLORS.bodyText,
          }}
        >
          {keyword}
        </span>
      ))}
    </div>
  );
}
