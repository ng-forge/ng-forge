import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

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

      // Fill address group inside array item (field IDs: street_0, city_0)
      const streetInput = scenario.locator('#street_0 input');
      const cityInput = scenario.locator('#city_0 input');
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
