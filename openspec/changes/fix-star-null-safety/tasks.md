## 1. Fix the guard

- [x] 1.1 Change `hasText` in `app/templates/star/shared/utils.ts` from `(value: unknown): boolean` to a type predicate `(value: unknown): value is string` (body unchanged)

## 2. Verify

- [x] 2.1 `npm run build` completes the TypeScript pass with no errors (the three STAR `string | undefined` errors are gone)
- [x] 2.2 Confirm no new type errors were introduced at other `hasText` call sites
