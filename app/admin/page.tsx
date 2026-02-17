"use client";

import { useState } from "react";

type ValidationStatus = "empty" | "valid" | "invalid";

export default function AdminPage() {
  const [json, setJson] = useState("");
  const [secret, setSecret] = useState("");
  const [template, setTemplate] = useState("example");
  const [paperWidth, setPaperWidth] = useState("794");
  const [paperHeight, setPaperHeight] = useState("1123");
  const [testMode, setTestMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getValidation(): { status: ValidationStatus; error?: string } {
    const trimmed = json.trim();
    if (!trimmed) return { status: "empty" };
    try {
      JSON.parse(trimmed);
      return { status: "valid" };
    } catch (e) {
      return { status: "invalid", error: (e as Error).message };
    }
  }

  const validation = getValidation();
  const isValid = validation.status === "valid";

  async function handleSubmit() {
    if (!isValid || !secret) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": secret,
        },
        body: json.trim(),
      });

      const body = await res.json();

      if (!res.ok) {
        setError(body.error ?? "Request failed");
        return;
      }

      const { uuid } = body as { uuid: string };
      const params = new URLSearchParams({ uuid, paperWidth, paperHeight });
      if (testMode) params.set("test", "true");
      window.open(`/${template}?${params.toString()}`, "_blank");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const borderColor =
    validation.status === "empty"
      ? "border-white/20"
      : isValid
        ? "border-[#11D4B3]"
        : "border-red-400";

  return (
    <div className="min-h-screen bg-[#02211A] flex items-center justify-center font-sans p-6">
      <div className="w-full max-w-xl space-y-4">
        <div>
          <h1 className="text-white text-xl font-bold mb-1">PDF Template Admin</h1>
          <p className="text-[#E2E0DF]/50 text-xs">CGIAR PDF Generator Service</p>
        </div>

        {/* Template selector + Secret */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[#E2E0DF]/60 text-xs mb-1 block">Template</label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-[#E2E0DF] text-sm focus:outline-none focus:border-[#11D4B3]"
            >
              <option value="example">example</option>
              <option value="summary">summary</option>
            </select>
          </div>
          <div>
            <label className="text-[#E2E0DF]/60 text-xs mb-1 block">API Secret</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-[#E2E0DF] text-sm focus:outline-none focus:border-[#11D4B3] placeholder-white/20"
            />
          </div>
        </div>

        {/* Paper dimensions */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[#E2E0DF]/60 text-xs mb-1 block">Paper Width (px)</label>
            <input
              type="number"
              value={paperWidth}
              onChange={(e) => setPaperWidth(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-[#E2E0DF] text-sm focus:outline-none focus:border-[#11D4B3]"
            />
          </div>
          <div>
            <label className="text-[#E2E0DF]/60 text-xs mb-1 block">Paper Height (px)</label>
            <input
              type="number"
              value={paperHeight}
              onChange={(e) => setPaperHeight(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-[#E2E0DF] text-sm focus:outline-none focus:border-[#11D4B3]"
            />
          </div>
        </div>

        {/* JSON textarea */}
        <div>
          <label className="text-[#E2E0DF]/60 text-xs mb-1 block">JSON Payload</label>
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder="Paste your JSON here..."
            rows={10}
            className={`w-full bg-[#02211A] border ${borderColor} rounded-lg p-4 text-[#E2E0DF] text-sm font-mono resize-y focus:outline-none placeholder-white/20 transition-colors`}
          />
          <div className="flex items-center gap-2 mt-1 h-5">
            {validation.status === "valid" && (
              <>
                <div className="w-2 h-2 rounded-full bg-[#11D4B3]" />
                <span className="text-[#11D4B3] text-xs">Valid JSON</span>
              </>
            )}
            {validation.status === "invalid" && (
              <>
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-red-400 text-xs">{validation.error}</span>
              </>
            )}
          </div>
        </div>

        {/* Test mode toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
            className="w-4 h-4 accent-[#11D4B3]"
          />
          <span className="text-[#E2E0DF]/70 text-sm">
            Test mode (keeps record in DB after loading)
          </span>
        </label>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-400/30 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || !secret || loading}
          className="w-full bg-[#11D4B3] text-[#02211A] font-bold text-sm py-3 rounded-lg hover:bg-[#11D4B3]/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {loading ? "Uploading..." : "Upload & Open Template"}
        </button>
      </div>
    </div>
  );
}
