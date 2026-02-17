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
          "x-admin-secret": secret,
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
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#11D4B3]/10 border border-[#11D4B3]/20 flex items-center justify-center">
              <span className="text-[#11D4B3] text-lg">+</span>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">Upload JSON</h1>
              <p className="text-[#E2E0DF]/40 text-xs">CGIAR PDF Generator Service</p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-[#11D4B3]/30 to-transparent mt-4" />
        </div>

        <div className="space-y-4">
          {/* Template selector + Secret */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#E2E0DF]/60 text-xs mb-1 block">Template</label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-[#E2E0DF] text-sm focus:outline-none focus:border-[#11D4B3] transition-colors"
              >
                <option value="example">example</option>
                <option value="summary">summary</option>
              </select>
            </div>
            <div>
              <label className="text-[#E2E0DF]/60 text-xs mb-1 block">Admin Secret</label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-[#E2E0DF] text-sm focus:outline-none focus:border-[#11D4B3] placeholder-white/20 transition-colors"
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
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-[#E2E0DF] text-sm focus:outline-none focus:border-[#11D4B3] transition-colors"
              />
            </div>
            <div>
              <label className="text-[#E2E0DF]/60 text-xs mb-1 block">Paper Height (px)</label>
              <input
                type="number"
                value={paperHeight}
                onChange={(e) => setPaperHeight(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-[#E2E0DF] text-sm focus:outline-none focus:border-[#11D4B3] transition-colors"
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
                  <div className="w-2 h-2 rounded-full bg-[#11D4B3] animate-pulse" />
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
            <div className="bg-red-900/20 border border-red-400/20 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isValid || !secret || loading}
            className="w-full bg-[#11D4B3] text-[#02211A] font-bold text-sm py-3 rounded-lg hover:bg-[#0bc4a4] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-[0.98]"
          >
            {loading ? "Uploading..." : "Upload & Open Template"}
          </button>

          {/* Nav link */}
          <a
            href="/list"
            className="block text-center text-[#11D4B3]/50 hover:text-[#11D4B3] text-xs transition-colors"
          >
            View all records
          </a>
        </div>
      </div>
    </div>
  );
}
