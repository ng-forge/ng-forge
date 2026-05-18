import type { Locator } from '@playwright/test';
import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { fillInput } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck();

async function fillVisibleInput(scenario: Locator, selector: string, value: string): Promise<void> {
  const input = scenario.locator(selector);
  await expect(input).toBeVisible({ timeout: 5000 });
  await input.fill(value);
}

test.describe('Container Nesting E2E Tests', () => {
  // Array inside group (group > row > array) is a known library limitation.
  // The array fields inside a row inside a group do not render their items.
  test.describe('Array Inside Group', () => {
    test.skip(true, 'Library limitation: array inside group via row does not render array items');
    test('should render and interact with array fields inside a group', async ({ page, helpers }) => {
      await page.goto('/#/test/container-nesting/array-inside-group');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('array-inside-group');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const teamNameInput = scenario.locator('#teamName input');
      await expect(teamNameInput).toBeVisible({ timeout: 5000 });
      await teamNameInput.fill('Engineering');

      const addButton = scenario.locator('button:has-text("Add Member")');
      await addButton.click();

      const memberNameInput = scenario.locator('#name_0 input');
      await expect(memberNameInput).toBeVisible({ timeout: 5000 });
      await memberNameInput.fill('Alice');

      const roleInput = scenario.locator('#role_0 input');
      await roleInput.fill('Lead');

      const data = await helpers.submitFormAndCapture(scenario);
      expect(data).toHaveProperty('team');
    });
  });

  test.describe('Group Inside Array', () => {
    test('should render and interact with group fields inside array items', async ({ page, helpers }) => {
      await page.goto('/#/test/container-nesting/group-inside-array');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('group-inside-array');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Fill first employee name (field ID: employeeName_0)
      const empNameInput = scenario.locator('#employeeName_0 input');
      await expect(empNameInput).toBeVisible({ timeout: 5000 });
      await empNameInput.fill('Charlie');

      // Fill address group inside array item — group prefix + array index
      // produce IDs like `address_street_0`.
      const streetInput = scenario.locator('#address_street_0 input');
      const cityInput = scenario.locator('#address_city_0 input');
      await expect(streetInput).toBeVisible({ timeout: 5000 });
      await streetInput.fill('123 Main St');
      await cityInput.fill('Springfield');

      // Add another employee
      const addButton = scenario.locator('button:has-text("Add Employee")');
      await addButton.click();
      const secondEmpName = scenario.locator('#employeeName_1 input');
      await expect(secondEmpName).toBeVisible({ timeout: 5000 });

      // Submit and verify nested structure
      const data = await helpers.submitFormAndCapture(scenario);
      expect(data).toHaveProperty('employees');
      const employees = data['employees'] as Record<string, unknown>[];
      expect(employees[0]).toHaveProperty('address');
      const address = employees[0]['address'] as Record<string, unknown>;
      expect(address['street']).toBe('123 Main St');
      expect(address['city']).toBe('Springfield');
    });
  });

  test.describe('Row Inside Array', () => {
    test('should render row layout within array items', async ({ page, helpers }) => {
      await page.goto('/#/test/container-nesting/row-inside-array');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('row-inside-array');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Fill first product row fields (field IDs: product_0, price_0, quantity_0)
      const productInput = scenario.locator('#product_0 input');
      await expect(productInput).toBeVisible({ timeout: 5000 });
      await productInput.fill('Widget');

      const priceInput = scenario.locator('#price_0 input');
      await expect(priceInput).toBeVisible({ timeout: 5000 });
      await priceInput.fill('9.99');

      const quantityInput = scenario.locator('#quantity_0 input');
      await expect(quantityInput).toBeVisible({ timeout: 5000 });
      await quantityInput.fill('10');

      // Add another product
      const addButton = scenario.locator('button:has-text("Add Product")');
      await addButton.click();
      const secondProductInput = scenario.locator('#product_1 input');
      await expect(secondProductInput).toBeVisible({ timeout: 5000 });
      await secondProductInput.fill('Gadget');

      // Submit and verify
      const data = await helpers.submitFormAndCapture(scenario);
      expect(data).toHaveProperty('products');
      const products = data['products'] as Record<string, unknown>[];
      expect(products).toHaveLength(2);
      expect(products[0]['product']).toBe('Widget');
      expect(products[0]['price']).toBe(9.99);
      expect(products[0]['quantity']).toBe(10);
    });
  });

  test.describe('Row Inside Container', () => {
    test('should render a row inside a container and submit the flat values', async ({ page, helpers }) => {
      await page.goto('/#/test/container-nesting/row-inside-container');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('row-inside-container');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await fillVisibleInput(scenario, '#street input', '500 Forge Ln');
      await fillVisibleInput(scenario, '#unit input', '4B');
      await fillVisibleInput(scenario, '#city input', 'Springfield');

      const data = await helpers.submitFormAndCapture(scenario);
      // Container + row are both layout-only — values flatten into the parent.
      expect(data['street']).toBe('500 Forge Ln');
      expect(data['unit']).toBe('4B');
      expect(data['city']).toBe('Springfield');
    });
  });

  test.describe('Container Inside Row', () => {
    test('should render a container inside a row and submit the flat values', async ({ page, helpers }) => {
      await page.goto('/#/test/container-nesting/container-inside-row');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('container-inside-row');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await fillVisibleInput(scenario, '#firstName input', 'Ada');
      await fillVisibleInput(scenario, '#nickname input', 'Lovelace');
      await fillVisibleInput(scenario, '#pronouns input', 'she/her');

      const data = await helpers.submitFormAndCapture(scenario);
      // Row + container are both layout-only — values flatten into the parent.
      expect(data['firstName']).toBe('Ada');
      expect(data['nickname']).toBe('Lovelace');
      expect(data['pronouns']).toBe('she/her');
    });
  });

  test.describe('Container Inside Group', () => {
    test('should fire derivation for an input nested as group > container > input', async ({ page, helpers }) => {
      await page.goto('/#/test/container-nesting/container-inside-group');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('container-inside-group');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // DOM IDs of fields inside a group are scoped: `state` becomes `address_state`.
      const stateInput = scenario.locator('#address_state input');
      await expect(stateInput).toBeVisible({ timeout: 5000 });
      await fillInput(stateInput, 'tx');

      // Derivation should self-transform the value to uppercase.
      await expect(stateInput).toHaveValue('TX', { timeout: 5000 });

      const data = await helpers.submitFormAndCapture(scenario);
      // Container is layout-only — `state` lives under the `address` group boundary.
      const address = data['address'] as Record<string, unknown>;
      expect(address['state']).toBe('TX');
    });

    test('should resolve $self in dependsOn for an input nested as group > container > input', async ({ page, helpers }) => {
      await page.goto('/#/test/container-nesting/container-inside-group-self');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('container-inside-group-self');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const stateInput = scenario.locator('#address_state input');
      await expect(stateInput).toBeVisible({ timeout: 5000 });
      await fillInput(stateInput, 'tx');

      // $self resolves to `address.state` so the derivation fires and writes back.
      await expect(stateInput).toHaveValue('TX', { timeout: 5000 });

      const data = await helpers.submitFormAndCapture(scenario);
      const address = data['address'] as Record<string, unknown>;
      expect(address['state']).toBe('TX');
    });

    test('should fire derivation when any sibling in the parent group changes via $group', async ({ page, helpers }) => {
      await page.goto('/#/test/container-nesting/container-inside-group-parent');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('container-inside-group-parent');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const countryInput = scenario.locator('#address_country input');
      const stateInput = scenario.locator('#address_state input');
      await expect(countryInput).toBeVisible({ timeout: 5000 });

      // $group resolves to 'address' — fires the derivation on any sibling change.
      await fillInput(countryInput, 'usa');
      await expect(stateInput).toHaveValue('NY', { timeout: 5000 });

      await fillInput(countryInput, 'canada');
      await expect(stateInput).toHaveValue('ON', { timeout: 5000 });

      const data = await helpers.submitFormAndCapture(scenario);
      const address = data['address'] as Record<string, unknown>;
      expect(address['country']).toBe('canada');
      expect(address['state']).toBe('ON');
    });
  });

  // Deeply nested (group > row > array > group) is a known library limitation.
  // Same issue as array-inside-group: arrays nested inside groups via rows don't render items.
  test.describe('Deeply Nested Containers', () => {
    test.skip(true, 'Library limitation: array inside group via row does not render array items');
    test('should handle group > row > array > group nesting', async ({ page, helpers }) => {
      await page.goto('/#/test/container-nesting/deeply-nested');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('deeply-nested');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const orgNameInput = scenario.locator('#orgName input');
      await expect(orgNameInput).toBeVisible({ timeout: 5000 });
      await orgNameInput.fill('Acme Corp');

      const addButton = scenario.locator('button:has-text("Add Department")');
      await addButton.click();

      const deptNameInput = scenario.locator('#name_0 input');
      await expect(deptNameInput).toBeVisible({ timeout: 10000 });
      await deptNameInput.fill('R&D');

      const budgetInput = scenario.locator('#budget_0 input');
      await expect(budgetInput).toBeVisible({ timeout: 5000 });
      await budgetInput.fill('50000');

      const data = await helpers.submitFormAndCapture(scenario);
      expect(data).toHaveProperty('organization');
    });
  });
});
