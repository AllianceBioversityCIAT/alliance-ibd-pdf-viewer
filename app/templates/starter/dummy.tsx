import type { TemplateProps } from "..";

interface DummyData {
  title: string;
}

export default function Dummy({ data }: TemplateProps) {
  const d = data as DummyData | null;

  return (
    <h1>{d?.title ?? "No title provided"}</h1>
  );
}
