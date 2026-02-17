/**
 * AWS Lambda Handler for Next.js Static Site
 * 
 * Serves static files from the Next.js static export (out/ directory).
 * Supports both Lambda Function URL and API Gateway events.
 */

import { readFileSync, existsSync } from 'fs';
import { join, extname, normalize } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to static files (Next.js export output)
const STATIC_DIR = join(__dirname, 'out');

// MIME type mapping
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.webp': 'image/webp',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

/**
 * Get MIME type for file extension
 */
function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Serve static file
 */
function serveFile(filePath) {
  try {
    const fullPath = join(STATIC_DIR, filePath);
    const normalizedPath = normalize(fullPath);
    
    // Security: Ensure path is within STATIC_DIR
    if (!normalizedPath.startsWith(STATIC_DIR)) {
      return null;
    }
    
    if (!existsSync(normalizedPath)) {
      return null;
    }
    
    const content = readFileSync(normalizedPath);
    const mimeType = getMimeType(filePath);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': filePath === 'index.html' || filePath.endsWith('.html')
          ? 'no-cache, no-store, must-revalidate'
          : 'public, max-age=31536000, immutable',
      },
      body: content.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Error serving file:', error);
    return null;
  }
}

/**
 * Convert Lambda event to request path
 */
function getRequestPath(event) {
  // Lambda Function URL
  if (event.requestContext && event.rawPath) {
    return event.rawPath === '/' ? 'index.html' : event.rawPath.replace(/^\//, '');
  }
  
  // API Gateway V2
  if (event.requestContext && event.requestContext.http) {
    const path = event.rawPath || event.path || '/';
    return path === '/' ? 'index.html' : path.replace(/^\//, '');
  }
  
  // API Gateway V1
  if (event.path) {
    return event.path === '/' ? 'index.html' : event.path.replace(/^\//, '');
  }
  
  return 'index.html';
}

/**
 * Main Lambda handler
 */
export const handler = async (event, context) => {
  try {
    const requestPath = getRequestPath(event);
    
    // Try to serve the requested file
    let response = serveFile(requestPath);
    
    // If file not found and it's not already index.html, try index.html (SPA routing)
    if (!response && requestPath !== 'index.html' && !requestPath.includes('.')) {
      response = serveFile('index.html');
    }
    
    // If still not found, serve index.html as fallback
    if (!response) {
      response = serveFile('index.html');
    }
    
    // If index.html doesn't exist, return 404
    if (!response) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Not Found',
        isBase64Encoded: false,
      };
    }
    
    return response;
  } catch (error) {
    console.error('Lambda handler error:', {
      message: error.message,
      stack: error.stack,
      requestPath: getRequestPath(event),
    });
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Internal Server Error',
      isBase64Encoded: false,
    };
  }
};
