"use client";

import { useEffect, useState } from "react";

export default function TemplateBadges() {
  const [templates, setTemplates] = useState<string[]>([]);

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
          key={t}
          className="text-xs font-mono bg-neutral-100 text-neutral-700 px-2 py-1 rounded"
        >
          {t}
        </span>
      ))}
    </div>
  );
}
