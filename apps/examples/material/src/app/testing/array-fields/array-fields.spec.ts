import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Array Fields E2E Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/array-fields');
  });

  test.describe('Basic Array Operations', () => {
    test('should add new array items dynamically', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-add');
      await page.goto('/#/test/array-fields/array-add');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Should have one initial empty item (use #emails input for cross-browser compatibility)
      const emailInputs = scenario.locator('#emails input');
      await expect(emailInputs.first()).toBeVisible({ timeout: 10000 });
      await expect(emailInputs).toHaveCount(1, { timeout: 10000 });

      // Screenshot: Initial array with one item
      await helpers.expectScreenshotMatch(scenario, 'material-array-add-initial');

      // Should have one add button (inside the first item)
      const addButton = scenario.locator('button:has-text("Add Email")').first();
      await expect(addButton).toBeVisible({ timeout: 5000 });
      await expect(addButton).toBeEnabled({ timeout: 5000 });

      // Add second item
      await addButton.click();
      await expect(emailInputs).toHaveCount(2, { timeout: 10000 });

      // Add third item
      const addButtons = scenario.locator('button:has-text("Add Email")');
      await expect(addButtons.first()).toBeEnabled({ timeout: 5000 });
      await addButtons.first().click();
      await expect(emailInputs).toHaveCount(3, { timeout: 10000 });

      // Screenshot: Array with three items
      await helpers.expectScreenshotMatch(scenario, 'material-array-add-three-items');
    });

    test('should remove array items', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-remove');
      await page.goto('/#/test/array-fields/array-remove');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Should have two phone inputs (with initial values)
      const phoneInputs = scenario.locator('#phones input');
      await expect(phoneInputs).toHaveCount(2, { timeout: 10000 });

      // Find and click remove button (removes last item)
      const removeButton = scenario.locator('button:has-text("Remove Last")');
      await expect(removeButton).toBeVisible({ timeout: 5000 });
      await expect(removeButton).toBeEnabled({ timeout: 5000 });

      await removeButton.click();
      await expect(phoneInputs).toHaveCount(1, { timeout: 10000 });
    });

    test('should maintain input values after add/remove operations', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-values');
      await page.goto('/#/test/array-fields/array-values');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Should have one initial item (the component starts with one empty item)
      const taskInputs = scenario.locator('#tasks input');
      await expect(taskInputs.first()).toBeVisible({ timeout: 10000 });
      await expect(taskInputs).toHaveCount(1, { timeout: 10000 });

      // Fill first task (the initial one)
      const firstInput = taskInputs.first();
      await firstInput.fill('First Task');

      // Find and click add button
      const addButton = scenario.locator('button:has-text("Add Task")').first();
      await expect(addButton).toBeVisible({ timeout: 5000 });
      await expect(addButton).toBeEnabled({ timeout: 5000 });
      await addButton.click();
      await expect(taskInputs).toHaveCount(2, { timeout: 10000 });

      // Fill second task
      const secondInput = taskInputs.nth(1);
      await secondInput.fill('Second Task');

      // Verify both values are maintained
      await expect(taskInputs.first()).toHaveValue('First Task', { timeout: 5000 });
      await expect(taskInputs.nth(1)).toHaveValue('Second Task', { timeout: 5000 });
    });

    test('should handle array with initial values', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-initial-values');
      await page.goto('/#/test/array-fields/array-initial-values');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Should have 4 inputs total (2 contacts × 2 fields each)
      const allInputs = scenario.locator('#contacts input');
      await expect(allInputs).toHaveCount(4, { timeout: 10000 });

      // Verify initial values - first contact's fields
      await expect(allInputs.nth(0)).toHaveValue('Alice', { timeout: 5000 });
      await expect(allInputs.nth(1)).toHaveValue('alice@example.com', { timeout: 5000 });

      // Verify second contact's fields
      await expect(allInputs.nth(2)).toHaveValue('Bob', { timeout: 5000 });
      await expect(allInputs.nth(3)).toHaveValue('bob@example.com', { timeout: 5000 });
    });
  });

  test.describe('Semantic Array Events (PR #218)', () => {
    test('should prepend items at the beginning of the array', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-prepend');
      await page.goto('/#/test/array-fields/array-prepend');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Should have two initial items
      const inputs = scenario.locator('#items input');
      await expect(inputs).toHaveCount(2, { timeout: 10000 });

      // Verify initial values
      await expect(inputs.nth(0)).toHaveValue('First', { timeout: 5000 });
      await expect(inputs.nth(1)).toHaveValue('Second', { timeout: 5000 });

      // Click prepend button
      const prependButton = scenario.locator('button:has-text("Prepend Item")');
      await expect(prependButton).toBeVisible({ timeout: 5000 });
      await prependButton.click();

      // Should now have three items
      await expect(inputs).toHaveCount(3, { timeout: 10000 });

      // Original items should have shifted to indices 1 and 2
      await expect(inputs.nth(1)).toHaveValue('First', { timeout: 5000 });
      await expect(inputs.nth(2)).toHaveValue('Second', { timeout: 5000 });

      // New item at index 0 should be empty
      await expect(inputs.nth(0)).toHaveValue('', { timeout: 5000 });
    });

    test('should shift (remove first) items from array', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-shift');
      await page.goto('/#/test/array-fields/array-shift');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Should have three initial items
      const inputs = scenario.locator('#items input');
      await expect(inputs).toHaveCount(3, { timeout: 10000 });

      // Verify initial values
      await expect(inputs.nth(0)).toHaveValue('First', { timeout: 5000 });
      await expect(inputs.nth(1)).toHaveValue('Second', { timeout: 5000 });
      await expect(inputs.nth(2)).toHaveValue('Third', { timeout: 5000 });

      // Click shift button (remove first)
      const shiftButton = scenario.locator('button:has-text("Remove First")');
      await expect(shiftButton).toBeVisible({ timeout: 5000 });
      await shiftButton.click();

      // Should now have two items
      await expect(inputs).toHaveCount(2, { timeout: 10000 });

      // First item should now be what was previously second
      await expect(inputs.nth(0)).toHaveValue('Second', { timeout: 5000 });
      await expect(inputs.nth(1)).toHaveValue('Third', { timeout: 5000 });
    });

    test('should insert items at specific indices', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-insert-at-index');
      await page.goto('/#/test/array-fields/array-insert-at-index');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Should have two initial items
      const inputs = scenario.locator('#items input');
      await expect(inputs).toHaveCount(2, { timeout: 10000 });

      // Verify initial values: First, Third (gap at index 1)
      await expect(inputs.nth(0)).toHaveValue('First', { timeout: 5000 });
      await expect(inputs.nth(1)).toHaveValue('Third', { timeout: 5000 });

      // Click insert at index 1 button
      const insertButton = scenario.locator('button:has-text("Insert at Index 1")');
      await expect(insertButton).toBeVisible({ timeout: 5000 });
      await insertButton.click();

      // Should now have three items
      await expect(inputs).toHaveCount(3, { timeout: 10000 });

      // Original items should be at indices 0 and 2
      await expect(inputs.nth(0)).toHaveValue('First', { timeout: 5000 });
      await expect(inputs.nth(1)).toHaveValue('', { timeout: 5000 }); // New item
      await expect(inputs.nth(2)).toHaveValue('Third', { timeout: 5000 });
    });

    test('should remove items at specific indices', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-remove-at-index');
      await page.goto('/#/test/array-fields/array-remove-at-index');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Should have three initial items
      const inputs = scenario.locator('#items input');
      await expect(inputs).toHaveCount(3, { timeout: 10000 });

      // Verify initial values
      await expect(inputs.nth(0)).toHaveValue('First', { timeout: 5000 });
      await expect(inputs.nth(1)).toHaveValue('Second', { timeout: 5000 });
      await expect(inputs.nth(2)).toHaveValue('Third', { timeout: 5000 });

      // Click remove at index 1 button
      const removeButton = scenario.locator('button:has-text("Remove at Index 1")');
      await expect(removeButton).toBeVisible({ timeout: 5000 });
      await removeButton.click();

      // Should now have two items
      await expect(inputs).toHaveCount(2, { timeout: 10000 });

      // First and Third should remain
      await expect(inputs.nth(0)).toHaveValue('First', { timeout: 5000 });
      await expect(inputs.nth(1)).toHaveValue('Third', { timeout: 5000 });
    });
  });

  test.describe('DOM ID Uniqueness (PR #219)', () => {
    test('should generate unique DOM IDs for each array item', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-dom-id-uniqueness');
      await page.goto('/#/test/array-fields/array-dom-id-uniqueness');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Add multiple items
      const addButton = scenario.locator('button:has-text("Add User")');
      await expect(addButton).toBeVisible({ timeout: 5000 });
      await addButton.click();
      await addButton.click();

      // Should now have 3 users (1 initial + 2 added)
      const inputs = scenario.locator('#users input');
      await expect(inputs).toHaveCount(6, { timeout: 10000 }); // 3 users × 2 fields

      // Get all input IDs
      const ids = await inputs.evaluateAll((els) => els.map((e) => e.id).filter((id) => id));

      // Verify we have IDs for all inputs
      expect(ids.length).toBeGreaterThan(0);

      // Verify uniqueness - no duplicate IDs
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);

      // Verify IDs contain index suffix pattern (underscore followed by digits)
      for (const id of ids) {
        expect(id).toMatch(/_\d+/);
      }
    });

    test('should maintain unique IDs after adding and removing items', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-dom-id-uniqueness');
      await page.goto('/#/test/array-fields/array-dom-id-uniqueness');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const addButton = scenario.locator('button:has-text("Add User")');
      const inputs = scenario.locator('#users input');

      // Add items
      await addButton.click();
      await addButton.click();
      await addButton.click();

      // Should have 4 users × 2 fields = 8 inputs
      await expect(inputs).toHaveCount(8, { timeout: 10000 });

      // Collect IDs before removal
      const idsBefore = await inputs.evaluateAll((els) => els.map((e) => e.id).filter((id) => id));

      // All IDs should be unique
      const uniqueIdsBefore = new Set(idsBefore);
      expect(uniqueIdsBefore.size).toBe(idsBefore.length);
    });
  });

  test.describe('Array Validation', () => {
    test('should validate individual array items', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-item-validation');
      await page.goto('/#/test/array-fields/array-item-validation');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible();

      // Fields should already be visible (initial item is rendered)
      const nameInput = scenario.locator('#members input').first();
      const emailInput = scenario.locator('#members input').nth(1);

      await expect(nameInput).toBeVisible();
      await expect(emailInput).toBeVisible();

      // Fields should be marked as required
      expect(await nameInput.getAttribute('required')).not.toBeNull();
      expect(await emailInput.getAttribute('required')).not.toBeNull();

      // Touch fields and blur to trigger validation errors
      await nameInput.focus();
      await nameInput.blur();
      await emailInput.focus();
      await emailInput.blur();

      // Error messages should be visible for empty required fields
      const nameErrors = scenario.locator('#name_0 mat-error');
      const emailErrors = scenario.locator('#email_0 mat-error');
      await expect(nameErrors).toBeVisible({ timeout: 5000 });
      await expect(emailErrors).toBeVisible({ timeout: 5000 });

      // Fill name and verify error clears
      await nameInput.fill('John');
      await expect(nameErrors).not.toBeVisible({ timeout: 5000 });

      // Fill email and verify error clears
      await emailInput.fill('john@example.com');
      await expect(emailErrors).not.toBeVisible({ timeout: 5000 });
    });

    test('should enforce minimum array length', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-min-length');
      await page.goto('/#/test/array-fields/array-min-length');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible();

      // Should start with one item
      const inputs = scenario.locator('#items input');
      await expect(inputs).toHaveCount(1, { timeout: 10000 });

      // Submit button should be present and functional
      const submitButton = scenario.locator('#submit button');
      await expect(submitButton).toBeVisible();

      // Add another item
      const addButton = scenario.locator('button:has-text("Add Item")');
      await addButton.click();
      await expect(inputs).toHaveCount(2, { timeout: 5000 });

      // Fill both items and submit
      await inputs.nth(0).fill('Item A');
      await inputs.nth(1).fill('Item B');

      const data = await helpers.submitFormAndCapture(scenario);
      expect(data).toHaveProperty('items');
      const items = data['items'] as Record<string, unknown>[];
      expect(items).toHaveLength(2);
      expect(items[0]['item']).toBe('Item A');
      expect(items[1]['item']).toBe('Item B');
    });

    test('should enforce maximum array length', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-max-length');
      await page.goto('/#/test/array-fields/array-max-length');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Should have two items initially (from initial values)
      const inputs = scenario.locator('#tags input');
      await expect(inputs).toHaveCount(2, { timeout: 10000 });

      // Add button is outside the array (one button)
      const addButton = scenario.locator('button:has-text("Add Tag")');
      await expect(addButton).toBeVisible({ timeout: 5000 });
      await expect(addButton).toBeEnabled({ timeout: 5000 });

      // Click add button to add a new item
      await addButton.click();
      await expect(inputs).toHaveCount(3, { timeout: 10000 });
    });
  });

  test.describe('Complex Array Structures', () => {
    test('should handle nested fields within array items', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-nested');
      await page.goto('/#/test/array-fields/array-nested');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Should have multiple fields (initial item is rendered)
      const firstNameInput = scenario.locator('input').first();
      const lastNameInput = scenario.locator('input').nth(1);
      const roleSelect = scenario.locator('mat-select').first();

      await expect(firstNameInput).toBeVisible({ timeout: 10000 });
      await expect(lastNameInput).toBeVisible({ timeout: 5000 });
      await expect(roleSelect).toBeVisible({ timeout: 5000 });

      // Fill fields
      await firstNameInput.fill('John');
      await lastNameInput.fill('Doe');

      // Select role using mat-select (click to open, then click option)
      await roleSelect.click();
      await page.locator('mat-option:has-text("Admin")').click();

      // Verify text input values
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });

      // Add another user
      const addButton = scenario.locator('button:has-text("Add User")').first();
      await expect(addButton).toBeEnabled({ timeout: 5000 });
      await addButton.click();
      // Wait for more inputs (2 users * 2 text inputs = 4)
      const allInputs = scenario.locator('input');
      await expect(allInputs).toHaveCount(4, { timeout: 10000 });
    });

    test('should handle multiple add and remove operations', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-multiple-ops');
      await page.goto('/#/test/array-fields/array-multiple-ops');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Verify initial count (has initial values)
      await expect(scenario.locator('#notes input')).toHaveCount(2, { timeout: 10000 });

      // Add button is outside the array (one button)
      const addButton = scenario.locator('button:has-text("Add Note")');
      await expect(addButton).toBeVisible({ timeout: 5000 });
      await expect(addButton).toBeEnabled({ timeout: 5000 });

      // Add 3 new notes by clicking the add button
      for (let i = 0; i < 3; i++) {
        const currentCount = 2 + i;
        await expect(addButton).toBeEnabled({ timeout: 5000 });
        await addButton.click();
        await expect(scenario.locator('#notes input')).toHaveCount(currentCount + 1, { timeout: 10000 });
      }

      // Should have 5 total
      await expect(scenario.locator('#notes input')).toHaveCount(5, { timeout: 10000 });

      // Remove 2 notes by clicking remove buttons (one per item, remove from end)
      for (let i = 0; i < 2; i++) {
        const currentCount = 5 - i;
        const removeButtons = scenario.locator('button:has-text("Remove")');
        await expect(removeButtons.last()).toBeVisible({ timeout: 5000 });
        await expect(removeButtons.last()).toBeEnabled({ timeout: 5000 });
        await removeButtons.last().click();
        await expect(scenario.locator('#notes input')).toHaveCount(currentCount - 1, { timeout: 10000 });
      }

      // Should have 3 remaining
      const noteInputs = scenario.locator('#notes input');
      await expect(noteInputs).toHaveCount(3, { timeout: 10000 });

      // Verify original values are maintained
      await expect(noteInputs.first()).toHaveValue('First note', { timeout: 5000 });
      await expect(noteInputs.nth(1)).toHaveValue('Second note', { timeout: 5000 });
    });

    test('should handle multiple independent arrays', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-multiple-arrays');
      await page.goto('/#/test/array-fields/array-multiple-arrays');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Should have one email and one phone initially
      const emailInputs = scenario.locator('#emails input');
      const phoneInputs = scenario.locator('#phones input');

      await expect(emailInputs).toHaveCount(1, { timeout: 10000 });
      await expect(phoneInputs).toHaveCount(1, { timeout: 10000 });

      // Add to emails array
      const addEmailButton = scenario.locator('button:has-text("Add Email")');
      await addEmailButton.click();
      await expect(emailInputs).toHaveCount(2, { timeout: 10000 });

      // Phone array should be unaffected
      await expect(phoneInputs).toHaveCount(1, { timeout: 5000 });

      // Add to phones array
      const addPhoneButton = scenario.locator('button:has-text("Add Phone")');
      await addPhoneButton.click();
      await addPhoneButton.click();
      await expect(phoneInputs).toHaveCount(3, { timeout: 10000 });

      // Email array should be unaffected
      await expect(emailInputs).toHaveCount(2, { timeout: 5000 });

      // Verify original values maintained
      await expect(emailInputs.first()).toHaveValue('alice@example.com', { timeout: 5000 });
      await expect(phoneInputs.first()).toHaveValue('555-0001', { timeout: 5000 });
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation through array fields', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-keyboard-navigation');
      await page.goto('/#/test/array-fields/array-keyboard-navigation');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Focus the first field before the array
      const beforeInput = scenario.locator('#beforeField input');
      await expect(beforeInput).toBeVisible({ timeout: 5000 });
      await beforeInput.focus();
      await expect(beforeInput).toBeFocused();

      // Tab through fields
      // Before -> Contact 1 Name -> Contact 1 Email -> Contact 2 Name -> Contact 2 Email -> Add Button -> After
      await page.keyboard.press('Tab');
      const contact1Name = scenario.locator('#contacts input').first();
      await expect(contact1Name).toBeFocused({ timeout: 5000 });

      await page.keyboard.press('Tab');
      const contact1Email = scenario.locator('#contacts input').nth(1);
      await expect(contact1Email).toBeFocused({ timeout: 5000 });

      await page.keyboard.press('Tab');
      const contact2Name = scenario.locator('#contacts input').nth(2);
      await expect(contact2Name).toBeFocused({ timeout: 5000 });

      await page.keyboard.press('Tab');
      const contact2Email = scenario.locator('#contacts input').nth(3);
      await expect(contact2Email).toBeFocused({ timeout: 5000 });

      // Continue tabbing to add button and after field
      await page.keyboard.press('Tab');
      const addButton = scenario.locator('button:has-text("Add Contact")');
      await expect(addButton).toBeFocused({ timeout: 5000 });

      await page.keyboard.press('Tab');
      const afterInput = scenario.locator('#afterField input');
      await expect(afterInput).toBeFocused({ timeout: 5000 });

      // Shift+Tab should go back
      await page.keyboard.press('Shift+Tab');
      await expect(addButton).toBeFocused({ timeout: 5000 });
    });

    test('should have proper ARIA attributes for screen readers', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-screen-reader-labels');
      await page.goto('/#/test/array-fields/array-screen-reader-labels');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Verify inputs have labels
      const inputs = scenario.locator('#contacts input');
      await expect(inputs).toHaveCount(4, { timeout: 10000 }); // 2 contacts × 2 fields

      // Check that inputs have associated labels (via aria-labelledby or label for)
      const firstInput = inputs.first();
      const hasLabel =
        (await firstInput.getAttribute('aria-labelledby')) !== null ||
        (await firstInput.getAttribute('aria-label')) !== null ||
        (await firstInput.getAttribute('id')) !== null;
      expect(hasLabel).toBe(true);

      // Buttons should have accessible names
      const addButton = scenario.locator('button:has-text("Add Contact")');
      await expect(addButton).toBeVisible({ timeout: 5000 });
      const addButtonText = await addButton.textContent();
      expect(addButtonText).toContain('Add Contact');

      const removeButton = scenario.locator('button:has-text("Remove Last Contact")');
      await expect(removeButton).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Focus Management', () => {
    test('should handle focus appropriately when adding items', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-focus-after-add');
      await page.goto('/#/test/array-fields/array-focus-after-add');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Should have one task initially
      const taskInputs = scenario.locator('#tasks input');
      await expect(taskInputs).toHaveCount(1, { timeout: 10000 });

      // Click add button
      const addButton = scenario.locator('button:has-text("Add Task")');
      await addButton.click();

      // Should now have two tasks
      await expect(taskInputs).toHaveCount(2, { timeout: 10000 });

      // Focus should be manageable (form should not lose focus entirely)
      // The new input should be visible and interactable
      const newTaskInput = taskInputs.nth(1);
      await expect(newTaskInput).toBeVisible({ timeout: 5000 });
      await newTaskInput.fill('New Task');
      await expect(newTaskInput).toHaveValue('New Task', { timeout: 5000 });
    });

    test('should handle focus appropriately when removing items', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-focus-after-remove');
      await page.goto('/#/test/array-fields/array-focus-after-remove');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Should have three tasks initially
      const taskInputs = scenario.locator('#tasks input');
      await expect(taskInputs).toHaveCount(3, { timeout: 10000 });

      // Click remove button on the middle item (index 1)
      const removeButtons = scenario.locator('button:has-text("Remove")');
      await expect(removeButtons).toHaveCount(3, { timeout: 5000 });
      await removeButtons.nth(1).click();

      // Should now have two tasks
      await expect(taskInputs).toHaveCount(2, { timeout: 10000 });

      // Form should still be functional
      await expect(taskInputs.first()).toHaveValue('Task 1', { timeout: 5000 });
      await expect(taskInputs.nth(1)).toHaveValue('Task 3', { timeout: 5000 }); // Task 2 was removed
    });
  });

  test.describe('Form State Tracking', () => {
    test('should track dirty state through array operations', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-dirty-touched-tracking');
      await page.goto('/#/test/array-fields/array-dirty-touched-tracking');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Should have one initial entry
      const inputs = scenario.locator('#entries input');
      await expect(inputs).toHaveCount(2, { timeout: 10000 }); // 1 entry × 2 fields

      // Modify a field
      const nameInput = inputs.first();
      await nameInput.clear();
      await nameInput.fill('Modified Entry');

      // Add a new entry
      const addButton = scenario.locator('button:has-text("Add Entry")');
      await addButton.click();

      // Should have two entries
      await expect(inputs).toHaveCount(4, { timeout: 10000 }); // 2 entries × 2 fields

      // Verify the modification persisted
      await expect(inputs.first()).toHaveValue('Modified Entry', { timeout: 5000 });
    });

    test('should handle rapid add/remove operations without errors', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-rapid-operations');
      await page.goto('/#/test/array-fields/array-rapid-operations');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const inputs = scenario.locator('#items input');
      const addButton = scenario.locator('button:has-text("Add Item")');
      const removeButton = scenario.locator('button:has-text("Remove Item")');

      // Rapid add operations
      for (let i = 0; i < 5; i++) {
        await addButton.click();
      }

      // Should have 6 items (1 initial + 5 added)
      await expect(inputs).toHaveCount(6, { timeout: 10000 });

      // Rapid remove operations
      for (let i = 0; i < 3; i++) {
        await removeButton.click();
      }

      // Should have 3 items remaining
      await expect(inputs).toHaveCount(3, { timeout: 10000 });

      // Verify no console errors occurred
      // (setupConsoleCheck() will fail the test if there are errors)

      // Initial value should still be preserved
      await expect(inputs.first()).toHaveValue('Initial', { timeout: 5000 });
    });
  });

  test.describe('Button Logic (Hidden/Disabled)', () => {
    test('should hide add button when hidden logic condition is met', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-button-hidden-logic');
      await page.goto('/#/test/array-fields/array-button-hidden-logic');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Add button should be visible initially
      const addButton = scenario.locator('button:has-text("Add Item")');
      await expect(addButton).toBeVisible({ timeout: 5000 });

      // Check the checkbox to trigger hidden logic
      const checkbox = scenario.locator('mat-checkbox');
      await checkbox.click();

      // Add button should now be hidden
      await expect(addButton).toBeHidden({ timeout: 5000 });

      // Uncheck to show the button again
      await checkbox.click();
      await expect(addButton).toBeVisible({ timeout: 5000 });
    });

    test('should disable add button when disabled logic condition is met', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-button-disabled-logic');
      await page.goto('/#/test/array-fields/array-button-disabled-logic');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Add button should be enabled initially
      const addButton = scenario.locator('button:has-text("Add Item")');
      await expect(addButton).toBeVisible({ timeout: 5000 });
      await expect(addButton).toBeEnabled({ timeout: 5000 });

      // Check the checkbox to trigger disabled logic
      const checkbox = scenario.locator('mat-checkbox');
      await checkbox.click();

      // Add button should now be disabled
      await expect(addButton).toBeDisabled({ timeout: 5000 });

      // Uncheck to enable the button again
      await checkbox.click();
      await expect(addButton).toBeEnabled({ timeout: 5000 });
    });

    test('should disable remove button when items count is 1', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-button-disabled-logic');
      await page.goto('/#/test/array-fields/array-button-disabled-logic');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // With only one item, remove button should be disabled
      const removeButton = scenario.locator('button:has-text("Remove")');
      await expect(removeButton).toBeDisabled({ timeout: 5000 });

      // Add another item
      const addButton = scenario.locator('button:has-text("Add Item")');
      await addButton.click();

      // Now remove buttons should be enabled
      const removeButtons = scenario.locator('button:has-text("Remove")');
      await expect(removeButtons).toHaveCount(2, { timeout: 5000 });
      await expect(removeButtons.first()).toBeEnabled({ timeout: 5000 });
      await expect(removeButtons.nth(1)).toBeEnabled({ timeout: 5000 });

      // Remove one item to go back to 1
      await removeButtons.first().click();

      // Should have one item and remove button disabled again
      await expect(removeButtons).toHaveCount(1, { timeout: 5000 });
      await expect(removeButtons.first()).toBeDisabled({ timeout: 5000 });
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle starting with an empty array', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-empty-state');
      await page.goto('/#/test/array-fields/array-empty-state');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Should start with no items
      const inputs = scenario.locator('#items input');
      await expect(inputs).toHaveCount(0, { timeout: 5000 });

      // Add button should be visible and functional
      const addButton = scenario.locator('button:has-text("Add First Item")');
      await expect(addButton).toBeVisible({ timeout: 5000 });
      await addButton.click();

      // Should now have one item with two fields
      await expect(inputs).toHaveCount(1, { timeout: 10000 }); // 1 input field (name, not textarea)

      // Textarea should also be present
      const textareas = scenario.locator('#items textarea');
      await expect(textareas).toHaveCount(1, { timeout: 5000 });
    });

    test('should handle boundary index operations gracefully', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-boundary-indices');
      await page.goto('/#/test/array-fields/array-boundary-indices');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Should have two items initially
      const inputs = scenario.locator('#items input');
      await expect(inputs).toHaveCount(2, { timeout: 10000 });

      // Try to remove at out-of-bounds index (100) - should handle gracefully
      const removeButton = scenario.locator('button:has-text("Remove at Index 100")');
      await removeButton.click();

      // Should handle gracefully (no crash, array unchanged)
      await page.waitForTimeout(500);
      await expect(inputs).toHaveCount(2, { timeout: 5000 });

      // Verify original values are preserved
      await expect(inputs.first()).toHaveValue('First', { timeout: 5000 });
      await expect(inputs.nth(1)).toHaveValue('Second', { timeout: 5000 });

      // Add an item using the addArrayItem button
      const addButton = scenario.locator('button:has-text("Add Item")');
      await addButton.click();
      await expect(inputs).toHaveCount(3, { timeout: 5000 });
    });
  });
});
