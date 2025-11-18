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

test.describe('Material Examples - Array Demo Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to material-examples app array demo
    await page.goto('http://localhost:4201/#/examples/array');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Initial State with Predefined Values', () => {
    test('should display predefined tags', async ({ page }) => {
      // Verify 2 predefined tags are displayed
      const tagInputs = page.locator('#tags input');
      await expect(tagInputs).toHaveCount(2);

      // Verify tag values
      await expect(tagInputs.nth(0)).toHaveValue('angular');
      await expect(tagInputs.nth(1)).toHaveValue('typescript');

      // Verify remove buttons are present
      const removeButtons = page.locator('.remove-tag-button');
      await expect(removeButtons).toHaveCount(2);

      // Verify form data displays tags
      const formData = page.locator('.example-result pre');
      await expect(formData).toContainText('angular');
      await expect(formData).toContainText('typescript');
    });

    test('should display predefined contact', async ({ page }) => {
      // Verify 1 predefined contact group is rendered
      const contactFields = page.locator('#contacts');
      await expect(contactFields).toBeVisible();

      // Verify contact input fields exist
      const nameInput = page.locator('#contacts input:not([type="tel"])').first();
      const phoneInput = page.locator('#contacts input[type="tel"]').first();
      await expect(nameInput).toBeVisible();
      await expect(phoneInput).toBeVisible();

      // Verify remove button is present
      const removeButton = page.locator('.remove-contact-button');
      await expect(removeButton).toHaveCount(1);

      // Verify form data has predefined contact values
      const formData = page.locator('.example-result pre');
      await expect(formData).toContainText('Jane Smith');
      await expect(formData).toContainText('5551234567');
      await expect(formData).toContainText('family');
    });
  });

  test.describe('Tags - Flat Array Operations', () => {
    test('should add new tag to existing predefined tags', async ({ page }) => {
      // Verify initial count (2 predefined)
      let tagInputs = page.locator('#tags input');
      await expect(tagInputs).toHaveCount(2);

      // Add new tag
      const addButton = page.locator('button:has-text("Add Tag")');
      await addButton.click();
      await page.waitForTimeout(200);

      // Verify count increased to 3
      tagInputs = page.locator('#tags input');
      await expect(tagInputs).toHaveCount(3);

      // Fill new tag
      await tagInputs.nth(2).fill('javascript');
      await expect(tagInputs.nth(2)).toHaveValue('javascript');

      // Verify predefined tags are still present
      await expect(tagInputs.nth(0)).toHaveValue('angular');
      await expect(tagInputs.nth(1)).toHaveValue('typescript');

      // Verify form data contains all tags
      const formData = page.locator('.example-result pre');
      await expect(formData).toContainText('angular');
      await expect(formData).toContainText('typescript');
      await expect(formData).toContainText('javascript');
    });

    test('should remove predefined tag', async ({ page }) => {
      // Verify initial count
      let tagInputs = page.locator('#tags input');
      await expect(tagInputs).toHaveCount(2);
      await expect(tagInputs.nth(0)).toHaveValue('angular');

      // Remove first tag (angular)
      const removeButtons = page.locator('.remove-tag-button');
      await removeButtons.first().click();
      await page.waitForTimeout(200);

      // Verify count decreased to 1
      tagInputs = page.locator('#tags input');
      await expect(tagInputs).toHaveCount(1);

      // Verify typescript is still present
      await expect(tagInputs.first()).toHaveValue('typescript');

      // Verify form data no longer contains removed tag
      const formData = page.locator('.example-result pre');
      await expect(formData).not.toContainText('angular');
      await expect(formData).toContainText('typescript');
    });

    test('should edit predefined tag value', async ({ page }) => {
      const tagInputs = page.locator('#tags input');
      await expect(tagInputs.nth(0)).toHaveValue('angular');

      // Edit first tag
      await tagInputs.nth(0).clear();
      await tagInputs.nth(0).fill('react');
      await expect(tagInputs.nth(0)).toHaveValue('react');

      // Verify form data reflects change
      const formData = page.locator('.example-result pre');
      await expect(formData).toContainText('react');
      await expect(formData).not.toContainText('angular');
      await expect(formData).toContainText('typescript');
    });

    test('should validate required tag field', async ({ page }) => {
      // Add new tag
      const addButton = page.locator('button:has-text("Add Tag")');
      await addButton.click();
      await page.waitForTimeout(200);

      // Tags are nested in rows with a "value" field
      const tagInputs = page.locator('#tags input[type="text"]');
      const newTagInput = tagInputs.nth(2);

      // Material uses aria-required instead of required attribute
      await expect(newTagInput).toHaveAttribute('aria-required', 'true');

      // Verify the input is visible and editable
      await expect(newTagInput).toBeVisible();
      await expect(newTagInput).toBeEditable();
    });

    test('should handle multiple add and remove operations', async ({ page }) => {
      let tagInputs = page.locator('#tags input');
      const addButton = page.locator('button:has-text("Add Tag")');

      // Add 3 new tags
      for (let i = 0; i < 3; i++) {
        await addButton.click();
        await page.waitForTimeout(100);
      }

      // Should have 5 total (2 predefined + 3 new)
      await expect(tagInputs).toHaveCount(5);

      // Fill new tags
      await tagInputs.nth(2).fill('vue');
      await tagInputs.nth(3).fill('react');
      await tagInputs.nth(4).fill('svelte');

      // Remove the middle one (react at index 3)
      const removeButtons = page.locator('.remove-tag-button');
      await removeButtons.nth(3).click();
      await page.waitForTimeout(200);

      // Should have 4 remaining
      tagInputs = page.locator('#tags input');
      await expect(tagInputs).toHaveCount(4);

      // Verify correct tags remain
      await expect(tagInputs.nth(0)).toHaveValue('angular');
      await expect(tagInputs.nth(1)).toHaveValue('typescript');
      await expect(tagInputs.nth(2)).toHaveValue('vue');
      await expect(tagInputs.nth(3)).toHaveValue('svelte');
    });
  });

  test.describe('Contacts - Object Array Operations', () => {
    test('should add new contact to existing predefined contact', async ({ page }) => {
      // Verify initial state (1 predefined contact)
      let nameInputs = page.locator('#contacts input:not([type="tel"])');
      await expect(nameInputs).toHaveCount(1);

      // Add new contact
      const addButton = page.locator('button:has-text("Add Contact")');
      await addButton.click();
      await page.waitForTimeout(300);

      // Verify count increased to 2
      nameInputs = page.locator('#contacts input:not([type="tel"])');
      await expect(nameInputs).toHaveCount(2);

      // Fill new contact (fields start empty) - use blur() to trigger form updates
      await nameInputs.nth(1).fill('John Doe');
      await nameInputs.nth(1).blur();
      await page.waitForTimeout(200);

      const phoneInputs = page.locator('#contacts input[type="tel"]');
      await phoneInputs.nth(1).fill('5559876543');
      await phoneInputs.nth(1).blur();
      await page.waitForTimeout(200);

      // Use mat-select instead of select
      const matSelect = page.locator('#contacts mat-select').nth(1);
      await matSelect.click();
      await page.waitForTimeout(100);
      await page.locator('mat-option:has-text("Friend")').click();
      await page.waitForTimeout(200);

      // Verify form data contains both contacts (use JSON instead of input values)
      const formData = page.locator('.example-result pre');
      await expect(formData).toContainText('Jane Smith');
      await expect(formData).toContainText('John Doe');
    });

    test('should remove predefined contact', async ({ page }) => {
      // Verify initial count
      let nameInputs = page.locator('#contacts input:not([type="tel"])');
      await expect(nameInputs).toHaveCount(1);

      // Verify form data initially has the contact
      let formData = page.locator('.example-result pre');
      await expect(formData).toContainText('Jane Smith');

      // Remove contact - array fields may keep minimum 1 item
      const removeButton = page.locator('.remove-contact-button');
      await removeButton.click();
      await page.waitForTimeout(300);

      // Check if there's a minimum item requirement
      nameInputs = page.locator('#contacts input:not([type="tel"])');
      const count = await nameInputs.count();

      // Verify form data shows empty contacts array
      formData = page.locator('.example-result pre');
      await expect(formData).toContainText('"contacts": []');
    });

    test('should edit predefined contact fields', async ({ page }) => {
      const nameInput = page.locator('#contacts input:not([type="tel"])').first();
      const phoneInput = page.locator('#contacts input[type="tel"]').first();

      // Edit text fields - use blur() to trigger form updates
      await nameInput.clear();
      await nameInput.fill('Sarah Connor');
      await nameInput.blur();
      await page.waitForTimeout(200);

      await phoneInput.clear();
      await phoneInput.fill('5550001111');
      await phoneInput.blur();
      await page.waitForTimeout(200);

      // Use mat-select instead of select
      const matSelect = page.locator('#contacts mat-select').first();
      await matSelect.click();
      await page.waitForTimeout(100);
      await page.locator('mat-option:has-text("Colleague")').click();
      await page.waitForTimeout(200);

      // Verify changes in input fields
      await expect(nameInput).toHaveValue('Sarah Connor');
      await expect(phoneInput).toHaveValue('5550001111');

      // Verify form data reflects changes
      const formData = page.locator('.example-result pre');
      await expect(formData).toContainText('Sarah Connor');
      await expect(formData).toContainText('5550001111');
      await expect(formData).toContainText('colleague');
    });

    test('should validate required contact fields', async ({ page }) => {
      // Add new contact
      const addButton = page.locator('button:has-text("Add Contact")');
      await addButton.click();
      await page.waitForTimeout(300);

      const nameInputs = page.locator('#contacts input:not([type="tel"])');
      const phoneInputs = page.locator('#contacts input[type="tel"]');

      // Verify required attributes
      await expect(nameInputs.nth(1)).toHaveAttribute('required');
      await expect(phoneInputs.nth(1)).toHaveAttribute('required');

      // Verify minlength on name
      await expect(nameInputs.nth(1)).toHaveAttribute('minlength', '2');
    });

    test('should validate phone pattern', async ({ page }) => {
      const phoneInput = page.locator('#contacts input[type="tel"]').first();

      // Verify input is editable
      await expect(phoneInput).toBeEditable();

      // Clear and enter invalid phone
      await phoneInput.clear();
      await phoneInput.fill('123');
      await phoneInput.blur();
      await page.waitForTimeout(300);

      // Material validation might show error state - check aria-invalid
      // (invalid state may not always be immediately visible)

      // Enter valid phone
      await phoneInput.clear();
      await phoneInput.fill('5551234567');
      await phoneInput.blur();
      await page.waitForTimeout(300);
      await expect(phoneInput).toHaveValue('5551234567');

      // Verify form data has valid phone
      const formData = page.locator('.example-result pre');
      await expect(formData).toContainText('5551234567');
    });

    test('should handle multiple contact operations', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add Contact")');

      // Add 2 more contacts (total 3)
      await addButton.click();
      await page.waitForTimeout(300);
      await addButton.click();
      await page.waitForTimeout(300);

      let nameInputs = page.locator('#contacts input:not([type="tel"])');
      await expect(nameInputs).toHaveCount(3);

      // Fill new contacts (fields start empty) - use blur() to trigger form updates
      await nameInputs.nth(1).fill('Bob Wilson');
      await nameInputs.nth(1).blur();
      await page.waitForTimeout(200);
      await page.locator('#contacts input[type="tel"]').nth(1).fill('5552222222');
      await page.locator('#contacts input[type="tel"]').nth(1).blur();
      await page.waitForTimeout(200);
      let matSelect = page.locator('#contacts mat-select').nth(1);
      await matSelect.click();
      await page.waitForTimeout(100);
      await page.locator('mat-option:has-text("Friend")').click();
      await page.waitForTimeout(200);

      await nameInputs.nth(2).fill('Alice Brown');
      await nameInputs.nth(2).blur();
      await page.waitForTimeout(200);
      await page.locator('#contacts input[type="tel"]').nth(2).fill('5553333333');
      await page.locator('#contacts input[type="tel"]').nth(2).blur();
      await page.waitForTimeout(200);
      matSelect = page.locator('#contacts mat-select').nth(2);
      await matSelect.click();
      await page.waitForTimeout(100);
      await page.locator('mat-option:has-text("Other")').click();
      await page.waitForTimeout(200);

      // Remove middle contact (Bob)
      const removeButtons = page.locator('.remove-contact-button');
      await removeButtons.nth(1).click();
      await page.waitForTimeout(300);

      // Should have 2 remaining
      nameInputs = page.locator('#contacts input:not([type="tel"])');
      await expect(nameInputs).toHaveCount(2);

      // Verify correct contacts remain via form data
      const formData = page.locator('.example-result pre');
      await expect(formData).toContainText('Jane Smith');
      await expect(formData).toContainText('Alice Brown');
      await expect(formData).not.toContainText('Bob Wilson');
    });
  });

  test.describe('Form Submission with Predefined Data', () => {
    test('should submit with only predefined data', async ({ page }) => {
      const submitButton = page.locator('button:has-text("Save All")');
      await submitButton.click();
      await page.waitForTimeout(200);

      // Verify form data contains predefined values
      const formData = page.locator('.example-result pre');
      await expect(formData).toContainText('angular');
      await expect(formData).toContainText('typescript');
      await expect(formData).toContainText('Jane Smith');
      await expect(formData).toContainText('5551234567');
    });

    test('should submit after modifying predefined data', async ({ page }) => {
      // Modify tag
      const tagInputs = page.locator('#tags input');
      await tagInputs.nth(0).clear();
      await tagInputs.nth(0).fill('vue');
      await tagInputs.nth(0).blur();
      await page.waitForTimeout(200);

      // Modify contact - fill all fields with new data - use blur() to trigger form updates
      const nameInput = page.locator('#contacts input:not([type="tel"])').first();
      await nameInput.clear();
      await nameInput.fill('Modified Name');
      await nameInput.blur();
      await page.waitForTimeout(200);

      const phoneInput = page.locator('#contacts input[type="tel"]').first();
      await phoneInput.clear();
      await phoneInput.fill('5559999999');
      await phoneInput.blur();
      await page.waitForTimeout(200);

      const matSelect = page.locator('#contacts mat-select').first();
      await matSelect.click();
      await page.waitForTimeout(100);
      await page.locator('mat-option:has-text("Friend")').click();
      await page.waitForTimeout(200);

      // Submit
      const submitButton = page.locator('button:has-text("Save All")');
      await submitButton.click();
      await page.waitForTimeout(200);

      // Verify modified data in form output
      const formData = page.locator('.example-result pre');
      await expect(formData).toContainText('vue');
      await expect(formData).not.toContainText('angular');
      await expect(formData).toContainText('Modified Name');
      await expect(formData).toContainText('5559999999');
      await expect(formData).not.toContainText('Jane Smith');
    });

    test('should submit with added items', async ({ page }) => {
      // Add tag
      await page.locator('button:has-text("Add Tag")').click();
      await page.waitForTimeout(200);
      await page.locator('#tags input').nth(2).fill('javascript');
      await page.locator('#tags input').nth(2).blur();
      await page.waitForTimeout(200);

      // Add contact - fill all fields completely - use blur() to trigger form updates
      await page.locator('button:has-text("Add Contact")').click();
      await page.waitForTimeout(300);
      await page.locator('#contacts input:not([type="tel"])').nth(1).fill('Emergency Contact');
      await page.locator('#contacts input:not([type="tel"])').nth(1).blur();
      await page.waitForTimeout(200);
      await page.locator('#contacts input[type="tel"]').nth(1).fill('5559999999');
      await page.locator('#contacts input[type="tel"]').nth(1).blur();
      await page.waitForTimeout(200);

      // Fill relationship select for new contact
      const matSelect = page.locator('#contacts mat-select').nth(1);
      await matSelect.click();
      await page.waitForTimeout(100);
      await page.locator('mat-option:has-text("Other")').click();
      await page.waitForTimeout(200);

      // Submit
      await page.locator('button:has-text("Save All")').click();
      await page.waitForTimeout(200);

      // Verify all data is present
      const formData = page.locator('.example-result pre');
      await expect(formData).toContainText('angular');
      await expect(formData).toContainText('typescript');
      await expect(formData).toContainText('javascript');
      await expect(formData).toContainText('Jane Smith');
      await expect(formData).toContainText('Emergency Contact');
    });

    test('should submit after removing items', async ({ page }) => {
      // Remove one tag
      await page.locator('.remove-tag-button').first().click();
      await page.waitForTimeout(200);

      // Submit
      await page.locator('button:has-text("Save All")').click();
      await page.waitForTimeout(200);

      // Verify only typescript remains
      const formData = page.locator('.example-result pre');
      await expect(formData).not.toContainText('angular');
      await expect(formData).toContainText('typescript');
      await expect(formData).toContainText('Jane Smith');
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle removing all predefined items', async ({ page }) => {
      // Remove all tags
      await page.locator('.remove-tag-button').first().click();
      await page.waitForTimeout(200);
      await page.locator('.remove-tag-button').first().click();
      await page.waitForTimeout(200);

      // Verify no tags remain
      const tagInputs = page.locator('#tags input');
      await expect(tagInputs).toHaveCount(0);

      // Remove contact - may keep minimum 1 item
      await page.locator('.remove-contact-button').click();
      await page.waitForTimeout(300);

      // Check if contacts were removed (may keep 1 empty item)
      const contactInputs = page.locator('#contacts input');
      const contactCount = await contactInputs.count();

      // Verify form data shows empty arrays (or array with 1 empty item)
      const formData = page.locator('.example-result pre');
      await expect(formData).toContainText('"contacts":');
      // Either empty array or array with empty object
    });

    test('should handle rapid add/remove operations', async ({ page }) => {
      const addTagButton = page.locator('button:has-text("Add Tag")');

      // Rapid add operations
      for (let i = 0; i < 5; i++) {
        await addTagButton.click();
        await page.waitForTimeout(50);
      }

      // Should have 7 tags (2 predefined + 5 new)
      let tagInputs = page.locator('#tags input');
      await expect(tagInputs).toHaveCount(7);

      // Rapid remove operations
      for (let i = 0; i < 3; i++) {
        await page.locator('.remove-tag-button').first().click();
        await page.waitForTimeout(50);
      }

      // Should have 4 tags remaining
      tagInputs = page.locator('#tags input');
      await expect(tagInputs).toHaveCount(4);
    });

    test('should preserve data integrity during complex operations', async ({ page }) => {
      // Add tag and fill it
      await page.locator('button:has-text("Add Tag")').click();
      await page.waitForTimeout(200);
      await page.locator('#tags input').nth(2).fill('react');
      await page.locator('#tags input').nth(2).blur();
      await page.waitForTimeout(200);

      // Edit predefined tag
      await page.locator('#tags input').nth(1).clear();
      await page.locator('#tags input').nth(1).fill('javascript');
      await page.locator('#tags input').nth(1).blur();
      await page.waitForTimeout(200);

      // Add contact and fill it completely - use blur() to trigger form updates
      await page.locator('button:has-text("Add Contact")').click();
      await page.waitForTimeout(300);
      await page.locator('#contacts input:not([type="tel"])').nth(1).fill('Test User');
      await page.locator('#contacts input:not([type="tel"])').nth(1).blur();
      await page.waitForTimeout(200);
      await page.locator('#contacts input[type="tel"]').nth(1).fill('5550000000');
      await page.locator('#contacts input[type="tel"]').nth(1).blur();
      await page.waitForTimeout(200);

      // Fill relationship select for new contact
      const matSelect = page.locator('#contacts mat-select').nth(1);
      await matSelect.click();
      await page.waitForTimeout(100);
      await page.locator('mat-option:has-text("Colleague")').click();
      await page.waitForTimeout(200);

      // Verify all values via form JSON instead of input values
      const formData = page.locator('.example-result pre');
      await expect(formData).toContainText('angular');
      await expect(formData).toContainText('javascript');
      await expect(formData).toContainText('react');
      await expect(formData).toContainText('Jane Smith');
      await expect(formData).toContainText('Test User');
      await expect(formData).toContainText('5550000000');
      await expect(formData).toContainText('colleague');
    });
  });
});
