import { notFound } from "next/navigation";
import { templates } from "@/app/templates";
import { getItem, deleteItem } from "@/lib/dynamo";

interface Props {
  params: Promise<{ template: string }>;
  searchParams: Promise<{
    uuid?: string;
    paperWidth?: string;
    paperHeight?: string;
    test?: string;
  }>;
}

export default async function TemplatePage({ params, searchParams }: Props) {
  const { template } = await params;
  const { uuid, paperWidth, paperHeight, test } = await searchParams;

  const TemplateComponent = templates[template];
  if (!TemplateComponent) notFound();

  if (!uuid) notFound();

  const data = await getItem(uuid);
  if (data === null) notFound();

  if (test !== "true") {
    try {
      await deleteItem(uuid);
    } catch {
      // Record may have already been deleted by a concurrent request
    }
  }

  const width = Math.max(100, Math.min(5000, Number(paperWidth) || 794));
  const height = Math.max(100, Math.min(5000, Number(paperHeight) || 1123));

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, overflow: "hidden" }}>
      <TemplateComponent data={data} />
    </div>
  );
}
