import { expect, test } from '@playwright/test';

test('array add - simple test', async ({ page }) => {
  // Skip the index page, go directly to array-add
  await page.goto('http://localhost:4200/#/test/array-fields/array-add');
  await page.waitForLoadState('networkidle');

  const scenario = page.locator('[data-testid="array-add"]');
  await expect(scenario).toBeVisible();

  const emailInputs = scenario.locator('#emails input[type="email"]');
  expect(await emailInputs.count()).toBe(1);
});
