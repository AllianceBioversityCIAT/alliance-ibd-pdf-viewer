# STAR: actor type icons and PDF access links

## Summary

- **Innovation Development, Actors**: each actor card shows its actor type image from S3 on the left.
- **Innovation Development, "Tools often used together with this tool"**: each card shows "Access link" to the linked result's PDF, top right (same as Evidence).
- **Policy Change, Linked Results**: the Innovation Development card shows the Access link icon (no text) in its top-right corner. Innovation Use has no PDF yet, so it never shows a link.
- All links open in a new tab. When no valid URL arrives, nothing is shown.

## Payload

| Template | Field | Notes |
|---|---|---|
| inn_dev | `innovation_details.actor_type_icons` | `Record<actor_type_id, url>`. Prefix `public/` in production, `public-dev/` in dev. |
| inn_dev | `actors[].actor_type_icon` | Optional per-actor URL. Wins over the map. |
| inn_dev | `knowledge_sharing_form.link_to_result[].pdf_url` | Absolute http(s) URL. |
| policy_change | `policy_change.innovation_development.pdf_url` | Absolute http(s) URL. |

Only absolute `http(s)` URLs are used (`normalizeHttpUrl` in `shared/utils.ts`). Ids, relative paths and text are ignored.

## Decisions

- The S3 actor images are white icons on transparent, so the PDF draws them on a STAR light blue (`#1689CA`) circle.
- `AccessLink` moved from the Evidence section to `shared/components/access-link.tsx`, so all three places share it. Evidence looks the same.
- In Policy, the link is icon-only, top right: "Access link" text did not fit next to the year in the half-width card.

## Validation

- `tsc --noEmit` and `eslint` pass.
- Screenshots of the inn_dev and policy_change demos checked: icons on blue circles, Access link top right in Tools, Access link icon top right in Policy.
- Demo URLs for `pdf_url` are `https://example.org/...` placeholders.

## Open items

- The backend must map each `actor_type_id` to its S3 image (farmers, researchers, extension agents, policy, other). Only Farmer = 1 and Other = 5 are known here.
- Confirm the real PDF URL format for linked results.
