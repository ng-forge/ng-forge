import { expect, Locator, test as base } from '@playwright/test';
import { logTestResult, testUrl } from './test-utils';
import { ConsoleCheckOptions, MockResponse } from './types';

/**
 * Console message tracking for E2E tests
 */
export interface ConsoleTracker {
  /** Array of console errors captured during the test (will fail tests) */
  errors: string[];
  /** Array of console warnings captured during the test (will be logged) */
  warnings: string[];
  /** Array of uncaught page errors (Angular RuntimeErrors, etc.) */
  pageErrors: string[];
  /** Clear all captured messages */
  clear: () => void;
}

/**
 * Mock API helpers for intercepting HTTP requests
 */
export interface MockApiHelpers {
  /**
   * Set up a mock endpoint that returns a success response
   * @param urlPattern - URL pattern to match (string or regex)
   * @param response - Optional response configuration
   */
  mockSuccess: (urlPattern: string | RegExp, response?: MockResponse) => Promise<void>;

  /**
   * Set up a mock endpoint that returns an error response
   * @param urlPattern - URL pattern to match (string or regex)
   * @param response - Optional response configuration (status defaults to 500)
   */
  mockError: (urlPattern: string | RegExp, response?: MockResponse) => Promise<void>;

  /**
   * Set up a mock endpoint that returns validation errors
   * @param urlPattern - URL pattern to match (string or regex)
   * @param errors - Validation errors to return
   * @param response - Optional additional response configuration
   */
  mockValidationError: (urlPattern: string | RegExp, errors: Record<string, string>, response?: MockResponse) => Promise<void>;

  /**
   * Get all intercepted requests for a URL pattern
   */
  getInterceptedRequests: (urlPattern: string | RegExp) => InterceptedRequest[];

  /**
   * Clear all intercepted requests
   */
  clearInterceptedRequests: () => void;
}

/**
 * Intercepted request data
 */
export interface InterceptedRequest {
  url: string;
  method: string;
  body: Record<string, unknown> | null;
  timestamp: number;
}

/**
 * Extended test context with common page helpers for Ionic
 */
export interface TestHelpers {
  /** Navigate to a test scenario */
  navigateToScenario: (path: string) => Promise<void>;
  /** Get a scenario container by testId */
  getScenario: (testId: string) => Locator;
  /** Get an input field within a scenario */
  getInput: (scenario: Locator, fieldId: string) => Locator;
  /** Get an Ionic checkbox within a scenario */
  getCheckbox: (scenario: Locator, fieldId: string) => Locator;
  /** Get an Ionic select within a scenario */
  getSelect: (scenario: Locator, fieldId: string) => Locator;
  /** Get the submit button within a scenario */
  getSubmitButton: (scenario: Locator) => Locator;
  /** Get the error message for a field (Ionic ion-note with danger color) */
  getFieldError: (scenario: Locator, fieldId: string) => Locator;
  /** Get all error messages for a field */
  getFieldErrors: (scenario: Locator, fieldId: string) => Locator;
  /** Fill an input and wait for debounce */
  fillInput: (input: Locator, value: string) => Promise<void>;
  /** Clear and fill an input */
  clearAndFill: (input: Locator, value: string) => Promise<void>;
  /** Select an option from an Ionic select */
  selectOption: (select: Locator, optionText: string) => Promise<void>;
  /** Submit form and capture submitted data */
  submitFormAndCapture: (scenario: Locator) => Promise<Record<string, unknown>>;
  /** Wait for field to become visible */
  waitForFieldVisible: (field: Locator, timeout?: number) => Promise<void>;
  /** Wait for field to become hidden */
  waitForFieldHidden: (field: Locator, timeout?: number) => Promise<void>;
  /** Blur (unfocus) an input to trigger error display */
  blurInput: (input: Locator) => Promise<void>;
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

/**
 * Normalizes a URL pattern for Playwright's page.route().
 * String patterns starting with '/' are converted to glob patterns with '**' prefix
 * to match against the full URL (e.g., '/api/test' becomes '** /api/test').
 */
function normalizeRoutePattern(pattern: string | RegExp): string | RegExp {
  if (typeof pattern === 'string' && pattern.startsWith('/')) {
    return `**${pattern}`;
  }
  return pattern;
}

export const test = base.extend<{ helpers: TestHelpers; consoleTracker: ConsoleTracker; mockApi: MockApiHelpers }>({
  mockApi: async ({ page }, use) => {
    const interceptedRequests: InterceptedRequest[] = [];

    const helpers: MockApiHelpers = {
      mockSuccess: async (urlPattern, response = {}) => {
        await page.route(normalizeRoutePattern(urlPattern), async (route) => {
          // Capture the request
          const request = route.request();
          let body: Record<string, unknown> | null = null;
          try {
            const postData = request.postData();
            if (postData) {
              body = JSON.parse(postData);
            }
          } catch {
            // Not JSON body
          }
          interceptedRequests.push({
            url: request.url(),
            method: request.method(),
            body,
            timestamp: Date.now(),
          });

          // Apply delay if specified
          if (response.delay) {
            await new Promise((resolve) => setTimeout(resolve, response.delay));
          }

          await route.fulfill({
            status: response.status ?? 200,
            contentType: 'application/json',
            headers: response.headers,
            body: JSON.stringify(response.body ?? { success: true }),
          });
        });
      },

      mockError: async (urlPattern, response = {}) => {
        await page.route(normalizeRoutePattern(urlPattern), async (route) => {
          const request = route.request();
          let body: Record<string, unknown> | null = null;
          try {
            const postData = request.postData();
            if (postData) {
              body = JSON.parse(postData);
            }
          } catch {
            // Not JSON body
          }
          interceptedRequests.push({
            url: request.url(),
            method: request.method(),
            body,
            timestamp: Date.now(),
          });

          if (response.delay) {
            await new Promise((resolve) => setTimeout(resolve, response.delay));
          }

          await route.fulfill({
            status: response.status ?? 500,
            contentType: 'application/json',
            headers: response.headers,
            body: JSON.stringify(response.body ?? { error: 'Internal server error' }),
          });
        });
      },

      mockValidationError: async (urlPattern, errors, response = {}) => {
        await page.route(normalizeRoutePattern(urlPattern), async (route) => {
          const request = route.request();
          let body: Record<string, unknown> | null = null;
          try {
            const postData = request.postData();
            if (postData) {
              body = JSON.parse(postData);
            }
          } catch {
            // Not JSON body
          }
          interceptedRequests.push({
            url: request.url(),
            method: request.method(),
            body,
            timestamp: Date.now(),
          });

          if (response.delay) {
            await new Promise((resolve) => setTimeout(resolve, response.delay));
          }

          await route.fulfill({
            status: response.status ?? 422,
            contentType: 'application/json',
            headers: response.headers,
            body: JSON.stringify({ errors, ...response.body }),
          });
        });
      },

      getInterceptedRequests: (urlPattern) => {
        if (typeof urlPattern === 'string') {
          return interceptedRequests.filter((r) => r.url.includes(urlPattern));
        }
        return interceptedRequests.filter((r) => urlPattern.test(r.url));
      },

      clearInterceptedRequests: () => {
        interceptedRequests.length = 0;
      },
    };

    await use(helpers);
  },

  consoleTracker: async ({ page }, use) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const pageErrors: string[] = [];

    // Listen for console messages
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    // Listen for uncaught page errors (Angular RuntimeErrors, etc.)
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    const tracker: ConsoleTracker = {
      errors,
      warnings,
      pageErrors,
      clear: () => {
        errors.length = 0;
        warnings.length = 0;
        pageErrors.length = 0;
      },
    };

    await use(tracker);
  },

  helpers: async ({ page }, use) => {
    const helpers: TestHelpers = {
      navigateToScenario: async (path: string) => {
        await page.goto(testUrl(path));
        await page.waitForLoadState('networkidle');
      },

      getScenario: (testId: string) => {
        // Use .last() because Ionic router outlet may keep old views during animations
        // The actively rendered component should be the last one in the DOM
        return page.locator(`[data-testid="${testId}"]`).last();
      },

      getInput: (scenario: Locator, fieldId: string) => {
        return scenario.locator(`#${fieldId} input`);
      },

      getCheckbox: (scenario: Locator, fieldId: string) => {
        return scenario.locator(`#${fieldId} ion-checkbox`);
      },

      getSelect: (scenario: Locator, fieldId: string) => {
        return scenario.locator(`#${fieldId} ion-select`);
      },

      getSubmitButton: (scenario: Locator) => {
        return scenario.locator('#submit ion-button');
      },

      getFieldError: (scenario: Locator, fieldId: string) => {
        return scenario.locator(`#${fieldId} ion-note[color="danger"]`).first();
      },

      getFieldErrors: (scenario: Locator, fieldId: string) => {
        return scenario.locator(`#${fieldId} ion-note[color="danger"]`);
      },

      fillInput: async (input: Locator, value: string) => {
        await input.fill(value);
        // Dispatch ionBlur to trigger touched state and validation in Ionic components
        await input.evaluate((el) => {
          el.blur();
          const ionicParent = el.closest('ion-input, ion-textarea, ion-select, ion-checkbox, ion-radio, ion-toggle, ion-datetime');
          if (ionicParent) {
            ionicParent.dispatchEvent(new CustomEvent('ionBlur', { bubbles: true, composed: true }));
          }
        });
        await page.waitForTimeout(200); // Wait for debounce
      },

      clearAndFill: async (input: Locator, value: string) => {
        await input.clear();
        await input.fill(value);
        // Dispatch ionBlur to trigger touched state and validation in Ionic components
        await input.evaluate((el) => {
          el.blur();
          const ionicParent = el.closest('ion-input, ion-textarea, ion-select, ion-checkbox, ion-radio, ion-toggle, ion-datetime');
          if (ionicParent) {
            ionicParent.dispatchEvent(new CustomEvent('ionBlur', { bubbles: true, composed: true }));
          }
        });
        await page.waitForTimeout(200);
      },

      selectOption: async (select: Locator, optionText: string) => {
        // Ionic ion-select opens an alert/popover when clicked
        await select.click();
        // Wait for alert overlay to appear
        const alertOverlay = page.locator('ion-alert');
        await expect(alertOverlay).toBeVisible({ timeout: 5000 });
        // Click the option with exact text match - use getByRole for exact matching
        const option = alertOverlay.getByRole('radio', { name: optionText, exact: true });
        await option.click();
        // Click OK button to confirm selection
        const okButton = alertOverlay.locator('button.alert-button', { hasText: 'OK' });
        await okButton.click();
        // Wait for alert to close
        await expect(alertOverlay).not.toBeVisible({ timeout: 5000 });
      },

      submitFormAndCapture: async (scenario: Locator) => {
        const submitButton = scenario.locator('#submit ion-button');

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

      blurInput: async (input: Locator) => {
        // Ionic components use ionBlur event for marking fields as touched
        // We need to dispatch ionBlur on the parent ion-input/ion-textarea element
        // since ValueAccessor listens for ionBlur on the host element
        await input.evaluate((el) => {
          // First blur the native element
          el.blur();
          // Then find the parent Ionic component and dispatch ionBlur
          const ionicParent = el.closest('ion-input, ion-textarea, ion-select, ion-checkbox, ion-radio, ion-toggle, ion-datetime');
          if (ionicParent) {
            ionicParent.dispatchEvent(new CustomEvent('ionBlur', { bubbles: true, composed: true }));
          }
        });
        await page.waitForTimeout(200); // Wait for validation to trigger
      },

      selectRadio: async (scenario: Locator, fieldId: string, labelText: string) => {
        // Ionic radio buttons: each option is an ion-item with ion-radio inside
        // We find the field container, then click the ion-radio with the matching label
        const radioGroup = scenario.locator(`#${fieldId}`);
        const radioOption = radioGroup.locator('ion-item', { hasText: labelText }).locator('ion-radio');
        await radioOption.click();
      },

      fillDatepicker: async (scenario: Locator, fieldId: string, value: string) => {
        // Ionic datepicker opens a modal with ion-datetime
        // First click to open the modal
        const datepickerInput = scenario.locator(`#${fieldId} ion-input`);
        await datepickerInput.click();

        // Wait for modal to open
        const modal = page.locator('ion-modal');
        await expect(modal).toBeVisible({ timeout: 5000 });

        // Parse the value (expected format: MM/DD/YYYY)
        const [month, day, year] = value.split('/');
        const dateValue = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const isoString = dateValue.toISOString();

        // Use ion-datetime to set the value and dispatch ionChange event
        // Note: The component's onDateChange() automatically closes the modal
        const datetime = modal.locator('ion-datetime');
        await datetime.evaluate((el: HTMLIonDatetimeElement, date: string) => {
          el.value = date;
          // Dispatch ionChange event which Angular listens to
          el.dispatchEvent(
            new CustomEvent('ionChange', {
              bubbles: true,
              composed: true,
              detail: { value: date },
            }),
          );
        }, isoString);

        // Wait for modal to close automatically (component closes on date change)
        await expect(modal).not.toBeVisible({ timeout: 5000 });

        // Wait for form to update after modal animation
        await page.waitForTimeout(200);
      },

      checkIonCheckbox: async (checkbox: Locator) => {
        // Ionic checkbox uses aria-checked attribute
        const isChecked = await checkbox.getAttribute('aria-checked');
        if (isChecked !== 'true') {
          await checkbox.click();
          // Wait for state change
          await page.waitForTimeout(100);
        }
      },

      uncheckIonCheckbox: async (checkbox: Locator) => {
        // Ionic checkbox uses aria-checked attribute
        const isChecked = await checkbox.getAttribute('aria-checked');
        if (isChecked === 'true') {
          await checkbox.click();
          // Wait for state change
          await page.waitForTimeout(100);
        }
      },

      toggleIonToggle: async (toggle: Locator, checked: boolean) => {
        // Ionic toggle uses aria-checked attribute
        const currentState = await toggle.getAttribute('aria-checked');
        const isCurrentlyChecked = currentState === 'true';

        if (isCurrentlyChecked !== checked) {
          // Need to toggle the state
          await toggle.click();
          // Wait for state change
          await page.waitForTimeout(200);
        }
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

/**
 * Creates beforeEach and afterEach hooks for checking console errors, page errors, and warnings.
 * - Console errors and uncaught page errors (Angular RuntimeErrors, etc.) will fail the test
 * - Console warnings will be logged but won't fail the test
 *
 * @param options - Configuration options
 * @param options.ignorePatterns - Array of regex patterns to ignore certain errors/warnings
 */
export function setupConsoleCheck(options?: ConsoleCheckOptions) {
  const ignorePatterns = options?.ignorePatterns ?? [];

  // IMPORTANT: This beforeEach hook ensures consoleTracker is instantiated BEFORE the test runs.
  // Without this, consoleTracker would only be set up when afterEach runs (after the test),
  // which means the page.on('console') listeners would be attached too late to capture errors.
  test.beforeEach(async ({ consoleTracker }) => {
    // Clear any errors from previous tests (ensures clean slate)
    consoleTracker.clear();
  });

  test.afterEach(async ({ consoleTracker }, testInfo) => {
    // Filter out ignored errors
    const relevantErrors = consoleTracker.errors.filter((error) => !ignorePatterns.some((pattern) => pattern.test(error)));

    // Filter out ignored page errors (Angular RuntimeErrors, etc.)
    const relevantPageErrors = consoleTracker.pageErrors.filter((error) => !ignorePatterns.some((pattern) => pattern.test(error)));

    // Filter out ignored warnings
    const relevantWarnings = consoleTracker.warnings.filter((warning) => !ignorePatterns.some((pattern) => pattern.test(warning)));

    // Log warnings (don't fail)
    if (relevantWarnings.length > 0) {
      console.warn(`\u26A0\uFE0F ${relevantWarnings.length} console warning(s) in "${testInfo.title}":`);
      relevantWarnings.forEach((warning, i) => {
        console.warn(`  ${i + 1}. ${warning}`);
      });
    }

    // Combine all errors for reporting
    const allErrors = [...relevantErrors.map((e) => `[Console] ${e}`), ...relevantPageErrors.map((e) => `[Page Error] ${e}`)];

    // Fail test on errors
    if (allErrors.length > 0) {
      const errorMessage = allErrors.map((e, i) => `  ${i + 1}. ${e}`).join('\n');
      throw new Error(`\u274C Test "${testInfo.title}" failed due to ${allErrors.length} error(s):\n${errorMessage}`);
    }
  });
}
