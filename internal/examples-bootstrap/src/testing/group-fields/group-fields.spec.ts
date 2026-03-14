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
      await helpers.expectScreenshotMatch(scenario, 'bootstrap-group-value-propagation-empty');

      // Fill the top-level name field
      const nameInput = scenario.locator('#name input');
      await expect(nameInput).toBeVisible({ timeout: 5000 });
      await nameInput.fill('Test User');

      // Fill nested group fields
      const streetInput = scenario.locator('#address input').first();
      const cityInput = scenario.locator('#address input').nth(1);
      const zipInput = scenario.locator('#address input').nth(2);

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
      await helpers.expectScreenshotMatch(scenario, 'bootstrap-group-value-propagation-filled');
    });

    test('should update parent form value when editing group fields', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('group-value-propagation');
      await page.goto('/#/test/group-fields/group-value-propagation');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Fill a nested field
      const streetInput = scenario.locator('#address input').first();
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
      const inputs = scenario.locator('#profile input');
      await expect(inputs).toHaveCount(3, { timeout: 10000 });

      await expect(inputs.nth(0)).toHaveValue('John', { timeout: 5000 });
      await expect(inputs.nth(1)).toHaveValue('Doe', { timeout: 5000 });
      await expect(inputs.nth(2)).toHaveValue('john.doe@example.com', { timeout: 5000 });
    });

    test('should allow editing initial values in group fields', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('group-initial-values');
      await page.goto('/#/test/group-fields/group-initial-values');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Edit the first name
      const firstNameInput = scenario.locator('#profile input').first();
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });

      await firstNameInput.clear();
      await firstNameInput.fill('Jane');

      await expect(firstNameInput).toHaveValue('Jane', { timeout: 5000 });

      // Other fields should remain unchanged
      const lastNameInput = scenario.locator('#profile input').nth(1);
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
    });
  });

  test.describe('Multiple Groups', () => {
    test('should propagate values through multiple sibling groups', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('group-nested');
      await page.goto('/#/test/group-fields/group-nested');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Fill personal group fields
      const personalInputs = scenario.locator('#personal input');
      await expect(personalInputs).toHaveCount(2, { timeout: 10000 });

      await personalInputs.nth(0).fill('John');
      await personalInputs.nth(1).fill('Doe');

      // Fill work group fields
      const workInputs = scenario.locator('#work input');
      await expect(workInputs).toHaveCount(2, { timeout: 10000 });

      await workInputs.nth(0).fill('Acme Corp');
      await workInputs.nth(1).fill('Developer');

      // Verify all values are maintained
      await expect(personalInputs.nth(0)).toHaveValue('John', { timeout: 5000 });
      await expect(personalInputs.nth(1)).toHaveValue('Doe', { timeout: 5000 });
      await expect(workInputs.nth(0)).toHaveValue('Acme Corp', { timeout: 5000 });
      await expect(workInputs.nth(1)).toHaveValue('Developer', { timeout: 5000 });
    });

    test('should maintain one group values when editing another group', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('group-nested');
      await page.goto('/#/test/group-fields/group-nested');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Fill work group first
      const companyInput = scenario.locator('#work input').first();
      await expect(companyInput).toBeVisible({ timeout: 5000 });
      await companyInput.fill('TechCorp');

      // Then fill personal group
      const firstNameInput = scenario.locator('#personal input').first();
      await firstNameInput.fill('Jane');

      // Verify work group value is maintained
      await expect(companyInput).toHaveValue('TechCorp', { timeout: 5000 });
      await expect(firstNameInput).toHaveValue('Jane', { timeout: 5000 });
    });
  });
});
