/**
 * Package Lambda deployment ZIP for Next.js Standalone
 * 
 * Creates lambda-package/ directory with:
 * - handler.mjs (Lambda handler)
 * - .next/standalone (Next.js standalone server)
 * - .next/static (Next.js static assets)
 * - public (public assets)
 * - package.json
 */

import { mkdirSync, cpSync, existsSync, rmSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const PACKAGE_DIR = join(ROOT_DIR, 'lambda-package');
const NEXT_STANDALONE = join(ROOT_DIR, '.next', 'standalone');
const NEXT_STATIC = join(ROOT_DIR, '.next', 'static');
const PUBLIC_DIR = join(ROOT_DIR, 'public');
const HANDLER_SRC = join(ROOT_DIR, 'lambda', 'handler.mjs');

console.log('Packaging Lambda deployment for Next.js standalone...');

// Clean and create package directory
if (existsSync(PACKAGE_DIR)) {
  console.log('Cleaning existing lambda-package/...');
  rmSync(PACKAGE_DIR, { recursive: true, force: true });
}
mkdirSync(PACKAGE_DIR, { recursive: true });

// Verify build output exists
if (!existsSync(NEXT_STANDALONE)) {
  console.error('ERROR: .next/standalone directory not found. Run "npm run build" first.');
  console.error('Make sure next.config.ts has output: "standalone"');
  process.exit(1);
}

if (!existsSync(join(NEXT_STANDALONE, 'server.js'))) {
  console.error('ERROR: server.js not found in .next/standalone. Build may have failed.');
  process.exit(1);
}

// Copy handler
console.log('Copying Lambda handler...');
cpSync(HANDLER_SRC, join(PACKAGE_DIR, 'handler.mjs'));

// Copy Next.js standalone server
console.log('Copying Next.js standalone server...');
cpSync(NEXT_STANDALONE, join(PACKAGE_DIR, '.next', 'standalone'), { recursive: true });

// Copy Next.js static assets
if (existsSync(NEXT_STATIC)) {
  console.log('Copying Next.js static assets...');
  cpSync(NEXT_STATIC, join(PACKAGE_DIR, '.next', 'static'), { recursive: true });
}

// Copy public directory if it exists
if (existsSync(PUBLIC_DIR)) {
  console.log('Copying public assets...');
  cpSync(PUBLIC_DIR, join(PACKAGE_DIR, 'public'), { recursive: true });
}

// Ensure serverless-http is available in root node_modules (handler imports from root)
const NODE_MODULES = join(ROOT_DIR, 'node_modules');
const SERVERLESS_HTTP_PATH = join(NODE_MODULES, 'serverless-http');
const PACKAGE_NODE_MODULES = join(PACKAGE_DIR, 'node_modules');

if (existsSync(SERVERLESS_HTTP_PATH)) {
  console.log('Copying serverless-http to package node_modules...');
  if (!existsSync(PACKAGE_NODE_MODULES)) {
    mkdirSync(PACKAGE_NODE_MODULES, { recursive: true });
  }
  cpSync(SERVERLESS_HTTP_PATH, join(PACKAGE_NODE_MODULES, 'serverless-http'), { recursive: true });
  console.log('serverless-http copied successfully');
} else {
  console.warn('WARNING: serverless-http not found in node_modules. It should be installed as a dependency.');
  console.warn('Attempting to install serverless-http in package directory...');
  try {
    execSync(`cd ${PACKAGE_DIR} && npm install serverless-http@^3.2.0 --production --no-save`, { stdio: 'inherit' });
    console.log('serverless-http installed successfully');
  } catch (error) {
    console.error('ERROR: Failed to install serverless-http:', error.message);
    process.exit(1);
  }
}

// Create index.mjs as fallback (re-exports handler)
console.log('Creating index.mjs fallback...');
const indexContent = `// Re-export handler for Lambda compatibility
export { handler } from './handler.mjs';
`;
writeFileSync(join(PACKAGE_DIR, 'index.mjs'), indexContent);

// Create minimal package.json for Lambda
const packageJson = {
  name: 'alliance-ibd-pdf-viewer-lambda',
  version: '1.0.0',
  type: 'module',
  main: 'handler.mjs',
};
writeFileSync(
  join(PACKAGE_DIR, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

// Calculate package size
try {
  const size = execSync(`du -sh ${PACKAGE_DIR}`, { encoding: 'utf-8' }).split('\t')[0];
  console.log(`Package size: ${size}`);
  
  // Check if we should use ECR instead
  const sizeBytes = parseInt(execSync(`du -sb ${PACKAGE_DIR}`, { encoding: 'utf-8' }).split('\t')[0]);
  const sizeMB = sizeBytes / (1024 * 1024);
  
  console.log(`Package size: ${sizeMB.toFixed(2)} MB`);
  
  if (sizeMB > 250) {
    console.warn('WARNING: Package size exceeds 250MB. Consider using ECR deployment.');
  } else if (sizeMB > 50) {
    console.warn('WARNING: Package size exceeds 50MB. ZIP deployment may be slow. Consider ECR.');
  } else {
    console.log('Package size is within ZIP deployment limits.');
  }
} catch (error) {
  console.warn('Could not calculate package size:', error.message);
}

console.log('Lambda package created successfully in lambda-package/');
console.log('Ready for deployment!');
