/**
 * AWS Lambda Handler for Next.js Standalone Server
 * 
 * Uses Next.js server by intercepting the HTTP server before it starts.
 * Supports both Lambda Function URL and API Gateway events.
 */

import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createServer } from 'http';

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

    console.log('Server module imported. Keys:', Object.keys(serverModule));
    console.log('Default type:', typeof serverModule.default);

    const defaultExport = serverModule.default;

    if (!defaultExport) {
      throw new Error('Server module default export is undefined');
    }

    // Log all properties to understand structure
    const keys = Object.keys(defaultExport);
    console.log('Default export keys:', keys);
    console.log('Default export property types:', keys.map(key => ({
      key,
      type: typeof defaultExport[key],
      isFunction: typeof defaultExport[key] === 'function',
      value: typeof defaultExport[key] === 'function' ? '[Function]' :
        typeof defaultExport[key] === 'object' ? Object.keys(defaultExport[key] || {}).slice(0, 5) :
          String(defaultExport[key]).substring(0, 50)
    })));

    // Next.js standalone exports an object that contains server configuration
    // The actual request handler is inside the server instance
    // We need to intercept the server before it starts listening

    // Approach 1: Check for requestHandler directly
    if (defaultExport.requestHandler && typeof defaultExport.requestHandler === 'function') {
      console.log('Using defaultExport.requestHandler');
      requestHandler = defaultExport.requestHandler;
      return requestHandler;
    }

    // Approach 2: Check for handle method
    if (defaultExport.handle && typeof defaultExport.handle === 'function') {
      console.log('Using defaultExport.handle');
      requestHandler = defaultExport.handle;
      return requestHandler;
    }

    // Approach 3: Check for fetch method
    if (defaultExport.fetch && typeof defaultExport.fetch === 'function') {
      console.log('Using defaultExport.fetch');
      requestHandler = defaultExport.fetch;
      return requestHandler;
    }

    // Approach 4: The object might contain a server property
    if (defaultExport.server) {
      console.log('Found server property, checking for handler');
      const server = defaultExport.server;
      if (server.requestHandler) {
        console.log('Using server.requestHandler');
        requestHandler = server.requestHandler;
        return requestHandler;
      }
      if (server.handle) {
        console.log('Using server.handle');
        requestHandler = server.handle;
        return requestHandler;
      }
      if (server.fetch) {
        console.log('Using server.fetch');
        requestHandler = server.fetch;
        return requestHandler;
      }
    }

    // Approach 5: Try to access internal Next.js properties
    // Next.js might store the handler in private properties
    const possibleHandlers = [
      defaultExport._requestHandler,
      defaultExport.__requestHandler,
      defaultExport.handler,
      defaultExport.app?.requestHandler,
      defaultExport.app?.handle,
      defaultExport.app?.fetch,
    ].filter(h => h && typeof h === 'function');

    if (possibleHandlers.length > 0) {
      console.log('Found handler in internal properties');
      requestHandler = possibleHandlers[0];
      return requestHandler;
    }

    // Approach 6: Create a wrapper that intercepts HTTP requests
    // Next.js standalone creates an HTTP server, we need to intercept it
    console.log('Creating HTTP server wrapper to intercept Next.js server');
    requestHandler = createHttpServerWrapper(defaultExport);
    return requestHandler;

  } catch (error) {
    console.error('Failed to load Next.js request handler:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

/**
 * Create an HTTP server wrapper that intercepts requests
 * This works by creating a local HTTP server and forwarding requests to Next.js
 */
function createHttpServerWrapper(serverConfig) {
  let httpServer = null;
  let nextRequestHandler = null;

  return async (request) => {
    // Lazy initialization: create HTTP server on first request
    if (!httpServer) {
      // Create a local HTTP server that Next.js can handle
      httpServer = createServer();

      // Try to get the request handler from the server
      // Next.js standalone might export a function that creates the server
      if (typeof serverConfig === 'function') {
        // If it's a function, it might be a factory
        const serverInstance = serverConfig();
        if (serverInstance && typeof serverInstance.handle === 'function') {
          nextRequestHandler = serverInstance.handle.bind(serverInstance);
        }
      } else if (serverConfig.server && typeof serverConfig.server.handle === 'function') {
        nextRequestHandler = serverConfig.server.handle.bind(serverConfig.server);
      } else {
        // Create a mock server that Next.js can attach to
        // This is a workaround for Next.js standalone mode
        throw new Error(`Cannot create handler from server config. Type: ${typeof serverConfig}, keys: ${Object.keys(serverConfig).join(', ')}`);
      }

      // Set up the server to handle requests
      httpServer.on('request', async (req, res) => {
        try {
          // Convert Node.js request to Web Request
          const webRequest = nodeToWebRequest(req);
          const response = await nextRequestHandler(webRequest);
          await webToNodeResponse(response, res);
        } catch (error) {
          console.error('Error handling request:', error);
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      });
    }

    // For Lambda, we need to handle the request directly
    // Since we can't start an HTTP server in Lambda, we need a different approach
    // This won't work - we need to find the actual request handler

    throw new Error('HTTP server wrapper not suitable for Lambda. Need direct request handler access.');
  };
}

/**
 * Convert Node.js request to Web Request
 */
function nodeToWebRequest(req) {
  const url = `https://${req.headers.host || 'localhost'}${req.url}`;
  return new Request(url, {
    method: req.method,
    headers: req.headers,
    body: req,
  });
}

/**
 * Convert Web Response to Node.js response
 */
async function webToNodeResponse(webResponse, nodeRes) {
  nodeRes.statusCode = webResponse.status;
  webResponse.headers.forEach((value, key) => {
    nodeRes.setHeader(key, value);
  });

  if (webResponse.body) {
    const reader = webResponse.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      nodeRes.write(value);
    }
  }
  nodeRes.end();
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
