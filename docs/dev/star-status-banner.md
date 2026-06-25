# STAR status banner

## Summary

Add support for a status badge and explanatory note at the start of STAR PDFs.

## Scope

- Extend `general_information` with status display fields from the backend: name, description, border color, and text color.
- Render compact header metadata for status, result code, and indicator.
- Keep rendering optional so partial payloads continue to work.

## Design Notes

- Badge follows the supplied pill style at the same visual scale as the result code metadata: rounded border, transparent background, info icon, uppercase status name.
- Description follows the supplied disclaimer style: light gray panel, STAR blue left rule, STAR blue info icon, short explanatory text.

## Validation

- `npm run lint -- "app/templates/star/shared/components/page-shell.tsx" "app/templates/star/shared/sections/general_information/types.ts" "app/templates/star/cap_sharing/template.tsx" "app/templates/star/inn_dev/template.tsx"`
