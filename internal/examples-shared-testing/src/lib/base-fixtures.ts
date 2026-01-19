import { expect, Locator, Page, test as base, TestInfo } from '@playwright/test';
import { ConsoleCheckOptions, MockResponse } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────────────────────────────

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
 * Base test helpers interface with common methods shared across all UI libraries.
 * UI-specific fixtures extend this interface with additional selectors/methods.
 */
export interface BaseTestHelpers {
  /** Navigate to a test scenario */
  navigateToScenario: (path: string) => Promise<void>;
  /** Get a scenario container by testId */
  getScenario: (testId: string) => Locator;
  /** Get an input field within a scenario */
  getInput: (scenario: Locator, fieldId: string) => Locator;
  /** Get the submit button within a scenario */
  getSubmitButton: (scenario: Locator) => Locator;
  /** Fill an input and wait for debounce */
  fillInput: (input: Locator, value: string) => Promise<void>;
  /** Clear and fill an input */
  clearAndFill: (input: Locator, value: string) => Promise<void>;
  /** Submit form and capture submitted data */
  submitFormAndCapture: (scenario: Locator) => Promise<Record<string, unknown>>;
  /** Wait for field to become visible */
  waitForFieldVisible: (field: Locator, timeout?: number) => Promise<void>;
  /** Wait for field to become hidden */
  waitForFieldHidden: (field: Locator, timeout?: number) => Promise<void>;
  /** Blur (unfocus) an input to trigger error display */
  blurInput: (input: Locator) => Promise<void>;
  /**
   * Take a screenshot of a scenario for visual verification.
   * Screenshots are saved to test-results directory with descriptive names.
   */
  takeScreenshot: (scenario: Locator, name: string) => Promise<void>;
  /**
   * Compare a screenshot against a baseline for visual regression testing.
   * On first run, creates the baseline. On subsequent runs, compares and fails if different.
   * Baselines are stored in __snapshots__ directory and should be committed to git.
   *
   * Default thresholds:
   * - maxDiffPixelRatio: 0.01 (1% of pixels can differ - catches real changes while allowing anti-aliasing differences)
   * - threshold: 0.2 (20% color difference tolerance per pixel)
   *
   * Override these for specific tests that need more/less tolerance.
   */
  expectScreenshotMatch: (scenario: Locator, name: string, options?: { maxDiffPixelRatio?: number; threshold?: number }) => Promise<void>;
}

/**
 * UI-specific selectors configuration for creating helpers
 */
export interface UISelectors {
  /** Error element selector (e.g., 'mat-error', '.invalid-feedback', 'ion-note[color="danger"]', '.p-error') */
  errorSelector: string;
  /** Submit button selector (e.g., '#submit button', '#submit ion-button') */
  submitButtonSelector: string;
  /** Whether to use .last() for getScenario (needed for Ionic router outlet animations) */
  useLastForScenario?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalizes a URL pattern for Playwright's page.route().
 * String patterns starting with '/' are converted to glob patterns with '**' prefix
 * to match against the full URL (e.g., '/api/test' becomes '** /api/test').
 */
export function normalizeRoutePattern(pattern: string | RegExp): string | RegExp {
  if (typeof pattern === 'string' && pattern.startsWith('/')) {
    return `**${pattern}`;
  }
  return pattern;
}

/**
 * Creates a testUrl function for a specific base URL
 */
export function createTestUrl(baseUrl: string): (path: string) => string {
  return (path: string) => `${baseUrl}/#${path}`;
}

/**
 * Logs test result on pass (for use in afterEach)
 */
export function logTestResult(testInfo: { status?: string; title: string }): void {
  if (testInfo.status === 'passed') {
    console.info(`\u2705 TEST PASSED: ${testInfo.title}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock API Fixture Factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates the mockApi fixture implementation
 */
export function createMockApiFixture(page: Page): MockApiHelpers {
  const interceptedRequests: InterceptedRequest[] = [];

  return {
    mockSuccess: async (urlPattern, response = {}) => {
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
}

// ─────────────────────────────────────────────────────────────────────────────
// Console Tracker Fixture Factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates the consoleTracker fixture implementation
 */
export function createConsoleTrackerFixture(page: Page): ConsoleTracker {
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

  return {
    errors,
    warnings,
    pageErrors,
    clear: () => {
      errors.length = 0;
      warnings.length = 0;
      pageErrors.length = 0;
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Base Helpers Factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates base helper methods that are shared across all UI libraries.
 * UI-specific fixtures should extend this with additional methods.
 */
export function createBaseHelpers(page: Page, testUrl: (path: string) => string, selectors: UISelectors): BaseTestHelpers {
  return {
    navigateToScenario: async (path: string) => {
      await page.goto(testUrl(path));
      await page.waitForLoadState('networkidle');
    },

    getScenario: (testId: string) => {
      const locator = page.locator(`[data-testid="${testId}"]`);
      return selectors.useLastForScenario ? locator.last() : locator;
    },

    getInput: (scenario: Locator, fieldId: string) => {
      return scenario.locator(`#${fieldId} input`);
    },

    getSubmitButton: (scenario: Locator) => {
      return scenario.locator(selectors.submitButtonSelector);
    },

    fillInput: async (input: Locator, value: string) => {
      await input.fill(value);
      await page.waitForTimeout(200);
    },

    clearAndFill: async (input: Locator, value: string) => {
      await input.clear();
      await input.fill(value);
      await page.waitForTimeout(200);
    },

    submitFormAndCapture: async (scenario: Locator) => {
      const submitButton = scenario.locator(selectors.submitButtonSelector);

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
      await input.blur();
      await page.waitForTimeout(200);
    },

    takeScreenshot: async (scenario: Locator, name: string) => {
      await scenario.screenshot({
        path: `test-results/screenshots/${name}.png`,
        animations: 'disabled',
      });
    },

    expectScreenshotMatch: async (scenario: Locator, name: string, options?: { maxDiffPixelRatio?: number; threshold?: number }) => {
      await expect(scenario).toHaveScreenshot(`${name}.png`, {
        animations: 'disabled',
        maxDiffPixelRatio: options?.maxDiffPixelRatio ?? 0.01,
        threshold: options?.threshold ?? 0.2,
      });
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Visibility Helpers Factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates error visibility helper methods for a specific error selector
 */
export function createErrorHelpers(errorSelector: string) {
  return {
    expectErrorVisible: async (scenario: Locator, fieldId: string, options?: { timeout?: number }) => {
      const timeout = options?.timeout ?? 5000;
      const errorLocator = scenario.locator(`#${fieldId} ${errorSelector}`).first();

      await expect(errorLocator).toBeAttached({ timeout });
      await expect(errorLocator).toBeVisible({ timeout });

      const textContent = await errorLocator.textContent();
      expect(textContent?.trim().length).toBeGreaterThan(0);
    },

    expectNoErrorVisible: async (scenario: Locator, fieldId: string, options?: { timeout?: number }) => {
      const timeout = options?.timeout ?? 5000;
      const errorLocator = scenario.locator(`#${fieldId} ${errorSelector}`);

      const count = await errorLocator.count();
      if (count > 0) {
        await expect(errorLocator.first()).not.toBeVisible({ timeout });
      }
    },

    getFieldError: (scenario: Locator, fieldId: string) => {
      return scenario.locator(`#${fieldId} ${errorSelector}`).first();
    },

    getFieldErrors: (scenario: Locator, fieldId: string) => {
      return scenario.locator(`#${fieldId} ${errorSelector}`);
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Setup Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a setupTestLogging function for a specific test instance.
 * Call this in your test file to enable logging.
 */
export function createSetupTestLogging(testInstance: typeof base) {
  return function setupTestLogging() {
    // eslint-disable-next-line no-empty-pattern
    testInstance.afterEach(async ({}, testInfo: TestInfo) => {
      logTestResult(testInfo);
    });
  };
}

/**
 * Creates a setupConsoleCheck function for a specific test instance.
 * Call this in your test file to enable console error checking.
 */
export function createSetupConsoleCheck(testInstance: ReturnType<typeof base.extend<{ consoleTracker: ConsoleTracker }>>) {
  return function setupConsoleCheck(options?: ConsoleCheckOptions) {
    const ignorePatterns = options?.ignorePatterns ?? [];

    testInstance.beforeEach(async ({ consoleTracker }) => {
      consoleTracker.clear();
    });

    testInstance.afterEach(async ({ consoleTracker }, testInfo: TestInfo) => {
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
  };
}

// Re-export for convenience
export { expect, base };
