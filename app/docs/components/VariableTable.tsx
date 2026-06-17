interface VariableRow {
  /** Variable name / placeholder, rendered in teal mono. */
  variable: string;
  /** What the variable is. */
  what: string;
  /** Where it lives / is configured. */
  where: string;
}

interface VariableTableProps {
  rows: VariableRow[];
}

/**
 * Clean three-column reference table for required variables.
 */
export default function VariableTable({ rows }: VariableTableProps) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-neutral-200">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
            <th className="px-3 py-2 font-medium text-neutral-500">Variable</th>
            <th className="px-3 py-2 font-medium text-neutral-500">What it is</th>
            <th className="px-3 py-2 font-medium text-neutral-500">Where it lives</th>
          </tr>
        </thead>
        <tbody>
          {(rows ?? []).map((row, i) => (
            <tr
              key={row.variable + i}
              className="border-b border-neutral-100 last:border-0 align-top"
            >
              <td className="px-3 py-2">
                <code className="font-mono text-[#065f4a] whitespace-nowrap">
                  {row.variable}
                </code>
              </td>
              <td className="px-3 py-2 text-neutral-600 leading-relaxed">
                {row.what}
              </td>
              <td className="px-3 py-2 text-neutral-500 leading-relaxed">
                {row.where}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
