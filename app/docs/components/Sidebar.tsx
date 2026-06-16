"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNav } from "../docs-nav";

/**
 * Left navigation rail for the /docs site.
 * Sticky, ~260px wide, highlights the active item with a CGIAR green accent.
 */
export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] shrink-0 border-r border-neutral-200 bg-white">
      <div className="sticky top-0 max-h-screen overflow-y-auto px-5 py-7">
        {/* Brand block */}
        <Link href="/docs" className="block group mb-7">
          <p className="text-neutral-900 text-sm font-semibold tracking-tight group-hover:text-[#065f4a] transition-colors">
            CGIAR PDF Generator
          </p>
          <p className="text-neutral-400 text-xs mt-0.5">Documentation</p>
        </Link>

        {/* Grouped nav */}
        <nav className="space-y-6">
          {docsNav.map((group) => (
            <div key={group.title}>
              <p className="text-neutral-400 text-[10px] uppercase tracking-wider font-semibold mb-2 px-2">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={
                          active
                            ? "flex items-center rounded-md border-l-2 border-[#11d4b3] bg-[#065f4a]/5 px-2 py-1.5 text-xs font-medium text-[#065f4a]"
                            : "flex items-center rounded-md border-l-2 border-transparent px-2 py-1.5 text-xs text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
                        }
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
