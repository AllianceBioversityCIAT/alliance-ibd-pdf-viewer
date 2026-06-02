# STAR PDF architecture

## Summary

Implemented reusable STAR PDF template architecture under `app/templates/star/` with shared sections, isolated rules, and Cap Sharing as the first result-type template.

## Scope

- Shared components: `PageShell`, `SectionTitle`, `InfoCard`, `DataTable`, label/value helpers
- Six shared sections with `types.ts`, `rules.ts`, `demo.json`, component, `index.ts`
- `cap_sharing` template with `CapSharingDetailsSection`
- `AGENTS.md` for AI maintainers → `docs/star/AGENTS.md`
- `payload-guide.json` for Cap Sharing payload documentation

## Figma sources

- Page 1: node `34180:17970` — header, general info, contributing projects
- Page 2: node `34180:18071` — levers, cap sharing (group)
- Page 2 alt: node `34218:14041` — cap sharing (individual)
- Page 3: node `34218:13713` — training details, partners

## Validation

```bash
npm run dev
open "http://localhost:3000/cap_sharing?demo=true&paperWidth=595&paperHeight=842&debug=true"
```

## Open items

- Export lever icons to `public/assets/star/levers/` when needed
- Optional: Gotenberg `cap_sharing/footer.ts` with base64 footer for PDF export (see PRMS `shared/footer.ts`)
- Implement `inn_dev`, `policy_change`, `knowledge_product` templates using same pattern
