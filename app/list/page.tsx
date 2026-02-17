"use client";

import { useState, useEffect } from "react";

const LS_SECRET = "cgiar_admin_secret";

interface TableItem {
  id: string;
  json: string;
}

export default function ListPage() {
  const [secret, setSecret] = useState("");
  const [items, setItems] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load secret from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LS_SECRET) ?? "";
    setSecret(saved);
    setMounted(true);
  }, []);

  // Persist secret changes
  useEffect(() => {
    if (!mounted) return;
    if (secret) {
      localStorage.setItem(LS_SECRET, secret);
    }
  }, [secret, mounted]);

  // Auto-load if secret was cached
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
  }

  async function handleFetch() {
    if (!secret) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/list", {
        headers: { "x-admin-secret": secret },
      });

      const body = await res.json();

      if (!res.ok) {
        setError(body.error ?? "Request failed");
        return;
      }

      setItems(body.items);
      setLoaded(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
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
        setError(body.error ?? "Delete failed");
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      setError((e as Error).message);
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
    <div className="min-h-screen bg-[#02211A] font-sans p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#11D4B3]/10 border border-[#11D4B3]/20 flex items-center justify-center">
                <span className="text-[#11D4B3] text-sm">DB</span>
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">Records</h1>
                <p className="text-[#E2E0DF]/40 text-xs">CGIAR PDF Generator Service</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/admin"
                className="text-[#11D4B3]/50 hover:text-[#11D4B3] text-xs transition-colors"
              >
                Upload JSON
              </a>
              {hasSession && (
                <button
                  onClick={handleLogout}
                  className="text-[#E2E0DF]/30 hover:text-red-400 text-xs transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-[#11D4B3]/30 to-transparent mt-4" />
        </div>

        {/* Auth bar */}
        <div className="flex gap-3 mb-6">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Admin Secret"
            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-[#E2E0DF] text-sm focus:outline-none focus:border-[#11D4B3] placeholder-white/20 transition-colors"
          />
          <button
            onClick={handleFetch}
            disabled={!secret || loading}
            className="bg-[#11D4B3] text-[#02211A] font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-[#0bc4a4] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-[0.98]"
          >
            {loading ? "Loading..." : "Load"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-400/20 rounded-lg px-4 py-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {loaded && (
          <>
            {/* Count badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-[#11D4B3]/10 text-[#11D4B3] text-xs font-bold px-2.5 py-1 rounded-full">
                {items.length}
              </span>
              <span className="text-[#E2E0DF]/40 text-sm">
                record{items.length !== 1 && "s"} in table
              </span>
              <button
                onClick={handleFetch}
                disabled={loading}
                className="text-[#E2E0DF]/30 hover:text-[#11D4B3] text-xs ml-auto transition-colors disabled:opacity-30"
              >
                Refresh
              </button>
            </div>

            {items.length === 0 && (
              <div className="text-center py-16">
                <div className="text-[#E2E0DF]/20 text-5xl mb-3">0</div>
                <p className="text-[#E2E0DF]/30 text-sm">Table is empty</p>
              </div>
            )}

            <div className="space-y-2">
              {items.map((item) => (
                <details
                  key={item.id}
                  className="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] rounded-xl transition-colors"
                >
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-[#11D4B3] shrink-0" />
                      <code className="text-[#11D4B3] text-sm font-mono truncate">
                        {item.id}
                      </code>
                      <span className="text-[#E2E0DF]/25 text-xs truncate hidden sm:inline">
                        {truncateJson(item.json)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-[#E2E0DF]/20 text-xs group-open:rotate-90 transition-transform">
                        &#9654;
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (confirm(`Delete record ${item.id}?`)) {
                            handleDelete(item.id);
                          }
                        }}
                        disabled={deleting === item.id}
                        className="text-red-400/40 hover:text-red-400 hover:bg-red-400/10 text-xs px-2.5 py-1 rounded-lg transition-all disabled:opacity-30"
                      >
                        {deleting === item.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </summary>
                  <div className="px-4 pb-4">
                    <div className="bg-black/20 rounded-lg p-3 border border-white/[0.04]">
                      <pre className="text-[#E2E0DF]/60 text-xs font-mono overflow-x-auto max-h-60 overflow-y-auto">
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
