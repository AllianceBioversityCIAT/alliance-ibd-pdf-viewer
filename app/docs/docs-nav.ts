export interface NavItem {
  /** Stable slug, equal to the last path segment (or "index" for /docs). */
  slug: string;
  /** Absolute href under /docs. */
  href: string;
  /** Sidebar label. */
  label: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/**
 * Typed navigation registry for the /docs framework site.
 * Downstream doc pages and the Sidebar consume this verbatim.
 */
export const docsNav: NavGroup[] = [
  {
    title: "Introduction",
    items: [
      { slug: "index", href: "/docs", label: "Getting Started" },
      { slug: "architecture", href: "/docs/architecture", label: "Architecture" },
    ],
  },
  {
    title: "Core concepts",
    items: [
      { slug: "pdf-flow", href: "/docs/pdf-flow", label: "PDF generation flow" },
      { slug: "dynamodb", href: "/docs/dynamodb", label: "DynamoDB storage" },
      { slug: "templates", href: "/docs/templates", label: "Template system" },
    ],
  },
  {
    title: "Guides",
    items: [
      { slug: "create-template", href: "/docs/create-template", label: "Create a template" },
      { slug: "backend-connection", href: "/docs/backend-connection", label: "Wire a backend" },
      { slug: "install-deploy", href: "/docs/install-deploy", label: "Install & deploy" },
    ],
  },
  {
    title: "Reference",
    items: [
      { slug: "api-reference", href: "/docs/api-reference", label: "API reference" },
      { slug: "variables", href: "/docs/variables", label: "Required variables" },
      { slug: "gotchas", href: "/docs/gotchas", label: "Gotchas & rules" },
      { slug: "agent-prompt", href: "/docs/agent-prompt", label: "Agent prompt" },
    ],
  },
];

export default docsNav;
