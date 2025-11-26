import { expect, test } from '@playwright/test';

test.describe('Age-Based Logic E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4201/#/test/essential-tests/age-based-logic');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Age-Based Logic', () => {
    test('should show guardian consent when age is under 18', async ({ page }) => {
      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="age-based-logic"]');
      await expect(scenario).toBeVisible();

      // Fill age with value under 18
      await scenario.locator('#age input').fill('16');
      await scenario.locator('#age input').blur();
      await page.waitForTimeout(200);

      // Guardian consent should be visible
      const guardianConsent = scenario.locator('#guardianConsent');
      await expect(guardianConsent).toBeVisible();
    });

    test('should hide guardian consent when age is 18 or over', async ({ page }) => {
      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="age-based-logic"]');
      await expect(scenario).toBeVisible();

      // Fill age with value 18 or over
      await scenario.locator('#age input').fill('25');
      await scenario.locator('#age input').blur();
      await page.waitForTimeout(200);

      // Guardian consent should not be visible
      const guardianConsent = scenario.locator('#guardianConsent');
      await expect(guardianConsent).not.toBeVisible();
    });

    test('should hide guardian consent at boundary age of exactly 18', async ({ page }) => {
      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="age-based-logic"]');
      await expect(scenario).toBeVisible();

      // Fill age with exactly 18
      await scenario.locator('#age input').fill('18');
      await scenario.locator('#age input').blur();
      await page.waitForTimeout(200);

      // Guardian consent should not be visible for 18
      const guardianConsent = scenario.locator('#guardianConsent');
      await expect(guardianConsent).not.toBeVisible();
    });

    test('should toggle guardian consent visibility when age changes', async ({ page }) => {
      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="age-based-logic"]');
      await expect(scenario).toBeVisible();

      const ageInput = scenario.locator('#age input');
      const guardianConsent = scenario.locator('#guardianConsent');

      // Start with age under 18
      await ageInput.fill('16');
      await ageInput.blur();
      await page.waitForTimeout(200);

      // Guardian consent should be visible
      await expect(guardianConsent).toBeVisible();

      // Change to age 18 or over
      await ageInput.clear();
      await ageInput.fill('25');
      await ageInput.blur();
      await page.waitForTimeout(200);

      // Guardian consent should not be visible
      await expect(guardianConsent).not.toBeVisible();

      // Change back to under 18
      await ageInput.clear();
      await ageInput.fill('17');
      await ageInput.blur();
      await page.waitForTimeout(200);

      // Guardian consent should be visible again
      await expect(guardianConsent).toBeVisible();
    });

    test('should submit form with age and guardian consent when applicable', async ({ page }) => {
      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="age-based-logic"]');
      await expect(scenario).toBeVisible();

      // Fill age under 18
      await scenario.locator('#age input').fill('16');
      await scenario.locator('#age input').blur();
      await page.waitForTimeout(200);

      // Guardian consent should be visible
      const guardianConsent = scenario.locator('#guardianConsent mat-checkbox');
      await expect(guardianConsent).toBeVisible();

      // Check guardian consent
      await guardianConsent.click();
      await page.waitForTimeout(200);

      // Set up event listener BEFORE clicking submit
      const submittedDataPromise = page.evaluate(
        () =>
          new Promise((resolve) => {
            window.addEventListener(
              'formSubmitted',
              (event: any) => {
                resolve(event.detail.data);
              },
              { once: true },
            );
          }),
      );

      // Submit the form
      const submitButton = scenario.locator('#submit button');
      await submitButton.click();

      // Wait for formSubmitted event
      const submittedData = await submittedDataPromise;

      // Verify submitted data
      expect(submittedData).toMatchObject({
        age: 16,
        guardianConsent: true,
      });
    });

    test('should submit form with only age when 18 or over', async ({ page }) => {
      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="age-based-logic"]');
      await expect(scenario).toBeVisible();

      // Fill age 18 or over
      await scenario.locator('#age input').fill('25');
      await scenario.locator('#age input').blur();
      await page.waitForTimeout(200);

      // Guardian consent should not be visible
      const guardianConsent = scenario.locator('#guardianConsent');
      await expect(guardianConsent).not.toBeVisible();

      // Set up event listener BEFORE clicking submit
      const submittedDataPromise = page.evaluate(
        () =>
          new Promise((resolve) => {
            window.addEventListener(
              'formSubmitted',
              (event: any) => {
                resolve(event.detail.data);
              },
              { once: true },
            );
          }),
      );

      // Submit the form
      const submitButton = scenario.locator('#submit button');
      await submitButton.click();

      // Wait for formSubmitted event
      const submittedData = await submittedDataPromise;

      // Verify submitted data (guardianConsent should not be in the data or should be undefined)
      expect(submittedData).toHaveProperty('age', 25);
    });
  });
});
