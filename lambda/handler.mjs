/**
 * AWS Lambda Handler for Next.js Standalone Server
 * 
 * Directly uses Next.js request handler without serverless-http.
 * Supports both Lambda Function URL and API Gateway events.
 */

import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to Next.js standalone server
const SERVER_PATH = join(__dirname, '.next', 'standalone', 'server.js');

let nextApp = null;

/**
 * Initialize Next.js app (lazy loading)
 */
async function getNextApp() {
  if (nextApp) {
    return nextApp;
  }

  try {
    // Import Next.js server module
    const serverModule = await import(SERVER_PATH);

    console.log('Server module imported. Keys:', Object.keys(serverModule));
    console.log('Default type:', typeof serverModule.default);
    console.log('Default keys:', serverModule.default ? Object.keys(serverModule.default) : 'null');

    const defaultExport = serverModule.default;

    if (!defaultExport) {
      throw new Error('Server module default export is undefined');
    }

    // Next.js standalone exports an object that contains the server
    // We need to find the request handler or create a wrapper
    // Try different approaches to access the handler

    // Approach 1: Check if there's a requestHandler property
    if (defaultExport.requestHandler && typeof defaultExport.requestHandler === 'function') {
      nextApp = { handler: defaultExport.requestHandler };
      return nextApp;
    }

    // Approach 2: Check if there's a handle method
    if (defaultExport.handle && typeof defaultExport.handle === 'function') {
      nextApp = { handler: defaultExport.handle };
      return nextApp;
    }

    // Approach 3: Check if there's a fetch method (Web API)
    if (defaultExport.fetch && typeof defaultExport.fetch === 'function') {
      nextApp = { handler: defaultExport.fetch };
      return nextApp;
    }

    // Approach 4: The object might contain the server instance
    // Next.js standalone might export { server, port, hostname }
    // We need to access the internal request handler
    if (defaultExport.server) {
      const server = defaultExport.server;
      if (server.requestHandler) {
        nextApp = { handler: server.requestHandler };
        return nextApp;
      }
      if (server.handle) {
        nextApp = { handler: server.handle };
        return nextApp;
      }
    }

    // Approach 5: The default export might be the server itself
    // Try to use it as a fetch handler (Next.js App Router uses Web Fetch API)
    if (typeof defaultExport === 'object') {
      // Create a wrapper that uses the server's internal handler
      nextApp = {
        handler: createFetchHandler(defaultExport),
        raw: defaultExport
      };
      return nextApp;
    }

    throw new Error(`Could not find request handler. Default export type: ${typeof defaultExport}, keys: ${Object.keys(defaultExport).join(', ')}`);
  } catch (error) {
    console.error('Failed to load Next.js server:', error);
    throw error;
  }
}

/**
 * Create a fetch handler wrapper for Next.js
 */
function createFetchHandler(server) {
  return async (request) => {
    // If server has a fetch method, use it directly
    if (typeof server.fetch === 'function') {
      return await server.fetch(request);
    }

    // If server has a requestHandler, use it
    if (typeof server.requestHandler === 'function') {
      return await server.requestHandler(request);
    }

    // If server has a handle method, use it
    if (typeof server.handle === 'function') {
      return await server.handle(request);
    }

    // Last resort: try to call the server as a function
    if (typeof server === 'function') {
      return await server(request);
    }

    throw new Error('Could not find a way to handle requests with the server object');
  };
}

/**
 * Convert Lambda event to Next.js Request object
 */
function createNextRequest(event) {
  const url = event.rawPath || event.path || '/';
  const queryString = event.rawQueryString || '';
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  const method = event.requestContext?.http?.method || event.httpMethod || 'GET';
  const host = event.requestContext?.domainName || event.headers?.host || 'localhost';

  const headers = new Headers();
  Object.entries(event.headers || {}).forEach(([key, value]) => {
    if (value) {
      headers.set(key, value);
    }
  });

  const body = event.body
    ? (event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body)
    : undefined;

  return new Request(`https://${host}${fullUrl}`, {
    method,
    headers,
    body: body,
  });
}

/**
 * Convert Next.js Response to Lambda response format
 */
async function convertResponseToLambda(response) {
  if (!response || !(response instanceof Response)) {
    throw new Error('Invalid response object');
  }

  const headers = {};
  response.headers.forEach((value, key) => {
    // Skip connection header
    if (key.toLowerCase() !== 'connection') {
      headers[key] = value;
    }
  });

  let body;
  let isBase64Encoded = false;

  // Check if response is binary
  const contentType = response.headers.get('content-type') || '';
  if (contentType.startsWith('image/') ||
    contentType.startsWith('application/pdf') ||
    contentType.startsWith('application/octet-stream') ||
    contentType.startsWith('font/')) {
    const arrayBuffer = await response.arrayBuffer();
    body = Buffer.from(arrayBuffer).toString('base64');
    isBase64Encoded = true;
  } else {
    body = await response.text();
  }

  return {
    statusCode: response.status,
    headers,
    body,
    isBase64Encoded,
  };
}

/**
 * Main Lambda handler
 */
export const handler = async (event, context) => {
  try {
    // Initialize Next.js app if needed
    const app = await getNextApp();

    if (!app || !app.handler || typeof app.handler !== 'function') {
      throw new Error('Next.js request handler is not available');
    }

    // Create Next.js Request from Lambda event
    const request = createNextRequest(event);

    // Call Next.js request handler
    const response = await app.handler(request);

    // Convert Next.js Response to Lambda format
    return await convertResponseToLambda(response);
  } catch (error) {
    console.error('Lambda handler error:', {
      message: error.message,
      stack: error.stack,
      errorType: error.constructor.name,
    });

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Internal Server Error: ' + error.message,
      isBase64Encoded: false,
    };
  }
};
