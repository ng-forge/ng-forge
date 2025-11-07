#!/usr/bin/env node

/**
 * Deployment Preparation Script for GitHub Pages
 *
 * This script prepares the deployment directory structure for GitHub Pages by:
 * 1. Copying the main docs app to the root of dist/deploy
 * 2. Copying example apps to dist/deploy/examples subdirectory
 *
 * Resulting structure:
 * dist/deploy/
 * ├── index.html              (docs app)
 * ├── assets/                 (docs assets)
 * └── examples/               (example apps)
 *     ├── material/           (Material examples)
 *     ├── primeng/            (PrimeNG examples)
 *     └── ionic/              (Ionic examples)
 */

import { cpSync, existsSync, mkdirSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🚀 Preparing deployment directory...\n');

const deployDir = join(rootDir, 'dist', 'deploy');
const distDir = join(rootDir, 'dist');

// Check if build output exists
if (!existsSync(join(distDir, 'apps', 'docs', 'browser'))) {
  console.error('❌ Error: Docs app build output not found!');
  console.error('   Please run: pnpm nx build docs --configuration=production');
  process.exit(1);
}

// Clean deploy directory
console.log('🧹 Cleaning deploy directory...');
rmSync(deployDir, { recursive: true, force: true });

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

// Create examples directory
console.log('\n📦 Setting up examples directory...');
const examplesDir = join(deployDir, 'examples');
mkdirSync(examplesDir, { recursive: true });

// Copy Material examples (if exists)
const materialSrc = join(distDir, 'apps', 'demo', 'material', 'browser');
if (existsSync(materialSrc)) {
  console.log('   📦 Copying Material examples...');
  try {
    cpSync(materialSrc, join(examplesDir, 'material'), { recursive: true });
    console.log('   ✅ Material examples copied');
  } catch (error) {
    console.warn('   ⚠️  Failed to copy Material examples:', error.message);
  }
} else {
  console.log('   ⏭️  Material examples not found, skipping');
}

// Copy PrimeNG examples (if exists)
const primengSrc = join(distDir, 'docs-examples', 'primeng', 'browser');
if (existsSync(primengSrc)) {
  console.log('   📦 Copying PrimeNG examples...');
  try {
    cpSync(primengSrc, join(examplesDir, 'primeng'), { recursive: true });
    console.log('   ✅ PrimeNG examples copied');
  } catch (error) {
    console.warn('   ⚠️  Failed to copy PrimeNG examples:', error.message);
  }
} else {
  console.log('   ⏭️  PrimeNG examples not found, skipping');
}

// Copy Ionic examples (if exists)
const ionicSrc = join(distDir, 'docs-examples', 'ionic', 'browser');
if (existsSync(ionicSrc)) {
  console.log('   📦 Copying Ionic examples...');
  try {
    cpSync(ionicSrc, join(examplesDir, 'ionic'), { recursive: true });
    console.log('   ✅ Ionic examples copied');
  } catch (error) {
    console.warn('   ⚠️  Failed to copy Ionic examples:', error.message);
  }
} else {
  console.log('   ⏭️  Ionic examples not found, skipping');
}

console.log('\n✅ Deployment directory prepared successfully!\n');
console.log('📂 Deployment structure:');
console.log('   dist/deploy/');
console.log('   ├── index.html           (docs app)');
console.log('   ├── assets/              (docs assets)');
console.log('   └── examples/            (example apps)');
console.log('       ├── material/        (Material examples)');
console.log('       ├── primeng/         (PrimeNG examples)');
console.log('       └── ionic/           (Ionic examples)\n');

console.log('🌐 GitHub Pages URLs:');
console.log('   Docs:     https://ng-forge.github.io/ng-forge/');
console.log('   Material: https://ng-forge.github.io/ng-forge/examples/material/');
console.log('   PrimeNG:  https://ng-forge.github.io/ng-forge/examples/primeng/');
console.log('   Ionic:    https://ng-forge.github.io/ng-forge/examples/ionic/\n');
