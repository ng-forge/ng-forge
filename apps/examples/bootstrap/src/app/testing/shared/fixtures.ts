import { Locator, test as base } from '@playwright/test';
import type { BaseTestHelpers, ConsoleCheckOptions, ConsoleTracker, MockApiHelpers } from '@ng-forge/examples-shared-testing';
import {
  APP_PORTS,
  createBaseHelpers,
  createConsoleTrackerFixture,
  createErrorHelpers,
  createMockApiFixture,
  createTestUrl,
  expect,
  logTestResult,
} from '@ng-forge/examples-shared-testing';

// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap-specific Configuration
// ─────────────────────────────────────────────────────────────────────────────

export const testUrl = createTestUrl(`http://localhost:${APP_PORTS['bootstrap-examples']}`);

const BOOTSTRAP_SELECTORS = {
  errorSelector: '.invalid-feedback',
  submitButtonSelector: '#submit button',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap TestHelpers Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface TestHelpers extends BaseTestHelpers {
  /** Get a Bootstrap checkbox within a scenario */
  getCheckbox: (scenario: Locator, fieldId: string) => Locator;
  /** Get a Bootstrap select within a scenario */
  getSelect: (scenario: Locator, fieldId: string) => Locator;
  /** Get the error message for a field (Bootstrap invalid-feedback element) */
  getFieldError: (scenario: Locator, fieldId: string) => Locator;
  /** Get all error messages for a field */
  getFieldErrors: (scenario: Locator, fieldId: string) => Locator;
  /** Select an option from a Bootstrap select */
  selectOption: (select: Locator, optionText: string) => Promise<void>;
  /** Assert that an error message is visible for a field */
  expectErrorVisible: (scenario: Locator, fieldId: string, options?: { timeout?: number }) => Promise<void>;
  /** Assert that no error message is visible for a field */
  expectNoErrorVisible: (scenario: Locator, fieldId: string, options?: { timeout?: number }) => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap Test Fixture
// ─────────────────────────────────────────────────────────────────────────────

export const test = base.extend<{ helpers: TestHelpers; consoleTracker: ConsoleTracker; mockApi: MockApiHelpers }>({
  mockApi: async ({ page }, use) => {
    await use(createMockApiFixture(page));
  },

  consoleTracker: async ({ page }, use) => {
    await use(createConsoleTrackerFixture(page));
  },

  helpers: async ({ page }, use) => {
    const baseHelpers = createBaseHelpers(page, testUrl, BOOTSTRAP_SELECTORS);
    const errorHelpers = createErrorHelpers(BOOTSTRAP_SELECTORS.errorSelector);

    const helpers: TestHelpers = {
      ...baseHelpers,
      ...errorHelpers,

      // Override fillInput to include blur for Bootstrap validation
      fillInput: async (input: Locator, value: string) => {
        await input.fill(value);
        await input.blur();
        await page.waitForTimeout(200);
      },

      // Override clearAndFill to include blur for Bootstrap validation
      clearAndFill: async (input: Locator, value: string) => {
        await input.clear();
        await input.fill(value);
        await input.blur();
        await page.waitForTimeout(200);
      },

      getCheckbox: (scenario: Locator, fieldId: string) => {
        return scenario.locator(`#${fieldId} .form-check`);
      },

      getSelect: (scenario: Locator, fieldId: string) => {
        return scenario.locator(`#${fieldId} select`);
      },

      selectOption: async (select: Locator, optionText: string) => {
        await select.selectOption({ label: optionText });
        await select.blur();
      },
    };

    await use(helpers);
  },
});

// Re-export expect for convenience
export { expect };

// Re-export types for convenience
export type { ConsoleTracker, MockApiHelpers } from '@ng-forge/examples-shared-testing';

/**
 * Creates afterEach hook for logging test results
 */
export function setupTestLogging() {
  // eslint-disable-next-line no-empty-pattern
  test.afterEach(async ({}, testInfo) => {
    logTestResult(testInfo);
  });
}

/**
 * Creates beforeEach and afterEach hooks for checking console errors, page errors, and warnings.
 */
export function setupConsoleCheck(options?: ConsoleCheckOptions) {
  const ignorePatterns = options?.ignorePatterns ?? [];

  test.beforeEach(async ({ consoleTracker }) => {
    consoleTracker.clear();
  });

  test.afterEach(async ({ consoleTracker }, testInfo) => {
    const relevantErrors = consoleTracker.errors.filter((error) => !ignorePatterns.some((pattern) => pattern.test(error)));
    const relevantPageErrors = consoleTracker.pageErrors.filter((error) => !ignorePatterns.some((pattern) => pattern.test(error)));
    const relevantWarnings = consoleTracker.warnings.filter((warning) => !ignorePatterns.some((pattern) => pattern.test(warning)));

    if (relevantWarnings.length > 0) {
      console.warn(`\u26A0\uFE0F ${relevantWarnings.length} console warning(s) in "${testInfo.title}":`);
      relevantWarnings.forEach((warning, i) => {
        console.warn(`  ${i + 1}. ${warning}`);
      });
    }

    const allErrors = [...relevantErrors.map((e) => `[Console] ${e}`), ...relevantPageErrors.map((e) => `[Page Error] ${e}`)];

    if (allErrors.length > 0) {
      const errorMessage = allErrors.map((e, i) => `  ${i + 1}. ${e}`).join('\n');
      throw new Error(`\u274C Test "${testInfo.title}" failed due to ${allErrors.length} error(s):\n${errorMessage}`);
    }
  });
}
