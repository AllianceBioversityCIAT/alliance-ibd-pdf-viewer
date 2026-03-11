# Development Log

Ongoing record of development changes for the CGIAR PDF Generator.

---

## QA Box refactor — Branch `pdf-pagination`

### Summary

Complete refactor of the **QA Box** component in the PRMS `results_p25` template. Moved from a model with hardcoded text and conditional logic scattered across the template, to a **data-driven** model where the backend sends a `qa_info` object with everything needed to render the Quality Assurance box.

### Design source (Figma)

**Reference frame:** [QA Scenarios — PRMS Reporting tool](https://www.figma.com/design/fLsTFcs0ERUG7fuiOjog5i/PRMS-Reporting-tool?node-id=23429-3023)

All badge assets and visual specs come from this frame. It contains 8 design variants (Cases 1–4D + QA in progress + Bilateral), of which **7 are implemented** (Case 5 - Bilateral excluded).

#### Figma → project asset mapping

| Figma asset ID | Local file | Badge | Notes |
|----------------|-----------|-------|-------|
| `75cc08c2-...` | `badge-two-assessors.png` | `two-assessors` | White shield, `filter: invert` applied |
| `1404ecd5-...` | `shield-badge.png` | `senior` | Gold shield (512x512), used as-is |
| `014cdcc8-...` | `badge-qa-in-progress.png` | `in-progress` | White hourglass, `filter: invert` applied |
| `2cd55175-...` | `figma-badge-kp.png` | `kp` | Hexagonal shape for KP (not yet integrated — CSS circle used) |
| `cec8ab5e-...` | `figma-badge-mqap.png` | `mqap` | Shape with checkmark for MQAP (not yet integrated — CSS circle used) |

> **KP/MQAP note:** Figma uses a shield/hexagonal shape as a CSS mask with "KP" text overlay. Current implementation uses a CSS circle with white border and "KP" text. Figma shapes were downloaded but **not yet integrated** — pending decision on whether to use Figma shapes or keep CSS circle.

### QA scenarios (scope)

**7 of 8** Figma scenarios implemented:

| # | Case | Badge | Applies to | Status |
|---|------|-------|-----------|--------|
| 1 | KP Center Manager | `kp` | Knowledge Products without QA Platform | Done |
| 2 | KP MQAP | `mqap` | Peer-reviewed Knowledge Products | Done |
| 3 | Two assessors | `two-assessors` | CapSharing, PolicyChange, OtherOutput, OtherOutcome | Done |
| 4 | Senior third party | `senior` | CapSharing, PolicyChange, OtherOutput, OtherOutcome (with adjustments) | Done |
| 4B | Senior (Innovation Dev) | `senior` | Innovation Development (readiness adjustment) | Done |
| 4C | Senior (Innovation Use) | `senior` | Innovation Use (readiness adjustment) | Done |
| 4D | Senior (confirmed) | `senior` | Innovations with confirmed readiness (no from→to, level only) | Done |
| — | QA in progress | `in-progress` | Any result undergoing QA | Done |
| ~~5~~ | ~~Bilateral~~ | ~~`bilateral`~~ | ~~Center-level QA~~ | **Excluded** |

### Changes

#### 1. New `QAInfo` interface (`types.ts`)

```ts
interface QAInfo {
  badge: string;        // "kp" | "mqap" | "two-assessors" | "senior" | "in-progress"
  title: string;        // Dynamic QA box title
  description: string;  // QA process description
  qa_url?: string;      // Optional link to CGIAR QA process
  adjustments_title?: string;   // Adjustments section title
  adjustments?: QAAdjustment[]; // Optional from → to adjustments
}
```

Added `qa_info?: QAInfo` to `PRMSResultData`.

#### 2. `qa-box.tsx` refactor

**Before:**
- Two separate components: `QABox` (standard) and `KPQABox` (Knowledge Products)
- Text, URLs, and titles **hardcoded** in JSX
- Readiness transition handled with separate props (`readinessTransition`, `adjustments`)
- Single badge visual (shield icon)

**After:**
- **Single `QABox` component** receiving `qaInfo: QAInfo`
- **Badge registry** (`BADGE_IMAGES`) mapping badge type to image and invert flag:
  - `two-assessors` → `badge-two-assessors.png` (inverted)
  - `senior` → `shield-badge.png`
  - `in-progress` → `badge-qa-in-progress.png` (inverted)
- **KP badge** rendered as CSS circle with "KP" text (for `badge === "kp"` or `"mqap"`)
- All content (title, description, URL, adjustments) comes from `qaInfo` prop — zero hardcoding
- `KPQABox` deleted entirely

Internal subcomponents:

| Component | Purpose |
|-----------|---------|
| `KPBadge` | White circle with "KP" text for Knowledge Products |
| `BadgeImage` | Renders badge image from `BADGE_IMAGES`, fallback to `shield-badge.png` |

#### 3. `template.tsx` simplification

**Before:** ~15 lines of conditional logic by `rt_id`
```tsx
{d?.rt_id === 6 ? <KPQABox /> : <QABox adjustments={...} readinessTransition={...} />}
```

**After:** Single line
```tsx
{d?.qa_info && <QABox qaInfo={d.qa_info} />}
```

#### 4. Updated demo data (`template.demo.json`)

Replaced `qa_adjustments` field with complete `qa_info` object.

#### 5. New file: `qa-scenarios.demo.json`

Catalog of all QA scenarios for testing (bilateral excluded).

#### 6. Assets (`public/assets/prms/`)

**Existing (confirmed identical to Figma):**
- `shield-badge.png` (512x512) — Gold shield for `senior`
- `badge-two-assessors.png` (88x88) — White shield for `two-assessors`
- `badge-qa-in-progress.png` (76x99) — Hourglass for `in-progress`

**Downloaded from Figma (pending integration):**
- `figma-badge-kp.png` (104x104) — Hexagonal/shield shape for KP
- `figma-badge-mqap.png` (102x102) — Shape with checkmark for MQAP

**Removed:** `badge-bilateral.png` — Case 5 Bilateral excluded from scope.

#### 7. `CLAUDE.md` updates

- Added "Defensive coding (CRITICAL)" section with null-safety patterns
- Updated QA Box documentation to reflect data-driven model
- Added Playwright screenshots rule

### Visual validation (Playwright)

All scenarios tested at `http://localhost:3001/results_p25?demo=true&paperWidth=600`:

| # | Badge | Image | Title | Description | QA URL | Adjustments | Errors |
|---|-------|-------|-------|-------------|--------|-------------|--------|
| 1 | `kp` | CSS circle "KP" | OK | OK | None (correct) | None (correct) | 0 |
| 2 | `mqap` | CSS circle "KP" | OK | OK | None (correct) | None (correct) | 0 |
| 3 | `two-assessors` | White shield (inverted) | OK | OK | OK (link visible) | None (correct) | 0 |
| 4B | `senior` | Gold shield | OK | OK | OK (link visible) | OK (from→to with arrow) | 0 |
| 4D | `senior` | Gold shield | OK | OK (confirmed text) | OK (link visible) | None (correct) | 0 |
| — | `in-progress` | White hourglass (inverted) | OK | OK | OK (link visible) | None (correct) | 0 |

**Finding:** Turbopack cache (`.next/`) had a stale reference to `badge-senior-third-party.png` (old asset name). Resolved by clearing `.next/` and restarting dev server. Source code always pointed correctly to `shield-badge.png`.

### Open decisions

1. **KP/MQAP badge shape:** Keep current CSS circle or integrate Figma hexagonal shapes (`figma-badge-kp.png`, `figma-badge-mqap.png`) as CSS masks?

### Motivation

The previous QA box had three problems:

1. **Frontend/backend coupling** — Template decided what text to show based on `rt_id`, duplicating logic that belongs in the backend
2. **Incomplete scenarios** — Only handled 2 scenarios (KP and standard with adjustments), but there are at least 7 real variants
3. **Generic badges** — Always showed the same shield, with no visual distinction between QA types

The new model delegates to the backend the responsibility of assembling the complete `qa_info`, and the frontend just renders — aligned with the project's data-driven template principle.
