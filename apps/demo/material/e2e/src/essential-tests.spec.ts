import { expect, test } from '@playwright/test';

test.describe('Essential Tests - Quick Validation', () => {
  test('basic form functionality works', async ({ page }) => {
    await page.goto('http://localhost:4200/cross-field-validation');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check page loads correctly
    await expect(page.getByRole('heading', { name: /Cross-Field Validation/i })).toBeVisible();

    // Test basic form interaction - Password Matching is default tab
    await expect(page.getByRole('button', { name: 'Password Matching' })).toHaveClass(/active/);
    await expect(page.getByLabel('Password').first()).toBeVisible();

    console.log('✅ Basic form functionality test passed');
  });

  test('age-based logic works correctly', async ({ page }) => {
    await page.goto('http://localhost:4200/cross-field-validation');
    await page.waitForLoadState('networkidle');

    // Go to dependent validation
    await page.getByRole('button', { name: 'Dependent Validation' }).click();
    await page.waitForTimeout(300);

    // Test age under 18 - guardian consent should be visible
    await page.getByLabel('Age').fill('16');
    await page.getByLabel('Age').blur();
    await page.waitForTimeout(200);

    await expect(page.getByLabel('Guardian Consent Required')).toBeVisible();

    // Test age 25 - guardian consent should be hidden
    await page.getByLabel('Age').clear();
    await page.getByLabel('Age').fill('25');
    await page.getByLabel('Age').blur();
    await page.waitForTimeout(200);

    await expect(page.getByLabel('Guardian Consent Required')).not.toBeVisible();

    console.log('✅ Age logic test passed');
  });

  test('multi-page navigation works', async ({ page }) => {
    await page.goto('http://localhost:4200/user-registration');
    await page.waitForLoadState('networkidle');

    // Check page loads
    await expect(page.getByRole('heading', { name: /User Registration/i })).toBeVisible();

    // Test scenario button navigation
    await page.getByRole('button', { name: 'Personal Information' }).first().click();
    await page.waitForTimeout(300);

    // Just verify it loads without throwing errors
    await expect(page.getByLabel('First Name')).toBeVisible();

    console.log('✅ Multi-page navigation test passed');
  });
});
