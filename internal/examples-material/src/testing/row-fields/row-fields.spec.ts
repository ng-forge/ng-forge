import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Row Fields E2E Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/row-fields');
  });

  test.describe('Basic Layout', () => {
    test('should render fields horizontally in a row', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('row-basic-layout');
      await page.goto('/#/test/row-fields/row-basic-layout');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Verify first row fields are visible
      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');

      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      await expect(lastNameInput).toBeVisible({ timeout: 5000 });

      // Screenshot: Initial row layout
      await helpers.expectScreenshotMatch(scenario, 'material-row-basic-layout-empty');

      // Fill in the fields
      await firstNameInput.fill('John');
      await lastNameInput.fill('Doe');

      // Verify second row fields
      const emailInput = scenario.locator('#email input');
      const phoneInput = scenario.locator('#phone input');
      const countrySelect = helpers.getSelect(scenario, 'country');

      await expect(emailInput).toBeVisible({ timeout: 5000 });
      await expect(phoneInput).toBeVisible({ timeout: 5000 });
      await expect(countrySelect).toBeVisible({ timeout: 5000 });

      // Fill second row
      await emailInput.fill('john@example.com');
      await phoneInput.fill('555-1234');
      await helpers.selectOption(countrySelect, 'United States');

      // Verify all values are maintained
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
      await expect(emailInput).toHaveValue('john@example.com', { timeout: 5000 });
      await expect(phoneInput).toHaveValue('555-1234', { timeout: 5000 });

      // Screenshot: Filled row layout
      await helpers.expectScreenshotMatch(scenario, 'material-row-basic-layout-filled');
    });
  });

  test.describe('Nested Containers', () => {
    test('should render row containing group containers', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('row-containing-group');
      await page.goto('/#/test/row-fields/row-containing-group');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Get group fields
      const personalFirstName = scenario.locator('#personalInfo input').first();
      const personalLastName = scenario.locator('#personalInfo input').nth(1);
      const contactEmail = scenario.locator('#contactInfo input').first();
      const contactPhone = scenario.locator('#contactInfo input').nth(1);

      // All fields should be visible
      await expect(personalFirstName).toBeVisible({ timeout: 5000 });
      await expect(personalLastName).toBeVisible({ timeout: 5000 });
      await expect(contactEmail).toBeVisible({ timeout: 5000 });
      await expect(contactPhone).toBeVisible({ timeout: 5000 });

      // Screenshot: Empty nested layout
      await helpers.expectScreenshotMatch(scenario, 'material-row-containing-group-empty');

      // Fill all fields
      await personalFirstName.fill('John');
      await personalLastName.fill('Doe');
      await contactEmail.fill('john@example.com');
      await contactPhone.fill('555-1234');

      // Verify values are maintained
      await expect(personalFirstName).toHaveValue('John', { timeout: 5000 });
      await expect(personalLastName).toHaveValue('Doe', { timeout: 5000 });
      await expect(contactEmail).toHaveValue('john@example.com', { timeout: 5000 });
      await expect(contactPhone).toHaveValue('555-1234', { timeout: 5000 });

      // Screenshot: Filled nested layout
      await helpers.expectScreenshotMatch(scenario, 'material-row-containing-group-filled');
    });
  });
});
