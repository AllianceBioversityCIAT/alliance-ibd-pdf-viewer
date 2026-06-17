## ADDED Requirements

### Requirement: Text-presence guard narrows to string
The STAR templates' shared `hasText` helper SHALL be a TypeScript type predicate so that a successful `hasText(value)` check narrows `value` to `string`. Its runtime contract SHALL remain: return true only when `value` is a string with non-whitespace content.

#### Scenario: Guarded optional field is typed as string
- **WHEN** code calls `hasText(value)` on a `string | undefined` value and the call returns true
- **THEN** TypeScript treats `value` as `string` inside that branch, so `value.trim()` and passing it to a `string` prop type-check without error

#### Scenario: Build type-checks cleanly
- **WHEN** `next build` runs its TypeScript pass over the STAR templates
- **THEN** no `Type 'string | undefined' is not assignable to type 'string'` errors are raised by `hasText`-guarded code

### Requirement: Runtime behavior unchanged
Making `hasText` a type predicate SHALL NOT change which values it accepts at runtime.

#### Scenario: Empty and non-string values still rejected
- **WHEN** `hasText` receives `undefined`, `null`, a non-string, or a whitespace-only string
- **THEN** it returns false, exactly as before
