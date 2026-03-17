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

import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🚀 Preparing deployment directory...\n');

const deployRoot = join(rootDir, 'dist', 'deploy');
const deployDir = join(deployRoot, 'dynamic-forms');
const distDir = join(rootDir, 'dist');

// Check if build output exists
if (!existsSync(join(distDir, 'apps', 'docs', 'client'))) {
  console.error('❌ Error: Docs app build output not found!');
  console.error('   Please run: pnpm nx build docs --configuration=production');
  process.exit(1);
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
  cpSync(join(distDir, 'apps', 'docs', 'client'), deployDir, { recursive: true });
  console.log('   ✅ Docs app copied');
} catch (error) {
  console.error('   ❌ Failed to copy docs app:', error.message);
  process.exit(1);
}

// Rewrite base href for /dynamic-forms/ deployment path
const indexHtmlPath = join(deployDir, 'index.html');
if (existsSync(indexHtmlPath)) {
  console.log('📄 Rewriting base href for /dynamic-forms/ deployment...');
  const html = readFileSync(indexHtmlPath, 'utf-8');
  const updated = html.replace('<base href="/" />', '<base href="/dynamic-forms/" />');
  writeFileSync(indexHtmlPath, updated, 'utf-8');
  console.log('   ✅ base href updated to /dynamic-forms/');
}

// Also rewrite 404.html if it exists
const notFoundPath = join(deployDir, '404.html');
if (existsSync(notFoundPath)) {
  const html404 = readFileSync(notFoundPath, 'utf-8');
  const updated404 = html404.replace('<base href="/" />', '<base href="/dynamic-forms/" />');
  writeFileSync(notFoundPath, updated404, 'utf-8');
  console.log('   ✅ 404.html base href updated');
}

console.log('\n✅ Deployment directory prepared successfully!\n');
console.log('📂 Deployment structure:');
console.log('   dist/deploy/');
console.log('   └── dynamic-forms/');
console.log('       ├── index.html   (docs app + embedded examples)');
console.log('       └── assets/      (docs assets)\n');

console.log('🌐 Production URL:');
console.log('   https://ng-forge.com/dynamic-forms/\n');
