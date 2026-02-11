import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Group Fields E2E Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/group-fields');
  });

  test.describe('Value Propagation', () => {
    test('should propagate values from nested group fields to parent form', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('group-value-propagation');
      await page.goto('/#/test/group-fields/group-value-propagation');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Screenshot: Empty group layout
      await helpers.expectScreenshotMatch(scenario, 'material-group-value-propagation-empty');

      // Fill the top-level name field
      const nameInput = scenario.locator('#name input');
      await expect(nameInput).toBeVisible({ timeout: 5000 });
      await nameInput.fill('Test User');

      // Fill nested group fields
      const streetInput = scenario.locator('#street input');
      const cityInput = scenario.locator('#city input');
      const zipInput = scenario.locator('#zip input');

      await expect(streetInput).toBeVisible({ timeout: 5000 });
      await streetInput.fill('123 Main St');

      await expect(cityInput).toBeVisible({ timeout: 5000 });
      await cityInput.fill('Springfield');

      await expect(zipInput).toBeVisible({ timeout: 5000 });
      await zipInput.fill('12345');

      // Verify all values are maintained
      await expect(nameInput).toHaveValue('Test User', { timeout: 5000 });
      await expect(streetInput).toHaveValue('123 Main St', { timeout: 5000 });
      await expect(cityInput).toHaveValue('Springfield', { timeout: 5000 });
      await expect(zipInput).toHaveValue('12345', { timeout: 5000 });

      // Screenshot: Filled group layout
      await helpers.expectScreenshotMatch(scenario, 'material-group-value-propagation-filled');
    });

    test('should update parent form value when editing group fields', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('group-value-propagation');
      await page.goto('/#/test/group-fields/group-value-propagation');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Fill a nested field
      const streetInput = scenario.locator('#street input');
      await expect(streetInput).toBeVisible({ timeout: 5000 });
      await streetInput.fill('456 Oak Ave');

      // Edit it to verify updates work
      await streetInput.clear();
      await streetInput.fill('789 Pine Blvd');

      await expect(streetInput).toHaveValue('789 Pine Blvd', { timeout: 5000 });
    });
  });

  test.describe('Initial Values', () => {
    test('should display initial values in group fields', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('group-initial-values');
      await page.goto('/#/test/group-fields/group-initial-values');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Verify initial values are displayed
      await expect(scenario.locator('#firstName input')).toHaveValue('John', { timeout: 5000 });
      await expect(scenario.locator('#lastName input')).toHaveValue('Doe', { timeout: 5000 });
      await expect(scenario.locator('#email input')).toHaveValue('john.doe@example.com', { timeout: 5000 });
    });

    test('should allow editing initial values in group fields', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('group-initial-values');
      await page.goto('/#/test/group-fields/group-initial-values');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Edit the first name
      const firstNameInput = scenario.locator('#firstName input');
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });

      await firstNameInput.clear();
      await firstNameInput.fill('Jane');

      await expect(firstNameInput).toHaveValue('Jane', { timeout: 5000 });

      // Other fields should remain unchanged
      await expect(scenario.locator('#lastName input')).toHaveValue('Doe', { timeout: 5000 });
    });
  });

  test.describe('Multiple Groups', () => {
    test('should propagate values through multiple sibling groups', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('group-nested');
      await page.goto('/#/test/group-fields/group-nested');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Fill personal group fields
      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });

      await firstNameInput.fill('John');
      await lastNameInput.fill('Doe');

      // Fill work group fields
      const companyInput = scenario.locator('#company input');
      const positionInput = scenario.locator('#position input');
      await expect(companyInput).toBeVisible({ timeout: 5000 });

      await companyInput.fill('Acme Corp');
      await positionInput.fill('Developer');

      // Verify all values are maintained
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
      await expect(companyInput).toHaveValue('Acme Corp', { timeout: 5000 });
      await expect(positionInput).toHaveValue('Developer', { timeout: 5000 });

      // Screenshot: Multiple groups filled
      await helpers.expectScreenshotMatch(scenario, 'material-group-nested-filled');
    });

    test('should maintain one group values when editing another group', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('group-nested');
      await page.goto('/#/test/group-fields/group-nested');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Fill work group first
      const companyInput = scenario.locator('#company input');
      await expect(companyInput).toBeVisible({ timeout: 5000 });
      await companyInput.fill('TechCorp');

      // Then fill personal group
      const firstNameInput = scenario.locator('#firstName input');
      await firstNameInput.fill('Jane');

      // Verify work group value is maintained
      await expect(companyInput).toHaveValue('TechCorp', { timeout: 5000 });
      await expect(firstNameInput).toHaveValue('Jane', { timeout: 5000 });
    });
  });
});
