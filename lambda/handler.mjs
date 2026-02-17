/**
 * AWS Lambda Handler for Next.js Standalone Server
 * 
 * Adapts Next.js standalone server to Lambda.
 * Supports both Lambda Function URL and API Gateway events.
 */

import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to Next.js standalone server
const SERVER_PATH = join(__dirname, '.next', 'standalone', 'server.js');

let requestHandler = null;

/**
 * Initialize Next.js request handler (lazy loading)
 */
async function getRequestHandler() {
  if (requestHandler) {
    return requestHandler;
  }

  try {
    // Import Next.js server
    const serverModule = await import(SERVER_PATH);
    
    // Next.js standalone exports a request handler
    // It might be default export or named export
    requestHandler = serverModule.default || serverModule.requestHandler || serverModule;
    
    return requestHandler;
  } catch (error) {
    console.error('Failed to load Next.js server:', error);
    throw error;
  }
}

/**
 * Convert Lambda event to Next.js request/response
 */
function createRequestResponse(event) {
  const url = event.rawPath || event.path || '/';
  const queryString = event.rawQueryString || '';
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  const method = event.requestContext?.http?.method || event.httpMethod || 'GET';
  
  const headers = new Headers();
  Object.entries(event.headers || {}).forEach(([key, value]) => {
    if (value) {
      headers.set(key, value);
    }
  });

  const body = event.body 
    ? (event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body)
    : undefined;

  const request = new Request(`https://${event.requestContext?.domainName || 'localhost'}${fullUrl}`, {
    method,
    headers,
    body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  });

  let responseBody = '';
  let responseHeaders = {};
  let statusCode = 200;
  let isBase64Encoded = false;

  const response = {
    status: (code) => {
      statusCode = code;
      return response;
    },
    setHeader: (name, value) => {
      responseHeaders[name] = value;
      return response;
    },
    getHeader: (name) => responseHeaders[name],
    write: (chunk) => {
      responseBody += chunk.toString();
      return response;
    },
    end: (chunk) => {
      if (chunk) {
        responseBody += chunk.toString();
      }
      return response;
    },
    json: (data) => {
      responseHeaders['Content-Type'] = 'application/json';
      responseBody = JSON.stringify(data);
      return response;
    },
    send: (data) => {
      responseBody = typeof data === 'string' ? data : JSON.stringify(data);
      return response;
    },
  };

  return { request, response, getResult: () => ({
    statusCode,
    headers: responseHeaders,
    body: responseBody,
    isBase64Encoded,
  })};
}

/**
 * Main Lambda handler
 */
export const handler = async (event, context) => {
  try {
    // Initialize request handler if needed
    const handlerFn = await getRequestHandler();

    // Create request/response objects
    const { request, response, getResult } = createRequestResponse(event);

    // Call Next.js request handler
    await handlerFn(request, response);

    // Get the result
    return getResult();
  } catch (error) {
    console.error('Lambda handler error:', {
      message: error.message,
      stack: error.stack,
    });

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Internal Server Error',
      isBase64Encoded: false,
    };
  }
};
