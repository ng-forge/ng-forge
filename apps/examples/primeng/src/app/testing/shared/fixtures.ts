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
// PrimeNG-specific Configuration
// ─────────────────────────────────────────────────────────────────────────────

export const testUrl = createTestUrl(`http://localhost:${APP_PORTS['primeng-examples']}`);

const PRIMENG_SELECTORS = {
  errorSelector: '.p-error',
  submitButtonSelector: '#submit button',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// PrimeNG TestHelpers Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface TestHelpers extends BaseTestHelpers {
  /** Get a PrimeNG checkbox within a scenario */
  getCheckbox: (scenario: Locator, fieldId: string) => Locator;
  /** Get a PrimeNG select within a scenario */
  getSelect: (scenario: Locator, fieldId: string) => Locator;
  /** Get the error message for a field (PrimeNG p-error element) */
  getFieldError: (scenario: Locator, fieldId: string) => Locator;
  /** Get all error messages for a field */
  getFieldErrors: (scenario: Locator, fieldId: string) => Locator;
  /** Select an option from a PrimeNG select */
  selectOption: (select: Locator, optionText: string) => Promise<void>;
  /** Assert that an error message is visible for a field */
  expectErrorVisible: (scenario: Locator, fieldId: string, options?: { timeout?: number }) => Promise<void>;
  /** Assert that no error message is visible for a field */
  expectNoErrorVisible: (scenario: Locator, fieldId: string, options?: { timeout?: number }) => Promise<void>;
  /** Select a radio option by clicking on the label text within a radio group */
  selectRadio: (scenario: Locator, fieldId: string, labelText: string) => Promise<void>;
  /** Fill a PrimeNG datepicker and close the popup */
  fillDatepicker: (scenario: Locator, fieldId: string, value: string) => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// PrimeNG Test Fixture
// ─────────────────────────────────────────────────────────────────────────────

export const test = base.extend<{ helpers: TestHelpers; consoleTracker: ConsoleTracker; mockApi: MockApiHelpers }>({
  mockApi: async ({ page }, use) => {
    await use(createMockApiFixture(page));
  },

  consoleTracker: async ({ page }, use) => {
    await use(createConsoleTrackerFixture(page));
  },

  helpers: async ({ page }, use) => {
    const baseHelpers = createBaseHelpers(page, testUrl, PRIMENG_SELECTORS);
    const errorHelpers = createErrorHelpers(PRIMENG_SELECTORS.errorSelector);

    const helpers: TestHelpers = {
      ...baseHelpers,
      ...errorHelpers,

      // Override fillInput to include blur for PrimeNG validation
      fillInput: async (input: Locator, value: string) => {
        await input.fill(value);
        await input.blur();
        await page.waitForTimeout(200);
      },

      // Override clearAndFill to include blur for PrimeNG validation
      clearAndFill: async (input: Locator, value: string) => {
        await input.clear();
        await input.fill(value);
        await input.blur();
        await page.waitForTimeout(200);
      },

      getCheckbox: (scenario: Locator, fieldId: string) => {
        return scenario.locator(`#${fieldId} p-checkbox`);
      },

      getSelect: (scenario: Locator, fieldId: string) => {
        return scenario.locator(`#${fieldId} p-select`);
      },

      selectOption: async (select: Locator, optionText: string) => {
        await select.click();
        const overlay = page.locator('.p-select-overlay');
        await expect(overlay).toBeVisible({ timeout: 5000 });
        const option = overlay.getByText(optionText, { exact: true });
        await option.click();
        await expect(overlay).not.toBeVisible({ timeout: 2000 });
      },

      selectRadio: async (scenario: Locator, fieldId: string, labelText: string) => {
        const radioGroup = scenario.locator(`#${fieldId}`);
        const label = radioGroup.locator('.radio-option-label', { hasText: labelText });
        await label.click();
      },

      fillDatepicker: async (scenario: Locator, fieldId: string, value: string) => {
        const input = scenario.locator(`#${fieldId} input`);
        await input.clear();
        await input.pressSequentially(value, { delay: 20 });
        await input.press('Tab');
        await page.waitForTimeout(200);
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
