/**
 * Database Abstraction Layer
 * 
 * Provides a unified interface for database operations, abstracting away
 * the underlying database implementation (currently DynamoDB, migrated from Cloudflare D1).
 * 
 * This allows the application code to remain database-agnostic and makes
 * future migrations easier.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  DeleteCommand,
  type GetCommandOutput,
  type PutCommandOutput,
  type DeleteCommandOutput
} from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client (singleton pattern)
let docClient: DynamoDBDocumentClient | null = null;

/**
 * Get or create DynamoDB document client
 */
function getDynamoDBClient(): DynamoDBDocumentClient {
  if (!docClient) {
    const client = new DynamoDBClient({ 
      region: process.env.AWS_REGION || 'us-east-1',
      // Optional: Configure retry, timeout, etc.
    });
    docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }
  return docClient;
}

/**
 * Get table name from environment variable
 */
function getTableName(): string {
  const tableName = process.env.DYNAMODB_TABLE_NAME;
  if (!tableName) {
    throw new Error('DYNAMODB_TABLE_NAME environment variable is not set');
  }
  return tableName;
}

/**
 * Database interface matching Cloudflare D1 API pattern
 * This allows minimal changes to existing code
 */
export interface Database {
  /**
   * Get a record by UUID
   * @param uuid - The UUID to look up
   * @returns The JSON data as a parsed object, or null if not found
   */
  get(uuid: string): Promise<any | null>;

  /**
   * Insert a new record
   * @param uuid - The UUID for the record
   * @param json - The JSON data to store (will be stringified)
   * @returns The UUID of the inserted record
   */
  insert(uuid: string, json: any): Promise<string>;

  /**
   * Delete a record by UUID
   * @param uuid - The UUID to delete
   * @returns true if deleted, false if not found
   */
  delete(uuid: string): Promise<boolean>;
}

/**
 * DynamoDB implementation of Database interface
 */
class DynamoDBDatabase implements Database {
  private client: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    this.client = getDynamoDBClient();
    this.tableName = getTableName();
  }

  async get(uuid: string): Promise<any | null> {
    try {
      const result: GetCommandOutput = await this.client.send(new GetCommand({
        TableName: this.tableName,
        Key: { uuid },
      }));

      if (!result.Item) {
        return null;
      }

      // Parse JSON string back to object
      return JSON.parse(result.Item.json as string);
    } catch (error: any) {
      // Log error without exposing sensitive data (table name, keys, etc.)
      console.error('DynamoDB get error:', {
        message: error.message,
        code: error.name,
        // Don't log table name or UUID in production
      });
      throw new Error(`Failed to get record: ${error.message}`);
    }
  }

  async insert(uuid: string, json: any): Promise<string> {
    try {
      await this.client.send(new PutCommand({
        TableName: this.tableName,
        Item: {
          uuid,
          json: JSON.stringify(json),
          createdAt: Date.now(), // Optional: for TTL if configured
        },
      }));

      return uuid;
    } catch (error: any) {
      // Log error without exposing sensitive data
      console.error('DynamoDB insert error:', {
        message: error.message,
        code: error.name,
        // Don't log table name, UUID, or data in production
      });
      throw new Error(`Failed to insert record: ${error.message}`);
    }
  }

  async delete(uuid: string): Promise<boolean> {
    try {
      const result: DeleteCommandOutput = await this.client.send(new DeleteCommand({
        TableName: this.tableName,
        Key: { uuid },
        ReturnValues: 'ALL_OLD',
      }));

      // Return true if item existed and was deleted
      return result.Attributes !== undefined;
    } catch (error: any) {
      // Log error without exposing sensitive data
      console.error('DynamoDB delete error:', {
        message: error.message,
        code: error.name,
        // Don't log table name or UUID in production
      });
      throw new Error(`Failed to delete record: ${error.message}`);
    }
  }
}

// Singleton instance
let dbInstance: Database | null = null;

/**
 * Get database instance (singleton pattern)
 * 
 * This function replaces the Cloudflare D1 pattern:
 *   const runtime = Astro.locals.runtime;
 *   const db = runtime.env.DB;
 * 
 * Usage in Astro pages:
 *   import { getDatabase } from '../lib/db';
 *   const db = getDatabase();
 *   const data = await db.get(uuid);
 */
export function getDatabase(): Database {
  if (!dbInstance) {
    dbInstance = new DynamoDBDatabase();
  }
  return dbInstance;
}

/**
 * Reset database instance (useful for testing)
 */
export function resetDatabase(): void {
  dbInstance = null;
}
