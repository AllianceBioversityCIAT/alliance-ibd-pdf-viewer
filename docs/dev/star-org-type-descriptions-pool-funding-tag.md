# STAR: organization type descriptions + "Contributing to CGIAR Portfolio" tag

## Summary

Two small gaps found when comparing the PDF with the STAR client as of 2026-11-13 (`ari-result-sections-changes-2026-05-13_2026-11-13.md`):

1. **Innovation Details (`inn_dev`)**: STAR shows Organization type and Sub-type as `Name: description` (commit `5904a9db`, 2026-08-26). The PDF only showed the name.
2. **Alliance Alignment (shared)**: STAR tags contracts with `is_pool_funding_contributor` as **"Contributing to CGIAR Portfolio"** (commits `e433698e`, `c110cf98`, `1b916d76`). The PDF had no tag.

## What changed

- `inn_dev/types.ts`: new optional maps `institution_type_descriptions` and `sub_institution_type_descriptions` (`Record<number, string>`, CLARISA description by id).
- `inn_dev/rules.ts`: `getOrganizationTypeDescription` and `getOrganizationSubtypeDescription`. They return a value only when the name itself is shown (same guards as the name helpers).
- `inn_dev/components/organization-card.tsx`: when there is a description, the field renders full width and wraps: **Organization type:** **Name**: description. With no description, it renders as before.
- `alliance_alignment/types.ts`: `Contract.is_pool_funding_contributor`. It can also come nested in `agresso_contract`, which `flattenContract` already merges.
- `alliance_alignment/rules.ts`: `POOL_FUNDING_TAG_LABEL` and `isPoolFundingContributor` (accepts `true`, `1`, `"1"`, `"true"`).
- `shared/components/info-card.tsx`: `PoolFundingBadge`, an outlined light-blue pill shown next to the PRIMARY badge.
- Demos: `is_pool_funding_contributor: true` on the primary contract of every alliance demo and both template demos. `inn_dev/template.demo.json` has illustrative type and sub-type descriptions (not real CLARISA text).
- Payload guides (`inn_dev`, `cap_sharing`) document the new fields.

## Validation

- `tsc --noEmit` and `eslint` pass.
- Rules script: descriptions resolve for the unknown-organization demo row. Known organizations, custom-named rows and missing maps return `null`. The pool-funding flag is truthy only for true, 1, "1" and "true".

## Backend action

To match STAR, the STAR backend must send:
- `innovation_details.institution_type_descriptions` and `sub_institution_type_descriptions`, taken from the CLARISA institution types `description`;
- `contracts[].is_pool_funding_contributor`.
