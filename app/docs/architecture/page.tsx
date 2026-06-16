import DocPage from "../components/DocPage";
import CodeBlock from "../components/CodeBlock";
import Callout from "../components/Callout";
import VariableTable from "../components/VariableTable";

const pipeline = `[PRMS client]
   |  GET /result/:code?phase=...   (or /ipsr/:code)
   v
[PRMS server]  (onecgiar-pr-server/src/api/platform-report/)
   |  - builds JSON via stored DB procedure (bakes {{FRONT_END_PDF_ENDPOINT}})
   |  - decides legacy vs P25 by portfolio acronym (P25 -> new viewer engine)
   |  - picks templateName + paper size
   |  RabbitMQ  client.send('pdf.generateUrl', {data, templateName,
   |            paperWidth, paperHeight, bucketName, fileName, apiKey})
   v
[reports-microservice]  (EXTERNAL -- the 'pdf.generateUrl' handler)
   |  (a) POST {{PDF_VIEWER_BASE_URL}}/api/data
   |      (x-api-secret: {{API_SECRET}})  -> { uuid }
   |  (b) build render URL:
   |      {{PDF_VIEWER_BASE_URL}}/{templateName}?uuid=...&paperWidth=...&paperHeight=...
   |  (c) POST {{GOTENBERG_URL}}/forms/chromium/convert/url  with that render URL
   v
[Gotenberg / headless Chrome]  navigates render URL
   v
[alliance-ibd-pdf-viewer]  (THIS REPO)
   |  - GET /{template}?uuid=...  ->  getItem(uuid) from DynamoDB
   |    (one-shot: deleted after read)
   |  - renders <TemplateComponent data={json}/> as continuous HTML
   |  - client-side Paginator inserts page breaks + footers
   |  ^ Gotenberg captures the settled page -> PDF binary
   v
[reports-microservice]  - upload PDF -> S3 {{AWS_BUCKET_NAME}}/{fileName}
   |                     - reply { data: { url } }   - Slack notify
   v
[PRMS server] -> returns { pdf: url, fileName } -> [PRMS client]`;

export default function ArchitecturePage() {
  return (
    <DocPage
      title="Architecture"
      lead="The end-to-end PDF pipeline and where this repo sits in it. This viewer only stores JSON and renders templates to HTML — the actual PDF capture happens downstream, in the consuming project's own stack."
    >
      <h2>The pipeline at a glance</h2>
      <p>
        The diagram below shows the pipeline as the <strong>first project
        (PRMS)</strong> wired it: a request starts in the PRMS client, is routed
        and built by the PRMS server, transported over RabbitMQ to the external{" "}
        <code>reports-microservice</code>, which drives Gotenberg against this
        viewer and uploads the result to S3. This repo is a single stop in that
        chain: it stores the JSON payload by UUID and renders the React template
        to continuous HTML.
      </p>

      <Callout type="success" title="PRMS is a reference example, not a requirement">
        The PRMS server, the <code>reports-microservice</code>, RabbitMQ, and
        Gotenberg shown here are how <strong>the first project</strong> integrated
        this viewer — a working reference, not a mandatory stack. Your backend can
        produce and send the JSON however it likes, and you can capture the
        rendered HTML to PDF with <strong>any</strong> engine (Gotenberg,
        Puppeteer, Playwright, a print service) — or just consume the HTML. The
        only thing this viewer actually requires is the{" "}
        <code>POST /api/data → uuid → render URL</code> contract.
      </Callout>

      <CodeBlock title="end-to-end flow (PRMS example)" lang="text">
        {pipeline}
      </CodeBlock>

      <h2>Split of responsibility</h2>
      <p>
        Three independent systems share the job. Knowing which one owns each
        concern is the fastest way to debug a broken PDF: build/transport issues
        are upstream, capture/upload issues are in the microservice, and HTML or
        pagination issues are here.
      </p>

      <VariableTable
        rows={[
          {
            variable: "PRMS server",
            what: "Build & route JSON, choose template, transport over RabbitMQ",
            where: "External — PRMS example (your backend replaces this)",
          },
          {
            variable: "reports-microservice",
            what: "POST data, build render URL, call Gotenberg, upload S3, Slack notify",
            where: "External — PRMS example (any PDF engine works here)",
          },
          {
            variable: "This repo",
            what: "Store JSON by UUID, render React template to HTML, paginate",
            where: "alliance-ibd-pdf-viewer",
          },
        ]}
      />

      <h2>What this repo actually does</h2>
      <p>
        Scoped tightly, the viewer has only two jobs. It exposes an authenticated{" "}
        <code>POST /api/data</code> that stores arbitrary JSON in DynamoDB keyed
        by a UUID, and a public <code>GET /&#123;template&#125;?uuid=...</code>{" "}
        that fetches that JSON and renders the matching template as continuous
        HTML. A client-side Paginator then inserts page breaks and footers so the
        page is ready when Gotenberg captures it.
      </p>
      <ul>
        <li>
          Stores arbitrary JSON in DynamoDB by UUID (one-shot: deleted after the
          first render unless <code>?test=true</code>).
        </li>
        <li>
          Renders React <code>.tsx</code> templates to <strong>continuous HTML</strong>{" "}
          — never a fixed-height page.
        </li>
        <li>
          Runs the client Paginator (page breaks + footers) before capture.
        </li>
      </ul>

      <Callout type="warn" title="Gotenberg / PDF capture is EXTERNAL">
        This repo never calls Gotenberg, Puppeteer, or any HTML&rarr;PDF engine.
        The actual PDF capture, S3 upload, and Slack notification all live in the
        separate <code>reports-microservice</code>. Verified: zero{" "}
        <code>convert/url</code> or <code>chromium</code> calls anywhere in this
        codebase.
      </Callout>

      <Callout type="info" title="The live handler was contract-derived">
        The live <code>pdf.generateUrl</code> / Gotenberg handler was not on disk
        during review (the microservice checkout was on a legacy branch). Steps
        (a)&ndash;(c) above are reconstructed from the <strong>producer contract</strong>{" "}
        (what PRMS sends over RabbitMQ) plus the <strong>viewer contract</strong>{" "}
        (what this repo accepts). Pull <code>reports-microservice</code>{" "}
        <code>main</code>/production for the authoritative handler.
      </Callout>

      <h2>Tech stack (this repo)</h2>
      <p>
        Next.js App Router with standalone output, React templates, Tailwind CSS
        v4, and DynamoDB via the AWS SDK v3. It deploys as a Next.js standalone
        server on AWS Lambda, with a Docker/ECR image as the fallback.
      </p>
    </DocPage>
  );
}
