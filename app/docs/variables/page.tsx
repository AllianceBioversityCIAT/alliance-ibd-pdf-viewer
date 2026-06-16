import DocPage from "../components/DocPage";
import VariableTable from "../components/VariableTable";

const rows = [
  {
    variable: "{{API_SECRET}}",
    what: "Shared secret external consumers / the microservice send to POST /api/data (header x-api-secret).",
    where: "This viewer (env API_SECRET) and the microservice. Must match.",
  },
  {
    variable: "{{ADMIN_SECRET}}",
    what: "Secret for the admin UI / list / delete (header x-admin-secret). Also accepted on POST /api/data.",
    where: "This viewer (env ADMIN_SECRET).",
  },
  {
    variable: "{{DYNAMO_TABLE}}",
    what: "DynamoDB table name. Read from env DYNAMODB_TABLE_NAME; throws if missing.",
    where: "This viewer (lib/dynamo.ts).",
  },
  {
    variable: "{{AWS_REGION}}",
    what: "AWS region. AWS_REGION → AWS_DEFAULT_REGION → fallback us-east-1. Auto-injected in Lambda.",
    where: "This viewer.",
  },
  {
    variable: "{{AWS_ACCESS_KEY_ID}}",
    what: "Static AWS key — local dev only, never in Lambda (IAM role used instead).",
    where: "Local .env only.",
  },
  {
    variable: "{{AWS_SECRET_ACCESS_KEY}}",
    what: "Static AWS secret — local dev only.",
    where: "Local .env only.",
  },
  {
    variable: "{{PDF_VIEWER_BASE_URL}}",
    what: "Base URL of this viewer deployment.",
    where: "Configured in the microservice.",
  },
  {
    variable: "{{GOTENBERG_URL}}",
    what: "Gotenberg (headless Chrome) base URL. Endpoint: POST {{GOTENBERG_URL}}/forms/chromium/convert/url.",
    where: "External microservice only.",
  },
  {
    variable: "{{RABBITMQ_URL}}",
    what: "RabbitMQ broker URL (transport between PRMS server and microservice).",
    where: "PRMS server + microservice.",
  },
  {
    variable: "{{REPORT_QUEUE}}",
    what: "RabbitMQ queue name (durable).",
    where: "PRMS server + microservice.",
  },
  {
    variable: "{{MICROSERVICE_API_KEY}}",
    what: "API key PRMS puts in the RMQ payload (apiKey); equals {{API_SECRET}} on the viewer side.",
    where: "PRMS server.",
  },
  {
    variable: "{{AWS_BUCKET_NAME}}",
    what: "S3 bucket the microservice uploads the final PDF to.",
    where: "PRMS server + microservice.",
  },
  {
    variable: "{{FRONT_END_PDF_ENDPOINT}}",
    what: "Front-end PDF endpoint baked into the JSON by the stored DB procedure.",
    where: "PRMS server.",
  },
];

export default function VariablesPage() {
  return (
    <DocPage
      title="Required variables"
      lead="Every {{variable}} placeholder used across these docs is masking a real URL, secret, table name, or host. This page is the single reference for what each one is and where it lives."
    >
      <p>
        Throughout the documentation, real values are never printed — they appear
        as <code>{"{{variable}}"}</code> placeholders. The table below lists every
        placeholder, what it represents, and which side of the pipeline owns it
        (this viewer, the external reports microservice, or the PRMS server).
      </p>

      <VariableTable rows={rows} />

      <h2>Notes</h2>
      <ul>
        <li>
          <strong>Secrets must match across services.</strong>{" "}
          <code>{"{{API_SECRET}}"}</code> on this viewer equals{" "}
          <code>{"{{MICROSERVICE_API_KEY}}"}</code> on the PRMS side — if they
          drift, <code>POST /api/data</code> rejects the request.
        </li>
        <li>
          <strong>Local dev only.</strong>{" "}
          <code>{"{{AWS_ACCESS_KEY_ID}}"}</code> and{" "}
          <code>{"{{AWS_SECRET_ACCESS_KEY}}"}</code> belong in a local{" "}
          <code>.env</code> exclusively. In Lambda, the execution IAM role
          supplies credentials.
        </li>
        <li>
          <strong>Required at boot.</strong>{" "}
          <code>{"{{DYNAMO_TABLE}}"}</code> is read from{" "}
          <code>DYNAMODB_TABLE_NAME</code> and throws if missing.
        </li>
      </ul>
    </DocPage>
  );
}
