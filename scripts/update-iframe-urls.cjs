#!/usr/bin/env node

/**
 * Script to update iframe URLs in markdown files for different environments.
 *
 * Usage:
 *   node scripts/update-iframe-urls.js production  # For production build
 *   node scripts/update-iframe-urls.js development # For development (default)
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const DOCS_PATH = 'apps/docs/src/docs';

const URL_MAPPINGS = {
  development: {
    'src="/dynamic-forms/examples/material/#': 'src="http://localhost:4201/#',
    'src="/dynamic-forms/examples/primeng/#': 'src="http://localhost:4202/#',
    'src="/dynamic-forms/examples/ionic/#': 'src="http://localhost:4203/#',
    'src="/dynamic-forms/examples/bootstrap/#': 'src="http://localhost:4204/#',
  },
  production: {
    'src="http://localhost:4201/#': 'src="/dynamic-forms/examples/material/#',
    'src="http://localhost:4202/#': 'src="/dynamic-forms/examples/primeng/#',
    'src="http://localhost:4203/#': 'src="/dynamic-forms/examples/ionic/#',
    'src="http://localhost:4204/#': 'src="/dynamic-forms/examples/bootstrap/#',
  },
};

const env = process.argv[2] || 'development';
const mappings = URL_MAPPINGS[env];

if (!mappings) {
  console.error(`Unknown environment: ${env}`);
  console.error('Usage: node scripts/update-iframe-urls.js [development|production]');
  process.exit(1);
}

console.log(`Updating iframe URLs for ${env}...`);

const files = glob.sync(`${DOCS_PATH}/**/*.md`);
let updatedCount = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  Object.entries(mappings).forEach(([from, to]) => {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(file, content);
    updatedCount++;
    console.log(`  Updated: ${file}`);
  }
});

console.log(`Done. Updated ${updatedCount} files.`);
