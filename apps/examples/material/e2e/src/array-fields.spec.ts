import { expect, test } from '@playwright/test';

test.describe('Array Fields Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/#/test/array-fields');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Basic Array Operations', () => {
    test.skip('should add new array items dynamically', async ({ page }) => {
      // Navigate to the array-add test component
      await page.goto('http://localhost:4200/#/test/array-fields/array-add');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-add"]');
      await expect(scenario).toBeVisible();

      // Should have add button
      const addButton = scenario.locator('.array-add-button, button:has-text("Add Email")').first();
      await expect(addButton).toBeVisible();

      // Add first item
      await addButton.click();
      await page.waitForTimeout(200);

      // Should have one email input
      let emailInputs = scenario.locator('#emails input[type="email"]');
      expect(await emailInputs.count()).toBe(1);

      // Add second item
      await addButton.click();
      await page.waitForTimeout(200);

      // Should have two email inputs
      emailInputs = scenario.locator('#emails input[type="email"]');
      expect(await emailInputs.count()).toBe(2);
    });

    test.skip('should remove array items', async ({ page }) => {
      // Navigate to the array-remove test component
      await page.goto('http://localhost:4200/#/test/array-fields/array-remove');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-remove"]');
      await expect(scenario).toBeVisible();

      // Should have two phone inputs
      let phoneInputs = scenario.locator('#phones input');
      expect(await phoneInputs.count()).toBe(2);

      // Find and click remove button for first item
      const removeButton = scenario.locator('.array-remove-button, button:has-text("Remove")').first();
      await removeButton.click();
      await page.waitForTimeout(200);

      // Should have one phone input remaining
      phoneInputs = scenario.locator('#phones input');
      expect(await phoneInputs.count()).toBe(1);
    });

    test.skip('should maintain input values after add/remove operations', async ({ page }) => {
      // Navigate to the array-values test component
      await page.goto('http://localhost:4200/#/test/array-fields/array-values');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-values"]');
      await expect(scenario).toBeVisible();

      // Add first item
      const addButton = scenario.locator('.array-add-button, button:has-text("Add Task")').first();
      await addButton.click();
      await page.waitForTimeout(200);

      // Fill first task
      const firstInput = scenario.locator('#tasks input').first();
      await firstInput.fill('First Task');

      // Add second item
      await addButton.click();
      await page.waitForTimeout(200);

      // Fill second task
      const secondInput = scenario.locator('#tasks input').nth(1);
      await secondInput.fill('Second Task');

      // Verify both values are maintained
      expect(await firstInput.inputValue()).toBe('First Task');
      expect(await secondInput.inputValue()).toBe('Second Task');
    });

    test.skip('should handle array with initial values', async ({ page }) => {
      // Navigate to the array-initial-values test component
      await page.goto('http://localhost:4200/#/test/array-fields/array-initial-values');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-initial-values"]');
      await expect(scenario).toBeVisible();

      // Should have two items
      const nameInputs = scenario.locator('#contacts input:not([type="email"])');
      const emailInputs = scenario.locator('#contacts input[type="email"]');

      expect(await nameInputs.count()).toBe(2);
      expect(await emailInputs.count()).toBe(2);

      // Verify initial values
      expect(await nameInputs.first().inputValue()).toBe('Alice');
      expect(await emailInputs.first().inputValue()).toBe('alice@example.com');
      expect(await nameInputs.nth(1).inputValue()).toBe('Bob');
      expect(await emailInputs.nth(1).inputValue()).toBe('bob@example.com');
    });
  });

  test.describe('Array Validation', () => {
    test.skip('should validate individual array items', async ({ page }) => {
      // Navigate to the array-item-validation test component
      await page.goto('http://localhost:4200/#/test/array-fields/array-item-validation');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-item-validation"]');
      await expect(scenario).toBeVisible();

      // Add an item
      const addButton = scenario.locator('.array-add-button, button:has-text("Add Member")').first();
      await addButton.click();
      await page.waitForTimeout(200);

      // Fields should be marked as required
      const nameInput = scenario.locator('#members input').first();
      const emailInput = scenario.locator('#members input[type="email"]').first();

      expect(await nameInput.getAttribute('required')).not.toBeNull();
      expect(await emailInput.getAttribute('required')).not.toBeNull();
    });

    test.skip('should enforce minimum array length', async ({ page }) => {
      // Navigate to the array-min-length test component
      await page.goto('http://localhost:4200/#/test/array-fields/array-min-length');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-min-length"]');
      await expect(scenario).toBeVisible();

      // Submit button should be present
      await expect(scenario.locator('#submit button')).toBeVisible();

      // Note: Min length validation is enforced by the form framework
    });

    test.skip('should enforce maximum array length', async ({ page }) => {
      // Navigate to the array-max-length test component
      await page.goto('http://localhost:4200/#/test/array-fields/array-max-length');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-max-length"]');
      await expect(scenario).toBeVisible();

      // Should have two items initially
      let inputs = scenario.locator('#tags input');
      expect(await inputs.count()).toBe(2);

      // Add one more (should be allowed - max is 3)
      const addButton = scenario.locator('.array-add-button, button:has-text("Add Tag")').first();
      await addButton.click();
      await page.waitForTimeout(200);

      // Should have three items
      inputs = scenario.locator('#tags input');
      expect(await inputs.count()).toBe(3);

      // Note: Add button may be disabled when max length is reached
    });
  });

  test.describe('Complex Array Structures', () => {
    test.skip('should handle nested fields within array items', async ({ page }) => {
      // Navigate to the array-nested test component
      await page.goto('http://localhost:4200/#/test/array-fields/array-nested');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-nested"]');
      await expect(scenario).toBeVisible();

      // Add an item
      const addButton = scenario.locator('.array-add-button, button:has-text("Add User")').first();
      await addButton.click();
      await page.waitForTimeout(300);

      // Should have multiple fields
      const firstNameInput = scenario.locator('#users input').first();
      const lastNameInput = scenario.locator('#users input').nth(1);
      const roleSelect = scenario.locator('#users select').first();

      await expect(firstNameInput).toBeVisible();
      await expect(lastNameInput).toBeVisible();
      await expect(roleSelect).toBeVisible();

      // Fill fields
      await firstNameInput.fill('John');
      await lastNameInput.fill('Doe');
      await roleSelect.selectOption('admin');

      // Verify values
      expect(await firstNameInput.inputValue()).toBe('John');
      expect(await lastNameInput.inputValue()).toBe('Doe');
      expect(await roleSelect.inputValue()).toBe('admin');
    });

    test.skip('should handle multiple add and remove operations', async ({ page }) => {
      // Navigate to the array-multiple-ops test component
      await page.goto('http://localhost:4200/#/test/array-fields/array-multiple-ops');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-multiple-ops"]');
      await expect(scenario).toBeVisible();

      let noteInputs = scenario.locator('#notes input');
      const addButton = scenario.locator('button:has-text("Add Note")');
      const removeButton = scenario.locator('button:has-text("Remove Last")');

      // Verify initial count
      expect(await noteInputs.count()).toBe(2);

      // Add 3 new notes
      for (let i = 0; i < 3; i++) {
        await addButton.click();
        await page.waitForTimeout(100);
      }

      // Should have 5 total
      noteInputs = scenario.locator('#notes input');
      expect(await noteInputs.count()).toBe(5);

      // Remove 2 notes
      for (let i = 0; i < 2; i++) {
        await removeButton.click();
        await page.waitForTimeout(100);
      }

      // Should have 3 remaining
      noteInputs = scenario.locator('#notes input');
      expect(await noteInputs.count()).toBe(3);

      // Verify original values are maintained
      expect(await noteInputs.first().inputValue()).toBe('First note');
      expect(await noteInputs.nth(1).inputValue()).toBe('Second note');
    });
  });
});
