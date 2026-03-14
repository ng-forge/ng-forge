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
// Ionic-specific Configuration
// ─────────────────────────────────────────────────────────────────────────────

export const testUrl = createTestUrl(`http://localhost:${APP_PORTS['ionic-examples']}`);

const IONIC_SELECTORS = {
  errorSelector: 'ion-note[color="danger"]',
  submitButtonSelector: '#submit ion-button',
  useLastForScenario: true, // Ionic router outlet may keep old views during animations
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Ionic TestHelpers Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface TestHelpers extends BaseTestHelpers {
  /** Get an Ionic checkbox within a scenario */
  getCheckbox: (scenario: Locator, fieldId: string) => Locator;
  /** Get an Ionic select within a scenario */
  getSelect: (scenario: Locator, fieldId: string) => Locator;
  /** Get the error message for a field (Ionic ion-note with danger color) */
  getFieldError: (scenario: Locator, fieldId: string) => Locator;
  /** Get all error messages for a field */
  getFieldErrors: (scenario: Locator, fieldId: string) => Locator;
  /** Select an option from an Ionic select */
  selectOption: (select: Locator, optionText: string) => Promise<void>;
  /** Assert that an error message is visible for a field */
  expectErrorVisible: (scenario: Locator, fieldId: string, options?: { timeout?: number }) => Promise<void>;
  /** Assert that no error message is visible for a field */
  expectNoErrorVisible: (scenario: Locator, fieldId: string, options?: { timeout?: number }) => Promise<void>;
  /** Select a radio option by clicking on the label text within a radio group */
  selectRadio: (scenario: Locator, fieldId: string, labelText: string) => Promise<void>;
  /** Fill an Ionic datepicker via modal */
  fillDatepicker: (scenario: Locator, fieldId: string, value: string) => Promise<void>;
  /** Check an Ionic checkbox (click if not already checked) */
  checkIonCheckbox: (checkbox: Locator) => Promise<void>;
  /** Uncheck an Ionic checkbox (click if currently checked) */
  uncheckIonCheckbox: (checkbox: Locator) => Promise<void>;
  /** Set an Ionic toggle to a specific state (checked or unchecked) */
  toggleIonToggle: (toggle: Locator, checked: boolean) => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ionic Test Fixture
// ─────────────────────────────────────────────────────────────────────────────

export const test = base.extend<{ helpers: TestHelpers; consoleTracker: ConsoleTracker; mockApi: MockApiHelpers }>({
  mockApi: async ({ page }, use) => {
    await use(createMockApiFixture(page));
  },

  consoleTracker: async ({ page }, use) => {
    await use(createConsoleTrackerFixture(page));
  },

  helpers: async ({ page }, use) => {
    const baseHelpers = createBaseHelpers(page, testUrl, IONIC_SELECTORS);
    const errorHelpers = createErrorHelpers(IONIC_SELECTORS.errorSelector);

    /**
     * Helper to dispatch ionBlur on Ionic parent component
     */
    const dispatchIonBlur = async (input: Locator) => {
      await input.evaluate((el) => {
        el.blur();
        const ionicParent = el.closest('ion-input, ion-textarea, ion-select, ion-checkbox, ion-radio, ion-toggle, ion-datetime');
        if (ionicParent) {
          ionicParent.dispatchEvent(new CustomEvent('ionBlur', { bubbles: true, composed: true }));
        }
      });
    };

    const helpers: TestHelpers = {
      ...baseHelpers,
      ...errorHelpers,

      // Override fillInput to dispatch ionBlur for Ionic validation
      fillInput: async (input: Locator, value: string) => {
        await input.fill(value);
        await dispatchIonBlur(input);
        await page.waitForTimeout(200);
      },

      // Override clearAndFill to dispatch ionBlur for Ionic validation
      clearAndFill: async (input: Locator, value: string) => {
        await input.clear();
        await input.fill(value);
        await dispatchIonBlur(input);
        await page.waitForTimeout(200);
      },

      // Override blurInput to dispatch ionBlur for Ionic components
      blurInput: async (input: Locator) => {
        await dispatchIonBlur(input);
        await page.waitForTimeout(200);
      },

      getCheckbox: (scenario: Locator, fieldId: string) => {
        return scenario.locator(`#${fieldId} ion-checkbox`);
      },

      getSelect: (scenario: Locator, fieldId: string) => {
        return scenario.locator(`#${fieldId} ion-select`);
      },

      selectOption: async (select: Locator, optionText: string) => {
        await select.click();
        const alertOverlay = page.locator('ion-alert');
        await expect(alertOverlay).toBeVisible({ timeout: 5000 });
        const option = alertOverlay.getByRole('radio', { name: optionText, exact: true });
        await option.click();
        const okButton = alertOverlay.locator('button.alert-button', { hasText: 'OK' });
        await okButton.click();
        await expect(alertOverlay).not.toBeVisible({ timeout: 5000 });
      },

      selectRadio: async (scenario: Locator, fieldId: string, labelText: string) => {
        const radioGroup = scenario.locator(`#${fieldId}`);
        const radioOption = radioGroup.locator('ion-item', { hasText: labelText }).locator('ion-radio');
        await radioOption.click();
      },

      fillDatepicker: async (scenario: Locator, fieldId: string, value: string) => {
        const datepickerInput = scenario.locator(`#${fieldId} ion-input`);
        await datepickerInput.click();

        const modal = page.locator('ion-modal');
        await expect(modal).toBeVisible({ timeout: 5000 });

        const [month, day, year] = value.split('/');
        const dateValue = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const isoString = dateValue.toISOString();

        const datetime = modal.locator('ion-datetime');
        await datetime.evaluate((el: HTMLIonDatetimeElement, date: string) => {
          el.value = date;
          el.dispatchEvent(
            new CustomEvent('ionChange', {
              bubbles: true,
              composed: true,
              detail: { value: date },
            }),
          );
        }, isoString);

        await expect(modal).not.toBeVisible({ timeout: 5000 });
        await page.waitForTimeout(200);
      },

      checkIonCheckbox: async (checkbox: Locator) => {
        const isChecked = await checkbox.getAttribute('aria-checked');
        if (isChecked !== 'true') {
          await checkbox.click();
          await page.waitForTimeout(100);
        }
      },

      uncheckIonCheckbox: async (checkbox: Locator) => {
        const isChecked = await checkbox.getAttribute('aria-checked');
        if (isChecked === 'true') {
          await checkbox.click();
          await page.waitForTimeout(100);
        }
      },

      toggleIonToggle: async (toggle: Locator, checked: boolean) => {
        const currentState = await toggle.getAttribute('aria-checked');
        const isCurrentlyChecked = currentState === 'true';

        if (isCurrentlyChecked !== checked) {
          await toggle.click();
          await page.waitForTimeout(200);
        }
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
