#!/usr/bin/env node

/**
 * Deployment Preparation Script for Vercel
 *
 * This script prepares the deployment directory structure by:
 * 1. Copying the main docs app to dist/deploy/dynamic-forms
 * 2. Copying example apps to dist/deploy/dynamic-forms/examples subdirectory
 *
 * Resulting structure:
 * dist/deploy/
 * └── dynamic-forms/
 *     ├── index.html          (docs app)
 *     ├── assets/             (docs assets)
 *     └── examples/           (example apps)
 *         ├── material/       (Material examples)
 *         ├── bootstrap/      (Bootstrap examples)
 *         ├── primeng/        (PrimeNG examples)
 *         └── ionic/          (Ionic examples)
 */

import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from 'fs';
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
if (!existsSync(join(distDir, 'apps', 'docs', 'browser'))) {
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
  cpSync(join(distDir, 'apps', 'docs', 'browser'), deployDir, { recursive: true });
  console.log('   ✅ Docs app copied');
} catch (error) {
  console.error('   ❌ Failed to copy docs app:', error.message);
  process.exit(1);
}

// Copy index.csr.html to index.html for SPA fallback on GitHub Pages
// Angular SSR generates index.csr.html as the client-side rendering fallback.
// GitHub Pages needs this at the root as index.html to handle the SPA routing.
const indexCsrPath = join(deployDir, 'index.csr.html');
const indexHtmlPath = join(deployDir, 'index.html');
if (existsSync(indexCsrPath)) {
  console.log('📄 Creating index.html from index.csr.html for SPA fallback...');
  try {
    copyFileSync(indexCsrPath, indexHtmlPath);
    console.log('   ✅ index.html created');
  } catch (error) {
    console.error('   ❌ Failed to create index.html:', error.message);
    process.exit(1);
  }
}

// Create examples directory
console.log('\n📦 Setting up examples directory...');
const examplesDir = join(deployDir, 'examples');
mkdirSync(examplesDir, { recursive: true });

// Copy Material examples (required)
const materialSrc = join(distDir, 'apps', 'examples', 'material', 'browser');
if (!existsSync(materialSrc)) {
  console.error('❌ Error: Material examples build output not found!');
  console.error('   Expected at:', materialSrc);
  console.error('   Please run: pnpm nx build material-examples --configuration=production');
  process.exit(1);
}
console.log('   📦 Copying Material examples...');
try {
  cpSync(materialSrc, join(examplesDir, 'material'), { recursive: true });
  console.log('   ✅ Material examples copied');
} catch (error) {
  console.error('   ❌ Failed to copy Material examples:', error.message);
  process.exit(1);
}

// Copy PrimeNG examples (required)
const primengSrc = join(distDir, 'apps', 'examples', 'primeng', 'browser');
if (!existsSync(primengSrc)) {
  console.error('❌ Error: PrimeNG examples build output not found!');
  console.error('   Expected at:', primengSrc);
  console.error('   Please run: pnpm nx build primeng-examples --configuration=production');
  process.exit(1);
}
console.log('   📦 Copying PrimeNG examples...');
try {
  cpSync(primengSrc, join(examplesDir, 'primeng'), { recursive: true });
  console.log('   ✅ PrimeNG examples copied');
} catch (error) {
  console.error('   ❌ Failed to copy PrimeNG examples:', error.message);
  process.exit(1);
}

// Copy Bootstrap examples (required)
const bootstrapSrc = join(distDir, 'apps', 'examples', 'bootstrap', 'browser');
if (!existsSync(bootstrapSrc)) {
  console.error('❌ Error: Bootstrap examples build output not found!');
  console.error('   Expected at:', bootstrapSrc);
  console.error('   Please run: pnpm nx build bootstrap-examples --configuration=production');
  process.exit(1);
}
console.log('   📦 Copying Bootstrap examples...');
try {
  cpSync(bootstrapSrc, join(examplesDir, 'bootstrap'), { recursive: true });
  console.log('   ✅ Bootstrap examples copied');
} catch (error) {
  console.error('   ❌ Failed to copy Bootstrap examples:', error.message);
  process.exit(1);
}

// Copy Ionic examples (required)
const ionicSrc = join(distDir, 'apps', 'examples', 'ionic', 'browser');
if (!existsSync(ionicSrc)) {
  console.error('❌ Error: Ionic examples build output not found!');
  console.error('   Expected at:', ionicSrc);
  console.error('   Please run: pnpm nx build ionic-examples --configuration=production');
  process.exit(1);
}
console.log('   📦 Copying Ionic examples...');
try {
  cpSync(ionicSrc, join(examplesDir, 'ionic'), { recursive: true });
  console.log('   ✅ Ionic examples copied');
} catch (error) {
  console.error('   ❌ Failed to copy Ionic examples:', error.message);
  process.exit(1);
}

console.log('\n✅ Deployment directory prepared successfully!\n');
console.log('📂 Deployment structure:');
console.log('   dist/deploy/');
console.log('   └── dynamic-forms/');
console.log('       ├── index.html       (docs app)');
console.log('       ├── assets/          (docs assets)');
console.log('       └── examples/        (example apps)');
console.log('           ├── material/    (Material examples)');
console.log('           ├── bootstrap/   (Bootstrap examples)');
console.log('           ├── primeng/     (PrimeNG examples)');
console.log('           └── ionic/       (Ionic examples)\n');

console.log('🌐 Production URLs:');
console.log('   Docs:      https://ng-forge.com/dynamic-forms/');
console.log('   Material:  https://ng-forge.com/dynamic-forms/examples/material/');
console.log('   Bootstrap: https://ng-forge.com/dynamic-forms/examples/bootstrap/');
console.log('   PrimeNG:   https://ng-forge.com/dynamic-forms/examples/primeng/');
console.log('   Ionic:     https://ng-forge.com/dynamic-forms/examples/ionic/\n');
