/**
 * AWS Lambda Handler for Next.js Standalone Server
 * 
 * Intercepts Next.js server creation to access the request handler.
 * Supports both Lambda Function URL and API Gateway events.
 */

import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to Next.js standalone server
const SERVER_PATH = join(__dirname, '.next', 'standalone', 'server.js');

let requestHandler = null;
let interceptedServer = null;

/**
 * Initialize Next.js request handler (lazy loading)
 */
async function getRequestHandler() {
  if (requestHandler) {
    return requestHandler;
  }

  try {
    // Intercept http.createServer before Next.js loads
    // This allows us to capture the server instance that Next.js creates
    const originalCreateServer = http.createServer;

    http.createServer = function (...args) {
      const server = originalCreateServer.apply(this, args);
      interceptedServer = server;
      console.log('Intercepted HTTP server creation');
      return server;
    };

    // Import Next.js server module (this will trigger server creation)
    const serverModule = await import(SERVER_PATH);
    const defaultExport = serverModule.default;

    // Restore original createServer
    http.createServer = originalCreateServer;

    console.log('Default export type:', typeof defaultExport);
    console.log('Default export keys:', Object.keys(defaultExport));

    // Check if we intercepted the server
    if (interceptedServer) {
      console.log('Using intercepted HTTP server');
      // The intercepted server is the Next.js HTTP server
      // We can use it to handle requests
      requestHandler = createServerRequestHandler(interceptedServer);
      return requestHandler;
    }

    // Try to access the server through the default export
    if (defaultExport) {
      // Check for non-enumerable properties
      const allPropertyNames = Object.getOwnPropertyNames(defaultExport);
      console.log('All property names:', allPropertyNames);

      for (const prop of allPropertyNames) {
        try {
          const value = defaultExport[prop];
          if (value && typeof value === 'object') {
            // Check if it's an HTTP server
            if (typeof value.on === 'function' || typeof value.emit === 'function') {
              console.log(`Found HTTP server in property: ${prop}`);
              requestHandler = createServerRequestHandler(value);
              return requestHandler;
            }
            // Check if it has request handler methods
            if (value.requestHandler && typeof value.requestHandler === 'function') {
              console.log(`Found requestHandler in property: ${prop}`);
              requestHandler = value.requestHandler;
              return requestHandler;
            }
            if (value.handle && typeof value.handle === 'function') {
              console.log(`Found handle in property: ${prop}`);
              requestHandler = value.handle;
              return requestHandler;
            }
            if (value.fetch && typeof value.fetch === 'function') {
              console.log(`Found fetch in property: ${prop}`);
              requestHandler = value.fetch;
              return requestHandler;
            }
          }
        } catch (e) {
          // Continue
        }
      }
    }

    // Try to access through module exports
    const moduleExports = Object.keys(serverModule);
    console.log('Module exports:', moduleExports);

    for (const exportName of moduleExports) {
      if (exportName === 'default') continue;
      const exportValue = serverModule[exportName];
      if (exportValue && typeof exportValue === 'object') {
        if (exportValue.requestHandler && typeof exportValue.requestHandler === 'function') {
          console.log(`Found requestHandler in export: ${exportName}`);
          requestHandler = exportValue.requestHandler;
          return requestHandler;
        }
        if (typeof exportValue.on === 'function') {
          console.log(`Found HTTP server in export: ${exportName}`);
          requestHandler = createServerRequestHandler(exportValue);
          return requestHandler;
        }
      }
    }

    throw new Error('Could not find Next.js request handler. Server may not have initialized correctly.');

  } catch (error) {
    console.error('Failed to load Next.js request handler:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

/**
 * Create a complete mock ServerResponse object
 * This needs to have all the properties and methods that Next.js expects
 */
function createMockResponse() {
  let statusCode = 200;
  const headers = {};
  const headersSent = false;
  let body = '';
  let responseComplete = false;

  // Create a mock response object that extends EventEmitter-like behavior
  const res = {
    statusCode: 200,
    statusMessage: 'OK',
    headersSent: false,
    finished: false,
    _hasBody: true,
    _header: null,
    _headerSent: false,
    _implicitHeader: function () {
      // This is called by compression middleware
      if (!this._headerSent) {
        this._headerSent = true;
      }
    },
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
    removeHeader: function (name) {
      delete headers[name];
    },
    getHeaders: function () {
      return { ...headers };
    },
    hasHeader: function (name) {
      return name in headers;
    },
    write: function (chunk) {
      if (chunk) {
        body += chunk.toString();
      }
      return true;
    },
    writeHead: function (code, statusMessage, headersObj) {
      this.statusCode = code;
      if (typeof statusMessage === 'string') {
        this.statusMessage = statusMessage;
      } else if (statusMessage && typeof statusMessage === 'object') {
        headersObj = statusMessage;
      }
      if (headersObj) {
        Object.assign(headers, headersObj);
      }
      this._headerSent = true;
      return this;
    },
    end: function (chunk, encoding, callback) {
      if (chunk) {
        body += chunk.toString();
      }
      this.finished = true;
      responseComplete = true;
      if (typeof callback === 'function') {
        callback();
      }
      return this;
    },
    json: function (data) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(data);
      this.finished = true;
      responseComplete = true;
      return this;
    },
    send: function (data) {
      body = typeof data === 'string' ? data : JSON.stringify(data);
      this.finished = true;
      responseComplete = true;
      return this;
    },
    // EventEmitter methods
    on: function (event, listener) {
      // Mock event listener
      return this;
    },
    once: function (event, listener) {
      // Mock event listener
      return this;
    },
    emit: function (event, ...args) {
      // Mock event emitter
      return true;
    },
    // Stream methods
    pipe: function (dest) {
      return dest;
    },
    // Additional methods that might be needed
    setEncoding: function (encoding) {
      return this;
    },
    pause: function () {
      return this;
    },
    resume: function () {
      return this;
    },
  };

  // Store references for closure access
  res._statusCode = statusCode;
  res._headers = headers;
  res._body = body;
  res._responseComplete = responseComplete;

  return res;
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
      // Additional properties that might be needed
      socket: {
        remoteAddress: '127.0.0.1',
        remotePort: 0,
      },
      connection: {
        remoteAddress: '127.0.0.1',
        remotePort: 0,
      },
    };

    // Create a complete mock response object
    const res = createMockResponse();

    // Handle the request using the server's request event
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 29000);

      // Emit request event on server
      server.emit('request', req, res);

      // Wait for response to complete
      const checkInterval = setInterval(() => {
        if (res._responseComplete || res.finished) {
          clearInterval(checkInterval);
          clearTimeout(timeout);

          // Get the response data
          const statusCode = res.statusCode || 200;
          const headers = res._headers || {};
          const body = res._body || '';

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
