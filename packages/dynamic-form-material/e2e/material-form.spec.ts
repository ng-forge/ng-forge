import { test, expect } from '@playwright/test';

test.describe('Dynamic Form Material Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render material input field', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Look for a material input field
    const inputField = page.locator('mat-form-field input');
    await expect(inputField.first()).toBeVisible();
  });

  test('should render material select field', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for a material select field
    const selectField = page.locator('mat-select');
    await expect(selectField.first()).toBeVisible();
  });

  test('should interact with material checkbox', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for a material checkbox
    const checkbox = page.locator('mat-checkbox input[type="checkbox"]');
    if ((await checkbox.count()) > 0) {
      await checkbox.first().check();
      await expect(checkbox.first()).toBeChecked();
    }
  });

  test('should interact with material button', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for a material button
    const button = page.locator('button[mat-button], button[mat-raised-button], button[mat-flat-button]');
    if ((await button.count()) > 0) {
      await expect(button.first()).toBeVisible();
      await button.first().click();
    }
  });
});
