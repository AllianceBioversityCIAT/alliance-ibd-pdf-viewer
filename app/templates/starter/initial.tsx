import type { TemplateProps } from "..";

// 1. Define the shape of the JSON data this template expects.
//    This is the payload sent via POST /api/data.
interface InitialData {
  title: string;
}

// 2. The default export is the template component.
//    It receives `data` (the stored JSON) as a prop.
//    Cast `data` to your interface to get type safety.
// 3. The rendered HTML will be captured as a PDF by a headless browser.
//    Style it accordingly (fixed dimensions, print-friendly layout).
export default function Initial({ data }: TemplateProps) {
  const d = data as InitialData | null;

  return (
    <h1>{d?.title ?? "No title provided"}</h1>
  );
}
