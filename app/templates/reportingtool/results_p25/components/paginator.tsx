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
  const noPaginate = searchParams.get("noPaginate") === "true";

  const config: PaginationConfig = {
    ...DEFAULT_CONFIG,
    ...configOverride,
    firstPage: { ...DEFAULT_CONFIG.firstPage, ...configOverride?.firstPage },
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !paperHeight || noPaginate) return;

    const timer = setTimeout(() => {
      paginate(container, paperHeight, config);
      if (debug) drawDebugLines(container, paperHeight, config);
    }, 500);

    return () => clearTimeout(timer);
  }, [paperHeight, debug, noPaginate]);

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

  // Walk all leaf content blocks in the DOM tree and push any that
  // cross a footer zone to the next page. Multi-pass handles
  // table-split continuations and cascading shifts.
  let safety = 10;
  while (safety-- > 0) {
    if (!processPass(container, pageRootTop, paperHeight, config)) break;
  }

  // Kill padding-bottom so it doesn't add space after our calculation
  container.style.paddingBottom = "0";

  // Place absolute footers
  const totalPages = Math.ceil(pageRoot.scrollHeight / paperHeight);
  placeFooters(pageRoot, totalPages, paperHeight, config);

  // Pad to exact multiple of paperHeight
  const target = totalPages * paperHeight;
  const current = pageRoot.scrollHeight;
  if (current < target) {
    const filler = document.createElement("div");
    filler.setAttribute("data-paginator-spacer", "filler");
    filler.style.height = `${target - current}px`;
    container.appendChild(filler);
  }
}

// ── Block collection ──

/**
 * Walks the DOM tree inside `container` and collects "content blocks" —
 * the granular elements that should be checked for page breaks.
 *
 *   - Recurses into plain wrapper divs (no background, border, shadow)
 *   - Stops at styled blocks (cards, colored divs) → atomic
 *   - Stops at non-div elements (tables, headings, paragraphs) → atomic
 *   - Stops at leaf elements (no children) → atomic
 *
 * Returns blocks in document order (top-to-bottom).
 */
function collectBlocks(container: HTMLElement): HTMLElement[] {
  const blocks: HTMLElement[] = [];

  function walk(el: HTMLElement) {
    if (
      el.hasAttribute("data-paginator-spacer") ||
      el.hasAttribute("data-paginator-footer")
    ) return;

    const children = Array.from(el.children).filter(
      (c): c is HTMLElement => c instanceof HTMLElement,
    );

    // No element children → leaf block
    if (children.length === 0) {
      if (el !== container) blocks.push(el);
      return;
    }

    // Plain wrapper → recurse into children
    if (el === container || isPlainWrapper(el)) {
      for (const child of children) walk(child);
      return;
    }

    // Styled / semantic block → treat as atomic unit
    blocks.push(el);
  }

  walk(container);
  return blocks;
}

/** A plain wrapper is a div/section/article with no visual styling. */
function isPlainWrapper(el: HTMLElement): boolean {
  const tag = el.tagName;
  if (tag !== "DIV" && tag !== "SECTION" && tag !== "ARTICLE") return false;

  const s = getComputedStyle(el);
  const bg = s.backgroundColor;
  if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return false;
  if (s.borderTopWidth !== "0px" || s.borderBottomWidth !== "0px") return false;
  if (s.boxShadow !== "none") return false;

  return true;
}

// ── Single processing pass ──

/**
 * One pass over all content blocks. For each block that extends past
 * the safe zone, either split the table or push it to the next page.
 * Returns true if any DOM changes were made (caller should re-run).
 */
function processPass(
  container: HTMLElement,
  pageRootTop: number,
  paperHeight: number,
  config: PaginationConfig,
): boolean {
  const blocks = collectBlocks(container);
  let changed = false;

  for (const block of blocks) {
    if (!block.isConnected) continue;

    const rect = block.getBoundingClientRect();
    const top = rect.top + window.scrollY - pageRootTop;
    const bottom = rect.bottom + window.scrollY - pageRootTop;
    const page = Math.floor(top / paperHeight);
    const safeEnd = getSafeZoneEnd(page, paperHeight, config);

    // Fits on its page — skip
    if (bottom <= safeEnd) continue;

    // Element taller than usable area AND already at page start — skip
    // (nothing we can do, it'll overflow regardless)
    const contentStart = getContentStart(page, paperHeight, config);
    const usableHeight = safeEnd - contentStart;
    if (rect.height > usableHeight && top - contentStart < 5) continue;

    // Try table splitting for TABLE elements
    if (block.tagName === "TABLE") {
      const spaceAvailable = safeEnd - top;
      if (spaceAvailable > 80) {
        if (splitTable(block, safeEnd, page, paperHeight, config, pageRootTop)) {
          changed = true;
          continue;
        }
      }
    }

    // Push to next page
    const nextStart = getContentStart(page + 1, paperHeight, config);
    const parentGap =
      parseFloat(getComputedStyle(block.parentElement!).gap) || 0;
    const spacerHeight = nextStart - top - parentGap;

    if (spacerHeight > 0) {
      const spacer = document.createElement("div");
      spacer.setAttribute("data-paginator-spacer", "push");
      spacer.style.cssText = `height:${spacerHeight}px; flex-shrink:0;`;
      block.parentNode?.insertBefore(spacer, block);
      changed = true;
    }
  }

  return changed;
}

// ── Table splitting ──

function splitTable(
  tableEl: HTMLElement,
  safeEnd: number,
  page: number,
  paperHeight: number,
  config: PaginationConfig,
  pageRootTop: number,
): boolean {
  const thead = tableEl.querySelector("thead");
  const tbody = tableEl.querySelector("tbody") || tableEl;
  const rows = Array.from(tbody.querySelectorAll(":scope > tr")) as HTMLElement[];

  if (rows.length < 2) return false;

  // Find the first row that overflows
  let splitIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const rowBottom =
      rows[i].getBoundingClientRect().bottom + window.scrollY - pageRootTop;
    if (rowBottom > safeEnd) {
      splitIndex = i;
      break;
    }
  }

  if (splitIndex <= 0) return false;

  // Build continuation table: clone structure + thead, move overflow rows
  const cloneTable = tableEl.cloneNode(false) as HTMLElement;
  if (thead) cloneTable.appendChild(thead.cloneNode(true));
  const cloneTbody = document.createElement("tbody");

  for (let i = rows.length - 1; i >= splitIndex; i--) {
    cloneTbody.insertBefore(rows[i], cloneTbody.firstChild);
  }
  cloneTable.appendChild(cloneTbody);

  // Spacer to bridge to next page content start
  const nextStart = getContentStart(page + 1, paperHeight, config);
  const tableBottom =
    tableEl.getBoundingClientRect().bottom + window.scrollY - pageRootTop;
  const parentGap =
    parseFloat(getComputedStyle(tableEl.parentElement!).gap) || 0;
  const spacerHeight = nextStart - tableBottom - parentGap;

  const spacer = document.createElement("div");
  spacer.setAttribute("data-paginator-spacer", "table-split");
  spacer.style.cssText = `height:${Math.max(0, spacerHeight)}px; flex-shrink:0;`;

  // Insert: table → spacer → continuation table
  tableEl.after(spacer);
  spacer.after(cloneTable);

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
