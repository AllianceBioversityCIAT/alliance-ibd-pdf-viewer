import DocPage from "../components/DocPage";
import CodeBlock from "../components/CodeBlock";
import Callout from "../components/Callout";
import VariableTable from "../components/VariableTable";

export default function InstallDeployPage() {
  return (
    <DocPage
      title="Install & deploy"
      lead="Environment variables, AWS/DynamoDB setup, IAM, and how this viewer ships to Lambda (or Docker/ECR) — plus running it locally."
    >
      <h2>Environment variables</h2>
      <p>
        This viewer reads a small set of env vars. The first three are{" "}
        <strong>always required</strong>; the AWS credential pair is{" "}
        <strong>local dev only</strong> (Lambda uses the IAM role instead).
      </p>

      <VariableTable
        rows={[
          {
            variable: "DYNAMODB_TABLE_NAME",
            what: "DynamoDB table name ({{DYNAMO_TABLE}}). Read in lib/dynamo.ts; throws if missing.",
            where: "Always — this viewer",
          },
          {
            variable: "API_SECRET",
            what: "Shared secret for external POST /api/data ({{API_SECRET}}). Must match the microservice.",
            where: "Always — this viewer + microservice",
          },
          {
            variable: "ADMIN_SECRET",
            what: "Secret for the admin UI / list / delete ({{ADMIN_SECRET}}).",
            where: "Always — this viewer",
          },
          {
            variable: "AWS_REGION",
            what: "AWS region. Falls back to AWS_DEFAULT_REGION, then us-east-1. Auto-set in Lambda.",
            where: "Recommended — this viewer",
          },
          {
            variable: "AWS_ACCESS_KEY_ID",
            what: "Static AWS key ({{AWS_ACCESS_KEY_ID}}). Both keys required together.",
            where: "Local dev only",
          },
          {
            variable: "AWS_SECRET_ACCESS_KEY",
            what: "Static AWS secret ({{AWS_SECRET_ACCESS_KEY}}). Omit in Lambda — IAM role is used.",
            where: "Local dev only",
          },
        ]}
      />

      <p>A minimal local <code>.env</code> looks like this:</p>

      <CodeBlock title=".env" lang="bash">{`DYNAMODB_TABLE_NAME={{DYNAMO_TABLE}}
API_SECRET={{API_SECRET}}
ADMIN_SECRET={{ADMIN_SECRET}}
AWS_REGION={{AWS_REGION}}
AWS_ACCESS_KEY_ID={{AWS_ACCESS_KEY_ID}}
AWS_SECRET_ACCESS_KEY={{AWS_SECRET_ACCESS_KEY}}`}</CodeBlock>

      <Callout type="info" title="Gotenberg & microservice vars live elsewhere">
        Variables like <code>{`{{GOTENBERG_URL}}`}</code>,{" "}
        <code>{`{{PDF_VIEWER_BASE_URL}}`}</code>,{" "}
        <code>{`{{RABBITMQ_URL}}`}</code>, <code>{`{{REPORT_QUEUE}}`}</code> and{" "}
        <code>{`{{AWS_BUCKET_NAME}}`}</code> belong to the{" "}
        <strong>external</strong> <code>reports-microservice</code>, NOT this
        repo. Do not set them here.
      </Callout>

      <h2>AWS / DynamoDB</h2>
      <p>
        The app <strong>never creates the table</strong> — provision it first.
        Create a DynamoDB table with partition key <code>id</code> of type{" "}
        <strong>String</strong> and <strong>no sort key</strong>. Name it
        whatever you set in <code>{`{{DYNAMO_TABLE}}`}</code>.
      </p>
      <ul>
        <li>
          No TTL is required by the code. Add one yourself if you want ephemeral
          cleanup — otherwise the table grows indefinitely.
        </li>
        <li>
          The only built-in cleanup is the one-shot delete on render plus the
          admin <code>/api/delete</code> route.
        </li>
      </ul>

      <h3>IAM permissions</h3>
      <p>
        The Lambda execution role must grant these four actions on{" "}
        <code>{`{{DYNAMO_TABLE}}`}</code>:
      </p>

      <CodeBlock title="IAM policy actions" lang="json">{`{
  "Effect": "Allow",
  "Action": [
    "dynamodb:PutItem",
    "dynamodb:GetItem",
    "dynamodb:Scan",
    "dynamodb:DeleteItem"
  ],
  "Resource": "arn:aws:dynamodb:{{AWS_REGION}}:<account-id>:table/{{DYNAMO_TABLE}}"
}`}</CodeBlock>

      <Callout type="warn" title="Scan is a full-table read">
        The admin <code>/api/list</code> route uses a paginated{" "}
        <code>Scan</code> — its cost grows with table size. Combined with the
        no-TTL default, keep the table small or add your own expiry.
      </Callout>

      <h2>Gotenberg dependency (external)</h2>
      <Callout type="danger" title="Gotenberg is NOT part of this repo">
        This viewer only stores JSON and renders templates to continuous HTML —
        it never calls Gotenberg, Puppeteer, or any HTML&#8594;PDF engine. Stand
        up Gotenberg separately (or use the{" "}
        <code>reports-microservice</code> deployment) and configure that service
        with <code>{`{{PDF_VIEWER_BASE_URL}}`}</code>,{" "}
        <code>{`{{GOTENBERG_URL}}`}</code>, and a matching{" "}
        <code>{`{{API_SECRET}}`}</code>.
      </Callout>

      <h2>Lambda deploy (primary)</h2>
      <p>
        The viewer ships as a Next.js standalone server on AWS Lambda. Key
        pieces:
      </p>
      <ul>
        <li>
          <code>next.config.ts</code> sets <code>output: &apos;standalone&apos;</code>{" "}
          for a minimal Lambda bundle.
        </li>
        <li>
          <code>lambda/handler.mjs</code> is a hand-rolled adapter that
          intercepts Next.js&apos;s internal HTTP server and drives it from a
          Lambda Function URL / API Gateway event.
        </li>
        <li>
          Binary responses (<code>application/pdf</code>, <code>image/*</code>,{" "}
          <code>font/*</code>, <code>application/octet-stream</code>) are
          base64-encoded.
        </li>
        <li>
          Static files (<code>/_next/static/*</code>, <code>/public/*</code>)
          are served directly before Next.js. A 29-second internal request
          timeout applies.
        </li>
        <li>
          <code>scripts/package-lambda.mjs</code> builds{" "}
          <code>lambda-package/</code> and warns at the 50MB / 250MB limits.
        </li>
      </ul>

      <CodeBlock title="package the Lambda bundle" lang="bash">{`npm run build
node scripts/package-lambda.mjs
# → produces lambda-package/ (warns at >50MB / >250MB)`}</CodeBlock>

      <h2>Docker / ECR (fallback)</h2>
      <p>
        A <code>Dockerfile</code> is provided as an alternative to the raw
        Lambda ZIP. It uses the AWS Lambda Node 20 base image, copies the
        standalone build plus static, public, and handler files, and sets the
        handler as the container command.
      </p>

      <CodeBlock title="Dockerfile (essentials)" lang="dockerfile">{`FROM public.ecr.aws/lambda/nodejs:20
# copy standalone + static + public + handler
CMD ["handler.handler"]`}</CodeBlock>

      <h2>Local dev</h2>
      <p>
        For local development, <code>lambda/local-server.mjs</code> feeds fake
        Lambda events to the same handler on port 3000 — so you exercise the
        real adapter, not <code>next dev</code>.
      </p>
      <ul>
        <li>
          Set <code>AWS_REGION</code>, <code>AWS_ACCESS_KEY_ID</code>,{" "}
          <code>AWS_SECRET_ACCESS_KEY</code>, <code>DYNAMODB_TABLE_NAME</code>,{" "}
          <code>API_SECRET</code>, and <code>ADMIN_SECRET</code> locally.
        </li>
        <li>
          The admin surface at <code>app/admin/page.tsx</code> POSTs to{" "}
          <code>/api/data</code> with <code>x-admin-secret</code>, then opens{" "}
          <code>/&#123;template&#125;?uuid=&#8230;</code> — the manual
          equivalent of the microservice flow, minus Gotenberg.
        </li>
      </ul>

      <CodeBlock title="run locally" lang="bash">{`npm run build
node lambda/local-server.mjs
# serves the Lambda handler on http://localhost:3000`}</CodeBlock>
    </DocPage>
  );
}
