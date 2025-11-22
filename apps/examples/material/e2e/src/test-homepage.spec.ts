import { expect, test } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveTitle(/Material Examples/);
});
