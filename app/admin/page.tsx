"use client";

import { useState, useEffect } from "react";
import { sileo } from "sileo";

type ValidationStatus = "empty" | "valid" | "invalid";

const LS_SECRET = "cgiar_admin_secret";
const LS_FORM = "cgiar_admin_form";

interface FormState {
  json: string;
  template: string;
  paperWidth: string;
  paperHeight: string;
  testMode: boolean;
}

const defaultForm: FormState = {
  json: "",
  template: "example",
  paperWidth: "794",
  paperHeight: "1123",
  testMode: false,
};

function loadSecret(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_SECRET) ?? "";
}

function loadForm(): FormState {
  if (typeof window === "undefined") return defaultForm;
  try {
    const raw = localStorage.getItem(LS_FORM);
    if (!raw) return defaultForm;
    return { ...defaultForm, ...JSON.parse(raw) };
  } catch {
    return defaultForm;
  }
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [form, setForm] = useState<FormState>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSecret(loadSecret());
    setForm(loadForm());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (secret) localStorage.setItem(LS_SECRET, secret);
  }, [secret, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(LS_FORM, JSON.stringify(form));
  }, [form, mounted]);

  function updateForm(partial: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function getValidation(): { status: ValidationStatus; error?: string } {
    const trimmed = form.json.trim();
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

  function handleSubmit() {
    if (!isValid || !secret) return;
    sileo.action({
      title: "Ready to upload?",
      description: `This will save the JSON and open the "${form.template}" template`,
      button: {
        title: "Upload",
        onClick: () => executeUpload(),
      },
    });
  }

  async function executeUpload() {
    setLoading(true);

    const promise = (async () => {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: form.json.trim(),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error ?? "Request failed");
      }

      const { uuid } = body as { uuid: string };
      const params = new URLSearchParams({
        uuid,
        paperWidth: form.paperWidth,
        paperHeight: form.paperHeight,
      });
      if (form.testMode) params.set("test", "true");
      window.open(`/${form.template}?${params.toString()}`, "_blank");
      return uuid;
    })();

    sileo.promise(promise, {
      loading: { title: "Saving to database..." },
      success: (uuid) => ({ title: "Record created", description: `Opening template with ID ${uuid}` }),
      error: (err) => ({ title: "Could not upload", description: (err as Error).message }),
    });

    try {
      await promise;
    } finally {
      setLoading(false);
    }
  }

  function handleClearForm() {
    setForm(defaultForm);
    localStorage.removeItem(LS_FORM);
    sileo.info({ title: "Form reset to defaults" });
  }

  function handleLogout() {
    setSecret("");
    localStorage.removeItem(LS_SECRET);
    sileo.info({ title: "Session cleared" });
  }

  const borderColor =
    validation.status === "empty"
      ? "border-neutral-200"
      : isValid
        ? "border-neutral-900"
        : "border-red-400";

  const hasSession = !!secret;

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-neutral-900 text-xl font-semibold tracking-tight">
                Upload JSON
              </h1>
              <p className="text-neutral-400 text-sm mt-0.5">
                CGIAR PDF Generator
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/list"
                className="text-neutral-400 hover:text-neutral-900 text-sm transition-colors"
              >
                Records
              </a>
              <a
                href="/docs"
                className="text-neutral-400 hover:text-neutral-900 text-sm transition-colors"
              >
                Docs
              </a>
              {hasSession && (
                <button
                  onClick={handleLogout}
                  className="text-neutral-400 hover:text-red-500 text-sm transition-colors"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
          <div className="h-px bg-neutral-100 mt-6" />
        </div>

        <div className="space-y-5">
          {/* Template + Secret */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-neutral-500 text-xs font-medium mb-1.5 block">
                Template
              </label>
              <select
                value={form.template}
                onChange={(e) => updateForm({ template: e.target.value })}
                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2.5 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
              >
                <option value="example">example</option>
                <option value="summary">summary</option>
              </select>
            </div>
            <div>
              <label className="text-neutral-500 text-xs font-medium mb-1.5 block">
                Admin Secret
                {hasSession && (
                  <span className="text-neutral-300 ml-1.5">saved</span>
                )}
              </label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter secret"
                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2.5 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent placeholder-neutral-300 transition-shadow"
              />
            </div>
          </div>

          {/* Paper dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-neutral-500 text-xs font-medium mb-1.5 block">
                Paper Width (px)
              </label>
              <input
                type="number"
                value={form.paperWidth}
                onChange={(e) => updateForm({ paperWidth: e.target.value })}
                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2.5 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
              />
            </div>
            <div>
              <label className="text-neutral-500 text-xs font-medium mb-1.5 block">
                Paper Height (px)
              </label>
              <input
                type="number"
                value={form.paperHeight}
                onChange={(e) => updateForm({ paperHeight: e.target.value })}
                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2.5 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
              />
            </div>
          </div>

          {/* JSON textarea */}
          <div>
            <label className="text-neutral-500 text-xs font-medium mb-1.5 block">
              JSON Payload
            </label>
            <textarea
              value={form.json}
              onChange={(e) => updateForm({ json: e.target.value })}
              placeholder='{ "title": "My Report", ... }'
              rows={10}
              className={`w-full bg-neutral-50 border ${borderColor} rounded-lg p-4 text-neutral-900 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent placeholder-neutral-300 transition-all`}
            />
            <div className="flex items-center gap-2 mt-1.5 h-5">
              {validation.status === "valid" && (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                  <span className="text-neutral-500 text-xs">Valid JSON</span>
                </>
              )}
              {validation.status === "invalid" && (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-red-500 text-xs">{validation.error}</span>
                </>
              )}
            </div>
          </div>

          {/* Test mode */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.testMode}
              onChange={(e) => updateForm({ testMode: e.target.checked })}
              className="w-4 h-4 accent-neutral-900 rounded"
            />
            <span className="text-neutral-600 text-sm">
              Test mode
              <span className="text-neutral-400 ml-1">(keep record after loading)</span>
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={!isValid || !secret || loading}
              className="flex-1 bg-neutral-900 text-white font-medium text-sm py-2.5 rounded-lg hover:bg-neutral-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer active:scale-[0.98]"
            >
              {loading ? "Uploading..." : "Upload & Open"}
            </button>
            <button
              onClick={handleClearForm}
              className="bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-500 hover:text-neutral-900 text-sm px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
