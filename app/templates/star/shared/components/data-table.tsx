import type { ReactNode } from "react";
import { STAR_COLORS } from "../tokens";

export interface DataTableRow {
  label: string;
  value: ReactNode;
}

interface DataTableProps {
  rows: DataTableRow[];
}

const TABLE_BORDER = `0.5px solid ${STAR_COLORS.grey300}`;
const LABEL_COLUMN_BORDER = "0.5px solid rgb(136, 136, 136)";
const TABLE_RADIUS = 1.5;
const LABEL_COLUMN_CLASS = "shrink-0 w-[34%] max-w-[200px]";

export function DataTable({ rows }: Readonly<DataTableProps>) {
  if (rows.length === 0) return null;

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        border: TABLE_BORDER,
        borderRadius: TABLE_RADIUS,
      }}
      data-paginator-block
    >
      {rows.map((row, index) => (
        <div key={row.label} className="flex w-full min-h-[36px]">
          <div
            className={`${LABEL_COLUMN_CLASS} flex items-center px-2.5 py-1 text-[10px] font-[350] leading-[1.2] text-white`}
            style={{
              backgroundColor: STAR_COLORS.primaryBlue600,
              borderRight: LABEL_COLUMN_BORDER,
              borderBottom: LABEL_COLUMN_BORDER,
              borderLeft: LABEL_COLUMN_BORDER,
              borderTop: index === 0 ? LABEL_COLUMN_BORDER : undefined,
            }}
          >
            {row.label}
          </div>
          <div
            className="flex-1 flex items-center px-2.5 py-1 text-[10px] leading-[1.2] min-w-0"
            style={{
              color: STAR_COLORS.bodyText,
              backgroundColor: STAR_COLORS.white,
              borderBottom:
                index < rows.length - 1 ? TABLE_BORDER : undefined,
            }}
          >
            {row.value}
          </div>
        </div>
      ))}
    </div>
  );
}

interface InlineMetaProps {
  items: (string | null)[];
}

export function InlineMeta({ items }: Readonly<InlineMetaProps>) {
  const visible = items.filter((item): item is string => !!item);
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[10px]">
      {visible.map((item, index) => (
        <span key={`${item}-${index}`} className="inline-flex items-center gap-3.5">
          {index > 0 && (
            <span
              className="inline-block w-px h-3"
              style={{ backgroundColor: STAR_COLORS.grey500 }}
              aria-hidden
            />
          )}
          <span style={{ color: STAR_COLORS.bodyText }}>{item}</span>
        </span>
      ))}
    </div>
  );
}
