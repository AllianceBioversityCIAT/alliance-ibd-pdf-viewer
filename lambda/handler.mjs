/**
 * AWS Lambda Handler for Next.js Standalone Server
 * 
 * Directly uses Next.js request handler without starting HTTP server.
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
    // Import Next.js server module
    // Note: This may trigger server startup, but we'll intercept the handler
    const serverModule = await import(SERVER_PATH);
    
    console.log('Server module imported. Keys:', Object.keys(serverModule));
    
    // Next.js standalone typically exports the request handler
    // Look for common Next.js handler exports
    if (serverModule.requestHandler) {
      requestHandler = serverModule.requestHandler;
    } else if (serverModule.default && typeof serverModule.default === 'function') {
      // Default export might be the handler
      requestHandler = serverModule.default;
    } else if (serverModule.handler) {
      requestHandler = serverModule.handler;
    } else {
      // Try to access the internal Next.js request handler
      // Next.js stores it in different places depending on version
      throw new Error('Could not find request handler in server module. Available keys: ' + Object.keys(serverModule).join(', '));
    }
    
    if (typeof requestHandler !== 'function') {
      throw new Error(`Request handler is not a function. Type: ${typeof requestHandler}`);
    }
    
    return requestHandler;
  } catch (error) {
    console.error('Failed to load Next.js request handler:', error);
    throw error;
  }
}

/**
 * Convert Lambda event to Next.js Request object
 */
function createNextRequest(event) {
  const url = event.rawPath || event.path || '/';
  const queryString = event.rawQueryString || '';
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  const method = event.requestContext?.http?.method || event.httpMethod || 'GET';
  const host = event.requestContext?.domainName || 'localhost';
  
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
async function convertResponse(response) {
  const headers = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let body;
  let isBase64Encoded = false;

  // Check if response is binary
  const contentType = response.headers.get('content-type') || '';
  if (contentType.startsWith('image/') || contentType.startsWith('application/pdf') || contentType.startsWith('application/octet-stream')) {
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
    // Initialize request handler if needed
    const handlerFn = await getRequestHandler();

    if (!handlerFn || typeof handlerFn !== 'function') {
      throw new Error('Request handler is not a function');
    }

    // Create Next.js Request from Lambda event
    const request = createNextRequest(event);

    // Call Next.js request handler
    const response = await handlerFn(request);

    // Convert Next.js Response to Lambda format
    return await convertResponse(response);
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
