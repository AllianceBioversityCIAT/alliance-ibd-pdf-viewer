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

    // Log detailed information about the default export
    console.log('Default export type:', typeof defaultExport);
    console.log('Default export keys:', Object.keys(defaultExport));

    // Log all properties and their types
    const keys = Object.keys(defaultExport);
    const propertyInfo = keys.map(key => {
      const value = defaultExport[key];
      return {
        key,
        type: typeof value,
        isFunction: typeof value === 'function',
        isObject: typeof value === 'object' && value !== null,
        objectKeys: (typeof value === 'object' && value !== null) ? Object.keys(value).slice(0, 10) : null
      };
    });
    console.log('Property details:', JSON.stringify(propertyInfo, null, 2));

    // Next.js standalone server.js exports the server instance
    // For Next.js 16 App Router, we need to access the request handler
    // The server instance typically has the handler we can use

    // Try direct access to request handler methods
    if (defaultExport.requestHandler && typeof defaultExport.requestHandler === 'function') {
      console.log('Found requestHandler method');
      requestHandler = defaultExport.requestHandler;
      return requestHandler;
    }

    if (defaultExport.handle && typeof defaultExport.handle === 'function') {
      console.log('Found handle method');
      requestHandler = defaultExport.handle;
      return requestHandler;
    }

    if (defaultExport.fetch && typeof defaultExport.fetch === 'function') {
      console.log('Found fetch method');
      requestHandler = defaultExport.fetch;
      return requestHandler;
    }

    // Check if there's a server property
    if (defaultExport.server) {
      console.log('Found server property');
      const server = defaultExport.server;
      console.log('Server type:', typeof server);
      console.log('Server keys:', Object.keys(server));

      if (server.requestHandler && typeof server.requestHandler === 'function') {
        console.log('Found server.requestHandler');
        requestHandler = server.requestHandler;
        return requestHandler;
      }
      if (server.handle && typeof server.handle === 'function') {
        console.log('Found server.handle');
        requestHandler = server.handle;
        return requestHandler;
      }
      if (server.fetch && typeof server.fetch === 'function') {
        console.log('Found server.fetch');
        requestHandler = server.fetch;
        return requestHandler;
      }
      // Use server's request event handler
      if (typeof server.on === 'function' || typeof server.emit === 'function') {
        console.log('Using server request event handler');
        requestHandler = createServerRequestHandler(server);
        return requestHandler;
      }
    }

    // Check for app property (Next.js might export { app, server, port, hostname })
    if (defaultExport.app) {
      console.log('Found app property');
      const app = defaultExport.app;
      console.log('App type:', typeof app);
      console.log('App keys:', Object.keys(app));

      if (app.requestHandler && typeof app.requestHandler === 'function') {
        console.log('Found app.requestHandler');
        requestHandler = app.requestHandler;
        return requestHandler;
      }
      if (app.handle && typeof app.handle === 'function') {
        console.log('Found app.handle');
        requestHandler = app.handle;
        return requestHandler;
      }
      if (app.fetch && typeof app.fetch === 'function') {
        console.log('Found app.fetch');
        requestHandler = app.fetch;
        return requestHandler;
      }
    }

    // Check for internal Next.js properties
    // Next.js might store the handler in private properties
    const internalProps = ['_requestHandler', '__requestHandler', 'handler', '_handler', 'request'];
    for (const prop of internalProps) {
      if (defaultExport[prop] && typeof defaultExport[prop] === 'function') {
        console.log(`Found internal property: ${prop}`);
        requestHandler = defaultExport[prop];
        return requestHandler;
      }
    }

    // If defaultExport is an HTTP server instance
    if (typeof defaultExport.on === 'function' || typeof defaultExport.emit === 'function') {
      console.log('Default export is an HTTP server, using request event handler');
      requestHandler = createServerRequestHandler(defaultExport);
      return requestHandler;
    }

    // Last resort: try to access the server through the module's exports
    console.log('Checking module exports:', Object.keys(serverModule));
    if (serverModule.requestHandler && typeof serverModule.requestHandler === 'function') {
      console.log('Found requestHandler in module exports');
      requestHandler = serverModule.requestHandler;
      return requestHandler;
    }

    // If we still haven't found it, try to create a wrapper that uses the entire object
    // This is a fallback for when Next.js exports something we don't recognize
    console.log('Attempting to use default export as request handler wrapper');
    requestHandler = createFallbackHandler(defaultExport);
    return requestHandler;

  } catch (error) {
    console.error('Failed to load Next.js request handler:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

/**
 * Create a fallback handler when we can't find the request handler
 * This attempts to use the object in various ways
 */
function createFallbackHandler(serverObj) {
  return async (request) => {
    // Try to call the object as a function
    if (typeof serverObj === 'function') {
      return await serverObj(request);
    }

    // Try to find any function that might handle requests
    const possibleHandlers = [
      serverObj.requestHandler,
      serverObj.handle,
      serverObj.fetch,
      serverObj.process,
      serverObj.handler,
      serverObj._requestHandler,
      serverObj.__requestHandler,
    ].filter(h => h && typeof h === 'function');

    if (possibleHandlers.length > 0) {
      return await possibleHandlers[0](request);
    }

    // If it's an object with a server property, try that
    if (serverObj.server) {
      if (typeof serverObj.server === 'function') {
        return await serverObj.server(request);
      }
      if (serverObj.server.requestHandler && typeof serverObj.server.requestHandler === 'function') {
        return await serverObj.server.requestHandler(request);
      }
    }

    throw new Error('Could not find any way to handle requests with the server object');
  };
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
