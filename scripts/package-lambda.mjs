/**
 * Package Lambda deployment ZIP
 * 
 * Creates lambda-package/ directory with:
 * - handler.mjs (Lambda handler)
 * - out/ (Next.js static export)
 * - package.json (minimal, if needed)
 */

import { mkdirSync, cpSync, existsSync, rmSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const PACKAGE_DIR = join(ROOT_DIR, 'lambda-package');
const OUT_DIR = join(ROOT_DIR, 'out');
const HANDLER_SRC = join(ROOT_DIR, 'lambda', 'handler.mjs');

console.log('Packaging Lambda deployment...');

// Clean and create package directory
if (existsSync(PACKAGE_DIR)) {
  console.log('Cleaning existing lambda-package/...');
  rmSync(PACKAGE_DIR, { recursive: true, force: true });
}
mkdirSync(PACKAGE_DIR, { recursive: true });

// Verify build output exists
if (!existsSync(OUT_DIR)) {
  console.error('ERROR: out/ directory not found. Run "npm run build" first.');
  process.exit(1);
}

if (!existsSync(join(OUT_DIR, 'index.html'))) {
  console.error('ERROR: index.html not found in out/. Build may have failed.');
  process.exit(1);
}

// Copy handler
console.log('Copying Lambda handler...');
cpSync(HANDLER_SRC, join(PACKAGE_DIR, 'handler.mjs'));

// Copy static files
console.log('Copying static files from out/...');
cpSync(OUT_DIR, join(PACKAGE_DIR, 'out'), { recursive: true });

// Create minimal package.json for Lambda (if needed)
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
