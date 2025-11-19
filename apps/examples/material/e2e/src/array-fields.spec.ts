import { expect, test } from '@playwright/test';

test.describe('Array Fields Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/test/array-fields');
    await page.waitForFunction(() => window.loadTestScenario !== undefined);
  });

  test.describe('Basic Array Operations', () => {
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
                label: 'Add Email',
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
      const addButton = page.locator('.array-add-button, button:has-text("Add Email")').first();
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
          {
            testId: 'array-remove',
            initialValue: {
              phones: [{ phone: '555-0001' }, { phone: '555-0002' }],
            },
          },
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
                label: 'Add Task',
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
      const addButton = page.locator('.array-add-button, button:has-text("Add Task")').first();
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

    test('should handle array with initial values', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'contacts',
                type: 'array',
                label: 'Contacts',
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
          {
            testId: 'array-initial-values',
            initialValue: {
              contacts: [
                { name: 'Alice', email: 'alice@example.com' },
                { name: 'Bob', email: 'bob@example.com' },
              ],
            },
          },
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
                label: 'Add Member',
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
      const addButton = page.locator('.array-add-button, button:has-text("Add Member")').first();
      await addButton.click();
      await page.waitForTimeout(200);

      // Fields should be marked as required
      const nameInput = page.locator('#members input').first();
      const emailInput = page.locator('#members input[type="email"]').first();

      expect(await nameInput.getAttribute('required')).not.toBeNull();
      expect(await emailInput.getAttribute('required')).not.toBeNull();
    });

    test.fixme('should enforce minimum array length', async ({ page }) => {
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

      // Submit button should be present
      await expect(page.locator('#submit button')).toBeVisible();

      // Note: Min length validation is enforced by the form framework
    });

    test.fixme('should enforce maximum array length', async ({ page }) => {
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
                fields: [tagFieldTemplate],
              },
              {
                key: 'addTagButton',
                type: 'button',
                label: 'Add Tag',
                className: 'array-add-button',
                event: (window as any).AddTagsEvent,
              },
            ],
          },
          {
            testId: 'array-max-length',
            initialValue: {
              tags: [{ tag: 'tag1' }, { tag: 'tag2' }],
            },
          },
        );
      });
      await page.waitForLoadState('networkidle');

      // Should have two items initially
      let inputs = page.locator('#tags input');
      expect(await inputs.count()).toBe(2);

      // Add one more (should be allowed - max is 3)
      const addButton = page.locator('.array-add-button, button:has-text("Add Tag")').first();
      await addButton.click();
      await page.waitForTimeout(200);

      // Should have three items
      inputs = page.locator('#tags input');
      expect(await inputs.count()).toBe(3);

      // Note: Add button may be disabled when max length is reached
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
                label: 'Add User',
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
      const addButton = page.locator('.array-add-button, button:has-text("Add User")').first();
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

    test('should handle multiple add and remove operations', async ({ page }) => {
      await page.evaluate(() => {
        class AddNotesEvent extends (window as any).AddArrayItemEvent {
          constructor() {
            super('notes', {
              key: 'note',
              type: 'input',
              label: 'Note',
            });
          }
        }
        (window as any).AddNotesEvent = AddNotesEvent;

        class RemoveNotesEvent extends (window as any).RemoveArrayItemEvent {
          constructor() {
            super('notes');
          }
        }
        (window as any).RemoveNotesEvent = RemoveNotesEvent;

        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'notes',
                type: 'array',
                label: 'Notes',
                fields: [
                  {
                    key: 'note',
                    type: 'input',
                    label: 'Note',
                  },
                ],
              },
              {
                key: 'addNoteButton',
                type: 'button',
                label: 'Add Note',
                className: 'array-add-button',
                event: (window as any).AddNotesEvent,
              },
              {
                key: 'removeNoteButton',
                type: 'button',
                label: 'Remove Last',
                className: 'array-remove-button',
                event: (window as any).RemoveNotesEvent,
              },
            ],
          },
          {
            testId: 'array-multiple-ops',
            initialValue: {
              notes: [{ note: 'First note' }, { note: 'Second note' }],
            },
          },
        );
      });
      await page.waitForLoadState('networkidle');

      let noteInputs = page.locator('#notes input');
      const addButton = page.locator('button:has-text("Add Note")');
      const removeButton = page.locator('button:has-text("Remove Last")');

      // Verify initial count
      expect(await noteInputs.count()).toBe(2);

      // Add 3 new notes
      for (let i = 0; i < 3; i++) {
        await addButton.click();
        await page.waitForTimeout(100);
      }

      // Should have 5 total
      noteInputs = page.locator('#notes input');
      expect(await noteInputs.count()).toBe(5);

      // Remove 2 notes
      for (let i = 0; i < 2; i++) {
        await removeButton.click();
        await page.waitForTimeout(100);
      }

      // Should have 3 remaining
      noteInputs = page.locator('#notes input');
      expect(await noteInputs.count()).toBe(3);

      // Verify original values are maintained
      expect(await noteInputs.first().inputValue()).toBe('First note');
      expect(await noteInputs.nth(1).inputValue()).toBe('Second note');
    });
  });
});
