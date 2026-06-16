import type { ReactNode } from "react";
import Link from "next/link";
import Sidebar from "./components/Sidebar";

/**
 * Route layout for the /docs framework site.
 * Sidebar rail on the left + scrollable main content column on the right.
 */
export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white font-sans flex">
      <Sidebar />

      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-end gap-4 border-b border-neutral-200 px-8 py-3">
          <Link
            href="/admin"
            className="text-neutral-400 hover:text-neutral-900 text-sm transition-colors"
          >
            Upload
          </Link>
          <Link
            href="/list"
            className="text-neutral-400 hover:text-neutral-900 text-sm transition-colors"
          >
            Records
          </Link>
        </header>

        {/* Scrollable content */}
        <main className="px-8 py-12">
          <div className="mx-auto max-w-3xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
