#!/usr/bin/env node

/**
 * Deployment Preparation Script for Vercel
 *
 * Copies the docs app (which now embeds all examples via sandbox harness) to
 * the deployment directory ready for Vercel.
 *
 * Resulting structure:
 * dist/deploy/
 * └── dynamic-forms/
 *     ├── index.html   (docs app + embedded examples)
 *     └── assets/      (docs assets)
 */

import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🚀 Preparing deployment directory...\n');

const deployRoot = join(rootDir, 'dist', 'deploy');
const deployDir = join(deployRoot, 'dynamic-forms');
const distDir = join(rootDir, 'dist');

// Prefer pre-rendered output (SSG via Analog) over client-only SPA shell
const docsAnalogDir = join(distDir, 'apps', 'docs', 'analog', 'public');
const docsClientDir = join(distDir, 'apps', 'docs', 'client');
const docsSourceDir = existsSync(docsAnalogDir) ? docsAnalogDir : docsClientDir;

if (!existsSync(docsSourceDir)) {
  console.error('❌ Error: Docs app build output not found!');
  console.error('   Please run: pnpm nx build docs --configuration=production');
  process.exit(1);
}

if (docsSourceDir === docsAnalogDir) {
  console.log('📦 Using pre-rendered (SSG) output from Analog...');
} else {
  console.log('📦 Using client-only SPA output (no pre-rendering)...');
}

// Clean deploy directory
console.log('🧹 Cleaning deploy directory...');
rmSync(deployRoot, { recursive: true, force: true });

// Create deploy directory structure
console.log('📁 Creating deploy directory structure...');
mkdirSync(deployDir, { recursive: true });

// Copy docs app to root
console.log('📄 Copying docs app to deployment root...');
try {
  cpSync(docsSourceDir, deployDir, { recursive: true });
  console.log('   ✅ Docs app copied');
} catch (error) {
  console.error('   ❌ Failed to copy docs app:', error.message);
  process.exit(1);
}

// Rewrite base href in all HTML files for /dynamic-forms/ deployment path
console.log('📄 Rewriting base href for /dynamic-forms/ deployment...');

function rewriteBaseHrefInDir(dir) {
  let count = 0;
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      count += rewriteBaseHrefInDir(fullPath);
    } else if (entry.endsWith('.html')) {
      const html = readFileSync(fullPath, 'utf-8');
      if (html.includes('<base href="/">') || html.includes('<base href="/" />')) {
        const updated = html
          .replace('<base href="/">', '<base href="/dynamic-forms/">')
          .replace('<base href="/" />', '<base href="/dynamic-forms/" />');
        writeFileSync(fullPath, updated, 'utf-8');
        count++;
      }
    }
  }
  return count;
}

const rewrittenCount = rewriteBaseHrefInDir(deployDir);
console.log(`   ✅ base href updated in ${rewrittenCount} HTML file(s)`);

console.log('\n✅ Deployment directory prepared successfully!\n');
console.log('📂 Deployment structure:');
console.log('   dist/deploy/');
console.log('   └── dynamic-forms/');
console.log('       ├── index.html   (docs app + embedded examples)');
console.log('       └── assets/      (docs assets)\n');

console.log('🌐 Production URL:');
console.log('   https://ng-forge.com/dynamic-forms/\n');
