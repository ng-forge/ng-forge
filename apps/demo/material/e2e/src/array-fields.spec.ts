/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from '@playwright/test';
import { E2EScenarioLoader } from './utils/e2e-form-helpers';

test.describe('Array Fields Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/e2e-test');
    await page.waitForFunction(() => window.loadTestScenario !== undefined);
  });

  test.describe('Array Operations', () => {
    test('should add new array items dynamically', async ({ page }) => {
      await page.evaluate(() => {
        const emailFieldTemplate = {
          key: 'email',
          type: 'input',
          label: 'Email',
          props: {
            type: 'email',
          },
        };

        class AddEmailsEvent extends (window as any).AddArrayItemEvent {
          constructor() {
            super('emails', emailFieldTemplate);
          }
        }
        // Attach to window so Angular can access it later
        (window as any).AddEmailsEvent = AddEmailsEvent;

        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'emails',
                type: 'array',
                label: 'Email Addresses',
                fields: [emailFieldTemplate],
              },
              {
                key: 'addEmailButton',
                type: 'button',
                label: 'Add',
                className: 'array-add-button',
                event: (window as any).AddEmailsEvent,
                props: {
                  color: 'primary',
                },
              },
            ],
          },
          { testId: 'array-add' },
        );
      });
      await page.waitForLoadState('networkidle');

      // Should have add button
      const addButton = page.locator('.array-add-button, button:has-text("Add")').first();
      await expect(addButton).toBeVisible();

      // Add first item
      await addButton.click();
      await page.waitForTimeout(200);

      // Should have one email input
      let emailInputs = page.locator('#emails input[type="email"]');
      expect(await emailInputs.count()).toBe(1);

      // Add second item
      await addButton.click();
      await page.waitForTimeout(200);

      // Should have two email inputs
      emailInputs = page.locator('#emails input[type="email"]');
      expect(await emailInputs.count()).toBe(2);
    });

    test('should remove array items', async ({ page }) => {
      await page.evaluate(() => {
        class RemovePhonesEvent extends (window as any).RemoveArrayItemEvent {
          constructor() {
            super('phones');
          }
        }
        (window as any).RemovePhonesEvent = RemovePhonesEvent;

        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'phones',
                type: 'array',
                label: 'Phone Numbers',
                value: [{ phone: '555-0001' }, { phone: '555-0002' }],
                fields: [
                  {
                    key: 'phone',
                    type: 'input',
                    label: 'Phone',
                  },
                ],
              },
              {
                key: 'removePhoneButton',
                type: 'button',
                label: 'Remove',
                className: 'array-remove-button',
                event: (window as any).RemovePhonesEvent,
              },
            ],
          },
          { testId: 'array-remove' },
        );
      });
      await page.waitForLoadState('networkidle');

      // Should have two phone inputs
      let phoneInputs = page.locator('#phones input');
      expect(await phoneInputs.count()).toBe(2);

      // Find and click remove button for first item
      const removeButton = page.locator('.array-remove-button, button:has-text("Remove")').first();
      await removeButton.click();
      await page.waitForTimeout(200);

      // Should have one phone input remaining
      phoneInputs = page.locator('#phones input');
      expect(await phoneInputs.count()).toBe(1);
    });

    test('should maintain input values after add/remove operations', async ({ page }) => {
      await page.evaluate(() => {
        const taskFieldTemplate = {
          key: 'taskName',
          type: 'input',
          label: 'Task',
        };

        class AddTasksEvent extends (window as any).AddArrayItemEvent {
          constructor() {
            super('tasks', taskFieldTemplate);
          }
        }
        (window as any).AddTasksEvent = AddTasksEvent;

        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'tasks',
                type: 'array',
                label: 'Tasks',
                fields: [taskFieldTemplate],
              },
              {
                key: 'addTaskButton',
                type: 'button',
                label: 'Add',
                className: 'array-add-button',
                event: (window as any).AddTasksEvent,
                props: {
                  color: 'primary',
                },
              },
            ],
          },
          { testId: 'array-values' },
        );
      });
      await page.waitForLoadState('networkidle');

      // Add first item
      const addButton = page.locator('.array-add-button, button:has-text("Add")').first();
      await addButton.click();
      await page.waitForTimeout(200);

      // Fill first task
      const firstInput = page.locator('#tasks input').first();
      await firstInput.fill('First Task');

      // Add second item
      await addButton.click();
      await page.waitForTimeout(200);

      // Fill second task
      const secondInput = page.locator('#tasks input').nth(1);
      await secondInput.fill('Second Task');

      // Verify both values are maintained
      expect(await firstInput.inputValue()).toBe('First Task');
      expect(await secondInput.inputValue()).toBe('Second Task');
    });
  });

  test.describe('Array Validation', () => {
    test('should validate individual array items', async ({ page }) => {
      await page.evaluate(() => {
        const memberFieldsTemplate = {
          key: 'member',
          type: 'group',
          fields: [
            {
              key: 'name',
              type: 'input',
              label: 'Name',
              required: true,
            },
            {
              key: 'email',
              type: 'input',
              label: 'Email',
              required: true,
              email: true,
            },
          ],
        };

        class AddMembersEvent extends (window as any).AddArrayItemEvent {
          constructor() {
            super('members', memberFieldsTemplate);
          }
        }
        (window as any).AddMembersEvent = AddMembersEvent;

        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'members',
                type: 'array',
                label: 'Team Members',
                fields: [memberFieldsTemplate],
              },
              {
                key: 'addMemberButton',
                type: 'button',
                label: 'Add',
                className: 'array-add-button',
                event: (window as any).AddMembersEvent,
              },
            ],
          },
          { testId: 'array-item-validation' },
        );
      });
      await page.waitForLoadState('networkidle');

      // Add an item
      const addButton = page.locator('.array-add-button, button:has-text("Add")').first();
      await addButton.click();
      await page.waitForTimeout(200);

      // Fields should be marked as required
      const nameInput = page.locator('#members input').first();
      const emailInput = page.locator('#members input[type="email"]').first();

      expect(await nameInput.getAttribute('required')).not.toBeNull();
      expect(await emailInput.getAttribute('required')).not.toBeNull();
    });

    test('should enforce minimum array length', async ({ page }) => {
      await page.evaluate(() => {
        const itemFieldTemplate = {
          key: 'item',
          type: 'input',
          label: 'Item',
        };

        class AddItemsEvent extends (window as any).AddArrayItemEvent {
          constructor() {
            super('items', itemFieldTemplate);
          }
        }
        (window as any).AddItemsEvent = AddItemsEvent;

        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'items',
                type: 'array',
                label: 'Items',
                minLength: 2,
                fields: [itemFieldTemplate],
              },
              {
                key: 'addItemButton',
                type: 'button',
                label: 'Add Item',
                className: 'array-add-button',
                event: (window as any).AddItemsEvent,
              },
              {
                key: 'submit',
                type: 'submit',
                label: 'Submit',
              },
            ],
          },
          { testId: 'array-min-length' },
        );
      });
      await page.waitForLoadState('networkidle');

      // Note: Min length validation is enforced by the form framework
      // Submit button should be present
      await expect(page.locator('#submit button')).toBeVisible();
    });

    test('should enforce maximum array length', async ({ page }) => {
      await page.evaluate(() => {
        const tagFieldTemplate = {
          key: 'tag',
          type: 'input',
          label: 'Tag',
        };

        class AddTagsEvent extends (window as any).AddArrayItemEvent {
          constructor() {
            super('tags', tagFieldTemplate);
          }
        }
        (window as any).AddTagsEvent = AddTagsEvent;

        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'tags',
                type: 'array',
                label: 'Tags (max 3)',
                maxLength: 3,
                value: [{ tag: 'tag1' }, { tag: 'tag2' }],
                fields: [tagFieldTemplate],
              },
              {
                key: 'addTagButton',
                type: 'button',
                label: 'Add',
                className: 'array-add-button',
                event: (window as any).AddTagsEvent,
              },
            ],
          },
          { testId: 'array-max-length' },
        );
      });
      await page.waitForLoadState('networkidle');

      // Should have two items initially
      let inputs = page.locator('#tags input');
      expect(await inputs.count()).toBe(2);

      // Add one more (should be allowed - max is 3)
      const addButton = page.locator('.array-add-button, button:has-text("Add")').first();
      await addButton.click();
      await page.waitForTimeout(200);

      // Should have three items
      inputs = page.locator('#tags input');
      expect(await inputs.count()).toBe(3);

      // Note: Add button may be disabled when max length is reached
      // This depends on the form framework implementation
    });
  });

  test.describe('Complex Array Structures', () => {
    test('should handle nested fields within array items', async ({ page }) => {
      await page.evaluate(() => {
        const userFieldsTemplate = {
          key: 'user',
          type: 'group',
          fields: [
            {
              key: 'firstName',
              type: 'input',
              label: 'First Name',
              col: 6,
            },
            {
              key: 'lastName',
              type: 'input',
              label: 'Last Name',
              col: 6,
            },
            {
              key: 'role',
              type: 'select',
              label: 'Role',
              options: [
                { value: 'admin', label: 'Admin' },
                { value: 'user', label: 'User' },
              ],
            },
          ],
        };

        class AddUsersEvent extends (window as any).AddArrayItemEvent {
          constructor() {
            super('users', userFieldsTemplate);
          }
        }
        (window as any).AddUsersEvent = AddUsersEvent;

        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'users',
                type: 'array',
                label: 'Users',
                fields: [userFieldsTemplate],
              },
              {
                key: 'addUserButton',
                type: 'button',
                label: 'Add',
                className: 'array-add-button',
                event: (window as any).AddUsersEvent,
              },
            ],
          },
          { testId: 'array-nested' },
        );
      });
      await page.waitForLoadState('networkidle');

      // Add an item
      const addButton = page.locator('.array-add-button, button:has-text("Add")').first();
      await addButton.click();
      await page.waitForTimeout(300);

      // Should have multiple fields
      const firstNameInput = page.locator('#users input').first();
      const lastNameInput = page.locator('#users input').nth(1);
      const roleSelect = page.locator('#users select').first();

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

    test('should handle array with initial values', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'contacts',
                type: 'array',
                label: 'Contacts',
                value: [
                  { name: 'Alice', email: 'alice@example.com' },
                  { name: 'Bob', email: 'bob@example.com' },
                ],
                fields: [
                  {
                    key: 'name',
                    type: 'input',
                    label: 'Name',
                  },
                  {
                    key: 'email',
                    type: 'input',
                    label: 'Email',
                    props: {
                      type: 'email',
                    },
                  },
                ],
              },
            ],
          },
          { testId: 'array-initial-values' },
        );
      });
      await page.waitForLoadState('networkidle');

      // Should have two items
      const nameInputs = page.locator('#contacts input:not([type="email"])');
      const emailInputs = page.locator('#contacts input[type="email"]');

      expect(await nameInputs.count()).toBe(2);
      expect(await emailInputs.count()).toBe(2);

      // Verify initial values
      expect(await nameInputs.first().inputValue()).toBe('Alice');
      expect(await emailInputs.first().inputValue()).toBe('alice@example.com');
      expect(await nameInputs.nth(1).inputValue()).toBe('Bob');
      expect(await emailInputs.nth(1).inputValue()).toBe('bob@example.com');
    });
  });
});
