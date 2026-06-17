import Link from "next/link";
import DocPage from "./components/DocPage";
import Callout from "./components/Callout";
import CodeBlock from "./components/CodeBlock";
import VariableTable from "./components/VariableTable";

const NEXT_STEPS = [
  {
    href: "/docs/architecture",
    label: "Architecture",
    desc: "How the viewer fits into the wider PDF pipeline.",
  },
  {
    href: "/docs/templates",
    label: "Template system",
    desc: "Auto-discovery, the fixed contract, and what you can change.",
  },
  {
    href: "/docs/create-template",
    label: "Create a template",
    desc: "Build a file-based or folder-based template step by step.",
  },
  {
    href: "/docs/agent-prompt",
    label: "Agent prompt",
    desc: "Ready-to-paste context for an AI agent working on this repo.",
  },
];

export default function DocsIndexPage() {
  return (
    <DocPage
      title="Getting Started"
      lead="This repository is the PDF Viewer: it stores JSON and renders React templates to continuous HTML. It is not the full PDF generator — the HTML-to-PDF capture runs in a separate external service."
    >
      <Callout type="info" title="Viewer, not generator">
        This repo only (a) stores arbitrary JSON in DynamoDB keyed by a UUID, and
        (b) renders <code>.tsx</code> templates to continuous HTML. It never calls{" "}
        <code>{`{{GOTENBERG_URL}}`}</code>, Puppeteer, or any HTML-to-PDF engine.
        The actual PDF capture, S3 upload, and Slack notification happen in a{" "}
        <strong>separate external service</strong> (the reports microservice).
      </Callout>

      <h2>1. What this project is</h2>
      <p>
        The system is split into two independent pieces. Knowing the boundary up
        front avoids confusion when you go looking for the Gotenberg call (it is
        not here).
      </p>
      <ul>
        <li>
          <strong>This repo (the viewer)</strong> — stores JSON by UUID, renders
          a React template to HTML, and paginates client-side.
        </li>
        <li>
          <strong>An external backend (the generator)</strong> — posts the JSON
          here, builds the render URL, captures the page as PDF, and stores it.
          The first project (PRMS) does this with a microservice + Gotenberg + S3,
          but that is just <strong>one example</strong> — your backend and PDF
          engine can be anything.
        </li>
      </ul>
      <p>
        The render endpoint is public but safe: a stored UUID is{" "}
        <strong>single-use</strong> and is deleted after the first render unless
        you append <code>?test=true</code>. The shared secrets are only needed to{" "}
        <em>write</em> data, never to read it.
      </p>

      <h2>2. Prerequisites</h2>
      <p>Before running the viewer locally you need:</p>
      <ul>
        <li>
          <strong>Node.js</strong> — the project is a Next.js App Router app
          (React, Tailwind CSS v4).
        </li>
        <li>
          <strong>A DynamoDB table</strong> with partition key{" "}
          <code>id</code> of type <strong>String</strong> and no sort key. The
          app never creates the table — create it yourself and set its name in{" "}
          <code>{`{{DYNAMO_TABLE}}`}</code>.
        </li>
        <li>
          <strong>Environment variables</strong> — at minimum the table name, the
          two secrets, and (for local dev only) static AWS credentials.
        </li>
      </ul>
      <VariableTable
        rows={[
          {
            variable: "{{DYNAMO_TABLE}}",
            what: "DynamoDB table name. Read from env DYNAMODB_TABLE_NAME; throws if missing.",
            where: "This viewer",
          },
          {
            variable: "{{API_SECRET}}",
            what: "Shared secret external consumers send to POST /api/data (header x-api-secret).",
            where: "This viewer + the microservice",
          },
          {
            variable: "{{ADMIN_SECRET}}",
            what: "Secret for the admin UI / list / delete (header x-admin-secret).",
            where: "This viewer",
          },
          {
            variable: "{{AWS_REGION}}",
            what: "AWS region. Falls back to us-east-1. Auto-injected in Lambda.",
            where: "This viewer",
          },
          {
            variable: "{{AWS_ACCESS_KEY_ID}}",
            what: "Static AWS key — local dev only (Lambda uses an IAM role).",
            where: "Local .env only",
          },
          {
            variable: "{{AWS_SECRET_ACCESS_KEY}}",
            what: "Static AWS secret — local dev only.",
            where: "Local .env only",
          },
        ]}
      />

      <h2>3. Install</h2>
      <p>Clone the repository and install dependencies:</p>
      <CodeBlock title="terminal" lang="bash">{`npm install`}</CodeBlock>

      <h2>4. Set environment variables</h2>
      <p>
        Create a <code>.env</code> file with the variables from the
        prerequisites. The table name and both secrets are always required; the
        static AWS credentials are only used in local development — in Lambda the
        execution role supplies them.
      </p>
      <CodeBlock title=".env" lang="bash">{`DYNAMODB_TABLE_NAME={{DYNAMO_TABLE}}
API_SECRET={{API_SECRET}}
ADMIN_SECRET={{ADMIN_SECRET}}
AWS_REGION={{AWS_REGION}}
AWS_ACCESS_KEY_ID={{AWS_ACCESS_KEY_ID}}
AWS_SECRET_ACCESS_KEY={{AWS_SECRET_ACCESS_KEY}}`}</CodeBlock>
      <Callout type="warn" title="Missing table name throws">
        <code>DYNAMODB_TABLE_NAME</code> has no fallback — the app throws{" "}
        <code>Missing env: DYNAMODB_TABLE_NAME</code> on first DynamoDB access if
        it is absent.
      </Callout>
      <p>
        For the full deployment story (Lambda, Docker/ECR, IAM permissions), see{" "}
        <Link href="/docs/install-deploy">Install &amp; deploy</Link>.
      </p>

      <h2>5. Render your first template</h2>
      <p>
        Every template ships demo data and can render without any backend. Start
        the dev server and open a template with <code>?demo=true</code> — this
        loads the template&#39;s demo JSON and ignores any UUID.
      </p>
      <CodeBlock title="render in demo mode" lang="text">{`/{template}?demo=true`}</CodeBlock>
      <p>
        Add <code>?paperHeight=1000&amp;debug=true</code> to activate the
        client-side paginator and draw the visual cut lines while you iterate on
        a multi-page layout. The list of available templates comes from{" "}
        <code>GET /api/templates</code>, which auto-discovers every template
        folder.
      </p>
      <Callout type="success" title="No backend needed">
        Demo mode is the fastest way to preview a template. You only need the
        microservice and a UUID when generating real PDFs end to end.
      </Callout>

      <h2>6. Where to go next</h2>
      <p>Pick the area you want to dig into:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose">
        {NEXT_STEPS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group rounded-xl border border-neutral-200 px-4 py-3 no-underline transition-colors hover:border-[#065f4a]"
          >
            <p className="text-sm font-medium text-neutral-900 group-hover:text-[#065f4a]">
              {s.label}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">{s.desc}</p>
          </Link>
        ))}
      </div>
    </DocPage>
  );
}
