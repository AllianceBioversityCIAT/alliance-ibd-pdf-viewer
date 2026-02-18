export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: string[][];
}) {
  return (
    <table
      className="w-full text-[7.5px] border-collapse"
      style={{ fontFamily: "'Inter', 'Noto Sans', sans-serif" }}
    >
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th
              key={i}
              className="bg-[#033529] text-white font-bold text-left border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="bg-white">
            {row.map((cell, j) => (
              <td
                key={j}
                className="text-[#4b5563] border-b border-[#e5e7eb]"
                style={{
                  padding: "7.5px",
                  borderLeft: j === 0 ? "0.5px solid #e8ebed" : undefined,
                }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function KeyValueTable({
  rows,
}: {
  rows: { label: string; value: string }[];
}) {
  return (
    <table
      className="w-full text-[7.5px] border-collapse"
      style={{ fontFamily: "'Inter', 'Noto Sans', sans-serif" }}
    >
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            <td
              className="bg-[#033529] text-white font-normal border-b border-[#e8ebed]"
              style={{ padding: "7.5px", width: 208 }}
            >
              {row.label}
            </td>
            <td
              className="bg-white text-[#4b5563] border-b border-[#e5e7eb]"
              style={{ padding: "7.5px" }}
            >
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
