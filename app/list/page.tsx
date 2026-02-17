"use client";

import { useState, useEffect } from "react";
import { sileo } from "sileo";

const LS_SECRET = "cgiar_admin_secret";

interface TableItem {
  id: string;
  json: string;
}

export default function ListPage() {
  const [secret, setSecret] = useState("");
  const [items, setItems] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LS_SECRET) ?? "";
    setSecret(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (secret) localStorage.setItem(LS_SECRET, secret);
  }, [secret, mounted]);

  useEffect(() => {
    if (mounted && secret && !loaded) {
      handleFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  function handleLogout() {
    setSecret("");
    setLoaded(false);
    setItems([]);
    localStorage.removeItem(LS_SECRET);
    sileo.info({ title: "Session cleared" });
  }

  async function handleFetch() {
    if (!secret) return;
    setLoading(true);

    const promise = (async () => {
      const res = await fetch("/api/list", {
        headers: { "x-admin-secret": secret },
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error ?? "Request failed");
      }

      setItems(body.items);
      setLoaded(true);
      return body.items.length as number;
    })();

    sileo.promise(promise, {
      loading: { title: "Fetching records..." },
      success: (count) => ({
        title: `${count} record${count !== 1 ? "s" : ""} found`,
      }),
      error: (err) => ({
        title: "Could not load records",
        description: (err as Error).message,
      }),
    });

    try {
      await promise;
    } finally {
      setLoading(false);
    }
  }

  function requestDelete(recordId: string) {
    const toastId = sileo.action({
      title: "Remove this record permanently?",
      description: (
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs">{recordId}</span>
          <div className="flex gap-2">
            <span
              role="button"
              tabIndex={0}
              data-sileo-button="true"
              onClick={(e) => { e.stopPropagation(); sileo.dismiss(toastId); executeDelete(recordId); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); sileo.dismiss(toastId); executeDelete(recordId); } }}
              style={{ background: "#ef4444", color: "#fff" }}
              className="flex-1 text-center text-sm font-medium py-2 rounded-lg cursor-pointer transition-colors"
            >
              Delete
            </span>
            <span
              role="button"
              tabIndex={0}
              data-sileo-button="true"
              onClick={(e) => { e.stopPropagation(); sileo.dismiss(toastId); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); sileo.dismiss(toastId); } }}
              style={{ background: "#262626", color: "#a3a3a3" }}
              className="flex-1 text-center text-sm font-medium py-2 rounded-lg cursor-pointer transition-colors"
            >
              Cancel
            </span>
          </div>
        </div>
      ),
      duration: null,
    });
  }

  async function executeDelete(id: string) {
    setDeleting(id);

    const promise = (async () => {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Delete failed");
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
    })();

    sileo.promise(promise, {
      loading: { title: "Removing record..." },
      success: { title: "Record removed" },
      error: (err) => ({
        title: "Could not delete record",
        description: (err as Error).message,
      }),
    });

    try {
      await promise;
    } finally {
      setDeleting(null);
    }
  }

  function formatJson(raw: string): string {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  }

  function truncateJson(raw: string, maxLen = 120): string {
    try {
      const oneLine = JSON.stringify(JSON.parse(raw));
      return oneLine.length > maxLen ? oneLine.slice(0, maxLen) + "..." : oneLine;
    } catch {
      return raw.length > maxLen ? raw.slice(0, maxLen) + "..." : raw;
    }
  }

  const hasSession = !!secret;

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-neutral-900 text-xl font-semibold tracking-tight">
                Records
              </h1>
              <p className="text-neutral-400 text-sm mt-0.5">
                CGIAR PDF Generator
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/admin"
                className="text-neutral-400 hover:text-neutral-900 text-sm transition-colors"
              >
                Upload
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

        {/* Auth bar */}
        <div className="flex gap-3 mb-8">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Admin Secret"
            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            className="flex-1 bg-white border border-neutral-200 rounded-lg px-3 py-2.5 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent placeholder-neutral-300 transition-shadow"
          />
          <button
            onClick={handleFetch}
            disabled={!secret || loading}
            className="bg-neutral-900 text-white font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-neutral-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer active:scale-[0.98]"
          >
            {loading ? "Loading..." : "Load"}
          </button>
        </div>

        {/* Results */}
        {loaded && (
          <>
            {/* Count + Refresh */}
            <div className="flex items-center gap-3 mb-5">
              <span className="bg-neutral-100 text-neutral-600 text-xs font-medium px-2.5 py-1 rounded-full">
                {items.length}
              </span>
              <span className="text-neutral-400 text-sm">
                record{items.length !== 1 && "s"}
              </span>
              <button
                onClick={handleFetch}
                disabled={loading}
                className="text-neutral-400 hover:text-neutral-900 text-sm ml-auto transition-colors disabled:opacity-30"
              >
                Refresh
              </button>
            </div>

            {items.length === 0 && (
              <div className="text-center py-20">
                <p className="text-neutral-300 text-lg font-medium">No records</p>
                <p className="text-neutral-400 text-sm mt-1">The table is empty</p>
              </div>
            )}

            <div className="space-y-px">
              {items.map((item) => (
                <details
                  key={item.id}
                  className="group border border-neutral-100 first:rounded-t-xl last:rounded-b-xl transition-colors hover:bg-neutral-50"
                >
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-neutral-900 shrink-0" />
                      <code className="text-neutral-900 text-sm font-mono truncate">
                        {item.id}
                      </code>
                      <span className="text-neutral-300 text-xs truncate hidden sm:inline font-mono">
                        {truncateJson(item.json)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-neutral-300 text-xs group-open:rotate-90 transition-transform">
                        &#9654;
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          requestDelete(item.id);
                        }}
                        disabled={deleting === item.id}
                        className="text-neutral-300 hover:text-red-500 hover:bg-red-50 text-xs px-2.5 py-1 rounded-md transition-all disabled:opacity-30"
                      >
                        {deleting === item.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </summary>
                  <div className="px-4 pb-4">
                    <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
                      <pre className="text-neutral-600 text-xs font-mono overflow-x-auto max-h-60 overflow-y-auto">
                        {formatJson(item.json)}
                      </pre>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
