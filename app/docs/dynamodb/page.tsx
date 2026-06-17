import DocPage from "../components/DocPage";
import CodeBlock from "../components/CodeBlock";
import Callout from "../components/Callout";
import VariableTable from "../components/VariableTable";

export default function DynamoDbPage() {
  return (
    <DocPage
      title="DynamoDB storage"
      lead="How the viewer persists arbitrary JSON by UUID — the schema, the client, and the API routes that read and write it."
    >
      <p>
        All database code lives in <code>lib/dynamo.ts</code>, consumed by three
        API routes (<code>data</code>, <code>list</code>, <code>delete</code>)
        plus the render page (<code>getItem</code>). The app never creates the
        table — it expects one to already exist.
      </p>

      <h2>Schema</h2>
      <p>
        Two attributes only. The partition key is the generated UUID; there is
        no sort key. The whole payload is stringified into a single{" "}
        <code>json</code> attribute rather than nested attributes — this avoids
        marshalling issues with arbitrary or deeply nested JSON, and reads are a
        trivial <code>JSON.parse</code>.
      </p>
      <VariableTable
        rows={[
          {
            variable: "id",
            what: "String — partition key, the generated UUID. No sort key.",
            where: "Partition key",
          },
          {
            variable: "json",
            what: "String — the original POSTed payload, JSON.stringify'd into a single attribute.",
            where: "Payload",
          },
        ]}
      />

      <Callout type="warn" title="No TTL / expiry">
        Items persist until explicitly deleted. The only cleanup is the{" "}
        <strong>one-shot delete on render</strong> and the admin{" "}
        <code>/api/delete</code> route. The table grows indefinitely, and the
        admin <code>Scan</code> reads every item.
      </Callout>

      <h3>UUID format</h3>
      <p>
        The generated key is <strong>not</strong> a standard RFC v4 UUID. It is
        a base36 timestamp followed by 8 hex characters:
      </p>
      <CodeBlock lang="text">{`{base36-timestamp}-{8 hex}`}</CodeBlock>

      <h2>Client, region, credentials</h2>
      <ul>
        <li>
          <strong>Singleton client</strong> — persists across HMR; cached on the
          global only in non-production.
        </li>
        <li>
          <strong>
            <code>removeUndefinedValues: true</code>
          </strong>{" "}
          on marshalling — DynamoDB rejects <code>undefined</code>, so this lets
          arbitrary JSON store safely.
        </li>
        <li>
          <strong>Region</strong> — resolves <code>AWS_REGION</code> →{" "}
          <code>AWS_DEFAULT_REGION</code> → fallback{" "}
          <code>&#123;&#123;AWS_REGION&#125;&#125;</code> (<code>us-east-1</code>{" "}
          when nothing is set).
        </li>
        <li>
          <strong>Credentials</strong> — in Lambda (detected via{" "}
          <code>AWS_LAMBDA_FUNCTION_NAME</code>, <code>LAMBDA_TASK_ROOT</code>,
          or <code>_HANDLER</code>) the IAM role is used with no explicit creds.
          Locally only, both{" "}
          <code>&#123;&#123;AWS_ACCESS_KEY_ID&#125;&#125;</code> and{" "}
          <code>&#123;&#123;AWS_SECRET_ACCESS_KEY&#125;&#125;</code> are required
          together.
        </li>
        <li>
          <strong>Table name</strong> — read from{" "}
          <code>DYNAMODB_TABLE_NAME</code> (<code>&#123;&#123;DYNAMO_TABLE&#125;&#125;</code>).
          It <strong>throws</strong>{" "}
          <code>Missing env: DYNAMODB_TABLE_NAME</code> if absent.
        </li>
      </ul>

      <h2>Save / read logic</h2>
      <p>Four operations cover the full lifecycle of a stored record.</p>
      <VariableTable
        rows={[
          {
            variable: "putItem(uuid, data)",
            what: "Save — PutCommand { id, json: JSON.stringify(data) }. Overwrites if id exists.",
            where: "PutCommand",
          },
          {
            variable: "getItem(uuid)",
            what: "Read — GetCommand Key: { id }. Returns null if missing, else JSON.parse. Called by the render page.",
            where: "GetCommand",
          },
          {
            variable: "scanAll()",
            what: "Scan — paginated ScanCommand. Full-table scan; cost grows with size. Admin only.",
            where: "ScanCommand",
          },
          {
            variable: "deleteItem(uuid)",
            what: "Delete — DeleteCommand Key: { id }. Idempotent.",
            where: "DeleteCommand",
          },
        ]}
      />

      <Callout type="warn" title="scanAll() is a full-table scan">
        <code>scanAll()</code> reads every item and its cost grows with table
        size. It backs the admin list only — never call it on a hot path.
      </Callout>

      <h2>API routes &amp; auth</h2>
      <p>
        Three routes touch DynamoDB. Writes are secret-gated; the only public
        path is the unauthenticated render page (covered below).
      </p>
      <VariableTable
        rows={[
          {
            variable: "POST /api/data",
            what: "Parse JSON (400 on bad), generate UUID + put, returns { uuid } with 201. Missing/invalid secret → 401.",
            where: "x-api-secret OR x-admin-secret (constant-time)",
          },
          {
            variable: "GET /api/list",
            what: "scanAll() → { items, count }.",
            where: "x-admin-secret only",
          },
          {
            variable: "POST /api/delete",
            what: "Requires body.id, deletes, returns { deleted: id }.",
            where: "x-admin-secret only",
          },
        ]}
      />

      <p>
        The write route accepts either{" "}
        <code>x-api-secret</code> = <code>&#123;&#123;API_SECRET&#125;&#125;</code>{" "}
        or <code>x-admin-secret</code> ={" "}
        <code>&#123;&#123;ADMIN_SECRET&#125;&#125;</code>, compared with{" "}
        <code>timingSafeEqual</code>:
      </p>
      <CodeBlock title="POST /api/data" lang="bash">{`curl -X POST {{PDF_VIEWER_BASE_URL}}/api/data \\
  -H "x-api-secret: {{API_SECRET}}" \\
  -H "Content-Type: application/json" \\
  -d '{ "result_name": "..." }'
# → 201 { "uuid": "..." }`}</CodeBlock>

      <Callout type="danger" title="Why the public docs are safe">
        <p>
          <code>POST /api/data</code> requires{" "}
          <code>x-api-secret</code> or <code>x-admin-secret</code> — compared
          in <strong>constant time</strong>, with a <strong>401</strong> on
          missing or invalid secrets.
        </p>
        <p>
          But the render path{" "}
          <code>GET /&#123;template&#125;?uuid=&hellip;</code> is{" "}
          <strong>unauthenticated</strong>. What protects it is the{" "}
          <strong>single-use UUID</strong>: the record is deleted after the
          first render unless <code>?test=true</code> is set. The viewer never
          exposes <code>&#123;&#123;API_SECRET&#125;&#125;</code>, which is why
          this public docs site is safe to ship.
        </p>
      </Callout>

      <Callout type="info" title="Required IAM permissions">
        The Lambda execution role must grant{" "}
        <code>dynamodb:PutItem</code>, <code>GetItem</code>,{" "}
        <code>Scan</code>, and <code>DeleteItem</code> on{" "}
        <code>&#123;&#123;DYNAMO_TABLE&#125;&#125;</code>.
      </Callout>
    </DocPage>
  );
}
