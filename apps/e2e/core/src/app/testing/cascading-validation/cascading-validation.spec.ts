import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Cascading Validation Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/cascading-validation');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Defaults — hidden fields skip validation
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Defaults — Hidden Skips Validation', () => {
    test('a statically hidden required field does not block submit', async ({ page, helpers }) => {
      await page.goto('/#/test/cascading-validation/basic-hidden-required');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('basic-hidden-required');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const submitButton = helpers.getSubmitButton(scenario);

      await expect(submitButton).toBeEnabled({ timeout: 5000 });
      await expect(scenario.locator('#hiddenRequired input')).not.toBeVisible({ timeout: 5000 });

      const data = await helpers.submitFormAndCapture(scenario);
      expect(data).toHaveProperty('hiddenRequired');
    });

    test('toggling a required field via hidden-logic toggles whether required runs', async ({ page, helpers }) => {
      await page.goto('/#/test/cascading-validation/toggle-hidden-required');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('toggle-hidden-required');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const submitButton = helpers.getSubmitButton(scenario);
      const showNameCheckbox = helpers.getCheckbox(scenario, 'showName');
      const nameInput = scenario.locator('#name input');

      // Initially showName=true → name visible & empty → required blocks submit.
      await expect(nameInput).toBeVisible({ timeout: 5000 });
      await expect(submitButton).toBeDisabled({ timeout: 5000 });

      await nameInput.fill('Alice');
      await expect(submitButton).toBeEnabled({ timeout: 5000 });

      await nameInput.clear();
      await expect(submitButton).toBeDisabled({ timeout: 5000 });

      // Hiding the field via the toggle skips its validator → submit re-enables.
      await showNameCheckbox.click();
      await expect(nameInput).not.toBeVisible({ timeout: 5000 });
      await expect(submitButton).toBeEnabled({ timeout: 5000 });

      // Showing it again re-applies the validator (value is still empty).
      await showNameCheckbox.click();
      await expect(nameInput).toBeVisible({ timeout: 5000 });
      await expect(submitButton).toBeDisabled({ timeout: 5000 });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Per-field override — validateWhenHidden=true on a single field
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Cascade — validateWhenHidden=true Through Hidden Group', () => {
    test('required leaf inside hidden group with validateWhenHidden=true blocks submit', async ({ page, helpers }) => {
      await page.goto('/#/test/cascading-validation/field-validate-when-hidden');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('field-validate-when-hidden');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const submitButton = helpers.getSubmitButton(scenario);

      // Group hidden + validateWhenHidden=true + leaf required + empty → submit blocked.
      await expect(scenario.locator('#mustValidate input')).not.toBeVisible({ timeout: 5000 });
      await expect(submitButton).toBeDisabled({ timeout: 5000 });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Form-level override — options.validateWhenHidden=true
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Form-Level Override — options.validateWhenHidden=true', () => {
    test('form-level option flips the default for the whole form', async ({ page, helpers }) => {
      await page.goto('/#/test/cascading-validation/form-validate-when-hidden');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('form-validate-when-hidden');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const submitButton = helpers.getSubmitButton(scenario);
      const hiddenInput = scenario.locator('#mustValidate input');

      // Group hidden + form-level validateWhenHidden=true → required leaf blocks submit.
      await expect(hiddenInput).not.toBeVisible({ timeout: 5000 });
      await expect(submitButton).toBeDisabled({ timeout: 5000 });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Group cascade — hidden group skips required descendants
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Group Cascade', () => {
    test('a hidden group cascades to required leaves', async ({ page, helpers }) => {
      await page.goto('/#/test/cascading-validation/group-cascade-hidden');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('group-cascade-hidden');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const submitButton = helpers.getSubmitButton(scenario);
      const showAddressCheckbox = helpers.getCheckbox(scenario, 'showAddress');
      // street/city are inside the `address` group — DOM IDs are scoped.
      const streetInput = scenario.locator('#address_street input');
      const cityInput = scenario.locator('#address_city input');

      // Initially showAddress=false → group hidden → required leaves skip → submit enabled.
      await expect(streetInput).not.toBeVisible({ timeout: 5000 });
      await expect(cityInput).not.toBeVisible({ timeout: 5000 });
      await expect(submitButton).toBeEnabled({ timeout: 5000 });

      // Showing the group exposes the empty required leaves → submit blocks.
      await showAddressCheckbox.click();
      await expect(streetInput).toBeVisible({ timeout: 5000 });
      await expect(cityInput).toBeVisible({ timeout: 5000 });
      await expect(submitButton).toBeDisabled({ timeout: 5000 });

      // Filling them satisfies the cascade.
      await streetInput.fill('123 Main St');
      await cityInput.fill('Springfield');
      await expect(submitButton).toBeEnabled({ timeout: 5000 });

      // Hiding the group again skips validation → submit stays enabled.
      await showAddressCheckbox.click();
      await expect(streetInput).not.toBeVisible({ timeout: 5000 });
      await expect(submitButton).toBeEnabled({ timeout: 5000 });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Cascade — leaf override wins over inherited group setting
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Cascade — Leaf Override Wins', () => {
    test('leaf overrides parent validateWhenHidden=true and skips validation', async ({ page, helpers }) => {
      await page.goto('/#/test/cascading-validation/cascade-middle-override');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('cascade-middle-override');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const submitButton = helpers.getSubmitButton(scenario);

      // Outer group says validate-when-hidden=true, but the leaf overrides to false.
      // Empty required leaf inside hidden group → skipped → form valid → submit enabled.
      await expect(scenario.locator('#optedOut input')).not.toBeVisible({ timeout: 5000 });
      await expect(submitButton).toBeEnabled({ timeout: 5000 });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Advanced — array → group(hidden) → required
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Array → Hidden Required Leaves', () => {
    test('hidden required leaves in an array item skip validation per item', async ({ page, helpers }) => {
      await page.goto('/#/test/cascading-validation/array-nested-hidden-required');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('array-nested-hidden-required');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const submitButton = helpers.getSubmitButton(scenario);

      const name0 = scenario.locator('#name_0 input');
      const hasContact0 = helpers.getCheckbox(scenario, 'hasContact_0');
      const email0 = scenario.locator('#email_0 input');
      const phone0 = scenario.locator('#phone_0 input');

      // Item 0: name visible & required & empty → submit blocked.
      await expect(name0).toBeVisible({ timeout: 5000 });
      await expect(email0).not.toBeVisible({ timeout: 5000 });
      await expect(phone0).not.toBeVisible({ timeout: 5000 });
      await expect(submitButton).toBeDisabled({ timeout: 5000 });

      // Filling name → contact group still hidden so its required validators don't fire.
      await name0.fill('Alice');
      await expect(submitButton).toBeEnabled({ timeout: 5000 });

      // Toggling hasContact reveals the inner group; required email/phone now block submit.
      await hasContact0.click();
      await expect(email0).toBeVisible({ timeout: 5000 });
      await expect(phone0).toBeVisible({ timeout: 5000 });
      await expect(submitButton).toBeDisabled({ timeout: 5000 });

      // Filling email + phone clears the cascade.
      await email0.fill('alice@example.com');
      await phone0.fill('555-0000');
      await expect(submitButton).toBeEnabled({ timeout: 5000 });

      // Hiding the contact group again skips the validators (values preserved).
      await hasContact0.click();
      await expect(email0).not.toBeVisible({ timeout: 5000 });
      await expect(submitButton).toBeEnabled({ timeout: 5000 });
    });

    test('per-item independence — one item with hidden contacts, another fully expanded', async ({ page, helpers }) => {
      await page.goto('/#/test/cascading-validation/array-nested-hidden-required');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('array-nested-hidden-required');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const submitButton = helpers.getSubmitButton(scenario);
      const addButton = scenario.locator('button:has-text("Add Member")');

      const name0 = scenario.locator('#name_0 input');
      await expect(name0).toBeVisible({ timeout: 5000 });
      await name0.fill('Alice');

      await addButton.click();
      const name1 = scenario.locator('#name_1 input');
      await expect(name1).toBeVisible({ timeout: 10000 });
      await name1.fill('Bob');

      // Reveal item 1's contact group only.
      const hasContact1 = helpers.getCheckbox(scenario, 'hasContact_1');
      await hasContact1.click();

      const email1 = scenario.locator('#email_1 input');
      const phone1 = scenario.locator('#phone_1 input');
      await expect(email1).toBeVisible({ timeout: 5000 });

      // Item 0 contact hidden → its required leaves skip; item 1 visible & empty → blocks.
      await expect(submitButton).toBeDisabled({ timeout: 5000 });

      await email1.fill('bob@example.com');
      await phone1.fill('555-1111');

      // Item 0's contact still hidden (skipped) and item 1's fully filled → submit enabled.
      await expect(submitButton).toBeEnabled({ timeout: 5000 });
    });
  });
});
