import { expect, Locator, test as base } from '@playwright/test';
import { logTestResult, testUrl } from './test-utils';

/**
 * Extended test context with common page helpers
 */
export interface TestHelpers {
  /** Navigate to a test scenario */
  navigateToScenario: (path: string) => Promise<void>;
  /** Get a scenario container by testId */
  getScenario: (testId: string) => Locator;
  /** Get an input field within a scenario */
  getInput: (scenario: Locator, fieldId: string) => Locator;
  /** Get a Material checkbox within a scenario */
  getCheckbox: (scenario: Locator, fieldId: string) => Locator;
  /** Get a Material select within a scenario */
  getSelect: (scenario: Locator, fieldId: string) => Locator;
  /** Get the submit button within a scenario */
  getSubmitButton: (scenario: Locator) => Locator;
  /** Fill an input and wait for debounce */
  fillInput: (input: Locator, value: string) => Promise<void>;
  /** Clear and fill an input */
  clearAndFill: (input: Locator, value: string) => Promise<void>;
  /** Select an option from a Material select */
  selectOption: (select: Locator, optionText: string) => Promise<void>;
  /** Submit form and capture submitted data */
  submitFormAndCapture: (scenario: Locator) => Promise<Record<string, unknown>>;
  /** Wait for field to become visible */
  waitForFieldVisible: (field: Locator, timeout?: number) => Promise<void>;
  /** Wait for field to become hidden */
  waitForFieldHidden: (field: Locator, timeout?: number) => Promise<void>;
}

/**
 * Extended test fixture with helper methods
 */
export const test = base.extend<{ helpers: TestHelpers }>({
  helpers: async ({ page }, use) => {
    const helpers: TestHelpers = {
      navigateToScenario: async (path: string) => {
        await page.goto(testUrl(path));
        await page.waitForLoadState('networkidle');
      },

      getScenario: (testId: string) => {
        return page.locator(`[data-testid="${testId}"]`);
      },

      getInput: (scenario: Locator, fieldId: string) => {
        return scenario.locator(`#${fieldId} input`);
      },

      getCheckbox: (scenario: Locator, fieldId: string) => {
        return scenario.locator(`#${fieldId} mat-checkbox`);
      },

      getSelect: (scenario: Locator, fieldId: string) => {
        return scenario.locator(`#${fieldId} mat-select`);
      },

      getSubmitButton: (scenario: Locator) => {
        return scenario.locator('#submit button');
      },

      fillInput: async (input: Locator, value: string) => {
        await input.fill(value);
        await page.waitForTimeout(200); // Wait for debounce
      },

      clearAndFill: async (input: Locator, value: string) => {
        await input.clear();
        await input.fill(value);
        await page.waitForTimeout(200);
      },

      selectOption: async (select: Locator, optionText: string) => {
        await select.click();
        await page.locator(`mat-option:has-text("${optionText}")`).click();
      },

      submitFormAndCapture: async (scenario: Locator) => {
        const submitButton = scenario.locator('#submit button');

        const submittedDataPromise = page.evaluate(
          () =>
            new Promise((resolve) => {
              window.addEventListener(
                'formSubmitted',
                (event: Event) => {
                  resolve((event as CustomEvent).detail.data);
                },
                { once: true },
              );
            }),
        );

        await submitButton.click();

        return submittedDataPromise as Promise<Record<string, unknown>>;
      },

      waitForFieldVisible: async (field: Locator, timeout = 5000) => {
        await expect(field).toBeVisible({ timeout });
      },

      waitForFieldHidden: async (field: Locator, timeout = 5000) => {
        await expect(field).not.toBeVisible({ timeout });
      },
    };

    await use(helpers);
  },
});

// Re-export expect for convenience
export { expect };

/**
 * Creates afterEach hook for logging test results
 */
export function setupTestLogging() {
  // eslint-disable-next-line no-empty-pattern
  test.afterEach(async ({}, testInfo) => {
    logTestResult(testInfo);
  });
}
