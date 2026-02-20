export function DataTable({
  columns,
  rows,
}: Readonly<{
  columns: string[];
  rows: string[][];
}>) {
  return (
    <table
      className="w-full text-[9px] border-collapse"
      style={{ fontFamily: "'Inter', 'Noto Sans', sans-serif" }}
    >
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th
              key={`${col}-${i}`}
              className="bg-[#033529] text-white text-left border-b border-[#e5e7eb] p-2"
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={`${row}-${i}`} className="bg-white">
            {row.map((cell, j) => (
              <td
                key={`${row}-${i}-${cell}-${j}`}
                className="text-[#4b5563] border-b border-[#e5e7eb] p-2"
                style={{
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
}: Readonly<{
  rows: { label: string; value: string }[];
}>) {
  return (
    <table
      className="w-full text-[9px] border-collapse"
      style={{ fontFamily: "'Inter', 'Noto Sans', sans-serif" }}
    >
      <tbody className="border border-[#e8ebed]">
        {rows.map((row, i) => (
          <tr key={`${row.label}-${row.value}-${i}`}>
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
