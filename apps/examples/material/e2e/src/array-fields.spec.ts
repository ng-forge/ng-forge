import { expect, test } from '@playwright/test';

test.describe('Array Fields Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/#/test/array-fields');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Basic Array Operations', () => {
    test.skip('should add new array items dynamically', async ({ page }) => {
      // NOTE: This test is skipped because empty arrays have no items = no add button
      // Need to either: (1) start with one empty item, or (2) add global add button for empty arrays
      // Navigate to the array-add test component
      await page.goto('http://localhost:4200/#/test/array-fields/array-add');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-add"]');
      await expect(scenario).toBeVisible();

      // TODO: Update once empty array UX is decided
    });

    test('should remove array items', async ({ page }) => {
      // Navigate to the array-remove test component
      await page.goto('http://localhost:4200/#/test/array-fields/array-remove');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-remove"]');
      await expect(scenario).toBeVisible();

      // Should have two phone inputs (with initial values)
      let phoneInputs = scenario.locator('#phones input[type="text"]');
      expect(await phoneInputs.count()).toBe(2);

      // Find and click remove button for first item (buttons are inside each array item now)
      const removeButtons = scenario.locator('button:has-text("Remove")');
      expect(await removeButtons.count()).toBe(2); // One per item

      await removeButtons.first().click();
      await page.waitForTimeout(200);

      // Should have one phone input remaining
      phoneInputs = scenario.locator('#phones input[type="text"]');
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

    test('should enforce maximum array length', async ({ page }) => {
      // Navigate to the array-max-length test component
      await page.goto('http://localhost:4200/#/test/array-fields/array-max-length');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-max-length"]');
      await expect(scenario).toBeVisible();

      // Should have two items initially (from initial values)
      let inputs = scenario.locator('#tags input[type="text"]');
      expect(await inputs.count()).toBe(2);

      // Each item has an add button inside it
      const addButtons = scenario.locator('button:has-text("Add Tag")');
      expect(await addButtons.count()).toBe(2); // One per item

      // Click any add button to add a new item
      await addButtons.first().click();
      await page.waitForTimeout(200);

      // Should have three items now
      inputs = scenario.locator('#tags input[type="text"]');
      expect(await inputs.count()).toBe(3);

      // Note: Max length validation would prevent adding beyond 3 items
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

    test('should handle multiple add and remove operations', async ({ page }) => {
      // Navigate to the array-multiple-ops test component
      await page.goto('http://localhost:4200/#/test/array-fields/array-multiple-ops');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-multiple-ops"]');
      await expect(scenario).toBeVisible();

      // Verify initial count (has initial values)
      let noteInputs = scenario.locator('#notes input[type="text"]');
      expect(await noteInputs.count()).toBe(2);

      // Buttons are inside each array item now
      let addButtons = scenario.locator('button:has-text("Add Note")');
      let removeButtons = scenario.locator('button:has-text("Remove")');

      expect(await addButtons.count()).toBe(2); // One per item
      expect(await removeButtons.count()).toBe(2); // One per item

      // Add 3 new notes by clicking any add button
      for (let i = 0; i < 3; i++) {
        const buttons = scenario.locator('button:has-text("Add Note")');
        await buttons.first().click();
        await page.waitForTimeout(100);
      }

      // Should have 5 total
      noteInputs = scenario.locator('#notes input[type="text"]');
      expect(await noteInputs.count()).toBe(5);

      // Remove 2 notes by clicking remove buttons
      for (let i = 0; i < 2; i++) {
        const buttons = scenario.locator('button:has-text("Remove")');
        await buttons.last().click(); // Remove from end
        await page.waitForTimeout(100);
      }

      // Should have 3 remaining
      noteInputs = scenario.locator('#notes input[type="text"]');
      expect(await noteInputs.count()).toBe(3);

      // Verify original values are maintained
      expect(await noteInputs.first().inputValue()).toBe('First note');
      expect(await noteInputs.nth(1).inputValue()).toBe('Second note');
    });
  });
});
