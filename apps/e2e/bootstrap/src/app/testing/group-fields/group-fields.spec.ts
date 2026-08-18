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

  test.describe('Container Validator (issue #568)', () => {
    test('renders the group-level message in this adapter and gates submit', async ({ page, helpers }) => {
      await page.goto('/#/test/group-fields/container-validator');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('group-container-validator-test');
      await expect(scenario).toBeVisible();

      const groupInputs = scenario.locator(':is([id="period"], [id$="_period"]) input');
      const dateFrom = groupInputs.first();
      const dateTo = groupInputs.nth(1);
      const submitButton = helpers.getSubmitButton(scenario);
      // This adapter registers its own `field-errors` wrapper over the core default.
      const containerError = scenario.locator('.invalid-feedback');

      await expect(containerError).toHaveCount(0);

      await helpers.fillInput(dateFrom, '2026-02-01');
      await helpers.fillInput(dateTo, '2026-01-01');
      await helpers.blurInput(dateTo);

      await expect(containerError).toBeVisible();
      await expect(containerError).toHaveText('The end must not be before the start.');
      await expect(submitButton).toBeDisabled();

      await helpers.fillInput(dateTo, '2026-03-01');
      await helpers.blurInput(dateTo);

      await expect(containerError).toHaveCount(0);
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Delegated field errors (FIELD_ERROR_DISPLAY)', () => {
    test('renders the message once, from the wrapper rather than the field', async ({ page, helpers }) => {
      await page.goto('/#/test/group-fields/delegated-field-errors');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('delegated-field-errors-test');
      await expect(scenario).toBeVisible();

      const username = scenario.locator(':is([id="username"], [id$="_username"]) input');
      const email = scenario.locator(':is([id="email"], [id$="_email"]) input');

      await helpers.fillInput(username, 'x');
      await helpers.clearAndFill(username, '');
      await helpers.blurInput(username);
      await helpers.fillInput(email, 'x');
      await helpers.clearAndFill(email, '');
      await helpers.blurInput(email);

      // One delegated (rendered by the wrapper) + one ordinary. Three would mean the
      // delegated field rendered its own on top of the wrapper's.
      await expect(scenario.locator('.invalid-feedback')).toHaveCount(2);
      await expect(scenario.locator('df-bs-field-errors .invalid-feedback')).toHaveCount(1);
      await expect(scenario.locator('df-bs-field-errors .invalid-feedback')).toHaveText('Username is required.');

      // Styling parity: the wrapper's message must look like the field component's own.
      // Text-only assertions let a wrapper render in body grey and still pass — that
      // regression happened once already on PrimeNG.
      const parity = await page.evaluate(
        ({ errorSel, wrapperSel }) => {
          const all = Array.from(document.querySelectorAll(errorSel));
          const wrapped = document.querySelector(`${wrapperSel} ${errorSel}`);
          const own = all.find((el) => el !== wrapped);
          if (!wrapped || !own) return null;
          const a = getComputedStyle(wrapped);
          const b = getComputedStyle(own);
          return {
            color: [a.color, b.color],
            fontSize: [a.fontSize, b.fontSize],
            inheritsBody: a.color === getComputedStyle(document.body).color,
          };
        },
        { errorSel: '.invalid-feedback', wrapperSel: 'df-bs-field-errors' },
      );

      expect(parity).not.toBeNull();
      expect(parity!.color[0]).toBe(parity!.color[1]);
      expect(parity!.fontSize[0]).toBe(parity!.fontSize[1]);
      expect(parity!.inheritsBody).toBe(false);
    });
  });

  test.describe('Container Validator on an array (issue #568)', () => {
    test('renders the array-level message in this adapter and gates submit', async ({ page, helpers }) => {
      await page.goto('/#/test/group-fields/array-container-validator');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('array-container-validator-test');
      await expect(scenario).toBeVisible();

      const rowInputs = scenario.locator(':is([id="periods"], [id$="_periods"]) input');
      const from = rowInputs.first();
      const to = rowInputs.nth(1);
      const submitButton = helpers.getSubmitButton(scenario);
      const containerError = scenario.locator('df-bs-field-errors .invalid-feedback');

      await expect(containerError).toHaveCount(0);

      await helpers.fillInput(from, '2026-01-02T10:00');
      await helpers.fillInput(to, '2026-01-02T09:00');
      await helpers.blurInput(to);

      await expect(containerError).toBeVisible();
      await expect(containerError).toHaveText('The end must not be before the start.');
      await expect(submitButton).toBeDisabled();

      await helpers.fillInput(to, '2026-01-02T11:00');
      await helpers.blurInput(to);

      await expect(containerError).toHaveCount(0);
      await expect(submitButton).toBeEnabled();
    });
  });
});
