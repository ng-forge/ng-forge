#!/usr/bin/env node
/**
 * Migration Script: Replace waitForTimeout with Deterministic Waits
 *
 * This script automatically replaces non-deterministic waitForTimeout calls
 * with proper deterministic waiting strategies.
 */

const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (file.endsWith('.spec.ts')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Pattern replacements - order matters!
const replacements = [
  // After page.evaluate - wait for scenario load
  {
    pattern: /await page\.evaluate\([^)]+\);\s*await page\.waitForTimeout\(\d+\);/gs,
    replacement: `await page.evaluate(/* ... */);
    const waitHelpers = new DeterministicWaitHelpers(page);
    await waitHelpers.waitForScenarioLoad();`,
    description: 'After page.evaluate (scenario load)'
  },

  // After clicking next/previous buttons
  {
    pattern: /await (nextButton|prevButton|page\.locator\([^)]*next[^)]*\))\.click\(\);\s*await page\.waitForTimeout\(\d+\);/g,
    replacement: `await $1.click();
    const waitHelpers = new DeterministicWaitHelpers(page);
    await waitHelpers.waitForPageTransition();`,
    description: 'After clicking next/previous button'
  },

  // After filling/clicking form fields - wait for validation
  {
    pattern: /(await page\.(fill|getByLabel)\([^)]+\)\.blur\(\);)\s*await page\.waitForTimeout\(\d+\);/g,
    replacement: `$1
    const waitHelpers = new DeterministicWaitHelpers(page);
    await waitHelpers.waitForAngularStability();`,
    description: 'After form field blur (validation)'
  },

  // After button clicks - general case
  {
    pattern: /(await page\.(click|getByText|getByRole)\([^)]+\)\.click\(\);)\s*await page\.waitForTimeout\(\d+\);/g,
    replacement: `$1
    const waitHelpers = new DeterministicWaitHelpers(page);
    await waitHelpers.waitForAngularStability();`,
    description: 'After button click (general)'
  },

  // In beforeEach - after navigation
  {
    pattern: /await page\.waitForLoadState\('networkidle'\);\s*await page\.waitForTimeout\(\d+\);/g,
    replacement: `await page.waitForLoadState('networkidle');
    const waitHelpers = new DeterministicWaitHelpers(page);
    await waitHelpers.waitForAngularStability();`,
    description: 'After waitForLoadState in beforeEach'
  },

  // Very short delays (< 500ms) - likely for animations
  {
    pattern: /await page\.waitForTimeout\((100|200|300)\);/g,
    replacement: '// Removed non-deterministic short delay - relying on auto-waiting',
    description: 'Very short delays removed'
  },

  // Generic fallback - replace with Angular stability wait
  {
    pattern: /await page\.waitForTimeout\(\d+\);/g,
    replacement: `const waitHelpers = new DeterministicWaitHelpers(page);
    await waitHelpers.waitForAngularStability();`,
    description: 'Generic waitForTimeout'
  }
];

function addImportIfMissing(content) {
  if (!content.includes('DeterministicWaitHelpers')) {
    const importLine = "import { DeterministicWaitHelpers } from './utils/deterministic-wait-helpers';";

    // Add after the last import
    const lastImportMatch = content.match(/(import .* from .*;\n)+/);
    if (lastImportMatch) {
      const lastImportEnd = lastImportMatch.index + lastImportMatch[0].length;
      return content.slice(0, lastImportEnd) + importLine + '\n' + content.slice(lastImportEnd);
    } else {
      // Add at the beginning
      return importLine + '\n' + content;
    }
  }
  return content;
}

function deduplicateWaitHelpers(content) {
  // Remove duplicate const waitHelpers declarations in the same function
  return content.replace(
    /(const waitHelpers = new DeterministicWaitHelpers\(page\);[\s\n]*){2,}/g,
    'const waitHelpers = new DeterministicWaitHelpers(page);\n    '
  );
}

async function migrateFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  let changesCount = 0;

  // Apply replacements
  for (const { pattern, replacement, description } of replacements) {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`  - ${description}: ${matches.length} replacements`);
      changesCount += matches.length;
      content = content.replace(pattern, replacement);
    }
  }

  if (changesCount > 0) {
    // Add import if needed
    content = addImportIfMissing(content);

    // Clean up duplicates
    content = deduplicateWaitHelpers(content);

    // Write back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Made ${changesCount} changes`);
    return changesCount;
  } else {
    console.log(`  ℹ️  No changes needed`);
    return 0;
  }
}

async function main() {
  console.log('🔄 Starting migration to deterministic waits...\n');

  const testDir = path.join(__dirname, 'src');
  const testFiles = getAllFiles(testDir);

  console.log(`Found ${testFiles.length} test files\n`);

  let totalChanges = 0;
  for (const file of testFiles) {
    const changes = await migrateFile(file);
    totalChanges += changes;
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Total changes: ${totalChanges} across ${testFiles.length} files`);
  console.log(`\n⚠️  Please review the changes and test thoroughly.`);
  console.log(`   Some complex cases may need manual adjustment.`);
}

main().catch(console.error);
