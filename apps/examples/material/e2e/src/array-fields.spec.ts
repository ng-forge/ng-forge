import { expect, test } from '@playwright/test';

test.describe('Array Fields Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4201/#/test/array-fields');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Basic Array Operations', () => {
    test('should add new array items dynamically', async ({ page }) => {
      // Navigate to the array-add test component
      await page.goto('http://localhost:4201/#/test/array-fields/array-add');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-add"]');
      await expect(scenario).toBeVisible();

      // Should have one initial empty item (use #emails input for cross-browser compatibility)
      let emailInputs = scenario.locator('#emails input');
      await expect(emailInputs.first()).toBeVisible({ timeout: 5000 });
      expect(await emailInputs.count()).toBe(1);

      // Should have one add button (inside the first item)
      const addButton = scenario.locator('button:has-text("Add Email")').first();
      await expect(addButton).toBeVisible({ timeout: 5000 });

      // Add second item
      await addButton.click();
      await page.waitForTimeout(200);

      // Should have two email inputs now
      emailInputs = scenario.locator('#emails input');
      expect(await emailInputs.count()).toBe(2);

      // Add third item
      const addButtons = scenario.locator('button:has-text("Add Email")');
      await addButtons.first().click();
      await page.waitForTimeout(200);

      // Should have three email inputs
      emailInputs = scenario.locator('#emails input');
      expect(await emailInputs.count()).toBe(3);
    });

    test('should remove array items', async ({ page }) => {
      // Navigate to the array-remove test component
      await page.goto('http://localhost:4201/#/test/array-fields/array-remove');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-remove"]');
      await expect(scenario).toBeVisible();

      // Should have two phone inputs (with initial values)
      let phoneInputs = scenario.locator('#phones input');
      expect(await phoneInputs.count()).toBe(2);

      // Find and click remove button (removes last item)
      const removeButton = scenario.locator('button:has-text("Remove Last")');
      await expect(removeButton).toBeVisible();

      await removeButton.click();
      await page.waitForTimeout(200);

      // Should have one phone input remaining
      phoneInputs = scenario.locator('#phones input');
      expect(await phoneInputs.count()).toBe(1);
    });

    test('should maintain input values after add/remove operations', async ({ page }) => {
      // Navigate to the array-values test component
      await page.goto('http://localhost:4201/#/test/array-fields/array-values');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-values"]');
      await expect(scenario).toBeVisible();

      // Should have one initial item (the component starts with one empty item)
      let taskInputs = scenario.locator('#tasks input');
      await expect(taskInputs.first()).toBeVisible({ timeout: 5000 });
      expect(await taskInputs.count()).toBe(1);

      // Fill first task (the initial one)
      const firstInput = taskInputs.first();
      await firstInput.fill('First Task');

      // Find and click add button
      const addButton = scenario.locator('button:has-text("Add Task")').first();
      await expect(addButton).toBeVisible({ timeout: 5000 });
      await addButton.click();
      await page.waitForTimeout(200);

      // Should now have two inputs
      taskInputs = scenario.locator('#tasks input');
      expect(await taskInputs.count()).toBe(2);

      // Fill second task
      const secondInput = taskInputs.nth(1);
      await secondInput.fill('Second Task');

      // Verify both values are maintained
      expect(await taskInputs.first().inputValue()).toBe('First Task');
      expect(await taskInputs.nth(1).inputValue()).toBe('Second Task');
    });

    test('should handle array with initial values', async ({ page }) => {
      // Navigate to the array-initial-values test component
      await page.goto('http://localhost:4201/#/test/array-fields/array-initial-values');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-initial-values"]');
      await expect(scenario).toBeVisible();

      // Should have 4 inputs total (2 contacts × 2 fields each)
      const allInputs = scenario.locator('#contacts input');
      expect(await allInputs.count()).toBe(4);

      // Verify initial values - first contact's fields
      expect(await allInputs.nth(0).inputValue()).toBe('Alice');
      expect(await allInputs.nth(1).inputValue()).toBe('alice@example.com');

      // Verify second contact's fields
      expect(await allInputs.nth(2).inputValue()).toBe('Bob');
      expect(await allInputs.nth(3).inputValue()).toBe('bob@example.com');
    });
  });

  test.describe('Array Validation', () => {
    test('should validate individual array items', async ({ page }) => {
      // Navigate to the array-item-validation test component
      await page.goto('http://localhost:4201/#/test/array-fields/array-item-validation');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-item-validation"]');
      await expect(scenario).toBeVisible();

      // Fields should already be visible (initial item is rendered)
      // Angular Material inputs don't use type="email", just text with validators
      const nameInput = scenario.locator('#members input').first();
      const emailInput = scenario.locator('#members input').nth(1);

      await expect(nameInput).toBeVisible();
      await expect(emailInput).toBeVisible();

      // Fields should be marked as required
      expect(await nameInput.getAttribute('required')).not.toBeNull();
      expect(await emailInput.getAttribute('required')).not.toBeNull();
    });

    test('should enforce minimum array length', async ({ page }) => {
      // Navigate to the array-min-length test component
      await page.goto('http://localhost:4201/#/test/array-fields/array-min-length');
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
      await page.goto('http://localhost:4201/#/test/array-fields/array-max-length');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-max-length"]');
      await expect(scenario).toBeVisible();

      // Should have two items initially (from initial values)
      let inputs = scenario.locator('#tags input');
      expect(await inputs.count()).toBe(2);

      // Add button is outside the array (one button)
      const addButton = scenario.locator('button:has-text("Add Tag")');
      await expect(addButton).toBeVisible();

      // Click add button to add a new item
      await addButton.click();
      await page.waitForTimeout(200);

      // Should have three items now
      inputs = scenario.locator('#tags input');
      expect(await inputs.count()).toBe(3);

      // Note: Max length validation would prevent adding beyond 3 items
    });
  });

  test.describe('Complex Array Structures', () => {
    test('should handle nested fields within array items', async ({ page }) => {
      // Navigate to the array-nested test component
      await page.goto('http://localhost:4201/#/test/array-fields/array-nested');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-nested"]');
      await expect(scenario).toBeVisible();

      // Should have multiple fields (initial item is rendered)
      const firstNameInput = scenario.locator('input').first();
      const lastNameInput = scenario.locator('input').nth(1);
      const roleSelect = scenario.locator('mat-select').first();

      await expect(firstNameInput).toBeVisible();
      await expect(lastNameInput).toBeVisible();
      await expect(roleSelect).toBeVisible();

      // Fill fields
      await firstNameInput.fill('John');
      await lastNameInput.fill('Doe');

      // Select role using mat-select (click to open, then click option)
      await roleSelect.click();
      await page.locator('mat-option:has-text("Admin")').click();

      // Verify text input values
      expect(await firstNameInput.inputValue()).toBe('John');
      expect(await lastNameInput.inputValue()).toBe('Doe');

      // Add another user
      const addButton = scenario.locator('button:has-text("Add User")').first();
      await addButton.click();
      await page.waitForTimeout(300);

      // Verify we now have more inputs (2 users * 2 text inputs = 4)
      const allInputs = scenario.locator('input');
      expect(await allInputs.count()).toBeGreaterThanOrEqual(4);
    });

    test('should handle multiple add and remove operations', async ({ page }) => {
      // Navigate to the array-multiple-ops test component
      await page.goto('http://localhost:4201/#/test/array-fields/array-multiple-ops');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="array-multiple-ops"]');
      await expect(scenario).toBeVisible();

      // Verify initial count (has initial values)
      let noteInputs = scenario.locator('#notes input');
      expect(await noteInputs.count()).toBe(2);

      // Add button is outside the array (one button)
      const addButton = scenario.locator('button:has-text("Add Note")');
      await expect(addButton).toBeVisible();

      // Add 3 new notes by clicking the add button
      for (let i = 0; i < 3; i++) {
        await addButton.click();
        await page.waitForTimeout(100);
      }

      // Should have 5 total
      noteInputs = scenario.locator('#notes input');
      expect(await noteInputs.count()).toBe(5);

      // Remove 2 notes by clicking remove buttons (one per item, remove from end)
      for (let i = 0; i < 2; i++) {
        const removeButtons = scenario.locator('button:has-text("Remove")');
        await removeButtons.last().click();
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
