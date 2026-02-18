"use client";

import { useEffect, useState } from "react";

export default function TemplateBadges() {
  const [templates, setTemplates] = useState<{ name: string; hasDemo: boolean }[]>([]);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates))
      .catch(() => {});
  }, []);

  return (
    <div className="flex gap-2 flex-wrap">
      {templates.map((t) => (
        <span
          key={t.name}
          className="text-xs font-mono bg-neutral-100 text-neutral-700 px-2 py-1 rounded"
        >
          {t.name}
        </span>
      ))}
    </div>
  );
}
