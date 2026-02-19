"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

interface PaginatorProps {
  children: ReactNode;
  className?: string;
  /** Height reserved for the footer zone at the bottom of each page (px) */
  footerHeight?: number;
}

/**
 * Client-side pagination component for Gotenberg PDF generation.
 *
 * Reads `paperHeight` from the URL search params. If present, it:
 * 1. Measures all direct children after mount
 * 2. Calculates which elements would be split by a page break
 * 3. Inserts spacer zones (with a footer) to push those elements to the next page
 *
 * Result: total rendered height is always an exact multiple of paperHeight,
 * so Gotenberg's page slicing aligns perfectly with our custom footers.
 *
 * If paperHeight is not set, renders children as-is (no pagination).
 */
export function Paginator({
  children,
  className,
  footerHeight = 40,
}: PaginatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const paperHeight = Number(searchParams.get("paperHeight")) || 0;
  const debug = searchParams.get("debug") === "true";

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !paperHeight) return;

    // Wait for images/fonts to load and layout to stabilize
    const timer = setTimeout(() => {
      paginate(container, paperHeight, footerHeight);
      if (debug) drawDebugLines(container, paperHeight, footerHeight);
    }, 500);

    return () => clearTimeout(timer);
  }, [paperHeight, footerHeight]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// ── Pagination algorithm ──

function paginate(
  container: HTMLElement,
  paperHeight: number,
  footerHeight: number,
) {
  // Clean previous pagination spacers
  container
    .querySelectorAll("[data-paginator-spacer]")
    .forEach((el) => el.remove());

  // Reset padding that might have been zeroed in a previous run
  container.style.paddingBottom = "";

  const usable = paperHeight - footerHeight;

  // Get absolute position of the PAGE root (the outermost wrapper)
  // This is the ancestor that Gotenberg slices — typically the <div style="width:…">
  // We walk up to find the first positioned ancestor or the body.
  const pageRoot = container.closest("[style*='width']") || document.body;
  const pageRootTop = pageRoot.getBoundingClientRect().top + window.scrollY;

  const children = Array.from(container.children) as HTMLElement[];
  if (children.length === 0) return;

  // Measure all children using absolute document positions
  const items = children.map((child) => {
    const rect = child.getBoundingClientRect();
    return {
      element: child,
      absTop: rect.top + window.scrollY - pageRootTop,
      height: rect.height,
    };
  });

  // Calculate page breaks
  // `shift` tracks the cumulative height of planned spacers,
  // so we can predict where each element will ACTUALLY end up.
  let shift = 0;

  interface PageBreak {
    beforeElement: HTMLElement;
    spacerHeight: number;
    pageNumber: number;
  }
  const breaks: PageBreak[] = [];

  for (const item of items) {
    const top = item.absTop + shift;
    const bottom = top + item.height;

    const page = Math.floor(top / paperHeight);
    const pageUsableEnd = page * paperHeight + usable;

    // Does element overflow into the footer zone?
    if (bottom > pageUsableEnd) {
      // Element taller than usable area — can't move it, let it overflow
      if (item.height > usable) continue;

      const nextPageStart = (page + 1) * paperHeight;
      const spacerHeight = nextPageStart - top;

      breaks.push({
        beforeElement: item.element,
        spacerHeight,
        pageNumber: page + 1,
      });

      shift += spacerHeight;
    }
  }

  // Calculate total pages based on final content extent
  const lastItem = items[items.length - 1];
  const lastAbsBottom = lastItem.absTop + lastItem.height + shift;
  const totalPages = Math.ceil(lastAbsBottom / paperHeight);

  // Insert spacers from bottom to top (so DOM indices stay valid)
  for (let i = breaks.length - 1; i >= 0; i--) {
    const b = breaks[i];
    const spacer = createSpacer(b.spacerHeight, b.pageNumber, totalPages, footerHeight);
    b.beforeElement.parentNode?.insertBefore(spacer, b.beforeElement);
  }

  // Remove container padding-bottom so it doesn't push past our exact calculation
  container.style.paddingBottom = "0";

  // Measure the ACTUAL final position after DOM changes
  const allChildren = Array.from(container.children) as HTMLElement[];
  const lastChild = allChildren[allChildren.length - 1];
  const lastChildRect = lastChild.getBoundingClientRect();
  const actualContentEnd =
    lastChildRect.bottom + window.scrollY - pageRootTop;

  const finalPageEnd = totalPages * paperHeight;
  const finalGap = finalPageEnd - actualContentEnd;

  if (finalGap > 0) {
    const finalSpacer = createSpacer(
      finalGap,
      totalPages,
      totalPages,
      footerHeight,
    );
    container.appendChild(finalSpacer);
  }
}

// ── Footer element creation ──

function createSpacer(
  height: number,
  pageNumber: number,
  totalPages: number,
  footerHeight: number,
): HTMLElement {
  const spacer = document.createElement("div");
  spacer.setAttribute("data-paginator-spacer", "true");
  spacer.style.cssText = `
    height: ${height}px;
    position: relative;
    width: 100%;
    flex-shrink: 0;
  `;

  const footer = document.createElement("div");
  footer.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: ${footerHeight}px;
    display: flex;
    align-items: flex-end;
    padding: 0 43px 8px;
    font-family: 'Noto Sans', Arial, Helvetica, sans-serif;
    font-size: 7px;
    color: #818181;
  `;
  footer.innerHTML = `
    <div style="border-top: 1px solid #e2e0df; padding-top: 6px; display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <span style="color: #065f4a; font-weight: 500;">CGIAR Results Framework</span>
      <span>Page ${pageNumber} of ${totalPages}</span>
    </div>
  `;

  spacer.appendChild(footer);
  return spacer;
}

// ── Debug overlay ──

function drawDebugLines(
  container: HTMLElement,
  paperHeight: number,
  footerHeight: number,
) {
  // Remove previous debug lines
  document.querySelectorAll("[data-paginator-debug]").forEach((el) => el.remove());

  const pageRoot = container.closest("[style*='width']") || document.body;
  const pageRootTop = pageRoot.getBoundingClientRect().top + window.scrollY;
  const totalHeight = pageRoot.scrollHeight;
  const totalPages = Math.ceil(totalHeight / paperHeight);
  const usable = paperHeight - footerHeight;

  for (let page = 0; page < totalPages; page++) {
    const cutY = (page + 1) * paperHeight - pageRootTop;
    const footerStartY = page * paperHeight + usable - pageRootTop;

    // Page cut line (red dashed)
    if (page < totalPages - 1) {
      const cutLine = document.createElement("div");
      cutLine.setAttribute("data-paginator-debug", "cut");
      cutLine.style.cssText = `
        position: absolute;
        top: ${cutY}px;
        left: 0;
        right: 0;
        height: 0;
        border-top: 2px dashed red;
        z-index: 9999;
        pointer-events: none;
      `;
      const cutLabel = document.createElement("span");
      cutLabel.style.cssText = `
        position: absolute;
        top: -14px;
        right: 20px;
        background: red;
        color: white;
        font-size: 9px;
        padding: 1px 6px;
        border-radius: 2px;
        font-family: monospace;
      `;
      cutLabel.textContent = `CUT ${cutY + pageRootTop}px`;
      cutLine.appendChild(cutLabel);
      pageRoot.appendChild(cutLine);
    }

    // Footer zone (orange shaded area)
    const zoneHeight = footerHeight;
    const zone = document.createElement("div");
    zone.setAttribute("data-paginator-debug", "footer-zone");
    zone.style.cssText = `
      position: absolute;
      top: ${footerStartY}px;
      left: 0;
      right: 0;
      height: ${zoneHeight}px;
      background: rgba(255, 140, 0, 0.15);
      border-top: 1px dashed orange;
      z-index: 9998;
      pointer-events: none;
    `;
    const zoneLabel = document.createElement("span");
    zoneLabel.style.cssText = `
      position: absolute;
      top: -14px;
      left: 20px;
      background: orange;
      color: white;
      font-size: 9px;
      padding: 1px 6px;
      border-radius: 2px;
      font-family: monospace;
    `;
    zoneLabel.textContent = `FOOTER ZONE p${page + 1}`;
    zone.appendChild(zoneLabel);
    pageRoot.appendChild(zone);
  }

  // Ensure the page root is positioned for absolute children
  const rootStyle = window.getComputedStyle(pageRoot);
  if (rootStyle.position === "static") {
    (pageRoot as HTMLElement).style.position = "relative";
  }
}
