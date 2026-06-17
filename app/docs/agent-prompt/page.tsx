"use client";

import CopyButton from "../components/CopyButton";
import { INSTALL_PROMPT } from "./install-prompt";

/**
 * "Agent prompt" docs page.
 *
 * Renders a ready-to-use install/operations prompt for any AI coding agent, plus
 * one-click Copy and Download (.md) actions. No external libraries — the download
 * is built from an in-memory Blob and a temporary anchor.
 */
export default function AgentPromptPage() {
  function handleDownload() {
    const blob = new Blob([INSTALL_PROMPT], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "install-prompt.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        Agent prompt
      </h1>

      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        A copy-paste prompt that turns any AI coding agent (Claude, Codex, Gemini,
        and others) into an install &amp; operations assistant for this project. Paste
        it into your agent of choice, then point it at the repo — it describes what
        the viewer is (and is not), prerequisites and env vars, install and run steps,
        how to author a new template, and how to wire a backend.
      </p>

      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        Every secret, URL, table name, and host appears as a{" "}
        <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[12px] text-[#065f4a]">
          {"{{variable}}"}
        </code>{" "}
        placeholder. The prompt instructs the agent to{" "}
        <strong className="font-medium text-neutral-800">
          ask you for the real value of each one
        </strong>{" "}
        rather than guessing — so nothing sensitive is baked in.
      </p>

      <div className="mt-6 flex items-center gap-2">
        <CopyButton text={INSTALL_PROMPT} label="Copy prompt" />
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center rounded-md border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-500 transition-colors hover:border-[#065f4a] hover:text-[#065f4a]"
        >
          Download .md
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
        <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-1.5">
          <span className="text-[11px] font-medium text-neutral-500">
            install-prompt.md
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
            markdown
          </span>
        </div>
        <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap px-3 py-3 font-mono text-xs leading-relaxed text-neutral-700">
          {INSTALL_PROMPT}
        </pre>
      </div>
    </div>
  );
}
