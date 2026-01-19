import { expect, Locator, Page } from '@playwright/test';
import { logTestResult } from '@ng-forge/examples-shared-testing';

/**
 * Base URL for the test application
 */
// BASE_URL is now derived from APP_PORTS in fixtures.ts

/**
 * Creates a URL for a specific test route
 */
export function testUrl(path: string): string {
  return `/#${path}`;
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
 */
export function getInput(scenario: Locator, fieldId: string): Locator {
  return scenario.locator(`#${fieldId} input`);
}

/**
 * Gets a PrimeNG checkbox within a scenario
 */
export function getCheckbox(scenario: Locator, fieldId: string): Locator {
  return scenario.locator(`#${fieldId} p-checkbox`);
}

/**
 * Gets a PrimeNG select within a scenario
 */
export function getSelect(scenario: Locator, fieldId: string): Locator {
  return scenario.locator(`#${fieldId} p-select`);
}

/**
 * Gets the submit button within a scenario
 */
export function getSubmitButton(scenario: Locator): Locator {
  return scenario.locator('#submit button');
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
 * Selects an option from a PrimeNG select by clicking to open dropdown and selecting option
 */
export async function selectOption(page: Page, select: Locator, optionText: string): Promise<void> {
  // PrimeNG p-select requires click to open dropdown, then click the option
  await select.click();
  // Wait for dropdown overlay to appear
  const overlay = page.locator('.p-select-overlay');
  await expect(overlay).toBeVisible({ timeout: 5000 });
  // Click the option with exact text match to avoid partial matching issues (e.g., "Active" matching "Inactive")
  const option = overlay.getByText(optionText, { exact: true });
  await option.click();
  // Wait for dropdown to close
  await expect(overlay).not.toBeVisible({ timeout: 2000 });
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

// Re-export for convenience
export { logTestResult };
