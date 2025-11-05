/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from '@playwright/test';

test.describe('Comprehensive Material Field Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e-test');
    // Wait for the component to initialize and loadTestScenario to be available
    await page.waitForFunction(() => window.loadTestScenario !== undefined);
  });

  test('should test all basic field types', async ({ page }) => {
    // Load comprehensive field scenario
    await page.evaluate(() => {
      const comprehensiveConfig = {
        fields: [
          // Text Input
          {
            key: 'textInput',
            type: 'input',
            label: 'Text Input',
            props: {
              placeholder: 'Enter text',
            },
            required: true,
            col: 6,
          },
          // Email Input
          {
            key: 'emailInput',
            type: 'input',
            label: 'Email Input',
            props: {
              type: 'email',
              placeholder: 'Enter email',
            },
            email: true,
            required: true,
            col: 6,
          },
          // Password Input
          {
            key: 'passwordInput',
            type: 'input',
            label: 'Password',
            props: {
              type: 'password',
              placeholder: 'Enter password',
            },
            required: true,
            minLength: 8,
            col: 6,
          },
          // Number Input
          {
            key: 'numberInput',
            type: 'input',
            label: 'Number Input',
            props: {
              type: 'number',
              placeholder: 'Enter number',
            },
            min: 1,
            max: 100,
            col: 6,
          },
          // Textarea
          {
            key: 'textareaField',
            type: 'textarea',
            label: 'Textarea Field',
            props: {
              placeholder: 'Enter long text',
              rows: 4,
            },
            col: 12,
          },
          // Select Field
          {
            key: 'selectField',
            type: 'select',
            label: 'Select Field',
            options: [
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' },
            ],
            col: 6,
          },
          // Multi-Select Field
          {
            key: 'multiSelectField',
            type: 'select',
            label: 'Multi-Select Field',
            options: [
              { value: 'tag1', label: 'Tag 1' },
              { value: 'tag2', label: 'Tag 2' },
              { value: 'tag3', label: 'Tag 3' },
            ],
            props: {
              multiple: true,
            },
            col: 6,
          },
          // Radio Field
          {
            key: 'radioField',
            type: 'radio',
            label: 'Radio Field',
            options: [
              { value: 'radio1', label: 'Radio Option 1' },
              { value: 'radio2', label: 'Radio Option 2' },
              { value: 'radio3', label: 'Radio Option 3' },
            ],
            col: 12,
          },
          // Checkbox Field
          {
            key: 'checkboxField',
            type: 'checkbox',
            label: 'Checkbox Field',
            col: 6,
          },
          // Toggle Field
          {
            key: 'toggleField',
            type: 'toggle',
            label: 'Toggle Field',
            props: {
              id: 'toggleField',
            },
            col: 6,
          },
          // Multi-Checkbox Field
          {
            key: 'multiCheckboxField',
            type: 'multi-checkbox',
            label: 'Multi-Checkbox Field',
            options: [
              { value: 'check1', label: 'Checkbox 1' },
              { value: 'check2', label: 'Checkbox 2' },
              { value: 'check3', label: 'Checkbox 3' },
            ],
            col: 12,
          },
          // Datepicker Field
          {
            key: 'datepickerField',
            type: 'datepicker',
            label: 'Date Picker',
            col: 6,
          },
          // Slider Field
          {
            key: 'sliderField',
            type: 'slider',
            label: 'Slider Field',
            props: {
              min: 0,
              max: 100,
              step: 10,
            },
            col: 6,
          },
          // Submit Button
          {
            key: 'submit',
            type: 'button',
            label: 'Submit All Fields',
            props: {
              type: 'submit',
            },
            col: 12,
          },
        ],
      };

      (window as any).loadTestScenario(comprehensiveConfig, {
        testId: 'comprehensive-fields',
        title: 'Comprehensive Field Testing',
        description: 'Testing all available Material Design field types',
      });
    });

    // Wait for form initialization
    await page.waitForFunction(() => {
      return new Promise((resolve) => {
        const handler = () => {
          window.removeEventListener('formInitialized', handler);
          resolve(true);
        };
        window.addEventListener('formInitialized', handler);
      });
    });

    // Wait a bit more for the DOM to be ready
    await page.waitForTimeout(1000);

    // Verify the form container is visible
    await expect(page.locator('#comprehensive-fields')).toBeVisible();

    // Test title and description (use the testId for the container)
    await expect(page.locator('#comprehensive-fields-title')).toContainText('Comprehensive Field Testing');

    // Test Text Input
    await expect(page.locator('#textInput input')).toBeVisible();
    await page.fill('#textInput input', 'Test text value');

    // Test Email Input
    await expect(page.locator('#emailInput input')).toBeVisible();
    await page.fill('#emailInput input', 'test@example.com');

    // Test Password Input
    await expect(page.locator('#passwordInput input')).toBeVisible();
    await page.fill('#passwordInput input', 'password123');

    // Test Number Input
    await expect(page.locator('#numberInput input')).toBeVisible();
    await page.fill('#numberInput input', '42');

    // Test Textarea
    await expect(page.locator('#textareaField textarea')).toBeVisible();
    await page.fill('#textareaField textarea', 'This is a long text that spans multiple lines and tests the textarea field functionality.');

    // Test Select Field
    await expect(page.locator('#selectField mat-select')).toBeVisible();
    await page.click('#selectField mat-select');
    await page.waitForSelector('mat-option[value="option2"]', { state: 'visible' });
    await page.click('mat-option[value="option2"]');

    // Test Radio Field
    await expect(page.locator('#radioField mat-radio-group')).toBeVisible();
    await page.click('#radioField mat-radio-button:has-text("Radio Option 2")');

    // Test Checkbox Field
    await expect(page.locator('#checkboxField mat-checkbox')).toBeVisible();
    await page.click('#checkboxField mat-checkbox');

    // Test Toggle Field
    await expect(page.locator('#toggleField mat-slide-toggle')).toBeVisible();
    await page.click('#toggleField mat-slide-toggle');

    // Test Multi-Checkbox Field
    await expect(page.locator('#multiCheckboxField')).toBeVisible();
    await page.click('#multiCheckboxField mat-checkbox:has-text("Checkbox 1")');
    await page.click('#multiCheckboxField mat-checkbox:has-text("Checkbox 3")');

    // Test Datepicker Field
    await expect(page.locator('#datepickerField mat-datepicker-toggle')).toBeVisible();
    await page.click('#datepickerField mat-datepicker-toggle');
    // Select today's date
    await page.click('mat-calendar .mat-calendar-body-today');

    // Test Slider Field
    await expect(page.locator('#sliderField mat-slider')).toBeVisible();
    // Move slider to approximately 70
    const sliderThumb = page.locator('#sliderField mat-slider .mat-slider-thumb');
    await sliderThumb.click();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');

    // Submit form
    await page.click('#submit button');

    // Verify submission contains all field values
    const submissionElement = page.locator('#submission-0');
    await expect(submissionElement).toBeVisible();
    await expect(submissionElement).toContainText('Test text value');
    await expect(submissionElement).toContainText('test@example.com');
    await expect(submissionElement).toContainText('option2');
    await expect(submissionElement).toContainText('radio2');
  });

  test('should handle field validation errors', async ({ page }) => {
    // Load validation testing scenario
    await page.evaluate(() => {
      const validationConfig = {
        fields: [
          // Required text field
          {
            key: 'requiredText',
            type: 'input',
            label: 'Required Text (minimum 5 characters)',
            props: {
              placeholder: 'Enter at least 5 characters',
            },
            required: true,
            minLength: 5,
            col: 12,
          },
          // Email validation
          {
            key: 'emailValidation',
            type: 'input',
            label: 'Email Validation',
            props: {
              type: 'email',
              placeholder: 'Enter valid email',
            },
            email: true,
            required: true,
            col: 12,
          },
          // Number with range validation
          {
            key: 'numberRange',
            type: 'input',
            label: 'Number (1-100)',
            props: {
              type: 'number',
              placeholder: 'Enter number between 1 and 100',
            },
            min: 1,
            max: 100,
            required: true,
            col: 12,
          },
          // Pattern validation
          {
            key: 'patternValidation',
            type: 'input',
            label: 'Pattern Validation (Only letters and spaces)',
            props: {
              placeholder: 'Only letters and spaces allowed',
            },
            pattern: '^[a-zA-Z\\s]+$',
            required: true,
            col: 12,
          },
          // Submit Button
          {
            key: 'submitValidation',
            type: 'button',
            label: 'Submit with Validation',
            props: {
              type: 'submit',
            },
            col: 12,
          },
        ],
      };

      (window as any).loadTestScenario(validationConfig, {
        testId: 'validation-test',
        title: 'Validation Testing',
        description: 'Testing various field validations and error handling',
      });
    });

    // Wait for form initialization
    await page.waitForFunction(() => {
      return new Promise((resolve) => {
        const handler = () => {
          window.removeEventListener('formInitialized', handler);
          resolve(true);
        };
        window.addEventListener('formInitialized', handler);
      });
    });

    // Try submitting empty form (should fail validation)
    await page.click('#submitValidation button');

    // Form should not submit (no submission in log)
    const submissionExists = await page.locator('#submission-0').isVisible();
    expect(submissionExists).toBeFalsy();

    // Test invalid inputs

    // Too short text
    await page.fill('#requiredText input', 'Hi'); // Only 2 characters

    // Invalid email
    await page.fill('#emailValidation input', 'invalid-email');

    // Number out of range
    await page.fill('#numberRange input', '150'); // Above max

    // Invalid pattern
    await page.fill('#patternValidation input', 'Hello123!'); // Contains numbers and special chars

    // Try submitting with invalid data
    await page.click('#submitValidation button');

    // Should still not submit
    const submissionStillExists = await page.locator('#submission-0').isVisible();
    expect(submissionStillExists).toBeFalsy();

    // Now fill with valid data
    await page.fill('#requiredText input', 'Valid text input');
    await page.fill('#emailValidation input', 'valid@example.com');
    await page.fill('#numberRange input', '50');
    await page.fill('#patternValidation input', 'Valid Name');

    // Submit again
    await page.click('#submitValidation button');

    // Should now submit successfully
    await expect(page.locator('#submission-0')).toBeVisible();
    await expect(page.locator('#submission-0')).toContainText('Valid text input');
    await expect(page.locator('#submission-0')).toContainText('valid@example.com');
    await expect(page.locator('#submission-0')).toContainText('50');
    await expect(page.locator('#submission-0')).toContainText('Valid Name');
  });

  test('should test responsive grid layout', async ({ page }) => {
    // Load grid layout testing scenario
    await page.evaluate(() => {
      const gridConfig = {
        fields: [
          {
            key: 'fullWidth',
            type: 'input',
            label: 'Full Width (col-12)',
            props: {
              placeholder: 'This takes full width',
            },
            col: 12,
          },
          {
            key: 'halfWidth1',
            type: 'input',
            label: 'Half Width 1 (col-6)',
            props: {
              placeholder: 'Half width field 1',
            },
            col: 6,
          },
          {
            key: 'halfWidth2',
            type: 'input',
            label: 'Half Width 2 (col-6)',
            props: {
              placeholder: 'Half width field 2',
            },
            col: 6,
          },
          {
            key: 'thirdWidth1',
            type: 'input',
            label: 'Third Width 1 (col-4)',
            props: {
              placeholder: 'Third width field 1',
            },
            col: 4,
          },
          {
            key: 'thirdWidth2',
            type: 'input',
            label: 'Third Width 2 (col-4)',
            props: {
              placeholder: 'Third width field 2',
            },
            col: 4,
          },
          {
            key: 'thirdWidth3',
            type: 'input',
            label: 'Third Width 3 (col-4)',
            props: {
              placeholder: 'Third width field 3',
            },
            col: 4,
          },
          {
            key: 'quarterWidth1',
            type: 'input',
            label: 'Quarter 1 (col-3)',
            props: {
              placeholder: 'Quarter 1',
            },
            col: 3,
          },
          {
            key: 'quarterWidth2',
            type: 'input',
            label: 'Quarter 2 (col-3)',
            props: {
              placeholder: 'Quarter 2',
            },
            col: 3,
          },
          {
            key: 'quarterWidth3',
            type: 'input',
            label: 'Quarter 3 (col-3)',
            props: {
              placeholder: 'Quarter 3',
            },
            col: 3,
          },
          {
            key: 'quarterWidth4',
            type: 'input',
            label: 'Quarter 4 (col-3)',
            props: {
              placeholder: 'Quarter 4',
            },
            col: 3,
          },
          {
            key: 'submitGrid',
            type: 'button',
            label: 'Submit Grid Test',
            props: {
              type: 'submit',
            },
            col: 12,
          },
        ],
      };

      (window as any).loadTestScenario(gridConfig, {
        testId: 'grid-layout',
        title: 'Grid Layout Testing',
        description: 'Testing responsive grid system with various column configurations',
      });
    });

    // Wait for form initialization
    await page.waitForFunction(() => {
      return new Promise((resolve) => {
        const handler = () => {
          window.removeEventListener('formInitialized', handler);
          resolve(true);
        };
        window.addEventListener('formInitialized', handler);
      });
    });

    // Test desktop layout (default)
    await expect(page.locator('#fullWidth')).toBeVisible();
    await expect(page.locator('#halfWidth1')).toBeVisible();
    await expect(page.locator('#halfWidth2')).toBeVisible();
    await expect(page.locator('#thirdWidth1')).toBeVisible();
    await expect(page.locator('#thirdWidth2')).toBeVisible();
    await expect(page.locator('#thirdWidth3')).toBeVisible();

    // Fill some fields to test interaction
    await page.fill('#fullWidth input', 'Full width content');
    await page.fill('#halfWidth1 input', 'Half 1');
    await page.fill('#halfWidth2 input', 'Half 2');
    await page.fill('#thirdWidth1 input', 'Third 1');
    await page.fill('#thirdWidth2 input', 'Third 2');
    await page.fill('#thirdWidth3 input', 'Third 3');

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone 6/7/8 size

    // Fields should still be visible and functional on mobile
    await expect(page.locator('#fullWidth')).toBeVisible();
    await expect(page.locator('#halfWidth1')).toBeVisible();
    await expect(page.locator('#halfWidth2')).toBeVisible();

    // Fill quarter width fields on mobile
    await page.fill('#quarterWidth1 input', 'Q1');
    await page.fill('#quarterWidth2 input', 'Q2');
    await page.fill('#quarterWidth3 input', 'Q3');
    await page.fill('#quarterWidth4 input', 'Q4');

    // Submit form
    await page.click('#submitGrid button');

    // Verify submission contains all grid field values
    await expect(page.locator('#submission-0')).toBeVisible();
    await expect(page.locator('#submission-0')).toContainText('Full width content');
    await expect(page.locator('#submission-0')).toContainText('Half 1');
    await expect(page.locator('#submission-0')).toContainText('Half 2');
    await expect(page.locator('#submission-0')).toContainText('Third 1');

    // Reset viewport back to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should test form state management', async ({ page }) => {
    // Load form state testing scenario
    await page.evaluate(() => {
      const stateConfig = {
        fields: [
          {
            key: 'stateInput1',
            type: 'input',
            label: 'State Input 1',
            props: {
              placeholder: 'Enter value 1',
            },
            col: 6,
          },
          {
            key: 'stateInput2',
            type: 'input',
            label: 'State Input 2',
            props: {
              placeholder: 'Enter value 2',
            },
            col: 6,
          },
          {
            key: 'stateCheckbox',
            type: 'checkbox',
            label: 'State Checkbox',
            col: 12,
          },
          {
            key: 'submitState',
            type: 'button',
            label: 'Submit State Test',
            props: {
              type: 'submit',
            },
            col: 12,
          },
        ],
      };

      (window as any).loadTestScenario(stateConfig, {
        testId: 'state-management',
        title: 'Form State Management',
        description: 'Testing form state tracking and management',
      });
    });

    // Wait for form initialization
    await page.waitForFunction(() => {
      return new Promise((resolve) => {
        const handler = () => {
          window.removeEventListener('formInitialized', handler);
          resolve(true);
        };
        window.addEventListener('formInitialized', handler);
      });
    });

    // Initially form should be empty
    await page.click('.form-state summary');
    const initialFormValue = await page.locator('#form-value-state-management').textContent();
    expect(initialFormValue).toContain('{}');

    // Fill first input and check state update
    await page.fill('#stateInput1 input', 'First value');

    // Check that form state reflects the change
    const updatedFormValue = await page.locator('#form-value-state-management').textContent();
    expect(updatedFormValue).toContain('First value');

    // Fill second input
    await page.fill('#stateInput2 input', 'Second value');

    // Toggle checkbox
    await page.click('#stateCheckbox mat-checkbox');

    // Check final form state
    const finalFormValue = await page.locator('#form-value-state-management').textContent();
    expect(finalFormValue).toContain('First value');
    expect(finalFormValue).toContain('Second value');
    expect(finalFormValue).toContain('true'); // checkbox should be true

    // Submit form
    await page.click('#submitState button');

    // Check submission log
    await expect(page.locator('#submission-0')).toBeVisible();
    await expect(page.locator('#submission-0')).toContainText('First value');
    await expect(page.locator('#submission-0')).toContainText('Second value');

    // Test multiple submissions
    await page.fill('#stateInput1 input', 'Modified first value');
    await page.click('#submitState button');

    // Should have two submissions now
    await expect(page.locator('#submission-0')).toBeVisible();
    await expect(page.locator('#submission-1')).toBeVisible();
    await expect(page.locator('#submission-1')).toContainText('Modified first value');
  });
});
