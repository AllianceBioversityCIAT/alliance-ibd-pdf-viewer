/**
 * AWS Lambda Handler for Next.js Standalone Server
 * 
 * Uses serverless-http to adapt Next.js HTTP server to Lambda.
 * Supports both Lambda Function URL and API Gateway events.
 */

import serverless from 'serverless-http';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to Next.js standalone server
const SERVER_PATH = join(__dirname, '.next', 'standalone', 'server.js');

let app = null;
let serverlessHandler = null;

/**
 * Initialize Next.js app (lazy loading)
 */
async function getApp() {
  if (app) {
    return app;
  }

  try {
    // Import Next.js server module
    const serverModule = await import(SERVER_PATH);

    console.log('Server module imported. Keys:', Object.keys(serverModule));
    console.log('Default type:', typeof serverModule.default);

    // Next.js standalone server.js exports a default
    // In Next.js 16, the default export might be the server instance or a factory
    const defaultExport = serverModule.default;

    // Check what the default export is
    if (!defaultExport) {
      throw new Error('Server module default export is undefined');
    }

    console.log('Default export type:', typeof defaultExport);
    console.log('Default export constructor:', defaultExport?.constructor?.name);

    // Next.js standalone server typically exports the HTTP server instance
    // We need to extract the Express/HTTP app from it
    if (typeof defaultExport === 'function') {
      // If it's a function, it might be:
      // 1. A factory that creates the server
      // 2. A request handler itself
      // 3. The server constructor

      // Try calling it (might be a factory)
      try {
        const result = defaultExport();
        if (result && (typeof result.listen === 'function' || typeof result.handle === 'function')) {
          app = result;
        } else {
          // If calling returns something else, use the function itself
          app = defaultExport;
        }
      } catch (e) {
        // If calling fails, use the function directly
        // It might be a request handler or middleware
        app = defaultExport;
      }
    } else if (defaultExport && typeof defaultExport.listen === 'function') {
      // It's already an HTTP server
      // Extract the underlying app if possible
      // For Express, the app is usually the server itself
      app = defaultExport;
    } else if (defaultExport && typeof defaultExport.handle === 'function') {
      // It might be a Connect-style app
      app = defaultExport;
    } else {
      // Try to use it as-is
      app = defaultExport;
    }

    // Verify app is usable with serverless-http
    // serverless-http works with Express apps, Connect apps, or any app with (req, res) signature
    if (!app) {
      throw new Error('Could not extract app from server module');
    }

    console.log('App type:', typeof app);
    console.log('App has listen:', typeof app.listen === 'function');
    console.log('App has handle:', typeof app.handle === 'function');

    // Wrap with serverless-http
    // serverless-http can work with Express apps, Connect middleware, or any (req, res) handler
    serverlessHandler = serverless(app, {
      binary: ['image/*', 'application/pdf', 'application/octet-stream'],
    });

    return app;
  } catch (error) {
    console.error('Failed to load Next.js server:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Main Lambda handler
 */
export const handler = async (event, context) => {
  try {
    // Initialize app if needed
    if (!serverlessHandler) {
      await getApp();
    }

    if (!serverlessHandler || typeof serverlessHandler !== 'function') {
      throw new Error('Handler is not a function. App initialization may have failed.');
    }

    // Use serverless-http to handle the request
    return await serverlessHandler(event, context);
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
