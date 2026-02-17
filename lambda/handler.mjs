/**
 * AWS Lambda Handler for Next.js Standalone Server
 * 
 * Accesses Next.js request handler from standalone server.
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
    const serverModule = await import(SERVER_PATH);
    const defaultExport = serverModule.default;

    if (!defaultExport) {
      throw new Error('Server module default export is undefined');
    }

    // Next.js standalone server.js exports the server instance
    // For Next.js 16 App Router, we need to access the request handler
    // The server instance typically has the handler we can use

    // Try direct access to request handler methods
    if (defaultExport.requestHandler && typeof defaultExport.requestHandler === 'function') {
      requestHandler = defaultExport.requestHandler;
      return requestHandler;
    }

    if (defaultExport.handle && typeof defaultExport.handle === 'function') {
      requestHandler = defaultExport.handle;
      return requestHandler;
    }

    if (defaultExport.fetch && typeof defaultExport.fetch === 'function') {
      requestHandler = defaultExport.fetch;
      return requestHandler;
    }

    // Check if there's a server property
    if (defaultExport.server) {
      const server = defaultExport.server;
      if (server.requestHandler && typeof server.requestHandler === 'function') {
        requestHandler = server.requestHandler;
        return requestHandler;
      }
      if (server.handle && typeof server.handle === 'function') {
        requestHandler = server.handle;
        return requestHandler;
      }
      if (server.fetch && typeof server.fetch === 'function') {
        requestHandler = server.fetch;
        return requestHandler;
      }
      // Use server's request event handler
      if (typeof server.on === 'function' || typeof server.emit === 'function') {
        requestHandler = createServerRequestHandler(server);
        return requestHandler;
      }
    }

    // If defaultExport is an HTTP server instance
    if (typeof defaultExport.on === 'function' || typeof defaultExport.emit === 'function') {
      requestHandler = createServerRequestHandler(defaultExport);
      return requestHandler;
    }

    throw new Error(`Could not find request handler. Default export type: ${typeof defaultExport}`);
  } catch (error) {
    console.error('Failed to load Next.js request handler:', error);
    throw error;
  }
}

/**
 * Create a request handler from an HTTP server instance
 * Uses the server's request event to handle requests
 */
function createServerRequestHandler(server) {
  return async (request) => {
    // Convert Web Request to Node.js request format
    const url = new URL(request.url);
    const req = {
      url: url.pathname + url.search,
      method: request.method,
      headers: Object.fromEntries(request.headers),
      getHeader: function (name) { return this.headers[name.toLowerCase()]; },
      body: request.body,
    };

    let statusCode = 200;
    const headers = {};
    let body = '';
    let responseComplete = false;

    const res = {
      statusCode: 200,
      status: function (code) {
        this.statusCode = code;
        statusCode = code;
        return this;
      },
      setHeader: function (name, value) {
        headers[name] = value;
        return this;
      },
      getHeader: function (name) {
        return headers[name];
      },
      write: function (chunk) {
        body += chunk ? chunk.toString() : '';
        return this;
      },
      end: function (chunk) {
        if (chunk) {
          body += chunk.toString();
        }
        responseComplete = true;
        return this;
      },
      json: function (data) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(data);
        responseComplete = true;
        return this;
      },
      send: function (data) {
        body = typeof data === 'string' ? data : JSON.stringify(data);
        responseComplete = true;
        return this;
      },
    };

    // Handle the request using the server's request event
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 29000);

      // Emit request event on server
      server.emit('request', req, res);

      // Wait for response to complete
      const checkInterval = setInterval(() => {
        if (responseComplete) {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          resolve(new Response(body, {
            status: statusCode,
            headers: headers,
          }));
        }
      }, 10);
    });
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
    if (key.toLowerCase() !== 'connection') {
      headers[key] = value;
    }
  });

  let body;
  let isBase64Encoded = false;

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
    const handlerFn = await getRequestHandler();

    if (!handlerFn || typeof handlerFn !== 'function') {
      throw new Error('Request handler is not a function');
    }

    const request = createNextRequest(event);
    const response = await handlerFn(request);
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
