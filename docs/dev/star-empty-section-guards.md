# STAR empty section guards

## Summary

Hide STAR section titles when the section has no visible content to render.

## Scope

- Alliance Alignment no longer renders from root-level SDGs alone when there are no contracts or levers to display.
- Cap Sharing Details checks the final table/card content before rendering its title.
- IP Rights checks displayable answers before rendering its title.
- Innovation Details and its nested sections require displayable rows, labels, cards, or scaling content before rendering.
- Evidence ignores notable references for visibility until that content is rendered by the component.

## Validation

- `npm run lint -- "app/templates/star/shared/sections/alliance_alignment/rules.ts" "app/templates/star/cap_sharing/components/cap-sharing-details-section.tsx" "app/templates/star/shared/sections/ip_rights/ip-rights-section.tsx" "app/templates/star/inn_dev/rules.ts" "app/templates/star/inn_dev/components/innovation-details-section.tsx" "app/templates/star/shared/sections/evidence/rules.ts"`
