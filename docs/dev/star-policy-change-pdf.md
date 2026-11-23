# STAR Policy Change PDF (`policy_change`)

## Summary

New STAR PDF for indicator 4 (Policy Change), the third one after `cap_sharing` and `inn_dev`. It uses the same `PageShell`, tokens and shared sections:

General Information → Alliance Alignment → **Policy Change Details** (new) → Results Partners → Geographic Scope → Evidence. There is no IP Rights section, same as in STAR.

Route: `/policy_change?uuid=…` · Demo: `/policy_change?demo=true`

## Source

- STAR client `policy-change.component.html` / `.ts` (2026-11-23): labels, the policy type 3 rule, and the hard-coded stage names.
- STAR GET `/api/results/policy-change/by-result-id/:id` returns ids only (`innovation_development: 30339`, `implementing_organization[].institution_id`). The PDF contract asks for **full data** instead. Bare ids are ignored and never printed.

## Section layout (`components/policy-change-details-section.tsx`)

| Block | Content | Visibility |
|---|---|---|
| Policy Details (DataTable, same as CapSharing tables) | Policy Type, Stage in Policy Process, USD Amount, Status, Evidence for stage | Each row only when it has data. USD Amount and Status only when policy type id = 3 |
| Whose policy is this? (implementing organizations) | `PartnerInstitutionCard` (same as Results Partners / CapSharing organizations) | Rows with a real name. Rows with only an id are skipped |
| Linked Results | Two columns, same as the STAR form: "Link to a reported Innovation Development output" and "Link to a reported Innovation Use". Each column (`PolicyLinkedResultField`) has its label and a card with "STAR 9150 - title", Status and Reporting year. One paginator block | The block shows when at least one full result with `title` is sent. A missing one shows "No result linked." |

## Rules (`rules.ts`)

- Policy type id comes from `policy_type.id`, falling back to `policy_type_id`. Id 3 is "Program, Budget, or Investment".
- USD amount: `USD 1,250,000`. 0 is shown, because STAR treats it as a saved value. Null, negative or non-numeric values are hidden.
- `amount_status`: an object `{ name }` or a plain string.
- Stage: the payload name wins. If only an id is sent, the PDF uses the three names hard-coded in the STAR client.
- Implementing organizations: nested `institution` is merged onto the row, `is_active: false` rows are skipped, and rows are deduped by `institution_id`.

## Files

`policy_change/{template.tsx, types.ts, catalogs.ts, rules.ts, payload-guide.json, template.demo.json}`, `components/{policy-change-details-section,policy-linked-result-card}.tsx`, `demos/{policy-type-other,budget-zero-amount}.demo.json`.

The demo uses the existing P2 Policy Change Alliance Alignment demo. Results Partners, Geographic Scope and Evidence come from the cap_sharing demo. Policy names and organizations are illustrative. The type 1 name "Policy or Strategy" is a guess, because STAR's `policyTypes` catalog names were not checked.

## Validation

- `tsc --noEmit` and `eslint` pass.
- Rules script: the demo, the variants, STAR's raw GET (ids only, so the section is hidden), `null`, strings, `{}`, wrong types, `"2,500.5"`, `0` and an unknown stage id.
- Server render (`renderToStaticMarkup`) of the section with all 3 demos and with bad data: renders, or is empty, without crashing.
- Visual check in the browser is pending: the dev server was not running.

## Country flags on partner cards (2026-11-23)

- The STAR client shows the headquarter flag from the institution's `isoAlpha2` (`partner-selected-item`).
- The shared `PartnerInstitutionCard` now does the same next to **Headquarter**, using `CountryFlag` (`shared/components/country-flag.tsx`, flagcdn PNG). CapSharing already used flagcdn for the trainee nationality, and that copy now reuses the shared component.
- With only `isoAlpha2` and no country name, the card shows the flag alone, same as STAR. Invalid codes show no flag.
- Applies to every STAR partner card (Results Partners, CapSharing organizations, Policy implementing organizations), but only when `isoAlpha2` is sent. `institution_location_name` is accepted as a headquarter name fallback.

## Open items

- Confirm the real names of STAR's `policyTypes` and `policyAmountStatus` catalogs.
- Backend: send `policy_type`, `policy_stage`, `amount_status` with names, the institution data for `implementing_organization`, and the full linked results.
