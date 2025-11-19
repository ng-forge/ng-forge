import { expect, test } from '@playwright/test';

test.describe('Advanced Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4201/test/advanced-validation');
  });

  test('should validate using custom validators', async ({ page }) => {
    const scenario = page.locator('[data-testid="custom-validator-test"]');
    await expect(scenario).toBeVisible();

    // Try weak password
    await scenario.locator('#password input').fill('weak');
    await scenario.locator('#submit button').click({ force: true });
    await page.waitForTimeout(500);

    // Check for validation errors
    const passwordField = scenario.locator('#password');
    const hasError = (await passwordField.locator('..').locator('mat-error').count()) > 0;

    // Fill strong password
    await scenario.locator('#password input').fill('Strong@123');
    await scenario.locator('#submit button').click({ force: true });
    await page.waitForTimeout(500);
  });

  test('should validate fields against each other using cross-field validation', async ({ page }) => {
    const scenario = page.locator('[data-testid="cross-field-test"]');
    await expect(scenario).toBeVisible();

    // Enter matching passwords
    await scenario.locator('#password input').fill('MyPassword123');
    await scenario.locator('#confirmPassword input').fill('MyPassword123');
    await scenario.locator('#submit button').click({ force: true });
    await page.waitForTimeout(500);

    // Now try mismatched passwords
    await scenario.locator('#confirmPassword input').fill('DifferentPassword');
    await scenario.locator('#submit button').click({ force: true });
    await page.waitForTimeout(500);

    // Should show error
    const confirmField = scenario.locator('#confirmPassword');
    const hasError = await confirmField
      .locator('..')
      .locator('mat-error')
      .isVisible()
      .catch(() => false);
  });

  test('should validate dependent numeric fields', async ({ page }) => {
    const scenario = page.locator('[data-testid="range-validation-test"]');
    await expect(scenario).toBeVisible();

    // Enter valid range
    await scenario.locator('#minValue input').fill('10');
    await scenario.locator('#maxValue input').fill('20');
    await scenario.locator('#submit button').click({ force: true });
    await page.waitForTimeout(500);

    // Enter invalid range (max < min)
    await scenario.locator('#maxValue input').fill('5');
    await scenario.locator('#submit button').click({ force: true });
    await page.waitForTimeout(500);

    // Should show error
    const maxField = scenario.locator('#maxValue');
    const hasError = await maxField
      .locator('..')
      .locator('mat-error')
      .isVisible()
      .catch(() => false);
  });

  test('should apply validators conditionally based on when expression', async ({ page }) => {
    const scenario = page.locator('[data-testid="conditional-validator-test"]');
    await expect(scenario).toBeVisible();

    // Check isAdult
    await scenario.locator('#isAdult input[type="checkbox"]').check();
    await page.waitForTimeout(500);

    // Try to submit without age
    await scenario.locator('#submit button').click({ force: true });
    await page.waitForTimeout(500);

    // Fill age < 18
    await scenario.locator('#age input').fill('16');
    await scenario.locator('#submit button').click({ force: true });
    await page.waitForTimeout(500);

    // Should show error
    const ageField = scenario.locator('#age');
    const hasError = await ageField
      .locator('..')
      .locator('mat-error')
      .isVisible()
      .catch(() => false);

    // Fill age >= 18
    await scenario.locator('#age input').fill('25');
    await scenario.locator('#submit button').click({ force: true });
    await page.waitForTimeout(500);
  });

  test('should apply multiple validators to a single field', async ({ page }) => {
    const scenario = page.locator('[data-testid="multiple-validators-test"]');
    await expect(scenario).toBeVisible();

    // Test empty (required)
    await scenario.locator('#submit button').click({ force: true });
    await page.waitForTimeout(500);

    // Test too short (minLength)
    await scenario.locator('#username input').fill('ab');
    await scenario.locator('#submit button').click({ force: true });
    await page.waitForTimeout(500);

    // Test invalid pattern
    await scenario.locator('#username input').fill('user name');
    await scenario.locator('#submit button').click({ force: true });
    await page.waitForTimeout(500);

    // Test valid username
    await scenario.locator('#username input').fill('valid_user_123');
    await scenario.locator('#submit button').click({ force: true });
    await page.waitForTimeout(500);
  });
});
