#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find all markdown files in docs
const docsPath = path.join(__dirname, '../apps/docs/src/docs');
const files = await glob('**/*.md', { cwd: docsPath, absolute: true });

let totalUpdates = 0;

files.forEach((filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Replace NgDocActions.demo("ComponentName") with NgDocActions.demo("ComponentName", { tabs: [] })
  // But don't replace if it already has options
  content = content.replace(/NgDocActions\.demo\("([^"]+)"\)(?!\s*,)/g, 'NgDocActions.demo("$1", { tabs: [] })');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    const count = (content.match(/NgDocActions\.demo/g) || []).length;
    console.log(`✅ Updated: ${path.relative(docsPath, filePath)} (${count} demo references)`);
    totalUpdates++;
  }
});

console.log(`\n🎉 Done! Updated ${totalUpdates} files`);
