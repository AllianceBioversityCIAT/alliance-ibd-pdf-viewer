/**
 * AWS Lambda Handler for Next.js Standalone Server
 * 
 * Intercepts Next.js server creation to access the request handler.
 * Supports both Lambda Function URL and API Gateway events.
 */

import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';
import { EventEmitter } from 'events';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to Next.js standalone server
// In Lambda, __dirname points to /var/task (the Lambda package root)
const SERVER_PATH = join(__dirname, '.next', 'standalone', 'server.js');

// Set NODE_ENV to production for Next.js
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Set working directory to standalone directory so Next.js can find static files
// Next.js standalone expects to run from its own directory
const STANDALONE_DIR = join(__dirname, '.next', 'standalone');
process.chdir(STANDALONE_DIR);

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
    // Use absolute path to ensure we can import even after chdir
    const absoluteServerPath = join(__dirname, '.next', 'standalone', 'server.js');
    const serverModule = await import(absoluteServerPath);
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

  // Store body reference so it can be accessed later
  res._body = body;

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
    // Normalize header value: if it's an array, join it; if it's not a string, convert it
    if (Array.isArray(value)) {
      headers[name] = value.join(', ');
    } else if (typeof value !== 'string' && value != null) {
      headers[name] = String(value);
    } else {
      headers[name] = value;
    }
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
  res.write = function (chunk, encoding, callback) {
    if (chunk) {
      let chunkStr;
      if (Buffer.isBuffer(chunk)) {
        chunkStr = chunk.toString(encoding || 'utf8');
      } else if (typeof chunk === 'string') {
        chunkStr = chunk;
      } else if (Array.isArray(chunk)) {
        // Handle array of numbers (bytes) - convert to Buffer then string
        // Check if it's an array of numbers (bytes)
        if (chunk.length > 0 && typeof chunk[0] === 'number') {
          chunkStr = Buffer.from(chunk).toString(encoding || 'utf8');
        } else {
          // Array of strings or other types
          chunkStr = chunk.join('');
        }
      } else if (chunk instanceof Uint8Array) {
        chunkStr = Buffer.from(chunk).toString(encoding || 'utf8');
      } else {
        // For other types, try to convert to string
        // But check if it's a string representation of an array
        const str = String(chunk);
        // If it looks like "60,33,68,79..." (comma-separated numbers), convert it
        if (/^\d+(,\d+)*$/.test(str.trim())) {
          const numbers = str.split(',').map(n => parseInt(n.trim(), 10));
          chunkStr = String.fromCharCode(...numbers);
        } else {
          chunkStr = str;
        }
      }
      body += chunkStr;
      res._body = body; // Update stored body reference
    }
    if (typeof callback === 'function') {
      callback();
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
  res.flushHeaders = function () {
    // flushHeaders sends the headers immediately
    this._headerSent = true;
    this.headersSent = true;
    return this;
  };
  res.end = function (chunk, encoding, callback) {
    if (chunk) {
      let chunkStr;
      if (Buffer.isBuffer(chunk)) {
        chunkStr = chunk.toString(encoding || 'utf8');
      } else if (typeof chunk === 'string') {
        chunkStr = chunk;
      } else if (Array.isArray(chunk)) {
        // Handle array of numbers (bytes) - convert to Buffer then string
        // Check if it's an array of numbers (bytes)
        if (chunk.length > 0 && typeof chunk[0] === 'number') {
          chunkStr = Buffer.from(chunk).toString(encoding || 'utf8');
        } else {
          // Array of strings or other types
          chunkStr = chunk.join('');
        }
      } else if (chunk instanceof Uint8Array) {
        chunkStr = Buffer.from(chunk).toString(encoding || 'utf8');
      } else {
        // For other types, try to convert to string
        // But check if it's a string representation of an array
        const str = String(chunk);
        // If it looks like "60,33,68,79..." (comma-separated numbers), convert it
        if (/^\d+(,\d+)*$/.test(str.trim())) {
          const numbers = str.split(',').map(n => parseInt(n.trim(), 10));
          chunkStr = String.fromCharCode(...numbers);
        } else {
          chunkStr = str;
        }
      }
      body += chunkStr;
      res._body = body; // Update stored body reference
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
    res._body = body; // Update stored body reference
    this.finished = true;
    responseComplete = true;
    this.headersSent = true;
    this._headerSent = true;
    this.emit('finish');
    return this;
  };
  res.send = function (data) {
    body = typeof data === 'string' ? data : JSON.stringify(data);
    res._body = body; // Update stored body reference
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
    // IMPORTANT: request.body is a ReadableStream in Web API Request objects
    // We must read it using arrayBuffer() or text(), NOT Buffer.from() directly
    let body = null;
    if (request.body) {
      try {
        // Check if it's already a string or Buffer (shouldn't happen with Web Request, but safe)
        if (typeof request.body === 'string') {
          body = request.body;
        } else if (Buffer.isBuffer(request.body)) {
          body = request.body;
        } else if (request.body instanceof ReadableStream) {
          // Read ReadableStream properly
          const contentType = headers['content-type'] || headers['Content-Type'] || '';
          if (contentType.includes('application/json') || contentType.includes('text/')) {
            // For JSON/text, read as text
            body = await request.text();
          } else {
            // For binary, read as arrayBuffer then convert to Buffer
            const arrayBuffer = await request.arrayBuffer();
            body = Buffer.from(arrayBuffer);
          }
        } else {
          // Fallback: try to read as text
          console.warn('Unexpected body type:', typeof request.body, request.body?.constructor?.name);
          body = await request.text();
        }
      } catch (error) {
        console.error('Error reading request body:', {
          error: error.message,
          bodyType: typeof request.body,
          bodyConstructor: request.body?.constructor?.name,
        });
        // Return 400 for invalid body
        throw new Error('Invalid request body: ' + error.message);
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
        let responseBody = res._body || '';

        // Check content-type to determine if response is binary
        // Headers can be arrays in Node.js, so ensure we get a string
        const contentTypeHeader = responseHeaders['content-type'] || responseHeaders['Content-Type'];
        const contentType = Array.isArray(contentTypeHeader) 
          ? contentTypeHeader[0] 
          : (typeof contentTypeHeader === 'string' ? contentTypeHeader : '');
        const isBinary = contentType && typeof contentType === 'string' && (
          contentType.startsWith('image/') ||
          contentType.startsWith('application/octet-stream') ||
          contentType.startsWith('font/') ||
          contentType.startsWith('application/javascript') ||
          contentType.startsWith('text/javascript') ||
          contentType.includes('charset=binary')
        );

        // Ensure responseBody is properly formatted
        let finalBody = responseBody;
        if (typeof responseBody !== 'string') {
          if (Buffer.isBuffer(responseBody)) {
            finalBody = isBinary ? responseBody.toString('binary') : responseBody.toString('utf8');
          } else if (Array.isArray(responseBody)) {
            if (responseBody.length > 0 && typeof responseBody[0] === 'number') {
              finalBody = Buffer.from(responseBody).toString(isBinary ? 'binary' : 'utf8');
            } else {
              finalBody = responseBody.join('');
            }
          } else {
            finalBody = String(responseBody);
          }
        } else {
          // Even if it's a string, check if it's a comma-separated list of numbers
          if (/^\d+(,\d+)*$/.test(responseBody.trim())) {
            const numbers = responseBody.split(',').map(n => parseInt(n.trim(), 10));
            finalBody = Buffer.from(numbers).toString(isBinary ? 'binary' : 'utf8');
          }
        }

        console.log('Response status:', statusCode);
        console.log('Response headers:', Object.keys(normalizedHeaders));
        console.log('Response body length:', finalBody.length);
        console.log('Response body type:', typeof finalBody);
        console.log('Content-Type:', contentType);
        console.log('Is binary:', isBinary);

        // Only log preview for text content, not binary
        if (!isBinary) {
          console.log('Response body preview (first 100 chars):', finalBody.substring(0, 100));
        } else {
          console.log('Response body is binary, will be base64 encoded');
        }

        // Create Response object
        // For binary content, we need to convert the binary string to a Buffer
        if (isBinary && typeof finalBody === 'string') {
          // Convert binary string to Buffer, then to ArrayBuffer for Response
          const buffer = Buffer.from(finalBody, 'binary');
          resolve(new Response(buffer, {
            status: statusCode,
            headers: normalizedHeaders,
          }));
        } else {
          resolve(new Response(finalBody, {
            status: statusCode,
            headers: normalizedHeaders,
          }));
        }
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
          let responseBody = res._body || '';

          // Normalize headers: ensure all header values are strings (not arrays)
          const normalizedHeaders = {};
          for (const [key, value] of Object.entries(responseHeaders)) {
            normalizedHeaders[key] = Array.isArray(value) ? value.join(', ') : (typeof value === 'string' ? value : String(value || ''));
          }

          // Ensure responseBody is a string
          if (typeof responseBody !== 'string') {
            if (Buffer.isBuffer(responseBody)) {
              responseBody = responseBody.toString('utf8');
            } else if (Array.isArray(responseBody)) {
              // Convert array of numbers to string
              if (responseBody.length > 0 && typeof responseBody[0] === 'number') {
                responseBody = Buffer.from(responseBody).toString('utf8');
              } else {
                responseBody = responseBody.join('');
              }
            } else {
              responseBody = String(responseBody);
            }
          } else {
            // Even if it's a string, check if it's a comma-separated list of numbers
            // This can happen if the array was converted to string incorrectly
            if (/^\d+(,\d+)*$/.test(responseBody.trim())) {
              const numbers = responseBody.split(',').map(n => parseInt(n.trim(), 10));
              responseBody = Buffer.from(numbers).toString('utf8');
            }
          }

          console.log('Response status:', statusCode);
          console.log('Response headers:', Object.keys(normalizedHeaders));
          console.log('Response body length:', responseBody.length);
          console.log('Response body type:', typeof responseBody);
          console.log('Response body preview (first 100 chars):', responseBody.substring(0, 100));

          resolve(new Response(responseBody, {
            status: statusCode,
            headers: normalizedHeaders,
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

  // Handle body from Lambda event
  // Lambda Function URL provides body as string (may be base64 encoded)
  let body = undefined;
  if (event.body) {
    if (event.isBase64Encoded) {
      // Decode base64 to Buffer, then to string for JSON
      body = Buffer.from(event.body, 'base64').toString('utf8');
    } else if (typeof event.body === 'string') {
      // Already a string, use as-is
      body = event.body;
    } else {
      // Shouldn't happen, but handle gracefully
      console.warn('Unexpected event.body type:', typeof event.body);
      body = String(event.body);
    }
  }

  // Create Web Request object
  // Note: When body is provided as string, Request constructor will create a ReadableStream
  // This is expected and will be handled correctly in createServerRequestHandler
  return new Request(`https://${host}${fullUrl}`, {
    method,
    headers,
    body: body, // This will become a ReadableStream in the Request object
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
 * Serve static files directly (fallback if Next.js doesn't handle them)
 * Uses absolute paths from __dirname since we change working directory
 */
function serveStaticFile(filePath) {
  try {
    if (!existsSync(filePath)) {
      return null;
    }

    const content = readFileSync(filePath);
    const ext = extname(filePath).toLowerCase();

    // Content-Type mapping
    const contentTypes = {
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.html': 'text/html',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.ico': 'image/x-icon',
      '.xml': 'application/xml',
      '.txt': 'text/plain',
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';
    // Binary files need base64 encoding
    const isBinary = ext.match(/\.(png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|ico)$/);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
      body: isBinary ? content.toString('base64') : content.toString('utf8'),
      isBase64Encoded: !!isBinary,
    };
  } catch (error) {
    console.error('Error serving static file:', filePath, error.message);
    return null;
  }
}

/**
 * Main Lambda handler
 */
export const handler = async (event, context) => {
  try {
    const url = event.rawPath || event.path || '/';

    // Handle static file requests directly (before Next.js)
    // This ensures /_next/static/* and /public/* are always served
    // Use absolute paths from __dirname since we change working directory

    // Serve /_next/static/* files (CSS, JS, chunks, etc.)
    if (url.startsWith('/_next/static/')) {
      // Remove /_next/static prefix
      const staticPath = url.replace('/_next/static/', '');

      // Try primary location: .next/standalone/.next/static (where Next.js expects them)
      const filePath1 = join(__dirname, '.next', 'standalone', '.next', 'static', staticPath);
      let response = serveStaticFile(filePath1);

      // Fallback to backup location: .next/static
      if (!response) {
        const filePath2 = join(__dirname, '.next', 'static', staticPath);
        response = serveStaticFile(filePath2);
      }

      if (response) {
        console.log('✓ Served static file:', url, 'Content-Type:', response.headers['Content-Type']);
        return response;
      } else {
        console.warn('⚠ Static file not found:', url);
      }
    }

    // Serve /public/* files (favicon, images, etc.)
    if (url.startsWith('/public/')) {
      const publicPath = url.replace('/public/', '');
      const filePath = join(__dirname, 'public', publicPath);

      const response = serveStaticFile(filePath);
      if (response) {
        console.log('✓ Served public file:', url);
        return response;
      }
    }

    // For all other requests (including /summary), use Next.js handler
    const handlerFn = await getRequestHandler();

    if (!handlerFn || typeof handlerFn !== 'function') {
      throw new Error('Request handler is not a function');
    }

    const request = createNextRequest(event);
    const response = await handlerFn(request);
    return await convertResponseToLambda(response);
  } catch (error) {
    // Log error safely (without exposing secrets)
    const errorInfo = {
      message: error.message,
      errorType: error.constructor.name,
      // Only log stack in development
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
    };
    console.error('Lambda handler error:', errorInfo);

    // Return appropriate status code based on error type
    const statusCode = error.message.includes('Invalid request body') ||
      error.message.includes('Invalid JSON') ? 400 : 500;

    return {
      statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: statusCode === 400 ? 'Bad Request' : 'Internal Server Error',
        message: statusCode === 400 ? error.message : 'An error occurred processing your request',
      }),
      isBase64Encoded: false,
    };
  }
};
