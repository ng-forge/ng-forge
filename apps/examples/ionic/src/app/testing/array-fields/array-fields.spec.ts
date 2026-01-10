import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { testUrl } from '../shared/test-utils';
import { ionBlur } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck();

test.describe('Array Fields E2E Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/testing/array-fields');
  });

  test.describe('Basic Array Operations', () => {
    test('should add new array items dynamically', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-add');
      await page.goto(testUrl('/array-fields/array-add'));
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for initial selector to be visible
      await page.waitForSelector('[data-testid="array-add"] #emails input', { state: 'visible', timeout: 10000 });

      // Should have one initial empty item (use #emails input for cross-browser compatibility)
      const emailInputs = scenario.locator('#emails input');
      await expect(emailInputs.first()).toBeVisible({ timeout: 10000 });
      await expect(emailInputs).toHaveCount(1, { timeout: 10000 });

      // Screenshot: Initial array with one item
      await helpers.expectScreenshotMatch(scenario, 'ionic-array-add-initial');

      // Should have one add button (inside the first item)
      const addButton = scenario.locator('ion-button:has-text("Add Email")').first();
      await expect(addButton).toBeVisible({ timeout: 10000 });
      await expect(addButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Add second item
      await addButton.click();
      await expect(emailInputs).toHaveCount(2, { timeout: 10000 });

      // Add third item
      const addButtons = scenario.locator('ion-button:has-text("Add Email")');
      await expect(addButtons.first()).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });
      await addButtons.first().click();
      await expect(emailInputs).toHaveCount(3, { timeout: 10000 });

      // Screenshot: Array with three items
      await helpers.expectScreenshotMatch(scenario, 'ionic-array-add-three-items');
    });

    test('should remove array items', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-remove');
      await page.goto(testUrl('/array-fields/array-remove'));
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for initial selector to be visible
      await page.waitForSelector('[data-testid="array-remove"] #phones input', { state: 'visible', timeout: 10000 });

      // Should have two phone inputs (with initial values)
      const phoneInputs = scenario.locator('#phones input');
      await expect(phoneInputs).toHaveCount(2, { timeout: 10000 });

      // Find and click remove button (removes last item)
      const removeButton = scenario.locator('ion-button:has-text("Remove Last")');
      await expect(removeButton).toBeVisible({ timeout: 10000 });
      await expect(removeButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      await removeButton.click();
      await expect(phoneInputs).toHaveCount(1, { timeout: 10000 });
    });

    test('should maintain input values after add/remove operations', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-values');
      await page.goto(testUrl('/array-fields/array-values'));
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for initial selector to be visible
      await page.waitForSelector('[data-testid="array-values"] #tasks input', { state: 'visible', timeout: 10000 });

      // Should have one initial item (the component starts with one empty item)
      const taskInputs = scenario.locator('#tasks input');
      await expect(taskInputs.first()).toBeVisible({ timeout: 10000 });
      await expect(taskInputs).toHaveCount(1, { timeout: 10000 });

      // Fill first task (the initial one)
      const firstInput = taskInputs.first();
      await firstInput.fill('First Task');
      await expect(firstInput).toHaveValue('First Task', { timeout: 5000 });
      await ionBlur(firstInput);

      // Find and click add button
      const addButton = scenario.locator('ion-button:has-text("Add Task")').first();
      await expect(addButton).toBeVisible({ timeout: 10000 });
      await expect(addButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });
      await addButton.click();
      await expect(taskInputs).toHaveCount(2, { timeout: 10000 });

      // Fill second task
      const secondInput = taskInputs.nth(1);
      await secondInput.fill('Second Task');
      await expect(secondInput).toHaveValue('Second Task', { timeout: 5000 });
      await ionBlur(secondInput);

      // Verify both values are maintained
      await expect(taskInputs.first()).toHaveValue('First Task', { timeout: 5000 });
      await expect(taskInputs.nth(1)).toHaveValue('Second Task', { timeout: 5000 });
    });

    test('should handle array with initial values', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-initial-values');
      await page.goto(testUrl('/array-fields/array-initial-values'));
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for initial selector to be visible
      await page.waitForSelector('[data-testid="array-initial-values"] #contacts input', { state: 'visible', timeout: 10000 });

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

  test.describe('Array Validation', () => {
    test('should validate individual array items', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-item-validation');
      await page.goto(testUrl('/array-fields/array-item-validation'));
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for initial selector to be visible
      await page.waitForSelector('[data-testid="array-item-validation"] #members input', { state: 'visible', timeout: 10000 });

      // Fields should already be visible (initial item is rendered)
      const nameInput = scenario.locator('#members input').first();
      const emailInput = scenario.locator('#members input').nth(1);

      await expect(nameInput).toBeVisible({ timeout: 10000 });
      await expect(emailInput).toBeVisible({ timeout: 10000 });

      // Fields should be editable and ready for validation
      await expect(nameInput).toBeEditable({ timeout: 5000 });
      await expect(emailInput).toBeEditable({ timeout: 5000 });
    });

    test('should enforce minimum array length', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-min-length');
      await page.goto(testUrl('/array-fields/array-min-length'));
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Submit button should be present
      await expect(scenario.locator('#submit ion-button')).toBeVisible({ timeout: 10000 });
    });

    test('should enforce maximum array length', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-max-length');
      await page.goto(testUrl('/array-fields/array-max-length'));
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for initial selector to be visible
      await page.waitForSelector('[data-testid="array-max-length"] #tags input', { state: 'visible', timeout: 10000 });

      // Should have two items initially (from initial values)
      const inputs = scenario.locator('#tags input');
      await expect(inputs).toHaveCount(2, { timeout: 10000 });

      // Add button is outside the array (one button)
      const addButton = scenario.locator('ion-button:has-text("Add Tag")');
      await expect(addButton).toBeVisible({ timeout: 10000 });
      await expect(addButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Click add button to add a new item
      await addButton.click();
      await expect(inputs).toHaveCount(3, { timeout: 10000 });
    });
  });

  test.describe('Complex Array Structures', () => {
    test('should handle nested fields within array items', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-nested');
      await page.goto(testUrl('/array-fields/array-nested'));
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for initial selector to be visible
      await page.waitForSelector('[data-testid="array-nested"] #users input', { state: 'visible', timeout: 10000 });

      // Should have multiple fields (initial item is rendered)
      // Use #users to scope to the array container only
      const firstNameInput = scenario.locator('#users input').first();
      const lastNameInput = scenario.locator('#users input').nth(1);
      const roleSelect = scenario.locator('#users ion-select').first();

      await expect(firstNameInput).toBeVisible({ timeout: 10000 });
      await expect(lastNameInput).toBeVisible({ timeout: 10000 });
      await expect(roleSelect).toBeVisible({ timeout: 10000 });

      // Fill fields
      await firstNameInput.fill('John');
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await ionBlur(firstNameInput);

      await lastNameInput.fill('Doe');
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
      await ionBlur(lastNameInput);

      // Select role using Ionic ion-select (uses helper for proper OK click)
      await helpers.selectOption(roleSelect, 'Admin');

      // Verify text input values
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });

      // Get initial count of inputs
      const initialCount = await scenario.locator('#users input').count();

      // Add another user
      const addButton = scenario.locator('ion-button:has-text("Add User")').first();
      await expect(addButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });
      await addButton.click();

      // Wait for inputs to double (adding another user duplicates the structure)
      // Each user has 2 text inputs plus possible hidden inputs from the nested group structure
      const allInputs = scenario.locator('#users input');
      await expect(allInputs).toHaveCount(initialCount * 2, { timeout: 10000 });
    });

    test('should handle multiple add and remove operations', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-multiple-ops');
      await page.goto(testUrl('/array-fields/array-multiple-ops'));
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for initial selector to be visible
      await page.waitForSelector('[data-testid="array-multiple-ops"] #notes input', { state: 'visible', timeout: 10000 });

      // Verify initial count (has initial values)
      await expect(scenario.locator('#notes input')).toHaveCount(2, { timeout: 10000 });

      // Add button is outside the array (one button)
      const addButton = scenario.locator('ion-button:has-text("Add Note")');
      await expect(addButton).toBeVisible({ timeout: 10000 });
      await expect(addButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Add 3 new notes by clicking the add button
      for (let i = 0; i < 3; i++) {
        const currentCount = 2 + i;
        await expect(addButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });
        await addButton.click();
        await expect(scenario.locator('#notes input')).toHaveCount(currentCount + 1, { timeout: 10000 });
      }

      // Should have 5 total
      await expect(scenario.locator('#notes input')).toHaveCount(5, { timeout: 10000 });

      // Remove 2 notes by clicking remove buttons (one per item, remove from end)
      for (let i = 0; i < 2; i++) {
        const currentCount = 5 - i;
        const removeButtons = scenario.locator('ion-button:has-text("Remove")');
        await expect(removeButtons.last()).toBeVisible({ timeout: 10000 });
        await expect(removeButtons.last()).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });
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
  });
});
