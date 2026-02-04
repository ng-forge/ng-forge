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

      await page.waitForSelector('[data-testid="array-add"] #emails input', { state: 'visible', timeout: 10000 });

      const emailInputs = scenario.locator('#emails input');
      await expect(emailInputs.first()).toBeVisible({ timeout: 10000 });
      await expect(emailInputs).toHaveCount(1, { timeout: 10000 });

      await helpers.expectScreenshotMatch(scenario, 'primeng-array-add-initial');

      const addButton = scenario.locator('button:has-text("Add Email")').first();
      await expect(addButton).toBeVisible({ timeout: 10000 });
      await expect(addButton).toBeEnabled({ timeout: 10000 });

      await addButton.click();
      await expect(emailInputs).toHaveCount(2, { timeout: 10000 });

      const addButtons = scenario.locator('button:has-text("Add Email")');
      await expect(addButtons.first()).toBeEnabled({ timeout: 10000 });
      await addButtons.first().click();
      await expect(emailInputs).toHaveCount(3, { timeout: 10000 });

      await helpers.expectScreenshotMatch(scenario, 'primeng-array-add-three-items');
    });

    test('should remove array items', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-remove');
      await page.goto('/#/test/array-fields/array-remove');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="array-remove"] #phones input', { state: 'visible', timeout: 10000 });

      const phoneInputs = scenario.locator('#phones input');
      await expect(phoneInputs).toHaveCount(2, { timeout: 10000 });

      const removeButton = scenario.locator('button:has-text("Remove Last")');
      await expect(removeButton).toBeVisible({ timeout: 10000 });
      await expect(removeButton).toBeEnabled({ timeout: 10000 });

      await removeButton.click();
      await expect(phoneInputs).toHaveCount(1, { timeout: 10000 });
    });

    test('should maintain input values after add/remove operations', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-values');
      await page.goto('/#/test/array-fields/array-values');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="array-values"] #tasks input', { state: 'visible', timeout: 10000 });

      const taskInputs = scenario.locator('#tasks input');
      await expect(taskInputs.first()).toBeVisible({ timeout: 10000 });
      await expect(taskInputs).toHaveCount(1, { timeout: 10000 });

      const firstInput = taskInputs.first();
      await firstInput.fill('First Task');
      await expect(firstInput).toHaveValue('First Task', { timeout: 5000 });
      await firstInput.blur();

      const addButton = scenario.locator('button:has-text("Add Task")').first();
      await expect(addButton).toBeVisible({ timeout: 10000 });
      await expect(addButton).toBeEnabled({ timeout: 10000 });
      await addButton.click();
      await expect(taskInputs).toHaveCount(2, { timeout: 10000 });

      const secondInput = taskInputs.nth(1);
      await secondInput.fill('Second Task');
      await expect(secondInput).toHaveValue('Second Task', { timeout: 5000 });
      await secondInput.blur();

      await expect(taskInputs.first()).toHaveValue('First Task', { timeout: 5000 });
      await expect(taskInputs.nth(1)).toHaveValue('Second Task', { timeout: 5000 });
    });

    test('should handle array with initial values', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-initial-values');
      await page.goto('/#/test/array-fields/array-initial-values');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="array-initial-values"] #contacts input', { state: 'visible', timeout: 10000 });

      const allInputs = scenario.locator('#contacts input');
      await expect(allInputs).toHaveCount(4, { timeout: 10000 });

      await expect(allInputs.nth(0)).toHaveValue('Alice', { timeout: 5000 });
      await expect(allInputs.nth(1)).toHaveValue('alice@example.com', { timeout: 5000 });
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

      await page.waitForSelector('[data-testid="array-prepend"] #items input', { state: 'visible', timeout: 10000 });

      const inputs = scenario.locator('#items input');
      await expect(inputs).toHaveCount(2, { timeout: 10000 });

      await expect(inputs.nth(0)).toHaveValue('First', { timeout: 5000 });
      await expect(inputs.nth(1)).toHaveValue('Second', { timeout: 5000 });

      const prependButton = scenario.locator('button:has-text("Prepend Item")');
      await expect(prependButton).toBeVisible({ timeout: 10000 });
      await prependButton.click();

      await expect(inputs).toHaveCount(3, { timeout: 10000 });

      await expect(inputs.nth(1)).toHaveValue('First', { timeout: 5000 });
      await expect(inputs.nth(2)).toHaveValue('Second', { timeout: 5000 });
      await expect(inputs.nth(0)).toHaveValue('', { timeout: 5000 });
    });

    test('should shift (remove first) items from array', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-shift');
      await page.goto('/#/test/array-fields/array-shift');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="array-shift"] #items input', { state: 'visible', timeout: 10000 });

      const inputs = scenario.locator('#items input');
      await expect(inputs).toHaveCount(3, { timeout: 10000 });

      await expect(inputs.nth(0)).toHaveValue('First', { timeout: 5000 });
      await expect(inputs.nth(1)).toHaveValue('Second', { timeout: 5000 });
      await expect(inputs.nth(2)).toHaveValue('Third', { timeout: 5000 });

      const shiftButton = scenario.locator('button:has-text("Remove First")');
      await expect(shiftButton).toBeVisible({ timeout: 10000 });
      await shiftButton.click();

      await expect(inputs).toHaveCount(2, { timeout: 10000 });

      await expect(inputs.nth(0)).toHaveValue('Second', { timeout: 5000 });
      await expect(inputs.nth(1)).toHaveValue('Third', { timeout: 5000 });
    });

    test('should insert items at specific indices', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-insert-at-index');
      await page.goto('/#/test/array-fields/array-insert-at-index');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="array-insert-at-index"] #items input', { state: 'visible', timeout: 10000 });

      const inputs = scenario.locator('#items input');
      await expect(inputs).toHaveCount(2, { timeout: 10000 });

      await expect(inputs.nth(0)).toHaveValue('First', { timeout: 5000 });
      await expect(inputs.nth(1)).toHaveValue('Third', { timeout: 5000 });

      const insertButton = scenario.locator('button:has-text("Insert at Index 1")');
      await expect(insertButton).toBeVisible({ timeout: 10000 });
      await insertButton.click();

      await expect(inputs).toHaveCount(3, { timeout: 10000 });

      await expect(inputs.nth(0)).toHaveValue('First', { timeout: 5000 });
      await expect(inputs.nth(1)).toHaveValue('', { timeout: 5000 });
      await expect(inputs.nth(2)).toHaveValue('Third', { timeout: 5000 });
    });

    test('should remove items at specific indices', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-remove-at-index');
      await page.goto('/#/test/array-fields/array-remove-at-index');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="array-remove-at-index"] #items input', { state: 'visible', timeout: 10000 });

      const inputs = scenario.locator('#items input');
      await expect(inputs).toHaveCount(3, { timeout: 10000 });

      await expect(inputs.nth(0)).toHaveValue('First', { timeout: 5000 });
      await expect(inputs.nth(1)).toHaveValue('Second', { timeout: 5000 });
      await expect(inputs.nth(2)).toHaveValue('Third', { timeout: 5000 });

      const removeButton = scenario.locator('button:has-text("Remove at Index 1")');
      await expect(removeButton).toBeVisible({ timeout: 10000 });
      await removeButton.click();

      await expect(inputs).toHaveCount(2, { timeout: 10000 });

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

      await page.waitForSelector('[data-testid="array-dom-id-uniqueness"] #users input', { state: 'visible', timeout: 10000 });

      const addButton = scenario.locator('button:has-text("Add User")');
      await expect(addButton).toBeVisible({ timeout: 10000 });
      await addButton.click();
      await addButton.click();

      const inputs = scenario.locator('#users input');
      await expect(inputs).toHaveCount(6, { timeout: 10000 });

      const ids = await inputs.evaluateAll((els) => els.map((e) => e.id).filter((id) => id));

      expect(ids.length).toBeGreaterThan(0);

      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);

      for (const id of ids) {
        expect(id).toMatch(/_\d+/);
      }
    });

    test('should maintain unique IDs after adding and removing items', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-dom-id-uniqueness');
      await page.goto('/#/test/array-fields/array-dom-id-uniqueness');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="array-dom-id-uniqueness"] #users input', { state: 'visible', timeout: 10000 });

      const addButton = scenario.locator('button:has-text("Add User")');
      const inputs = scenario.locator('#users input');

      await addButton.click();
      await addButton.click();
      await addButton.click();

      await expect(inputs).toHaveCount(8, { timeout: 10000 });

      const idsBefore = await inputs.evaluateAll((els) => els.map((e) => e.id).filter((id) => id));

      const uniqueIdsBefore = new Set(idsBefore);
      expect(uniqueIdsBefore.size).toBe(idsBefore.length);
    });
  });

  test.describe('Array Validation', () => {
    test('should validate individual array items', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-item-validation');
      await page.goto('/#/test/array-fields/array-item-validation');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="array-item-validation"] #members input', { state: 'visible', timeout: 10000 });

      const nameInput = scenario.locator('#members input').first();
      const emailInput = scenario.locator('#members input').nth(1);

      await expect(nameInput).toBeVisible({ timeout: 10000 });
      await expect(emailInput).toBeVisible({ timeout: 10000 });

      expect(await nameInput.getAttribute('required')).not.toBeNull();
      expect(await emailInput.getAttribute('required')).not.toBeNull();
    });

    test('should enforce minimum array length', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-min-length');
      await page.goto('/#/test/array-fields/array-min-length');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await expect(scenario.locator('#submit button')).toBeVisible({ timeout: 10000 });
    });

    test('should enforce maximum array length', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-max-length');
      await page.goto('/#/test/array-fields/array-max-length');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="array-max-length"] #tags input', { state: 'visible', timeout: 10000 });

      const inputs = scenario.locator('#tags input');
      await expect(inputs).toHaveCount(2, { timeout: 10000 });

      const addButton = scenario.locator('button:has-text("Add Tag")');
      await expect(addButton).toBeVisible({ timeout: 10000 });
      await expect(addButton).toBeEnabled({ timeout: 10000 });

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

      await page.waitForSelector('[data-testid="array-nested"] input', { state: 'visible', timeout: 10000 });

      const firstNameInput = scenario.locator('input').first();
      const lastNameInput = scenario.locator('input').nth(1);
      const roleSelect = scenario.locator('p-select').first();

      await expect(firstNameInput).toBeVisible({ timeout: 10000 });
      await expect(lastNameInput).toBeVisible({ timeout: 10000 });
      await expect(roleSelect).toBeVisible({ timeout: 10000 });

      await firstNameInput.fill('John');
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await firstNameInput.blur();

      await lastNameInput.fill('Doe');
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
      await lastNameInput.blur();

      await roleSelect.click();
      const overlay = page.locator('.p-select-overlay');
      await expect(overlay).toBeVisible({ timeout: 10000 });
      await overlay.getByText('Admin', { exact: true }).click();
      await expect(overlay).not.toBeVisible({ timeout: 2000 });

      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });

      const addButton = scenario.locator('button:has-text("Add User")').first();
      await expect(addButton).toBeEnabled({ timeout: 10000 });
      await addButton.click();

      const allInputs = scenario.locator('input');
      await expect(allInputs).toHaveCount(4, { timeout: 10000 });
    });

    test('should handle multiple add and remove operations', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-multiple-ops');
      await page.goto('/#/test/array-fields/array-multiple-ops');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="array-multiple-ops"] #notes input', { state: 'visible', timeout: 10000 });

      await expect(scenario.locator('#notes input')).toHaveCount(2, { timeout: 10000 });

      const addButton = scenario.locator('button:has-text("Add Note")');
      await expect(addButton).toBeVisible({ timeout: 10000 });
      await expect(addButton).toBeEnabled({ timeout: 10000 });

      for (let i = 0; i < 3; i++) {
        const currentCount = 2 + i;
        await expect(addButton).toBeEnabled({ timeout: 10000 });
        await addButton.click();
        await expect(scenario.locator('#notes input')).toHaveCount(currentCount + 1, { timeout: 10000 });
      }

      await expect(scenario.locator('#notes input')).toHaveCount(5, { timeout: 10000 });

      for (let i = 0; i < 2; i++) {
        const currentCount = 5 - i;
        const removeButtons = scenario.locator('button:has-text("Remove")');
        await expect(removeButtons.last()).toBeVisible({ timeout: 10000 });
        await expect(removeButtons.last()).toBeEnabled({ timeout: 10000 });
        await removeButtons.last().click();
        await expect(scenario.locator('#notes input')).toHaveCount(currentCount - 1, { timeout: 10000 });
      }

      const noteInputs = scenario.locator('#notes input');
      await expect(noteInputs).toHaveCount(3, { timeout: 10000 });

      await expect(noteInputs.first()).toHaveValue('First note', { timeout: 5000 });
      await expect(noteInputs.nth(1)).toHaveValue('Second note', { timeout: 5000 });
    });

    test('should handle multiple independent arrays', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-multiple-arrays');
      await page.goto('/#/test/array-fields/array-multiple-arrays');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="array-multiple-arrays"] #emails input', { state: 'visible', timeout: 10000 });

      const emailInputs = scenario.locator('#emails input');
      const phoneInputs = scenario.locator('#phones input');

      await expect(emailInputs).toHaveCount(1, { timeout: 10000 });
      await expect(phoneInputs).toHaveCount(1, { timeout: 10000 });

      const addEmailButton = scenario.locator('button:has-text("Add Email")');
      await addEmailButton.click();
      await expect(emailInputs).toHaveCount(2, { timeout: 10000 });

      await expect(phoneInputs).toHaveCount(1, { timeout: 5000 });

      const addPhoneButton = scenario.locator('button:has-text("Add Phone")');
      await addPhoneButton.click();
      await addPhoneButton.click();
      await expect(phoneInputs).toHaveCount(3, { timeout: 10000 });

      await expect(emailInputs).toHaveCount(2, { timeout: 5000 });

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

      await page.waitForSelector('[data-testid="array-keyboard-navigation"] #beforeField input', { state: 'visible', timeout: 10000 });

      const beforeInput = scenario.locator('#beforeField input');
      await expect(beforeInput).toBeVisible({ timeout: 10000 });
      await beforeInput.focus();
      await expect(beforeInput).toBeFocused();

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

      await page.keyboard.press('Tab');
      const addButton = scenario.locator('button:has-text("Add Contact")');
      await expect(addButton).toBeFocused({ timeout: 5000 });

      await page.keyboard.press('Tab');
      const afterInput = scenario.locator('#afterField input');
      await expect(afterInput).toBeFocused({ timeout: 5000 });

      await page.keyboard.press('Shift+Tab');
      await expect(addButton).toBeFocused({ timeout: 5000 });
    });

    test('should have proper ARIA attributes for screen readers', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-screen-reader-labels');
      await page.goto('/#/test/array-fields/array-screen-reader-labels');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="array-screen-reader-labels"] #contacts input', { state: 'visible', timeout: 10000 });

      const inputs = scenario.locator('#contacts input');
      await expect(inputs).toHaveCount(4, { timeout: 10000 });

      const firstInput = inputs.first();
      const hasLabel =
        (await firstInput.getAttribute('aria-labelledby')) !== null ||
        (await firstInput.getAttribute('aria-label')) !== null ||
        (await firstInput.getAttribute('id')) !== null;
      expect(hasLabel).toBe(true);

      const addButton = scenario.locator('button:has-text("Add Contact")');
      await expect(addButton).toBeVisible({ timeout: 10000 });
      const addButtonText = await addButton.textContent();
      expect(addButtonText).toContain('Add Contact');

      const removeButton = scenario.locator('button:has-text("Remove Last Contact")');
      await expect(removeButton).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Focus Management', () => {
    test('should handle focus appropriately when adding items', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-focus-after-add');
      await page.goto('/#/test/array-fields/array-focus-after-add');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="array-focus-after-add"] #tasks input', { state: 'visible', timeout: 10000 });

      const taskInputs = scenario.locator('#tasks input');
      await expect(taskInputs).toHaveCount(1, { timeout: 10000 });

      const addButton = scenario.locator('button:has-text("Add Task")');
      await addButton.click();

      await expect(taskInputs).toHaveCount(2, { timeout: 10000 });

      const newTaskInput = taskInputs.nth(1);
      await expect(newTaskInput).toBeVisible({ timeout: 10000 });
      await newTaskInput.fill('New Task');
      await expect(newTaskInput).toHaveValue('New Task', { timeout: 5000 });
    });

    test('should handle focus appropriately when removing items', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-focus-after-remove');
      await page.goto('/#/test/array-fields/array-focus-after-remove');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="array-focus-after-remove"] #tasks input', { state: 'visible', timeout: 10000 });

      const taskInputs = scenario.locator('#tasks input');
      await expect(taskInputs).toHaveCount(3, { timeout: 10000 });

      const removeButtons = scenario.locator('button:has-text("Remove")');
      await expect(removeButtons).toHaveCount(3, { timeout: 10000 });
      await removeButtons.nth(1).click();

      await expect(taskInputs).toHaveCount(2, { timeout: 10000 });

      await expect(taskInputs.first()).toHaveValue('Task 1', { timeout: 5000 });
      await expect(taskInputs.nth(1)).toHaveValue('Task 3', { timeout: 5000 });
    });
  });

  test.describe('Form State Tracking', () => {
    test('should track dirty state through array operations', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-dirty-touched-tracking');
      await page.goto('/#/test/array-fields/array-dirty-touched-tracking');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="array-dirty-touched-tracking"] #entries input', { state: 'visible', timeout: 10000 });

      const inputs = scenario.locator('#entries input');
      await expect(inputs).toHaveCount(2, { timeout: 10000 });

      const nameInput = inputs.first();
      await nameInput.clear();
      await nameInput.fill('Modified Entry');
      await nameInput.blur();

      const addButton = scenario.locator('button:has-text("Add Entry")');
      await addButton.click();

      await expect(inputs).toHaveCount(4, { timeout: 10000 });

      await expect(inputs.first()).toHaveValue('Modified Entry', { timeout: 5000 });
    });

    test('should handle rapid add/remove operations without errors', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-rapid-operations');
      await page.goto('/#/test/array-fields/array-rapid-operations');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="array-rapid-operations"] #items input', { state: 'visible', timeout: 10000 });

      const inputs = scenario.locator('#items input');
      const addButton = scenario.locator('button:has-text("Add Item")');
      const removeButton = scenario.locator('button:has-text("Remove Item")');

      for (let i = 0; i < 5; i++) {
        await addButton.click();
      }

      await expect(inputs).toHaveCount(6, { timeout: 10000 });

      for (let i = 0; i < 3; i++) {
        await removeButton.click();
      }

      await expect(inputs).toHaveCount(3, { timeout: 10000 });

      await expect(inputs.first()).toHaveValue('Initial', { timeout: 5000 });
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle starting with an empty array', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-empty-state');
      await page.goto('/#/test/array-fields/array-empty-state');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const inputs = scenario.locator('#items input');
      await expect(inputs).toHaveCount(0, { timeout: 5000 });

      const addButton = scenario.locator('button:has-text("Add First Item")');
      await expect(addButton).toBeVisible({ timeout: 10000 });
      await addButton.click();

      await expect(inputs).toHaveCount(1, { timeout: 10000 });

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
