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

  test.describe('Conditional Visibility', () => {
    test('should show/hide entire group based on radio selection', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('group-conditional-visibility');
      await page.goto('/#/test/group-fields/group-conditional-visibility');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Get radio buttons
      const personalRadio = scenario.locator('#accountType mat-radio-button:has-text("Personal")');
      const businessRadio = scenario.locator('#accountType mat-radio-button:has-text("Business")');

      // Get business group fields
      const companyNameInput = scenario.locator('#companyName input');
      const taxIdInput = scenario.locator('#taxId input');
      const employeeCountSelect = helpers.getSelect(scenario, 'employeeCount');

      // Common field should always be visible
      const emailInput = scenario.locator('#commonField input');
      await expect(emailInput).toBeVisible({ timeout: 5000 });

      // Initially personal is selected, so business group should be hidden
      await expect(personalRadio).toBeVisible({ timeout: 5000 });
      await expect(companyNameInput).not.toBeVisible({ timeout: 5000 });

      // Screenshot: Personal selected, business hidden
      await helpers.expectScreenshotMatch(scenario, 'material-group-conditional-visibility-personal');

      // Switch to business
      await businessRadio.click();

      // Business group should now be visible
      await expect(companyNameInput).toBeVisible({ timeout: 5000 });
      await expect(taxIdInput).toBeVisible({ timeout: 5000 });
      await expect(employeeCountSelect).toBeVisible({ timeout: 5000 });

      // Fill business fields
      await companyNameInput.fill('Acme Corp');
      await taxIdInput.fill('12-3456789');
      await helpers.selectOption(employeeCountSelect, '11-50');

      // Screenshot: Business selected, group visible and filled
      await helpers.expectScreenshotMatch(scenario, 'material-group-conditional-visibility-business');

      // Switch back to personal
      await personalRadio.click();

      // Business group should be hidden
      await expect(companyNameInput).not.toBeVisible({ timeout: 5000 });

      // Switch to business again - values should be preserved
      await businessRadio.click();
      await expect(companyNameInput).toHaveValue('Acme Corp', { timeout: 5000 });
      await expect(taxIdInput).toHaveValue('12-3456789', { timeout: 5000 });
    });

    test('should preserve group values through visibility toggle', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('group-state-preservation');
      await page.goto('/#/test/group-fields/group-state-preservation');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Get checkboxes
      const includeAddressCheckbox = helpers.getCheckbox(scenario, 'includeAddress');
      const includeBillingCheckbox = helpers.getCheckbox(scenario, 'includeBilling');

      // Get address group fields
      const streetInput = scenario.locator('#street input');
      const cityInput = scenario.locator('#city input');
      const stateSelect = helpers.getSelect(scenario, 'state');

      // Get billing group fields
      const billingStreetInput = scenario.locator('#billingStreet input');

      // Initially both groups should be hidden
      await expect(streetInput).not.toBeVisible({ timeout: 5000 });
      await expect(billingStreetInput).not.toBeVisible({ timeout: 5000 });

      // Screenshot: Both groups hidden
      await helpers.expectScreenshotMatch(scenario, 'material-group-state-preservation-initial');

      // Enable address group
      await includeAddressCheckbox.click();
      await expect(streetInput).toBeVisible({ timeout: 5000 });

      // Fill address fields
      await streetInput.fill('123 Main St');
      await cityInput.fill('Springfield');
      await helpers.selectOption(stateSelect, 'California');

      // Enable billing group
      await includeBillingCheckbox.click();
      await expect(billingStreetInput).toBeVisible({ timeout: 5000 });
      await billingStreetInput.fill('456 Billing Ave');

      // Screenshot: Both groups visible
      await helpers.expectScreenshotMatch(scenario, 'material-group-state-preservation-filled');

      // Toggle address off and on
      await includeAddressCheckbox.click();
      await expect(streetInput).not.toBeVisible({ timeout: 5000 });
      await includeAddressCheckbox.click();
      await expect(streetInput).toBeVisible({ timeout: 5000 });

      // Values should be preserved
      await expect(streetInput).toHaveValue('123 Main St', { timeout: 5000 });
      await expect(cityInput).toHaveValue('Springfield', { timeout: 5000 });

      // Toggle billing off and on
      await includeBillingCheckbox.click();
      await expect(billingStreetInput).not.toBeVisible({ timeout: 5000 });
      await includeBillingCheckbox.click();
      await expect(billingStreetInput).toBeVisible({ timeout: 5000 });

      // Values should be preserved
      await expect(billingStreetInput).toHaveValue('456 Billing Ave', { timeout: 5000 });
    });

    test('should handle nested conditional fields inside conditional group', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('group-nested-conditional');
      await page.goto('/#/test/group-fields/group-nested-conditional');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Get controls
      const showPersonalCheckbox = helpers.getCheckbox(scenario, 'showPersonal');
      const hasMiddleNameCheckbox = helpers.getCheckbox(scenario, 'hasMiddleName');
      const emailRadio = scenario.locator('#personal mat-radio-button:has-text("Email")');
      const phoneRadio = scenario.locator('#personal mat-radio-button:has-text("Phone")');

      // Get fields
      const firstNameInput = scenario.locator('#personal #firstName input');
      const middleNameInput = scenario.locator('#personal #middleName input');
      const emailInput = scenario.locator('#personal #email input');
      const phoneInput = scenario.locator('#personal #phone input');

      // Initially group is visible (checkbox is checked by default)
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      await expect(middleNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(emailInput).toBeVisible({ timeout: 5000 });
      await expect(phoneInput).not.toBeVisible({ timeout: 5000 });

      // Screenshot: Initial state
      await helpers.expectScreenshotMatch(scenario, 'material-group-nested-conditional-initial');

      // Fill first name
      await firstNameInput.fill('John');

      // Enable middle name
      await hasMiddleNameCheckbox.click();
      await expect(middleNameInput).toBeVisible({ timeout: 5000 });
      await middleNameInput.fill('William');

      // Fill email
      await emailInput.fill('john@example.com');

      // Switch to phone
      await phoneRadio.click();
      await expect(emailInput).not.toBeVisible({ timeout: 5000 });
      await expect(phoneInput).toBeVisible({ timeout: 5000 });
      await phoneInput.fill('555-1234');

      // Screenshot: All options enabled
      await helpers.expectScreenshotMatch(scenario, 'material-group-nested-conditional-all');

      // Hide the entire group
      await showPersonalCheckbox.click();
      await expect(firstNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(middleNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(phoneInput).not.toBeVisible({ timeout: 5000 });

      // Show the group again
      await showPersonalCheckbox.click();

      // All values should be preserved
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await expect(middleNameInput).toHaveValue('William', { timeout: 5000 });
      await expect(phoneInput).toHaveValue('555-1234', { timeout: 5000 });

      // Switch back to email - value should be preserved
      await emailRadio.click();
      await expect(emailInput).toHaveValue('john@example.com', { timeout: 5000 });
    });
  });
});
