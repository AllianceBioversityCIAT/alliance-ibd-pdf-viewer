## ADDED Requirements

### Requirement: Public documentation site
The system SHALL serve a publicly accessible documentation site under the `/docs` route that requires no authentication. The site SHALL NOT expose any real URLs, secrets, table names, or hostnames; every such value SHALL be rendered as a `{{variable}}` placeholder.

#### Scenario: Anonymous visitor opens the docs
- **WHEN** an unauthenticated user navigates to `/docs`
- **THEN** the documentation site renders without prompting for any secret or credential

#### Scenario: Sensitive values are masked
- **WHEN** any documentation section references a deployment URL, secret, DynamoDB table name, or host
- **THEN** the value is shown as a `{{variable}}` placeholder, never the real value

### Requirement: Sidebar navigation layout
The documentation site SHALL present a persistent left sidebar listing every section, and clicking a section SHALL navigate to that section's content. The currently active section SHALL be visually indicated.

#### Scenario: Navigate between sections
- **WHEN** the user clicks a section entry in the sidebar
- **THEN** the main content area shows that section and the sidebar marks it as active

### Requirement: Getting Started section
The site SHALL include a "Getting Started" section that presents a step-by-step path covering, at minimum: what this project is (the PDF viewer, not the full generator), prerequisites, install, and how to render a first template in demo mode.

#### Scenario: New developer reads Getting Started
- **WHEN** the user opens the Getting Started section
- **THEN** an ordered step-by-step guide is shown that ends with rendering a template via `/{template}?demo=true`

### Requirement: Core documentation sections
The site SHALL provide sections covering: Architecture overview, PDF generation flow, DynamoDB storage, the Template system (the non-changeable fixed contract vs what a developer can change), How to create a new template (file-based and folder-based), How to wire a new backend connection, Install & deploy, and Gotchas & rules.

#### Scenario: Architecture split is explained
- **WHEN** the user reads the Architecture or PDF generation flow section
- **THEN** it makes explicit that this repo only stores JSON and renders HTML, while Gotenberg PDF capture and S3 upload live in the external reports-microservice and the PRMS server sends payloads via RabbitMQ

#### Scenario: DynamoDB auth is documented
- **WHEN** the user reads the DynamoDB storage section
- **THEN** it states that `POST /api/data` requires an `x-api-secret` or `x-admin-secret` header, that the `GET` render is unauthenticated, and that the stored UUID is single-use (deleted after first render unless `?test=true`)

#### Scenario: Template contract is documented
- **WHEN** the user reads the Template system section
- **THEN** it clearly separates the non-changeable fixed contract (e.g. default-exported component, `TemplateProps` data prop, entry-point naming, flow layout) from what the developer is free to change

### Requirement: Required variables reference
The site SHALL include a "Required variables" reference table that lists every `{{variable}}` placeholder used across the docs, what it represents, and where it is configured.

#### Scenario: Reader looks up a variable
- **WHEN** the user encounters a `{{variable}}` in any section
- **THEN** the Required variables table describes what that variable is and where it lives

### Requirement: Tailwind-only presentation with no external libraries
The documentation site SHALL be authored as hand-written TSX styled exclusively with Tailwind CSS v4, using shared presentational components (e.g. sidebar, code block, callout, variable table, copy button). It SHALL NOT introduce any CDN reference or external runtime library (including markdown/MDX renderers).

#### Scenario: No new runtime dependency is added
- **WHEN** the docs site is built
- **THEN** it relies only on Tailwind CSS and existing project dependencies, with no markdown renderer, MDX, or CDN `<script>`/`<link>` added

### Requirement: Agent installation prompt with copy and download
The site SHALL provide an "Agent Prompt" section that displays an installation prompt intended to be copy-pasted into any AI agent. It SHALL offer a "Copy prompt" action that writes the prompt to the clipboard and a "Download" action that downloads the prompt as a `.md` file. The prompt SHALL have a single source of truth and SHALL guide an agent to help install the project and answer questions.

#### Scenario: User copies the agent prompt
- **WHEN** the user clicks the "Copy prompt" button
- **THEN** the full installation prompt text is written to the system clipboard

#### Scenario: User downloads the agent prompt
- **WHEN** the user clicks the "Download" button
- **THEN** the browser downloads the installation prompt as a `.md` file generated client-side without any external library
