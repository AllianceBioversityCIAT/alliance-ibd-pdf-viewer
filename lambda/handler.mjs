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
import { EventEmitter } from 'events';

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
 * Create a complete mock IncomingMessage object
 * This needs to have all the properties and methods that Next.js expects
 */
function createMockRequest(url, method, headers, body) {
  // Create an EventEmitter-like object for the request
  const req = Object.create(EventEmitter.prototype);

  // Set properties
  req.url = url;
  req.method = method;
  req.headers = headers;
  req.headersDistinct = {};
  req.rawHeaders = [];
  Object.entries(headers).forEach(([key, value]) => {
    req.rawHeaders.push(key, value);
  });

  req.httpVersion = '1.1';
  req.httpVersionMajor = 1;
  req.httpVersionMinor = 1;
  req.complete = false;
  req.aborted = false;
  req.upgrade = false;
  req.readable = true;
  req.socket = {
    remoteAddress: '127.0.0.1',
    remotePort: 0,
    localAddress: '127.0.0.1',
    localPort: 0,
  };
  req.connection = req.socket;

  // Body handling
  if (body) {
    if (typeof body === 'string') {
      req.body = body;
    } else if (Buffer.isBuffer(body)) {
      req.body = body;
    }
  }

  // EventEmitter methods (delegate to EventEmitter)
  req.on = EventEmitter.prototype.on.bind(req);
  req.once = EventEmitter.prototype.once.bind(req);
  req.emit = EventEmitter.prototype.emit.bind(req);
  req.removeListener = EventEmitter.prototype.removeListener.bind(req);
  req.removeAllListeners = EventEmitter.prototype.removeAllListeners.bind(req);
  req.setMaxListeners = EventEmitter.prototype.setMaxListeners.bind(req);
  req.getMaxListeners = EventEmitter.prototype.getMaxListeners.bind(req);
  req.listeners = EventEmitter.prototype.listeners.bind(req);
  req.listenerCount = EventEmitter.prototype.listenerCount.bind(req);

  // Stream methods
  req.read = function (size) {
    return null;
  };
  req.setEncoding = function (encoding) {
    return this;
  };
  req.pause = function () {
    return this;
  };
  req.resume = function () {
    return this;
  };
  req.pipe = function (dest) {
    return dest;
  };
  req.unpipe = function (dest) {
    return this;
  };
  req.unshift = function (chunk) {
    return this;
  };
  req.wrap = function (stream) {
    return this;
  };

  // Additional methods
  req.getHeader = function (name) {
    return this.headers[name.toLowerCase()];
  };
  req.setHeader = function (name, value) {
    this.headers[name.toLowerCase()] = value;
    return this;
  };
  req.removeHeader = function (name) {
    delete this.headers[name.toLowerCase()];
    return this;
  };
  req.getHeaders = function () {
    return { ...this.headers };
  };
  req.hasHeader = function (name) {
    return name.toLowerCase() in this.headers;
  };

  return req;
}

/**
 * Create a complete mock ServerResponse object
 * This needs to have all the properties and methods that Next.js expects
 */
function createMockResponse() {
  // Create an EventEmitter-like object for the response
  const res = Object.create(EventEmitter.prototype);

  let statusCode = 200;
  const headers = {};
  let body = '';
  let responseComplete = false;

  // Set properties
  res.statusCode = 200;
  res.statusMessage = 'OK';
  res.headersSent = false;
  res.finished = false;
  res._hasBody = true;
  res._header = null;
  res._headerSent = false;
  res._implicitHeader = function () {
    // This is called by compression middleware
    if (!this._headerSent) {
      this._headerSent = true;
    }
  };

  // HTTP methods
  res.status = function (code) {
    this.statusCode = code;
    statusCode = code;
    return this;
  };
  res.setHeader = function (name, value) {
    headers[name] = value;
    return this;
  };
  res.appendHeader = function (name, value) {
    // appendHeader appends to existing header or creates new one
    if (headers[name]) {
      // If header exists, append with comma separator
      headers[name] = Array.isArray(headers[name])
        ? [...headers[name], value].join(', ')
        : `${headers[name]}, ${value}`;
    } else {
      headers[name] = value;
    }
    return this;
  };
  res.getHeader = function (name) {
    return headers[name];
  };
  res.removeHeader = function (name) {
    delete headers[name];
    return this;
  };
  res.getHeaders = function () {
    return { ...headers };
  };
  res.hasHeader = function (name) {
    return name in headers;
  };
  res.write = function (chunk) {
    if (chunk) {
      body += chunk.toString();
    }
    return true;
  };
  res.writeHead = function (code, statusMessage, headersObj) {
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
    this.headersSent = true;
    return this;
  };
  res.end = function (chunk, encoding, callback) {
    if (chunk) {
      body += chunk.toString();
    }
    this.finished = true;
    responseComplete = true;
    this.headersSent = true;
    this._headerSent = true;
    // Emit finish event before calling callback
    this.emit('finish');
    if (typeof callback === 'function') {
      callback();
    }
    return this;
  };
  res.json = function (data) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(data);
    this.finished = true;
    responseComplete = true;
    this.headersSent = true;
    this._headerSent = true;
    this.emit('finish');
    return this;
  };
  res.send = function (data) {
    body = typeof data === 'string' ? data : JSON.stringify(data);
    this.finished = true;
    responseComplete = true;
    this.headersSent = true;
    this._headerSent = true;
    this.emit('finish');
    return this;
  };

  // EventEmitter methods (delegate to EventEmitter)
  res.on = EventEmitter.prototype.on.bind(res);
  res.once = EventEmitter.prototype.once.bind(res);
  res.emit = EventEmitter.prototype.emit.bind(res);
  res.removeListener = EventEmitter.prototype.removeListener.bind(res);
  res.removeAllListeners = EventEmitter.prototype.removeAllListeners.bind(res);
  res.setMaxListeners = EventEmitter.prototype.setMaxListeners.bind(res);
  res.getMaxListeners = EventEmitter.prototype.getMaxListeners.bind(res);
  res.listeners = EventEmitter.prototype.listeners.bind(res);
  res.listenerCount = EventEmitter.prototype.listenerCount.bind(res);

  // Stream methods
  res.pipe = function (dest) {
    return dest;
  };
  res.setEncoding = function (encoding) {
    return this;
  };
  res.pause = function () {
    return this;
  };
  res.resume = function () {
    return this;
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
    const urlPath = url.pathname + url.search;
    const method = request.method;
    const headers = Object.fromEntries(request.headers);

    // Get body if present
    let body = null;
    if (request.body) {
      if (typeof request.body === 'string') {
        body = request.body;
      } else if (Buffer.isBuffer(request.body)) {
        body = request.body;
      } else {
        body = Buffer.from(request.body);
      }
    }

    // Create complete mock request and response objects
    const req = createMockRequest(urlPath, method, headers, body);
    const res = createMockResponse();

    // Handle the request using the server's request event
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('Request timeout - response not completed');
        console.error('Response finished:', res.finished);
        console.error('Response complete:', res._responseComplete);
        console.error('Response status:', res.statusCode);
        console.error('Response headers:', res._headers);
        reject(new Error('Request timeout'));
      }, 29000);

      // Listen for 'finish' event on response
      res.once('finish', () => {
        clearTimeout(timeout);
        console.log('Response finished event received');

        // Get the response data
        const statusCode = res.statusCode || 200;
        const responseHeaders = res._headers || {};
        const responseBody = res._body || '';

        console.log('Response status:', statusCode);
        console.log('Response headers:', Object.keys(responseHeaders));
        console.log('Response body length:', responseBody.length);

        resolve(new Response(responseBody, {
          status: statusCode,
          headers: responseHeaders,
        }));
      });

      // Also check periodically in case 'finish' event doesn't fire
      const checkInterval = setInterval(() => {
        if (res._responseComplete || res.finished) {
          clearInterval(checkInterval);
          clearTimeout(timeout);

          console.log('Response completed via check interval');

          // Get the response data
          const statusCode = res.statusCode || 200;
          const responseHeaders = res._headers || {};
          const responseBody = res._body || '';

          console.log('Response status:', statusCode);
          console.log('Response headers:', Object.keys(responseHeaders));
          console.log('Response body length:', responseBody.length);

          resolve(new Response(responseBody, {
            status: statusCode,
            headers: responseHeaders,
          }));
        }
      }, 10);

      // Emit request event on server
      console.log('Emitting request event to server for:', urlPath);
      try {
        server.emit('request', req, res);
      } catch (error) {
        console.error('Error emitting request event:', error);
        clearTimeout(timeout);
        reject(error);
      }
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
