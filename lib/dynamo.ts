import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

// ---------------------------------------------------------------------------
// Singleton client (survives HMR in dev, stable in prod/Lambda)
// ---------------------------------------------------------------------------

declare global {
  // eslint-disable-next-line no-var
  var __dynamoDb: DynamoDBDocumentClient | undefined;
}

function createClient(): DynamoDBDocumentClient {
  // Get region from environment
  // In Lambda, AWS_REGION is automatically set by the runtime
  // Also check AWS_REGION env var (which you've configured in Lambda)
  const region = 
    process.env.AWS_REGION || 
    process.env.AWS_DEFAULT_REGION || 
    'us-east-1'; // Fallback

  const config: ConstructorParameters<typeof DynamoDBClient>[0] = {
    region: region,
  };

  // In Lambda, NEVER use explicit credentials - always use the IAM role
  // Only use explicit credentials for LOCAL development (when not in Lambda)
  const isLambda = !!(
    process.env.AWS_LAMBDA_FUNCTION_NAME || 
    process.env.LAMBDA_TASK_ROOT ||
    process.env._HANDLER
  );

  if (!isLambda && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    // Only use explicit credentials for local development
    config.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }
  // In Lambda, the SDK will automatically use the IAM role credentials
  // Do NOT set credentials explicitly in Lambda - let the SDK use the role

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

export interface TableItem {
  id: string;
  json: string;
}

export async function scanAll(): Promise<TableItem[]> {
  const items: TableItem[] = [];
  let lastKey: Record<string, unknown> | undefined;

  do {
    const result = await client.send(
      new ScanCommand({
        TableName: table(),
        ExclusiveStartKey: lastKey,
      }),
    );

    if (result.Items) {
      for (const item of result.Items) {
        items.push({ id: item.id as string, json: item.json as string });
      }
    }

    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return items;
}

export async function deleteItem(uuid: string): Promise<void> {
  await client.send(
    new DeleteCommand({
      TableName: table(),
      Key: { id: uuid },
    }),
  );
}
