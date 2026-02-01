#!/usr/bin/env node

/**
 * Generates a GitHub Job Summary from Playwright test results.
 *
 * This script reads the JSON test results and creates a markdown summary
 * with failed tests, error messages, and embedded screenshots.
 *
 * Usage: node scripts/playwright-job-summary.mjs <app-name> <test-results-dir>
 * Example: node scripts/playwright-job-summary.mjs material-examples apps/examples/material/test-results
 */

import { readFileSync, existsSync, readdirSync, statSync, appendFileSync } from 'node:fs';
import { join, basename, relative } from 'node:path';

const MAX_EMBEDDED_IMAGES = 10;
const MAX_IMAGE_SIZE_KB = 500;
const MAX_ERROR_LENGTH = 500;

/**
 * @typedef {Object} TestResult
 * @property {string} title
 * @property {string} status
 * @property {Array<{attachments: Array<{name: string, path: string, contentType: string}>}>} results
 */

/**
 * @typedef {Object} TestSuite
 * @property {string} title
 * @property {TestResult[]} specs
 * @property {TestSuite[]} suites
 */

/**
 * @typedef {Object} PlaywrightReport
 * @property {TestSuite[]} suites
 * @property {{startTime: string, duration: number}} stats
 */

/**
 * Recursively finds all failed tests in the test suites.
 * @param {TestSuite[]} suites
 * @param {string} prefix
 * @returns {Array<{title: string, fullTitle: string, error: string, attachments: Array<{name: string, path: string, contentType: string}>}>}
 */
function findFailedTests(suites, prefix = '') {
  const failed = [];

  for (const suite of suites) {
    const suiteTitle = prefix ? `${prefix} > ${suite.title}` : suite.title;

    // Check specs in this suite
    if (suite.specs) {
      for (const spec of suite.specs) {
        if (spec.ok === false || spec.status === 'unexpected') {
          const attachments = [];
          let error = '';

          // Collect attachments and errors from test results
          if (spec.tests) {
            for (const test of spec.tests) {
              if (test.results) {
                for (const result of test.results) {
                  if (result.status === 'failed' || result.status === 'timedOut') {
                    // Get error message
                    if (result.error?.message) {
                      error = result.error.message;
                    }

                    // Collect attachments
                    if (result.attachments) {
                      attachments.push(...result.attachments);
                    }
                  }
                }
              }
            }
          }

          failed.push({
            title: spec.title,
            fullTitle: `${suiteTitle} > ${spec.title}`,
            error: error.substring(0, MAX_ERROR_LENGTH),
            attachments,
          });
        }
      }
    }

    // Recursively check nested suites
    if (suite.suites) {
      failed.push(...findFailedTests(suite.suites, suiteTitle));
    }
  }

  return failed;
}

/**
 * Finds all PNG files in a directory recursively.
 * @param {string} dir
 * @returns {string[]}
 */
function findScreenshots(dir) {
  const screenshots = [];

  if (!existsSync(dir)) {
    return screenshots;
  }

  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      screenshots.push(...findScreenshots(fullPath));
    } else if (entry.name.endsWith('.png')) {
      screenshots.push(fullPath);
    }
  }

  return screenshots;
}

/**
 * Encodes an image as base64 data URI, with size limit.
 * @param {string} imagePath
 * @returns {string|null}
 */
function encodeImageAsDataUri(imagePath) {
  try {
    const stats = statSync(imagePath);
    if (stats.size > MAX_IMAGE_SIZE_KB * 1024) {
      return null; // Too large to embed
    }

    const buffer = readFileSync(imagePath);
    const base64 = buffer.toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch {
    return null;
  }
}

/**
 * Generates the markdown summary.
 * @param {string} appName
 * @param {PlaywrightReport} report
 * @param {string} testResultsDir
 * @returns {string}
 */
function generateSummary(appName, report, testResultsDir) {
  const lines = [];
  const failedTests = findFailedTests(report.suites || []);
  const passedTests = report.stats?.expected ?? 0;
  const failedCount = report.stats?.unexpected ?? 0;
  const flakyTests = report.stats?.flaky ?? 0;
  const skippedTests = report.stats?.skipped ?? 0;
  const totalTests = passedTests + failedCount + flakyTests + skippedTests;
  const durationMs = report.stats?.duration ?? 0;
  const durationSec = (durationMs / 1000).toFixed(1);

  // Header
  lines.push(`## Playwright E2E Results: ${appName}`);
  lines.push('');

  // Stats
  if (failedTests.length === 0) {
    lines.push(`### :white_check_mark: All tests passed`);
    lines.push('');
    lines.push(`| Metric | Value |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Total | ${totalTests} |`);
    lines.push(`| Passed | ${passedTests} |`);
    if (flakyTests > 0) {
      lines.push(`| Flaky | ${flakyTests} |`);
    }
    lines.push(`| Duration | ${durationSec}s |`);
    lines.push('');
    return lines.join('\n');
  }

  // Failure summary
  lines.push(`### :x: ${failedTests.length} test(s) failed`);
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total | ${totalTests} |`);
  lines.push(`| Passed | ${passedTests} |`);
  lines.push(`| Failed | ${failedTests.length} |`);
  if (flakyTests > 0) {
    lines.push(`| Flaky | ${flakyTests} |`);
  }
  lines.push(`| Duration | ${durationSec}s |`);
  lines.push('');

  // Failed tests details
  lines.push('### Failed Tests');
  lines.push('');

  for (const test of failedTests) {
    lines.push(`<details>`);
    lines.push(`<summary><strong>${test.title}</strong></summary>`);
    lines.push('');
    lines.push(`**Full path:** \`${test.fullTitle}\``);
    lines.push('');

    if (test.error) {
      lines.push('**Error:**');
      lines.push('```');
      lines.push(test.error);
      lines.push('```');
      lines.push('');
    }

    lines.push('</details>');
    lines.push('');
  }

  // Screenshots section - filter for diff/actual/failure screenshots
  // Playwright naming: test-failed-1.png, screenshot-diff.png, screenshot-actual.png
  const screenshots = findScreenshots(testResultsDir);
  const screenshotDiffs = screenshots.filter((s) => {
    const name = basename(s);
    return name.includes('-diff') || name.includes('-actual') || name.includes('-failed') || name.includes('failure');
  });

  if (screenshotDiffs.length > 0) {
    lines.push('### Screenshots');
    lines.push('');
    lines.push(
      `Found ${screenshotDiffs.length} screenshot(s). Showing up to ${MAX_EMBEDDED_IMAGES} inline (max ${MAX_IMAGE_SIZE_KB}KB each).`,
    );
    lines.push('');

    let embeddedCount = 0;
    for (const screenshot of screenshotDiffs) {
      if (embeddedCount >= MAX_EMBEDDED_IMAGES) {
        lines.push(`_...and ${screenshotDiffs.length - embeddedCount} more screenshot(s) in artifacts_`);
        break;
      }

      const relativePath = relative(process.cwd(), screenshot);
      const fileName = basename(screenshot);

      // Try to embed as base64
      const dataUri = encodeImageAsDataUri(screenshot);

      lines.push(`<details>`);
      lines.push(`<summary><code>${fileName}</code></summary>`);
      lines.push('');

      if (dataUri) {
        lines.push(`![${fileName}](${dataUri})`);
        embeddedCount++;
      } else {
        lines.push(`_Image too large to embed. Download artifacts to view: \`${relativePath}\`_`);
      }

      lines.push('');
      lines.push('</details>');
      lines.push('');
    }
  }

  // Footer with artifact hint
  lines.push('---');
  lines.push('');
  lines.push(':information_source: Download the `playwright-results-*` artifact for full HTML report and trace files.');
  lines.push('');

  return lines.join('\n');
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node scripts/playwright-job-summary.mjs <app-name> <test-results-dir>');
  process.exit(1);
}

const [appName, testResultsDir] = args;
const resultsJsonPath = join(testResultsDir, 'results.json');

// Check if results file exists
if (!existsSync(resultsJsonPath)) {
  console.log(`No results.json found at ${resultsJsonPath}. Skipping summary generation.`);
  process.exit(0);
}

// Read and parse results
let report;
try {
  const content = readFileSync(resultsJsonPath, 'utf-8');
  report = JSON.parse(content);
} catch (error) {
  console.error(`Failed to parse ${resultsJsonPath}:`, error.message);
  process.exit(1);
}

// Generate summary
const summary = generateSummary(appName, report, testResultsDir);

// Output to GITHUB_STEP_SUMMARY if available, otherwise to stdout
const summaryFile = process.env.GITHUB_STEP_SUMMARY;
if (summaryFile) {
  appendFileSync(summaryFile, summary + '\n');
  console.log(`Summary written to ${summaryFile}`);
} else {
  console.log(summary);
}
