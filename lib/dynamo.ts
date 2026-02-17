import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

// ---------------------------------------------------------------------------
// Singleton client (survives HMR in dev, stable in prod/Lambda)
// ---------------------------------------------------------------------------

declare global {
  // eslint-disable-next-line no-var
  var __dynamoDb: DynamoDBDocumentClient | undefined;
}

function createClient(): DynamoDBDocumentClient {
  const config: ConstructorParameters<typeof DynamoDBClient>[0] = {
    region: process.env.AWS_REGION,
  };

  // Use explicit credentials if provided, otherwise fall back to IAM role
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    config.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }

  const raw = new DynamoDBClient(config);

  return DynamoDBDocumentClient.from(raw, {
    marshallOptions: { removeUndefinedValues: true },
  });
}

const client: DynamoDBDocumentClient =
  globalThis.__dynamoDb ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__dynamoDb = client;
}

// ---------------------------------------------------------------------------
// Table name
// ---------------------------------------------------------------------------

function table(): string {
  const name = process.env.DYNAMODB_TABLE_NAME;
  if (!name) throw new Error("Missing env: DYNAMODB_TABLE_NAME");
  return name;
}

// ---------------------------------------------------------------------------
// UUID generation (same format as Astro version)
// ---------------------------------------------------------------------------

export function generateUUID(): string {
  const timestamp = Date.now().toString(36);
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${timestamp}-${hex}`;
}

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

export async function putItem(uuid: string, data: unknown): Promise<void> {
  await client.send(
    new PutCommand({
      TableName: table(),
      Item: { id: uuid, json: JSON.stringify(data) },
    }),
  );
}

export async function getItem(uuid: string): Promise<unknown | null> {
  const result = await client.send(
    new GetCommand({
      TableName: table(),
      Key: { id: uuid },
    }),
  );

  if (!result.Item) return null;

  const json = result.Item.json;
  if (typeof json !== "string") return null;

  return JSON.parse(json);
}

export async function deleteItem(uuid: string): Promise<void> {
  await client.send(
    new DeleteCommand({
      TableName: table(),
      Key: { id: uuid },
    }),
  );
}
