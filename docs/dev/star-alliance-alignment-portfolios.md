# STAR Alliance Alignment: portfolios × indicators

## Summary

The shared STAR section `shared/sections/alliance_alignment/` now follows STAR's portfolio logic.
Because the section is shared, every STAR PDF that uses it (cap_sharing, inn_dev and any later ones) gets the change.

- The **portfolio** comes from the JSON (`portfolio.id`, or the aliases `portfolio_id` / `portfolioId`). STAR works it out from the report year and the `portfolios` table, so **no years are hardcoded**. `2` gives the P2 view. Any other value, or no value, gives the P1 view (same rule as the STAR client).
- The **indicator** (`indicator_id`) turns blocks on and off, using the matrix below.
- Portfolio `start_year` and `end_year`, when both are sent, show as a "Portfolio 2026–2030" tag next to **Reporting year** in General Information. The portfolio name is not shown. The templates pass `getPortfolioLabel(alliance_alignment)` to `GeneralInformationSection`. Before 2026-11-13 the tag sat next to the Alliance Alignment title.

Source of business rules: `alliance-alignment-context.md` (ARI repo, branch `fix-testing`, 2026-11-11), plus the STAR client's `alliance-lever-card` and `portfolio-2-alignment.mapper.ts` (real field names).

## Visibility matrix (implemented in `rules.ts`)

| Block | P1 | P2 |
|---|---|---|
| Contributing Projects | always | always |
| Primary Levers | always | — |
| Contributing Levers ("Other Contributing Levers" in OICR) | always | — |
| ↳ Strategic Outcome(s) | OICR, primary lever, not lever 9 "Other" | — |
| ↳ SDG target(s) | OICR | — |
| Research Areas | — | always |
| Strategic Objectives | — | always |
| Impact Outcomes | — | indicators 4, 5, 6 |
| SDG Targets (result level, grouped by SDG) | — | OICR |
| Contribution to SDG | all except OICR | all except OICR |

A block that does not apply is ignored even when the backend sends its data.

## Payload (accepted shapes)

- Levers and Research Areas: `icon` or `lever_url` (S3 URL). Title is `short_name - other_names`; `full_name` or `description` is shown as a subtitle. The "Other" lever (P1 `lever_id` 9, P2 18) shows the same way as in STAR: title `{custom_lever_name} (Other)` (or "Other" with no custom name) and the STAR icon `images/levers/other.png` when the payload has no icon.
- Strategic outcomes: `strategic_outcome: "SO1: text"` (split on the first `:`). The legacy `name` + `description` shape also works.
- SDG targets: `sdg_target_code`, `sdg_target` and `clarisa_sdg { icon, short_name, color }`. The legacy `target` + `description` shape also works. If a target has no icon, it is looked up in `result_sdgs`.
- SDGs: the CLARISA shape. `short_name` "Goal 2: Zero Hunger" renders as "SDG 2 · Zero Hunger", and `full_name` is the description. The code uses `color`.
- P2 lists: `research_areas`, `strategic_objectives` / `result_strategic_objectives`, `impact_outcomes` / `result_impact_outcomes`, `result_sdg_targets` / `sdg_targets`.
- Contracts: flat, or nested under `agresso_contract`.
- Images show only when there is a URL. Without one, the card renders with no image.

Full field docs: `alliance_alignment` in `star/cap_sharing/payload-guide.json` and `star/inn_dev/payload-guide.json`.

## What changed

- `types.ts`: new payload fields (portfolio, P2 lists, STAR field aliases) and the display models (`AllianceAlignmentView`).
- `rules.ts`: rewritten. It resolves portfolio and indicator, holds the applicability helpers, and the defensive normalizers (null, wrong types, nested rows). `getAllianceAlignmentView()` is the single entry point for the component.
- `alliance-alignment-section.tsx`: the P1 and P2 bodies, lever cards with OICR details, catalog cards (SO and IO), SDG target group cards and SDG cards. It uses the existing STAR tokens and components.
- Demos: `demos/{p1-oicr,p1-innovation-dev,p2-oicr,p2-policy-change,p2-cap-sharing}.demo.json`. They use real CLARISA SDG and target data. The P2 research area, objective and outcome names are illustrative.
- `cap_sharing/template.demo.json` now uses P2 with indicator 1. `inn_dev/template.demo.json` now uses P1 with indicator 2. Only the `alliance_alignment` key changed.

## Validation

- `tsc --noEmit` and `eslint` pass on the section.
- Robustness script: `null`, strings, `{}`, wrong-type arrays, empty items, and an unknown portfolio 3 (falls back to P1) all render or hide without crashing.
- Screenshots of all five variants are in `.playwright-screenshots/aa-*.png`.
- Local dev note: Turbopack picks `/Users/dzuniga` as the workspace root because of a stray `~/package-lock.json`, and then cannot resolve `tailwindcss`. Run `npx next dev --webpack`, or delete that lockfile.

## Open items

- Required fields with no data are **hidden**, which matches the existing STAR empty-section guards. STAR's report view prints "Not provided" for them instead. Decide whether the PDF should do the same.
- Confirm with the backend that the PDF payload includes `portfolio` (or `portfolio_id`) and the P2 lists with the S3 `icon` URLs for Research Areas, Strategic Objectives and Impact Outcomes.
