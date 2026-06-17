## Context

`next build` runs a TypeScript pass that fails the Jenkins deploy. The STAR templates use a shared helper `hasText(value: unknown): boolean` to gate optional text fields, but because it returns a plain `boolean`, TypeScript does not narrow the checked value — so `data.field.trim()` / `label={value}` after a `hasText` check are typed `string | undefined`.

## Goals / Non-Goals

**Goals:**
- Make the deploy build type-check cleanly with a minimal, behavior-preserving change.
- Fix the failure at its root so the same error class cannot recur across the ~100 `hasText` call sites.

**Non-Goals:**
- No redesign of the STAR templates or their data model.
- No change to runtime rendering behavior.

## Decisions

**Make `hasText` a type predicate (`value is string`).**
The body already guarantees `typeof value === "string"`, so declaring the return type as `value is string` is sound. Narrowing only *removes* "not assignable" errors — it cannot introduce new ones — so it is backward-compatible across all existing call sites.

*Alternative considered — local fixes (`?? ""`, `?.trim() ?? ""`) at the 3 error sites.* Rejected: it patches symptoms, leaves ~100 other call sites one edit away from the same error, and adds noise. The predicate is the idiomatic null-safety fix.

## Risks / Trade-offs

- [A call site somewhere relies on the un-narrowed type] → Narrowing to `string` after a true `hasText` is always correct given the body; verified by a full `next build`. If the build surfaces an unrelated latent error, it is pre-existing and reported, not silently changed.
