## Why

The Jenkins deploy build (`pdf-viewer` #143) fails at the `Running TypeScript` step of `next build` with `Type 'string | undefined' is not assignable to type 'string'`. The root cause is that the shared `hasText()` guard in the STAR templates returns `boolean` instead of a type predicate, so values it validates stay `string | undefined` after the check. This blocks every deploy — including publishing the new documentation site that an external backend developer is waiting on.

## What Changes

- Make `hasText()` a TypeScript **type predicate** (`value is string`) so a successful `hasText(x)` check narrows `x` to `string`. The runtime behavior is unchanged (it already checks `typeof value === "string" && value.trim().length > 0`).
- This resolves all three current compile errors at once and prevents the same class of error at the other ~100 call sites:
  - `app/templates/star/cap_sharing/components/individual-training-rows.tsx:56`
  - `app/templates/star/inn_dev/components/anticipated-users-section.tsx:40`
  - `app/templates/star/inn_dev/components/anticipated-users-section.tsx:47`

## Capabilities

### New Capabilities
- `star-null-safety`: The STAR templates' shared text-presence guard narrows validated values to `string`, so optional text fields render type-safely and `next build` type-checks cleanly.

### Modified Capabilities
<!-- None: no existing OpenSpec specs. -->

## Impact

- **One file changed:** `app/templates/star/shared/utils.ts` (the `hasText` return type).
- **No runtime behavior change** — purely a type-level narrowing improvement.
- **Unblocks** `next build` / the Jenkins deploy build.
- No new dependencies.
