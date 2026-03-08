import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Config Change E2E Tests', () => {
  test.describe('Simple Config Swap', () => {
    test('should render initial config fields', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/config-swap-simple');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('config-swap-simple');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Verify initial config fields are visible
      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      await expect(lastNameInput).toBeVisible({ timeout: 5000 });

      // Email and phone from alternate config should not be visible
      const emailInput = scenario.locator('#email input');
      const phoneInput = scenario.locator('#phone input');
      await expect(emailInput).not.toBeVisible({ timeout: 5000 });
      await expect(phoneInput).not.toBeVisible({ timeout: 5000 });
    });

    test('should swap entire config and render new fields', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/config-swap-simple');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('config-swap-simple');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Verify initial config fields are visible
      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      await expect(lastNameInput).toBeVisible({ timeout: 5000 });

      // Fill initial fields
      await firstNameInput.fill('John');
      await lastNameInput.fill('Doe');

      // Switch to alternate config
      await scenario.locator('[data-testid="switch-to-alternate"]').click();

      // Verify new fields appear and old fields disappear
      const emailInput = scenario.locator('#email input');
      const phoneInput = scenario.locator('#phone input');
      await expect(emailInput).toBeVisible({ timeout: 5000 });
      await expect(phoneInput).toBeVisible({ timeout: 5000 });
      await expect(firstNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(lastNameInput).not.toBeVisible({ timeout: 5000 });
    });

    test('should swap back to initial config after switching', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/config-swap-simple');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('config-swap-simple');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');

      // Switch to alternate
      await scenario.locator('[data-testid="switch-to-alternate"]').click();

      const emailInput = scenario.locator('#email input');
      await expect(emailInput).toBeVisible({ timeout: 5000 });

      // Switch back to initial
      await scenario.locator('[data-testid="switch-to-initial"]').click();
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      await expect(lastNameInput).toBeVisible({ timeout: 5000 });
      await expect(emailInput).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Config Swap with Value Preservation', () => {
    test('should show shared fields after config swap', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/config-swap-preserve-values');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('config-swap-preserve-values');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Fill fields in initial config
      const firstNameInput = scenario.locator('#firstName input');
      const emailInput = scenario.locator('#email input');
      const lastNameInput = scenario.locator('#lastName input');
      await firstNameInput.fill('Jane');
      await emailInput.fill('jane@example.com');
      await lastNameInput.fill('Smith');

      // Switch to alternate config (firstName and email are shared)
      await scenario.locator('[data-testid="switch-to-alternate"]').click();

      // Shared fields should still be visible
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      await expect(emailInput).toBeVisible({ timeout: 5000 });

      // lastName should be removed, phone should be added
      await expect(lastNameInput).not.toBeVisible({ timeout: 5000 });
      const phoneInput = scenario.locator('#phone input');
      await expect(phoneInput).toBeVisible({ timeout: 5000 });
    });

    test('should remove non-shared fields and add new ones', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/config-swap-preserve-values');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('config-swap-preserve-values');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Fill all initial fields
      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const emailInput = scenario.locator('#email input');
      await firstNameInput.fill('Jane');
      await lastNameInput.fill('Smith');
      await emailInput.fill('jane@example.com');

      // Switch to alternate
      await scenario.locator('[data-testid="switch-to-alternate"]').click();

      // New phone field should be empty and visible
      const phoneInput = scenario.locator('#phone input');
      await expect(phoneInput).toBeVisible({ timeout: 5000 });
      await expect(phoneInput).toHaveValue('', { timeout: 5000 });

      // Switch back to initial
      await scenario.locator('[data-testid="switch-to-initial"]').click();

      // lastName should reappear
      await expect(lastNameInput).toBeVisible({ timeout: 5000 });
      // Phone should disappear
      await expect(phoneInput).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Add Fields to Config', () => {
    test('should add new fields while keeping existing fields visible', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/config-add-fields');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('config-add-fields');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Fill initial fields
      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      await firstNameInput.fill('Alice');
      await lastNameInput.fill('Wonder');

      // Switch to extended config
      await scenario.locator('[data-testid="switch-to-extended"]').click();

      // New fields should appear
      const emailInput = scenario.locator('#email input');
      const phoneInput = scenario.locator('#phone input');
      await expect(emailInput).toBeVisible({ timeout: 5000 });
      await expect(phoneInput).toBeVisible({ timeout: 5000 });

      // Original fields should still be visible
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      await expect(lastNameInput).toBeVisible({ timeout: 5000 });
    });

    test('should allow filling new fields after config extension', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/config-add-fields');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('config-add-fields');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Switch to extended config
      await scenario.locator('[data-testid="switch-to-extended"]').click();

      // Fill new fields
      const emailInput = scenario.locator('#email input');
      const phoneInput = scenario.locator('#phone input');
      await expect(emailInput).toBeVisible({ timeout: 5000 });
      await emailInput.fill('alice@example.com');
      await phoneInput.fill('555-0100');

      // Verify values are set
      await expect(emailInput).toHaveValue('alice@example.com', { timeout: 5000 });
      await expect(phoneInput).toHaveValue('555-0100', { timeout: 5000 });
    });

    test('should switch back to initial config without errors', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/config-add-fields');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('config-add-fields');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Switch to extended, then back to initial
      await scenario.locator('[data-testid="switch-to-extended"]').click();
      const emailInput = scenario.locator('#email input');
      await expect(emailInput).toBeVisible({ timeout: 5000 });

      await scenario.locator('[data-testid="switch-to-initial"]').click();

      // Extra fields should be gone
      await expect(emailInput).not.toBeVisible({ timeout: 5000 });

      // Original fields should still work
      const firstNameInput = scenario.locator('#firstName input');
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Remove Fields from Config', () => {
    test('should remove fields when switching to reduced config', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/config-remove-fields');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('config-remove-fields');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Fill all fields in initial (full) config
      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const emailInput = scenario.locator('#email input');
      const phoneInput = scenario.locator('#phone input');
      await firstNameInput.fill('Bob');
      await lastNameInput.fill('Builder');
      await emailInput.fill('bob@example.com');
      await phoneInput.fill('555-0123');

      // Switch to reduced config (only firstName, lastName)
      await scenario.locator('[data-testid="switch-to-reduced"]').click();

      // Removed fields should disappear
      await expect(emailInput).not.toBeVisible({ timeout: 5000 });
      await expect(phoneInput).not.toBeVisible({ timeout: 5000 });

      // Remaining fields should still be visible
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      await expect(lastNameInput).toBeVisible({ timeout: 5000 });
    });

    test('should restore removed fields when switching back', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/config-remove-fields');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('config-remove-fields');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const emailInput = scenario.locator('#email input');
      const phoneInput = scenario.locator('#phone input');

      // Switch to reduced
      await scenario.locator('[data-testid="switch-to-reduced"]').click();
      await expect(emailInput).not.toBeVisible({ timeout: 5000 });

      // Switch back to initial (full)
      await scenario.locator('[data-testid="switch-to-initial"]').click();

      // All fields should be back
      await expect(emailInput).toBeVisible({ timeout: 5000 });
      await expect(phoneInput).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Config Swap with Arrays', () => {
    test('should render initial array fields', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/config-swap-with-arrays');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('config-swap-with-arrays');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Verify initial array fields (contacts)
      const contactName = scenario.locator('#contacts #name_0 input');
      const contactEmail = scenario.locator('#contacts #email_0 input');
      await expect(contactName).toBeVisible({ timeout: 5000 });
      await expect(contactEmail).toBeVisible({ timeout: 5000 });
    });

    test('should swap to config with different array', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/config-swap-with-arrays');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('config-swap-with-arrays');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const contactName = scenario.locator('#contacts #name_0 input');
      await expect(contactName).toBeVisible({ timeout: 5000 });

      // Switch to alternate config with different array
      await scenario.locator('[data-testid="switch-to-alternate"]').click();

      // New array should appear
      const productName = scenario.locator('#items #product_0 input');
      const quantity = scenario.locator('#items #quantity_0 input');
      await expect(productName).toBeVisible({ timeout: 5000 });
      await expect(quantity).toBeVisible({ timeout: 5000 });

      // Old array should disappear
      await expect(contactName).not.toBeVisible({ timeout: 5000 });
    });

    test('should swap back to initial array config', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/config-swap-with-arrays');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('config-swap-with-arrays');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const contactName = scenario.locator('#contacts #name_0 input');

      // Switch to alternate
      await scenario.locator('[data-testid="switch-to-alternate"]').click();
      const productName = scenario.locator('#items #product_0 input');
      await expect(productName).toBeVisible({ timeout: 5000 });

      // Switch back
      await scenario.locator('[data-testid="switch-to-initial"]').click();
      await expect(contactName).toBeVisible({ timeout: 5000 });
      await expect(productName).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Value Two-Way Binding', () => {
    test('should update form fields when value is set programmatically', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/value-binding');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('value-binding');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const emailInput = scenario.locator('#email input');
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });

      // Fields should start empty
      await expect(firstNameInput).toHaveValue('', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('', { timeout: 5000 });
      await expect(emailInput).toHaveValue('', { timeout: 5000 });

      // Set value A programmatically
      await scenario.locator('[data-testid="set-value-a"]').click();

      // Form fields should reflect the new value
      await expect(firstNameInput).toHaveValue('Alice', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('Smith', { timeout: 5000 });
      await expect(emailInput).toHaveValue('alice@example.com', { timeout: 5000 });
    });

    test('should update form fields when value changes to a different preset', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/value-binding');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('value-binding');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const emailInput = scenario.locator('#email input');

      // Set value A
      await scenario.locator('[data-testid="set-value-a"]').click();
      await expect(firstNameInput).toHaveValue('Alice', { timeout: 5000 });

      // Switch to value B
      await scenario.locator('[data-testid="set-value-b"]').click();

      // Form fields should update to value B
      await expect(firstNameInput).toHaveValue('Bob', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('Builder', { timeout: 5000 });
      await expect(emailInput).toHaveValue('bob@example.com', { timeout: 5000 });
    });

    test('should clear form fields when value is cleared', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/value-binding');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('value-binding');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const emailInput = scenario.locator('#email input');

      // Set value A first
      await scenario.locator('[data-testid="set-value-a"]').click();
      await expect(firstNameInput).toHaveValue('Alice', { timeout: 5000 });

      // Clear value
      await scenario.locator('[data-testid="clear-value"]').click();

      // Form fields should be empty
      await expect(firstNameInput).toHaveValue('', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('', { timeout: 5000 });
      await expect(emailInput).toHaveValue('', { timeout: 5000 });
    });

    test('should reflect programmatic value in debug output', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/value-binding');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('value-binding');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Set value A
      await scenario.locator('[data-testid="set-value-a"]').click();

      // Debug output should contain the value
      const debugOutput = scenario.locator('[data-testid="form-value-value-binding"]');
      await expect(debugOutput).toContainText('Alice', { timeout: 5000 });
      await expect(debugOutput).toContainText('Smith', { timeout: 5000 });
      await expect(debugOutput).toContainText('alice@example.com', { timeout: 5000 });
    });
  });

  test.describe('Config Swap with Pages', () => {
    test('should render initial two-page config', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/config-swap-pages');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('config-swap-pages');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Verify initial page 1 fields
      const firstNameInput = scenario.locator('#firstName input');
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });

      const lastNameInput = scenario.locator('#lastName input');
      await expect(lastNameInput).toBeVisible({ timeout: 5000 });
    });

    test('should swap to three-page config', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/config-swap-pages');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('config-swap-pages');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Switch to alternate config with different pages
      await scenario.locator('[data-testid="switch-to-alternate"]').click();

      // New page 1 fields should appear
      const fullNameInput = scenario.locator('#fullName input');
      await expect(fullNameInput).toBeVisible({ timeout: 5000 });

      // Old page 1 fields should disappear
      const firstNameInput = scenario.locator('#firstName input');
      await expect(firstNameInput).not.toBeVisible({ timeout: 5000 });
    });

    test('should handle navigation in swapped multi-page config', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/config-swap-pages');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('config-swap-pages');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Switch to three-page config
      await scenario.locator('[data-testid="switch-to-alternate"]').click();

      const fullNameInput = scenario.locator('#fullName input');
      await expect(fullNameInput).toBeVisible({ timeout: 5000 });

      // Navigate to page 2 (address)
      await scenario.locator('#nextToAddress button').click();

      const streetInput = scenario.locator('#street input');
      await expect(streetInput).toBeVisible({ timeout: 5000 });

      const cityInput = scenario.locator('#city input');
      await expect(cityInput).toBeVisible({ timeout: 5000 });

      // Navigate to page 3 (review)
      await scenario.locator('#nextToReview button').click();

      const termsCheckbox = helpers.getCheckbox(scenario, 'termsAccepted');
      await expect(termsCheckbox).toBeVisible({ timeout: 5000 });
    });

    test('should swap back to initial pages config', async ({ page, helpers }) => {
      await page.goto('/#/test/config-change/config-swap-pages');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('config-swap-pages');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Switch to alternate then back
      await scenario.locator('[data-testid="switch-to-alternate"]').click();
      const fullNameInput = scenario.locator('#fullName input');
      await expect(fullNameInput).toBeVisible({ timeout: 5000 });

      await scenario.locator('[data-testid="switch-to-initial"]').click();

      // Original page 1 fields should be back
      const firstNameInput = scenario.locator('#firstName input');
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      await expect(fullNameInput).not.toBeVisible({ timeout: 5000 });
    });
  });
});
