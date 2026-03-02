import { expect, Locator, Page } from '@playwright/test';
import { logTestResult } from '@ng-forge/examples-shared-testing';

/**
 * Base URL for the test application
 */
// BASE_URL is now derived from APP_PORTS in fixtures.ts

/**
 * Base path for testing routes
 */
export const TESTING_BASE_PATH = '/testing';

/**
 * Creates a URL for a specific test route
 * @param path - Path relative to the testing base (e.g., '/accessibility/aria-attributes')
 */
export function testUrl(path: string): string {
  // If path already starts with /testing, use as-is; otherwise prepend TESTING_BASE_PATH
  const fullPath = path.startsWith(TESTING_BASE_PATH) ? path : `${TESTING_BASE_PATH}${path}`;
  return `/#${fullPath}`;
}

/**
 * Navigates to a test scenario and waits for it to load
 */
export async function navigateToScenario(page: Page, path: string): Promise<void> {
  await page.goto(testUrl(path));
  await page.waitForLoadState('networkidle');
}

/**
 * Gets a test scenario section by its data-testid
 */
export function getScenario(page: Page, testId: string): Locator {
  return page.locator(`[data-testid="${testId}"]`);
}

/**
 * Gets an input field within a scenario
 * Ionic uses ion-input which renders a native input inside
 */
export function getInput(scenario: Locator, fieldId: string): Locator {
  return scenario.locator(`#${fieldId} input`);
}

/**
 * Gets an Ionic checkbox within a scenario
 */
export function getCheckbox(scenario: Locator, fieldId: string): Locator {
  return scenario.locator(`#${fieldId} ion-checkbox`);
}

/**
 * Gets an Ionic select within a scenario
 */
export function getSelect(scenario: Locator, fieldId: string): Locator {
  return scenario.locator(`#${fieldId} ion-select`);
}

/**
 * Gets the submit button within a scenario
 */
export function getSubmitButton(scenario: Locator): Locator {
  return scenario.locator('#submit ion-button');
}

/**
 * Fills an input field and waits for debounce
 */
export async function fillInput(input: Locator, value: string): Promise<void> {
  await input.fill(value);
  await input.page().waitForTimeout(200); // Wait for debounce
}

/**
 * Clears and fills an input field
 */
export async function clearAndFill(input: Locator, value: string): Promise<void> {
  await input.clear();
  await fillInput(input, value);
}

/**
 * Selects an option from an Ionic select by clicking to open alert/popover and selecting option
 */
export async function selectOption(page: Page, select: Locator, optionText: string): Promise<void> {
  // Ionic ion-select opens an alert/popover when clicked
  await select.click();
  // Wait for alert overlay to appear
  const alertOverlay = page.locator('ion-alert');
  await expect(alertOverlay).toBeVisible({ timeout: 5000 });
  // Click the option with exact text match
  const option = alertOverlay.locator('button.alert-radio-button', { hasText: optionText });
  await option.click();
  // Click OK button to confirm selection
  const okButton = alertOverlay.locator('button.alert-button', { hasText: 'OK' });
  await okButton.click();
  // Wait for alert to close
  await expect(alertOverlay).not.toBeVisible({ timeout: 2000 });
}

/**
 * Waits for and captures a form submission event
 */
export async function captureFormSubmission(page: Page, submitAction: () => Promise<void>): Promise<Record<string, unknown>> {
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

  await submitAction();

  return submittedDataPromise as Promise<Record<string, unknown>>;
}

/**
 * Submits a form and captures the submitted data
 */
export async function submitFormAndCapture(page: Page, scenario: Locator): Promise<Record<string, unknown>> {
  const submitButton = getSubmitButton(scenario);
  return captureFormSubmission(page, () => submitButton.click());
}

/**
 * Waits for a field to become visible
 */
export async function waitForFieldVisible(field: Locator, timeout = 5000): Promise<void> {
  await expect(field).toBeVisible({ timeout });
}

/**
 * Waits for a field to become hidden
 */
export async function waitForFieldHidden(field: Locator, timeout = 5000): Promise<void> {
  await expect(field).not.toBeVisible({ timeout });
}

/**
 * Blurs an Ionic input element and dispatches the ionBlur event.
 * This is necessary because Ionic's ValueAccessor listens for ionBlur (not native blur)
 * to mark the form control as touched.
 *
 * @param input - The input/textarea locator (native element inside ion-input/ion-textarea)
 */
export async function ionBlur(input: Locator): Promise<void> {
  await input.evaluate((el) => {
    // First blur the native element
    el.blur();
    // Then find the parent Ionic component and dispatch ionBlur
    const ionicParent = el.closest('ion-input, ion-textarea, ion-select, ion-checkbox, ion-radio, ion-toggle, ion-datetime');
    if (ionicParent) {
      ionicParent.dispatchEvent(new CustomEvent('ionBlur', { bubbles: true, composed: true }));
    }
  });
  await input.page().waitForTimeout(200); // Wait for validation to trigger
}

// Re-export for convenience
export { logTestResult };
