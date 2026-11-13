# Paginator: orphaned section headings

## Problem

In the STAR Innovation PDF, the "Innovation Details" title sometimes stayed alone at the bottom of a page while its content started on the next page.

## Cause

The orphan check in `paginator.tsx` only looked at the **direct previous sibling** of the overflowing block. The section is laid out like this:

```
<section>
  <h2>Innovation Details</h2>
  <div>                      ← plain wrapper (recursed into)
    <p>Short title …</p>     ← first collected block, has no previous sibling
    …
```

When `Short title` (or the next row) overflowed, the paginator found no previous sibling, or only a sibling row. The `<h2>` outside the wrapper was never pulled along.

## Fix (`app/templates/reportingtool/shared/components/paginator.tsx`)

- `getPreviousContentNode`: when the block is the first content child of its wrapper, it climbs up and returns the wrapper's previous sibling.
- `getPushTarget`: pulls up to `MAX_ORPHAN_PULLS` (3) small blocks (< `ORPHAN_MAX_HEIGHT`, 30px) on the same page before the overflowing block. The heading always moves with at least the first row of its content.
- Big previous blocks (≥ 30px, e.g. a whole previous section or a card) stop the climb, so unrelated content is never pulled.

## Scope: STAR only

The paginator is shared with templates we don't maintain (PRMS / reportingtool). To avoid changing them, the new rule runs only when `config.footerVariant === "star"`, which only the STAR `PageShell` sets. Every other template uses `getLegacyPushTarget`, the original single-sibling logic, copied verbatim.

## Validation

- `tsc --noEmit` passes. `eslint` shows only the existing `useEffect` deps warning.
- Headless Chrome check (CDP script). For every `h2` / uppercase subsection label, it compares the page of the heading with the page of the first text after it, at paperHeight 600–900:
  - **Old paginator** (`cap_sharing` demo): orphans at 600, 750, 800, 842 and 900. Examples: "Research Areas (p1 → p2)" at 842, plus "Results Partners", "IP Rights", "Evidence" and "Contribution to SDG".
  - **New paginator**: no orphans in `cap_sharing` or `inn_dev`.
  - **PRMS unchanged**: on `results_p25` at paperHeight 600, 700, 842 and 900, the spacers the paginator inserts are byte-identical between the original paginator and the STAR-scoped version.
