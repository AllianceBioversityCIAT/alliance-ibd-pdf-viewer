/**
 * AWS Lambda Handler for Astro SSR
 * 
 * This handler converts Lambda events (API Gateway or Function URL) to Node.js Request objects,
 * invokes the Astro app, and converts the Response back to Lambda format.
 */

import type { 
  APIGatewayProxyEventV2, 
  APIGatewayProxyResultV2, 
  Context,
  LambdaFunctionUrlEvent
} from 'aws-lambda';
import { NodeApp } from 'astro/app/node';
import { applyPolyfills } from 'astro/app/node/polyfills';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import the built Astro app
// Astro Node adapter generates manifest in dist/server/manifest.js
// @ts-ignore - Astro generates this file at build time
import { manifest } from '../dist/server/manifest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Apply polyfills for Node.js compatibility
applyPolyfills();

// Initialize Astro app (singleton pattern for cold start optimization)
let app: NodeApp | null = null;

function getApp(): NodeApp {
  if (!app) {
    app = new NodeApp(manifest);
  }
  return app;
}

/**
 * Convert Lambda Function URL event to Request
 */
function functionUrlEventToRequest(event: LambdaFunctionUrlEvent): Request {
  const url = `https://${event.requestContext.domainName}${event.rawPath}${event.rawQueryString ? `?${event.rawQueryString}` : ''}`;
  
  // Filter out undefined headers
  const headers: Record<string, string> = {};
  Object.entries(event.headers || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      headers[key] = value;
    }
  });
  
  return new Request(url, {
    method: event.requestContext.http.method,
    headers: new Headers(headers),
    body: event.body 
      ? (event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body)
      : undefined,
  });
}

/**
 * Convert API Gateway V2 event to Request
 */
function apiGatewayEventToRequest(event: APIGatewayProxyEventV2): Request {
  const url = `https://${event.requestContext.domainName}${event.rawPath}${event.rawQueryString ? `?${event.rawQueryString}` : ''}`;
  
  // Filter out undefined headers
  const headers: Record<string, string> = {};
  Object.entries(event.headers || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      headers[key] = value;
    }
  });
  
  return new Request(url, {
    method: event.requestContext.http.method,
    headers: new Headers(headers),
    body: event.body 
      ? (event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body)
      : undefined,
  });
}

/**
 * Convert Response to Lambda Function URL format
 */
async function responseToFunctionUrlResult(response: Response): Promise<{
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  isBase64Encoded: boolean;
}> {
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    // Lambda Function URL has restrictions on some headers
    if (key.toLowerCase() !== 'connection') {
      responseHeaders[key] = value;
    }
  });

  const body = await response.text();
  
  return {
    statusCode: response.status,
    headers: responseHeaders,
    body,
    isBase64Encoded: false,
  };
}

/**
 * Convert Response to API Gateway V2 format
 */
async function responseToApiGatewayResult(response: Response): Promise<APIGatewayProxyResultV2> {
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  const body = await response.text();
  
  return {
    statusCode: response.status,
    headers: responseHeaders,
    body,
    isBase64Encoded: false,
  };
}

/**
 * Main Lambda handler
 * 
 * Supports both API Gateway V2 and Lambda Function URL events
 */
export const handler = async (
  event: APIGatewayProxyEventV2 | LambdaFunctionUrlEvent,
  context: Context
): Promise<APIGatewayProxyResultV2 | { statusCode: number; headers: Record<string, string>; body: string; isBase64Encoded: boolean }> => {
  try {
    // Determine event type and convert to Request
    const isFunctionUrl = 'requestContext' in event && 'http' in event.requestContext;
    const request = isFunctionUrl 
      ? functionUrlEventToRequest(event as LambdaFunctionUrlEvent)
      : apiGatewayEventToRequest(event as APIGatewayProxyEventV2);

    // Get Astro app instance
    const astroApp = getApp();

    // Render with Astro
    const response = await astroApp.render(request);

    // Convert Response to Lambda format
    if (isFunctionUrl) {
      return await responseToFunctionUrlResult(response);
    } else {
      return await responseToApiGatewayResult(response);
    }
  } catch (error: any) {
    // Log error without exposing sensitive information
    console.error('Lambda handler error:', {
      message: error.message,
      stack: error.stack,
      // Sanitized event info (no headers, body, or sensitive data)
      eventInfo: {
        method: 'requestContext' in event && 'http' in event.requestContext 
          ? (event as LambdaFunctionUrlEvent).requestContext.http.method
          : (event as APIGatewayProxyEventV2).requestContext.http.method,
        path: 'rawPath' in event ? event.rawPath : (event as APIGatewayProxyEventV2).rawPath,
        requestId: context.requestId,
        functionName: context.functionName,
      }
    });
    
    // Never expose full event/context in logs (may contain sensitive headers, cookies, etc.)
    // Only return generic error message to client
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Internal Server Error',
      isBase64Encoded: false,
    };
  }
};
