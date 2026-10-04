import { expect, type Page } from '@playwright/test';

/** Opens one scenario by hash route, the web counterpart of the Maestro deep link. */
export async function openScenario(page: Page, suite: string, scenario: string): Promise<void> {
  await page.goto(`/#/test/${suite}/${scenario}`);
  await expect(page.getByTestId(scenario)).toBeVisible();
}

/** The scenario's form value, as the app renders it. */
export async function formValue(page: Page): Promise<Record<string, unknown>> {
  return JSON.parse(await page.getByTestId('form-value').innerText());
}

/** The last submitted value, or null. */
export async function lastSubmission(page: Page): Promise<Record<string, unknown> | null> {
  return JSON.parse(await page.getByTestId('last-submission').innerText());
}
