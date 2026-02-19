"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

// ── Configuration ──

interface PaginationConfig {
  /** Height of the footer element on each page (px) */
  footerHeight: number;
  /** Top margin on each page — breathing room after page cut (px) */
  marginTop: number;
  /** Bottom margin before footer — space between content and footer (px) */
  marginBottom: number;
  /** Override for the first page (header already provides spacing) */
  firstPage?: {
    marginTop?: number;
  };
}

const DEFAULT_CONFIG: PaginationConfig = {
  footerHeight: 40,
  marginTop: 15,
  marginBottom: 10,
  firstPage: {
    marginTop: 0,
  },
};

// ── Component ──

interface PaginatorProps {
  children: ReactNode;
  className?: string;
  config?: Partial<PaginationConfig>;
}

export function Paginator({
  children,
  className,
  config: configOverride,
}: PaginatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const paperHeight = Number(searchParams.get("paperHeight")) || 0;
  const debug = searchParams.get("debug") === "true";

  const config: PaginationConfig = {
    ...DEFAULT_CONFIG,
    ...configOverride,
    firstPage: { ...DEFAULT_CONFIG.firstPage, ...configOverride?.firstPage },
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !paperHeight) return;

    const timer = setTimeout(() => {
      paginate(container, paperHeight, config);
      if (debug) drawDebugLines(container, paperHeight, config);
    }, 500);

    return () => clearTimeout(timer);
  }, [paperHeight, debug]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// ── Layout helpers ──

function getContentStart(page: number, ph: number, c: PaginationConfig): number {
  if (page === 0) return c.firstPage?.marginTop ?? c.marginTop;
  return page * ph + c.marginTop;
}

function getSafeZoneEnd(page: number, ph: number, c: PaginationConfig): number {
  return (page + 1) * ph - c.footerHeight - c.marginBottom;
}

function getFooterY(page: number, ph: number, c: PaginationConfig): number {
  return (page + 1) * ph - c.footerHeight;
}

function findPageRoot(container: HTMLElement): HTMLElement {
  return (container.closest("[style*='width']") as HTMLElement) || document.body;
}

// ── Core pagination ──

function paginate(container: HTMLElement, paperHeight: number, config: PaginationConfig) {
  // Cleanup previous run
  container.querySelectorAll("[data-paginator-spacer]").forEach((el) => el.remove());
  document.querySelectorAll("[data-paginator-footer]").forEach((el) => el.remove());
  container.style.paddingBottom = "";

  const pageRoot = findPageRoot(container);
  const pageRootTop = pageRoot.getBoundingClientRect().top + window.scrollY;
  const gap = parseFloat(getComputedStyle(container).gap) || 0;

  // Phase 1: Process content — push overflowing elements, split tables
  processContent(container, pageRootTop, paperHeight, config, gap);

  // Phase 2: Kill padding-bottom so it doesn't add space after our calculation
  container.style.paddingBottom = "0";

  // Phase 3: Calculate total pages & place absolute footers
  const totalPages = Math.ceil(pageRoot.scrollHeight / paperHeight);
  placeFooters(pageRoot, totalPages, paperHeight, config);

  // Phase 4: Pad to exact multiple of paperHeight
  const target = totalPages * paperHeight;
  const current = pageRoot.scrollHeight;
  if (current < target) {
    const filler = document.createElement("div");
    filler.setAttribute("data-paginator-spacer", "filler");
    filler.style.height = `${target - current}px`;
    container.appendChild(filler);
  }
}

// ── Content processing (overflow detection + section breaking + table splitting) ──

function processContent(
  container: HTMLElement,
  pageRootTop: number,
  paperHeight: number,
  config: PaginationConfig,
  gap: number,
) {
  let cursor = 0;
  let safety = 500;

  while (cursor < container.children.length && safety-- > 0) {
    const child = container.children[cursor] as HTMLElement;

    // Skip our own spacers / continuations
    if (child.hasAttribute("data-paginator-spacer")) {
      cursor++;
      continue;
    }

    const rect = child.getBoundingClientRect();
    const top = rect.top + window.scrollY - pageRootTop;
    const bottom = rect.bottom + window.scrollY - pageRootTop;
    const page = Math.floor(top / paperHeight);
    const safeEnd = getSafeZoneEnd(page, paperHeight, config);

    // Element fits — move on
    if (bottom <= safeEnd) {
      cursor++;
      continue;
    }

    // ── Overflow detected ──
    // Strategy: dig into the section's internal children to find the
    // exact element that crosses the boundary, then either:
    //   a) Break the section there (move overflow children to next page)
    //   b) Split a table at the row level
    //   c) Last resort — push the entire section to next page

    const resolved = resolveOverflow(
      child, safeEnd, page, paperHeight, config, pageRootTop, gap, container,
    );

    if (resolved) {
      cursor += resolved; // skip original section + spacer (+ continuation)
      continue;
    }

    // Last resort: push entire element to next page
    const nextStart = getContentStart(page + 1, paperHeight, config);
    const spacerHeight = nextStart - top - gap;

    if (spacerHeight > 0) {
      const spacer = document.createElement("div");
      spacer.setAttribute("data-paginator-spacer", "push");
      spacer.style.cssText = `height:${spacerHeight}px; flex-shrink:0;`;
      child.parentNode?.insertBefore(spacer, child);
      cursor++; // skip the spacer
    }

    cursor++;
  }
}

/**
 * Tries to resolve an overflow by looking INSIDE the section:
 *  1. Walk the section's direct children
 *  2. Find which internal child crosses safeEnd
 *  3. If there are children before it that fit → break the section there
 *  4. If the crossing child contains a table → split the table
 *  5. Returns the number of cursor positions to skip, or 0 if unresolved
 */
function resolveOverflow(
  section: HTMLElement,
  safeEnd: number,
  page: number,
  paperHeight: number,
  config: PaginationConfig,
  pageRootTop: number,
  gap: number,
  container: HTMLElement,
): number {
  const innerChildren = Array.from(section.children) as HTMLElement[];
  if (innerChildren.length < 2) {
    // Section has 0-1 children — check if that child has a table to split
    const table = section.querySelector("table");
    if (table) {
      const didSplit = splitTable(section, table, safeEnd, page, paperHeight, config, pageRootTop, gap);
      if (didSplit) return 3; // section + spacer + continuation
    }
    return 0;
  }

  // Find the internal child that crosses safeEnd
  let crossIndex = -1;
  for (let i = 0; i < innerChildren.length; i++) {
    const childBottom =
      innerChildren[i].getBoundingClientRect().bottom + window.scrollY - pageRootTop;
    if (childBottom > safeEnd) {
      crossIndex = i;
      break;
    }
  }

  if (crossIndex < 0) return 0; // shouldn't happen

  // If there are children before the crossing one that fit,
  // break the section: move crossIndex+ to a continuation wrapper on next page
  if (crossIndex > 0) {
    return breakSection(section, innerChildren, crossIndex, page, paperHeight, config, pageRootTop, gap);
  }

  // The FIRST internal child itself overflows — try table splitting on it
  const crossingChild = innerChildren[0];
  const table =
    crossingChild.tagName === "TABLE"
      ? crossingChild
      : crossingChild.querySelector("table");

  if (table) {
    const spaceAvailable = safeEnd - (crossingChild.getBoundingClientRect().top + window.scrollY - pageRootTop);
    if (spaceAvailable > 80) {
      const didSplit = splitTable(section, table, safeEnd, page, paperHeight, config, pageRootTop, gap);
      if (didSplit) return 3;
    }
  }

  return 0; // couldn't resolve — caller will push entire section
}

/**
 * Breaks a section by moving internal children from `breakIndex` onward
 * into a new wrapper element on the next page.
 * Returns cursor skip count (3: original section + spacer + wrapper).
 */
function breakSection(
  section: HTMLElement,
  innerChildren: HTMLElement[],
  breakIndex: number,
  page: number,
  paperHeight: number,
  config: PaginationConfig,
  pageRootTop: number,
  gap: number,
): number {
  // Create wrapper that inherits no special styling (children have their own)
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-paginator-spacer", "section-continuation");

  // Move children from breakIndex onward into wrapper (reverse order to maintain sequence)
  for (let i = innerChildren.length - 1; i >= breakIndex; i--) {
    wrapper.insertBefore(innerChildren[i], wrapper.firstChild);
  }

  // Calculate spacer to bridge to next page content start
  const nextStart = getContentStart(page + 1, paperHeight, config);
  const sectionBottom =
    section.getBoundingClientRect().bottom + window.scrollY - pageRootTop;
  const spacerHeight = nextStart - sectionBottom - 2 * gap;

  const spacer = document.createElement("div");
  spacer.setAttribute("data-paginator-spacer", "section-break");
  spacer.style.cssText = `height:${Math.max(0, spacerHeight)}px; flex-shrink:0;`;

  // Insert after section: section → spacer → continuation wrapper
  section.after(spacer);
  spacer.after(wrapper);

  return 3; // skip: section(1) + spacer(1) + wrapper will be checked on next iteration
}

// ── Table splitting ──

function splitTable(
  sectionEl: HTMLElement,
  tableEl: HTMLElement,
  safeEnd: number,
  page: number,
  paperHeight: number,
  config: PaginationConfig,
  pageRootTop: number,
  gap: number,
): boolean {
  const thead = tableEl.querySelector("thead");
  const tbody = tableEl.querySelector("tbody") || tableEl;
  const rows = Array.from(tbody.querySelectorAll(":scope > tr")) as HTMLElement[];

  if (rows.length < 2) return false;

  // Find the last row that fits before safeEnd
  let splitIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const rowBottom = rows[i].getBoundingClientRect().bottom + window.scrollY - pageRootTop;
    if (rowBottom > safeEnd) {
      splitIndex = i;
      break;
    }
  }

  // Can't split if the very first row overflows
  if (splitIndex <= 0) return false;

  // Build continuation table: clone table + thead, move overflow rows
  const cloneTable = tableEl.cloneNode(false) as HTMLElement;
  if (thead) cloneTable.appendChild(thead.cloneNode(true));
  const cloneTbody = document.createElement("tbody");

  // Move rows from splitIndex onward into the clone (mutates original table)
  for (let i = rows.length - 1; i >= splitIndex; i--) {
    cloneTbody.insertBefore(rows[i], cloneTbody.firstChild);
  }
  cloneTable.appendChild(cloneTbody);

  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-paginator-spacer", "table-continuation");
  wrapper.appendChild(cloneTable);

  // Spacer: bridge from section bottom to next page content start
  // Subtract 2 gaps (spacer + wrapper add 2 new flex children)
  const nextStart = getContentStart(page + 1, paperHeight, config);
  const sectionBottom = sectionEl.getBoundingClientRect().bottom + window.scrollY - pageRootTop;
  const spacerHeight = nextStart - sectionBottom - 2 * gap;

  const spacer = document.createElement("div");
  spacer.setAttribute("data-paginator-spacer", "table-split");
  spacer.style.cssText = `height:${Math.max(0, spacerHeight)}px; flex-shrink:0;`;

  // Insert: section → spacer → continuation
  sectionEl.after(spacer);
  spacer.after(wrapper);

  return true;
}

// ── Footer placement (absolute positioned on page root) ──

function placeFooters(
  pageRoot: HTMLElement,
  totalPages: number,
  paperHeight: number,
  config: PaginationConfig,
) {
  if (getComputedStyle(pageRoot).position === "static") {
    pageRoot.style.position = "relative";
  }

  for (let page = 0; page < totalPages; page++) {
    const y = getFooterY(page, paperHeight, config);

    const footer = document.createElement("div");
    footer.setAttribute("data-paginator-footer", String(page + 1));
    footer.style.cssText = `
      position: absolute;
      top: ${y}px;
      left: 0;
      right: 0;
      height: ${config.footerHeight}px;
      display: flex;
      align-items: flex-end;
      padding: 0 43px 8px;
      font-family: 'Noto Sans', Arial, Helvetica, sans-serif;
      font-size: 7px;
      color: #818181;
      z-index: 100;
    `;
    footer.innerHTML = `
      <div style="border-top: 1px solid #e2e0df; padding-top: 6px; display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span style="color: #065f4a; font-weight: 500;">CGIAR Results Framework</span>
        <span>Page ${page + 1} of ${totalPages}</span>
      </div>
    `;

    pageRoot.appendChild(footer);
  }
}

// ── Debug overlay ──

function drawDebugLines(
  container: HTMLElement,
  paperHeight: number,
  config: PaginationConfig,
) {
  document.querySelectorAll("[data-paginator-debug]").forEach((el) => el.remove());

  const pageRoot = findPageRoot(container);
  const totalPages = Math.ceil(pageRoot.scrollHeight / paperHeight);

  if (getComputedStyle(pageRoot).position === "static") {
    pageRoot.style.position = "relative";
  }

  for (let page = 0; page < totalPages; page++) {
    // Red dashed — page cut
    if (page < totalPages - 1) {
      const y = (page + 1) * paperHeight;
      const line = document.createElement("div");
      line.setAttribute("data-paginator-debug", "cut");
      line.style.cssText = `
        position:absolute; top:${y}px; left:0; right:0;
        border-top:2px dashed red; z-index:9999; pointer-events:none;
      `;
      const label = document.createElement("span");
      label.style.cssText = `
        position:absolute; top:-14px; right:20px;
        background:red; color:white; font-size:9px;
        padding:1px 6px; border-radius:2px; font-family:monospace;
      `;
      label.textContent = `CUT ${(page + 1) * paperHeight}px`;
      line.appendChild(label);
      pageRoot.appendChild(line);
    }

    // Orange zone — footer + margin area (no content here)
    const zoneTop = getSafeZoneEnd(page, paperHeight, config);
    const zoneBottom = (page + 1) * paperHeight;
    const zone = document.createElement("div");
    zone.setAttribute("data-paginator-debug", "zone");
    zone.style.cssText = `
      position:absolute; top:${zoneTop}px; left:0; right:0;
      height:${zoneBottom - zoneTop}px;
      background:rgba(255,140,0,0.12); border-top:1px dashed orange;
      z-index:9998; pointer-events:none;
    `;
    const zLabel = document.createElement("span");
    zLabel.style.cssText = `
      position:absolute; top:-14px; left:20px;
      background:orange; color:white; font-size:9px;
      padding:1px 6px; border-radius:2px; font-family:monospace;
    `;
    zLabel.textContent = `FOOTER ZONE p${page + 1}`;
    zone.appendChild(zLabel);
    pageRoot.appendChild(zone);

    // Green dashed — content start (pages > 0)
    if (page > 0) {
      const cs = getContentStart(page, paperHeight, config);
      const marker = document.createElement("div");
      marker.setAttribute("data-paginator-debug", "start");
      marker.style.cssText = `
        position:absolute; top:${cs}px; left:0; right:0;
        border-top:1px dashed #065f4a; z-index:9999; pointer-events:none;
      `;
      const mLabel = document.createElement("span");
      mLabel.style.cssText = `
        position:absolute; top:2px; left:20px;
        background:#065f4a; color:white; font-size:9px;
        padding:1px 6px; border-radius:2px; font-family:monospace;
      `;
      mLabel.textContent = `CONTENT START p${page + 1}`;
      marker.appendChild(mLabel);
      pageRoot.appendChild(marker);
    }
  }
}
