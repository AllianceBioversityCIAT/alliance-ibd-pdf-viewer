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

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !paperHeight) return;

    // Wait for images/fonts to load and layout to stabilize
    const timer = setTimeout(() => {
      paginate(container, paperHeight, footerHeight);
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

  const usable = paperHeight - footerHeight;
  const containerTop =
    container.getBoundingClientRect().top + window.scrollY;

  const children = Array.from(container.children) as HTMLElement[];
  if (children.length === 0) return;

  // Measure all children (positions before any modification)
  const items = children.map((child) => {
    const rect = child.getBoundingClientRect();
    return {
      element: child,
      relativeTop: rect.top + window.scrollY - containerTop,
      height: rect.height,
    };
  });

  // Calculate page breaks
  // `shift` tracks the cumulative height of spacers we plan to insert,
  // so we can predict where each element will ACTUALLY end up.
  let shift = 0;

  interface PageBreak {
    beforeElement: HTMLElement;
    spacerHeight: number;
    pageNumber: number;
  }
  const breaks: PageBreak[] = [];

  for (const item of items) {
    const absTop = containerTop + item.relativeTop + shift;
    const absBottom = absTop + item.height;

    const page = Math.floor(absTop / paperHeight);
    const pageUsableEnd = page * paperHeight + usable;

    // Does element overflow into the footer zone?
    if (absBottom > pageUsableEnd) {
      // Element taller than usable area — can't move it, let it overflow
      if (item.height > usable) continue;

      const nextPageStart = (page + 1) * paperHeight;
      const spacerHeight = nextPageStart - absTop;

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
  const lastAbsBottom =
    containerTop + lastItem.relativeTop + lastItem.height + shift;
  const totalPages = Math.ceil(lastAbsBottom / paperHeight);

  // Insert spacers from bottom to top (so DOM indices stay valid)
  for (let i = breaks.length - 1; i >= 0; i--) {
    const b = breaks[i];
    const spacer = createSpacer(b.spacerHeight, b.pageNumber, totalPages, footerHeight);
    b.beforeElement.parentNode?.insertBefore(spacer, b.beforeElement);
  }

  // Final footer on the last page
  const finalContentEnd =
    containerTop + lastItem.relativeTop + lastItem.height + shift;
  const finalPageEnd = totalPages * paperHeight;
  const finalGap = finalPageEnd - finalContentEnd;

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
