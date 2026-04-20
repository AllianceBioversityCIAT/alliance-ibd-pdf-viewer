# IPSR P25 — Backend Data Contract

**Jira ticket:** [P2-2805](https://cgiarmel.atlassian.net/browse/P2-2805)  
**Figma mockup:** [PDF Mockup](https://www.figma.com/design/fLsTFcs0ERUG7fuiOjog5i/PRMS-Reporting-tool?node-id=24592-4742)  
**Field mapping:** [Figma Spreadsheet](https://www.figma.com/design/fLsTFcs0ERUG7fuiOjog5i/PRMS-Reporting-tool?node-id=24592-4740)  
**Template name:** `ipsr_p25`  
**Parent story:** [P2-2282](https://cgiarmel.atlassian.net/browse/P2-2282) — PDF results generator for P25 - Pool funding  
**Common info story:** [P2-2375](https://cgiarmel.atlassian.net/browse/P2-2375) — PDF P25 - Common information

---

## Overview

PDF template for **Innovation Package** (IPSR) results under Pool Funding P25. The template reuses common sections from `results_p25` (header, QA box, result details, impact areas, contributors & partners, geographic location, evidence) and adds IPSR-specific sections organized by **Steps 1–4** under "Package and Assess".

### PDF structure (page flow)

| Page | Sections |
|------|----------|
| 1 | Header (result code, type, title), QA Box (if applies), Result Details (description, phase, submitter, contact, impact areas) |
| 2 | Contributors & Partners (TOC, contributors, partners table), **Package and Assess** → Step 1 start (core innovation, geographic location) |
| 3 | Step 1 continued (scaling ambition, targeted actors/orgs, aspired outcomes, workshop, facilitators), Step 2&3 start (current use actors) |
| 4 | Step 2&3 continued (current use orgs/measures, workshop assessment, scaling readiness, reference materials), Step 4 start (investment programs) |
| 5 | Step 4 continued (investment bilateral, investment partners) |

---

## API endpoint

```
POST /api/data
```

The backend sends the full JSON payload to this endpoint, receives a UUID, and then triggers Gotenberg to capture:

```
GET /ipsr_p25?uuid={uuid}&paperWidth=595&paperHeight=842
```

### Testing

The template supports demo mode:

```
GET /ipsr_p25?demo=true&paperWidth=595&paperHeight=842
```

Full demo JSON available at: `app/templates/reportingtool/ipsr_p25/template.demo.json`

---

## Critical rule: Do not show empty data

> **Jira AC #6:** "Empty or missing information must be avoided in the reports. If no data is provided for specific fields or sections, they should not be displayed."

The template **automatically hides** any section whose data is `null`, `undefined`, or an empty array `[]`. The backend must:

- Send `null` or omit the field entirely when there's no data
- Send `[]` (empty array) for array fields with no entries
- **Never send placeholder values** like `"N/A"`, `"Not provided"`, or `"—"` — just send `null`

---

## JSON contract — Full payload

### Common fields (reused from `results_p25`)

These fields follow the same contract as [P2-2375](https://cgiarmel.atlassian.net/browse/P2-2375). If the backend already serves pool-funding PDFs, these fields are already available.

```jsonc
{
  // ── Core identification ──
  "result_code": 2378,                    // number — PRMS result code
  "result_type": "Innovation Package",     // string — always "Innovation Package" for IPSR
  "result_name": "Full title of the result", // string — displayed in header
  "title": "Full title of the result",     // string — fallback if result_name is missing
  "short_title": "",                       // string — shown under "Result details" if non-empty
  "result_description": "Description...",  // string — shown under "Result description"

  // ── Phase ──
  "phase_name": "Reporting 2025",          // string — e.g. "Reporting 2025"

  // ── People ──
  "primary_submitter_name": "Science Program (SP) 02 - Sustainable Farming", // string
  "primary_submitter_acronym": "SP02",     // string — controls color theming & sidebar pattern
  "lead_contact_person": "Obilo Chinyere (o.chinyere@cgiar.org)", // string

  // ── KRS ──
  "is_krs": "No",                          // string — "Yes" or "No"
  "krs_link": null,                        // string | null — URL if is_krs = "Yes"

  // ── Impact Area tags ──
  // Each tag has score (string format) and components array.
  // Only tags with a non-empty score are displayed.
  // Score format: "(0) Not targeted", "(1) Significant", "(2) Principal"
  "nutrition_tag":     { "score": "(2) Principal",      "components": ["Nutrition", "Health"] },
  "climate_tag":       { "score": "(0) Not targeted",   "components": [] },
  "poverty_tag":       { "score": "(0) Not targeted",   "components": [] },
  "gender_tag":        { "score": "(0) Not targeted",   "components": [] },
  "environmental_tag": { "score": "(1) Significant",    "components": [] },

  // ── Geographic location ──
  "geo_focus": "Global",                   // string — "Global", "Regional", "National", "Sub-national", "This is yet to be determined"
  "regions": ["Eastern Africa", "Southern Africa", "Western Africa"], // string[] | null
  "countries": [                           // array of {name, code} | null
    { "name": "Ethiopia", "code": "ET" },  // code = ISO 3166-1 alpha-2 (used for flag images)
    { "name": "South Africa", "code": "ZA" }
  ],
  "subnational": null,                     // array of {country, subnationals[]} | null — only for geo_focus="Sub-national"

  // ── Theory of Change ──
  "primary_submitter_data": {              // object | null
    "toc_url": "https://toc.mel.cgiar.org/toc/example-uuid",  // string — link to TOC diagram
    "toc_internal_id": "example-uuid",     // string
    "contributor_name": "Science program 02 - Sustainable Farming", // string — shown in TOC card header
    "contributor_can_match_result": true    // boolean
  },
  "toc_primary": [                         // TocPrimaryEntry[] | null
    {
      "toc_level_name": "Outcome",                        // string — e.g. "Outcome", "Output"
      "toc_work_package_acronym": "Area of work 01 - Climate Adaptation and Mitigation", // string
      "toc_result_title": "Climate hazards to prioritized geographies and systems", // string
      "toc_indicator": "Number of quantified climate change-related hazards...", // string
      "toc_result_description": ""          // string — currently not displayed but reserved
    }
  ],

  // ── Contributors ──
  "contributing_initiatives": [            // array | null
    { "initiative_short_name": "Science Program (SP) 01 - Breeding for tomorrow" }
  ],
  "contributing_centers": [],              // ContributingCenter[] — can be empty array
  "bilateral_projects": [                  // array | null
    {
      "project_title": "IWMI - Implementation of conservation agriculture in Africa and Asia",
      "is_lead_project": false             // boolean — if true, shows "(Lead)" badge
    }
  ],

  // ── Partners ──
  // ⚠️ IMPORTANT: IPSR template shows "Delivery type(s)" column — this field is REQUIRED
  "non_kp_partner_data": [                 // PartnerEntry[] | null
    {
      "partner_name": "JEEVIKA - Jeevika",
      "partner_country_hq": "India (IN)",
      "partner_type": "NGO Local (General)",
      "partner_delivery_type": "Scaling"   // ← REQUIRED for IPSR — shown as 4th column in Partners table
    }
  ],

  // ── Evidence ──
  "linked_evidences": [],                  // LinkedEvidence[] — can be empty (section hidden if empty)

  // ── QA Information ──
  // ⚠️ Jira AC #5: "Display QA Badge if applies. Apply for innovation use."
  "qa_info": {                             // QAInfo | undefined — omit entirely if no QA applies
    "badge": "senior",                     // string — "kp", "mqap", "two-assessors", "senior", "in-progress"
    "title": "Result quality assured by two assessors and subsequently reviewed by a senior third party",
    "description": "This result underwent two rounds of quality assurance...",
    "qa_url": "https://www.cgiar.org/news-events/news/cgiars-quality-assurance-process...", // string | undefined
    "adjustments_title": "Core data point that were adjusted during the QA process:", // string | undefined
    "adjustments": [                       // QAAdjustment[] | undefined
      { "label": "Innovation Use", "to_value": "Level 7" }
    ]
  }
}
```

### IPSR-specific fields (NEW — Steps 1–4)

These are the fields **unique to Innovation Package** that the backend needs to add.

---

#### Step 1 — Ambition

```jsonc
{
  // ── Core innovation link ──
  // Displayed as: "{result_code}: {title}" with clickable link
  "core_innovation": {                     // object | null — hide section if null
    "result_code": 15052,                  // number
    "title": "Innovation development - Progress report of Aflasafe...", // string — full title
    "link": "https://reporting.cgiar.org/reports/result-details/15052?phase=4" // string — URL to result
  },

  // ── 2030 Scaling Ambition Statement ──
  // Previously called "2024 scaling ambition blurb"
  "scaling_ambition_statement": "By 2030, the Sustainable Farming will work together with...", // string | null

  // ── Targeted Innovation Use — Actors ──
  // Table columns: #, Type, Women, Men, Total (NO evidence column in Step 1)
  "targeted_actors": [                     // IpsrActorEntry[] | null
    {
      "actor_type": "Farmers/pastoralist/herders/fishers", // string
      "other_actor_type": null,            // string | null — when actor_type is generic/Other, this has the specific name
      "sex_and_age_disaggregation": false,  // boolean
      // When FALSE → show Women/Men breakdown with Total = women_total + men_total
      // When TRUE  → show "Not applicable" for Women/Men, show how_many as Total
      "women_total": 25,                   // number | null
      "women_youth": 5,                    // number | null
      "women_non_youth": 20,               // number | null
      "men_total": 15,                     // number | null
      "men_youth": 5,                      // number | null
      "men_non_youth": 10,                 // number | null
      "total": 40,                         // number — always present
      "how_many": null,                    // number | null — used when sex_and_age_disaggregation=true
      "evidence_link": null                // string | null — ⚠️ IGNORED in Step 1, only used in Steps 2&3
    }
  ],

  // ── Targeted Innovation Use — Organizations ──
  // Table columns: #, Type, Subtype, How many (NO evidence column in Step 1)
  "targeted_organizations": [              // IpsrOrganizationEntry[] | null
    {
      "type": "NGO",                       // string — institution type name
      "other_institution": null,           // string | null — when type is "Other", this has the specific name
      "subtype": "NGO National (General)", // string — institution subtype
      "has_subtypes": true,                // boolean — if false and subtype is empty, shows "Not applicable"
      "how_many": "7",                     // string — number of organizations
      "evidence_link": null                // string | null — ⚠️ IGNORED in Step 1
    }
  ],

  // ── Aspired outcomes and impact ──
  // Rendered as a bulleted list
  "aspired_outcomes": [                    // string[] | null
    "PO6 - Animal and aquatic food producers, market actors and communities...",
    "PO3 - Communities within animal and aquatic food systems adopt innovations..."
  ],

  // ── Workshop organized ──
  "workshop_organized": "Yes, an expert workshop was organized.", // string | null

  // ── Facilitators ──
  // Rendered as bulleted list: "Name (email) - Role"
  "facilitators": [                        // IpsrFacilitatorEntry[] | null
    {
      "name": "Paul Silva",               // string
      "email": "p.silva@cgiar.org",        // string
      "role": "Lead"                       // string
    }
  ]
}
```

---

#### Steps 2 & 3 — Package and Assess

```jsonc
{
  // ── Current use of the core innovation — Actors ──
  // Same structure as targeted_actors BUT with evidence_link shown
  // Table columns: #, Type, Evidence, Women, Men, Total
  "current_use_actors": [                  // IpsrActorEntry[] | null
    {
      "actor_type": "Farmers/pastoralist/herders/fishers",
      "other_actor_type": null,
      "sex_and_age_disaggregation": false,
      "women_total": 25,
      "women_youth": 5,
      "women_non_youth": 20,
      "men_total": 15,
      "men_youth": 5,
      "men_non_youth": 10,
      "total": 40,
      "how_many": null,
      "evidence_link": "https://evidence.example.com/actors-1"  // ← SHOWN as "Access link" in Step 2&3
    }
  ],

  // ── Current use — Organizations ──
  // Table columns: #, Type, Subtype, How many, Evidence
  "current_use_organizations": [           // IpsrOrganizationEntry[] | null
    {
      "type": "NGO",
      "other_institution": null,
      "subtype": "NGO National (General)",
      "has_subtypes": true,
      "how_many": "1",
      "evidence_link": "https://evidence.example.com/org-1"  // ← SHOWN in Step 2&3
    }
  ],

  // ── Current use — Quantitative measures ──
  // Table columns: #, Type, Evidence, Unit of measure, Quantity
  "current_use_measures": [                // IpsrMeasureEntry[] | null
    {
      "type": "Other",                     // string
      "evidence_link": null,               // string | null — shown as "Access link" or "Not provided"
      "unit_of_measure": "",               // string — empty string renders as "Not provided"
      "quantity": ""                       // string — empty string renders as "Not provided"
    }
  ],

  // ── What was assessed during the expert workshop? ──
  // ⚠️ CONDITIONAL LOGIC: The value here affects what scaling_readiness_assessment shows
  // Possible values:
  //   - "Only Current innovation readiness and innovation use were self-assessed by the workshop experts"
  //   - "Current and Potential innovation readiness and innovation use were self-assessed by workshop experts"
  //   - "None of the above"
  //   - null (not provided)
  // The BACKEND decides which scaling_readiness_assessment data to send based on this selection.
  "workshop_assessment": "Current and Potential innovation readiness and innovation use were self-assessed by workshop experts.", // string | null

  // ── Evidence-based Scaling Readiness assessment ──
  // ⚠️ Backend must send the correct entries based on workshop_assessment option.
  // If "None of the above" or nothing applies, send null or [].
  // Table columns: Type, Short title, Innovation readiness, Evidence, Innovation use, Evidence
  "scaling_readiness_assessment": [        // IpsrScalingReadinessEntry[] | null
    {
      "type": "Core innovation",           // string — "Core innovation" or "Complementary innovation N"
      "short_title": "Aflasafe development for Sierra Leone", // string
      "innovation_readiness": "9 - Proven Innovation",  // string — level label
      "innovation_readiness_evidence_link": "https://evidence.example.com/readiness-core", // string | null
      "innovation_use": "4 - Connected next-user",      // string — level label
      "innovation_use_evidence_link": "https://evidence.example.com/use-core"  // string | null
    },
    {
      "type": "Complementary innovation 1",
      "short_title": "Aflasafe development for Sierra Leone",
      "innovation_readiness": "3 - Proof of Concept",
      "innovation_readiness_evidence_link": "https://evidence.example.com/readiness-comp",
      "innovation_use": "2 - Partners",
      "innovation_use_evidence_link": "https://evidence.example.com/use-comp"
    }
  ],

  // ── Reference materials ──
  "reference_materials_description": "This information can be found on all pages of the document..." // string | null
}
```

---

#### Step 4 — Additional Information

All three investment tables share the same structure:

```jsonc
{
  // ── Investment by CGIAR Programs ──
  // Table columns: Science program/Accelerator, Total USD value, To be determined
  "investment_programs": [                 // IpsrInvestmentEntry[] | null
    {
      "name": "SP02 - Sustainable Farming", // string — Science Program name
      "total_usd_value": "$4,000",         // string | null — ⚠️ pre-formatted with $ and commas
      "is_not_determined": false            // boolean — if true: USD value shows "-", To be determined shows "Yes"
    },
    {
      "name": "SP04 - Multifunctional Landscapes",
      "total_usd_value": null,             // null because is_not_determined=true
      "is_not_determined": true
    }
  ],

  // ── Investment by CGIAR W3 or bilateral projects ──
  // Table columns: Bilateral, Total USD value, To be determined
  "investment_bilateral": [                // IpsrInvestmentEntry[] | null
    {
      "name": "T-PJ-003262-An innovative approach to agribusiness...",
      "total_usd_value": "$1,000",
      "is_not_determined": false
    }
  ],

  // ── Investment by partners ──
  // Table columns: Partner, Total USD value, To be determined
  "investment_partners": [                 // IpsrInvestmentEntry[] | null
    {
      "name": "ACODE - Advocates Coalition for Development and Environment",
      "total_usd_value": "$2,000",
      "is_not_determined": false
    }
  ]
}
```

---

## Fields NOT included in the PDF

The following fields from the IPSR form are **explicitly excluded** from the PDF per the Figma field mapping:

| Field | Reason |
|-------|--------|
| Innovation packaging experts | Marked "No aplica" in field mapping |
| Consensus and consultation | Marked "No aplica — quitar esta información del PDF" |
| Status / submission_status | Not needed — the generation date is auto-generated client-side |
| submission_data | Not needed |
| result_level | Covered by `result_type` ("Innovation Package") |
| portfolio_acronym | Not displayed in IPSR template |

**Do NOT send these fields** — they will be ignored.

---

## Display logic summary

This table explains **when each section is visible** based on data:

| Section | Visible when... |
|---------|----------------|
| QA Box | `qa_info` is present (not null/undefined) |
| Result details | Always (uses common fields) |
| Impact Areas | At least one tag has a non-empty `score` |
| Contributors & Partners | Any of: toc_primary, contributing_initiatives, contributing_centers, bilateral_projects, or non_kp_partner_data has data |
| Theory of Change card | `toc_primary` is non-empty AND `primary_submitter_data` is present |
| Partners table | `non_kp_partner_data` is non-empty |
| Evidence | `linked_evidences` is non-empty |
| **Step 1** | Any Step 1 field is non-null/non-empty |
| Core innovation link | `core_innovation` is not null |
| Geographic location | `geo_focus` is present |
| Scaling ambition | `scaling_ambition_statement` is not null |
| Targeted actors table | `targeted_actors` is non-empty |
| Targeted organizations table | `targeted_organizations` is non-empty |
| Aspired outcomes | `aspired_outcomes` is non-empty |
| Workshop organized | `workshop_organized` is not null |
| Facilitators | `facilitators` is non-empty |
| **Steps 2 & 3** | Any Step 2&3 field is non-null/non-empty |
| Current use actors table | `current_use_actors` is non-empty |
| Current use organizations table | `current_use_organizations` is non-empty |
| Quantitative measures table | `current_use_measures` is non-empty |
| Workshop assessment | `workshop_assessment` is not null |
| Scaling readiness table | `scaling_readiness_assessment` is non-empty |
| Reference materials | `reference_materials_description` is not null |
| **Step 4** | Any Step 4 field is non-empty |
| Investment programs table | `investment_programs` is non-empty |
| Investment bilateral table | `investment_bilateral` is non-empty |
| Investment partners table | `investment_partners` is non-empty |

---

## Actors table — sex_and_age_disaggregation behavior

This flag controls how the Women/Men/Total columns render:

| `sex_and_age_disaggregation` | Women column | Men column | Total column |
|------------------------------|-------------|------------|--------------|
| `false` | Shows: Total: X, Youth: Y, Non-youth: Z | Same breakdown | `total` field |
| `true` | Shows: "Not applicable" | "Not applicable" | `how_many` field |

---

## Organizations table — has_subtypes behavior

| `has_subtypes` | `subtype` value | Subtype column displays |
|----------------|-----------------|------------------------|
| `true` | `"NGO National (General)"` | `"NGO National (General)"` |
| `true` | `""` or `null` | `"Not provided"` |
| `false` | (any) | `"Not applicable"` |

---

## Investment table — is_not_determined behavior

| `is_not_determined` | `total_usd_value` | USD column | To be determined column |
|---------------------|--------------------|------------|------------------------|
| `false` | `"$4,000"` | `"$4,000"` | `"No"` |
| `true` | `null` | `"-"` | `"Yes"` |

---

## Formatting requirements

| Field | Format | Example |
|-------|--------|---------|
| USD values | Pre-formatted with `$` and thousands separator | `"$4,000"`, `"$1,000"` |
| Evidence links | Full URL | `"https://evidence.example.com/..."` |
| Country codes | ISO 3166-1 alpha-2 lowercase | `"ET"`, `"ZA"` — used for flag images via `flagcdn.com` |
| Score strings | `"(N) Label"` format | `"(2) Principal"`, `"(0) Not targeted"` |
| Scaling levels | `"N - Label"` format | `"9 - Proven Innovation"`, `"4 - Connected next-user"` |

---

## TypeScript interfaces

The full TypeScript interfaces are defined in `app/templates/reportingtool/ipsr_p25/types.ts`:

- `IPSRResultData` — main payload interface
- `IpsrActorEntry` — actors (used in targeted_actors and current_use_actors)
- `IpsrOrganizationEntry` — organizations
- `IpsrMeasureEntry` — quantitative measures
- `IpsrScalingReadinessEntry` — scaling readiness assessment
- `IpsrFacilitatorEntry` — facilitators
- `IpsrInvestmentEntry` — investment tables
- `IpsrCoreInnovation` — core innovation link

Shared types (from `shared/types.ts`):
- `TocPrimaryEntry`, `PrimarySubmitterData` — Theory of Change
- `ContributingCenter`, `ContributingInitiative`, `BilateralProject` — Contributors
- `PartnerEntry` — Partners (includes `partner_delivery_type`)
- `LinkedEvidence` — Evidence
- `QAInfo`, `QAAdjustment` — QA box

---

## Validation checklist for backend

Before deploying, verify:

- [ ] All sections hide correctly when their data is `null` or `[]`
- [ ] Partners table includes `partner_delivery_type` for each entry
- [ ] Impact tags use string format for score: `"(2) Principal"`, not numeric `2`
- [ ] USD values come pre-formatted: `"$4,000"`, not `4000`
- [ ] Country codes are ISO 3166-1 alpha-2: `"ET"`, `"ZA"` — **not** ISO alpha-3
- [ ] Evidence links are full URLs (with `https://`)
- [ ] `scaling_readiness_assessment` content matches the `workshop_assessment` option selected
- [ ] When `sex_and_age_disaggregation=true`, the `how_many` field is populated
- [ ] When `is_not_determined=true` in investments, `total_usd_value` can be `null`
- [ ] `core_innovation.link` is a valid URL to the result details page
- [ ] QA adjustments include both `label` and `to_value` (optionally `from_value`)

---

## Demo data

A complete demo JSON is maintained at:

```
app/templates/reportingtool/ipsr_p25/template.demo.json
```

Access it live: `GET /ipsr_p25?demo=true`

This demo JSON represents a fully populated IPSR result and can be used as a reference for the expected payload structure.
