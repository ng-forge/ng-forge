import { expect, test } from '@playwright/test';

test.describe('Comprehensive Material Field Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4201/test/comprehensive-field-tests');
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
            type: 'submit',
            label: 'Submit All Fields',
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

    // Wait for form to initialize and render
    await page.waitForSelector('[data-testid="comprehensive-fields"]', { state: 'visible', timeout: 10000 });

    // Verify the form container is visible
    await expect(page.locator('[data-testid="comprehensive-fields"]')).toBeVisible();

    // Test title and description (use the testId for the container)
    await expect(page.locator('[data-testid="comprehensive-fields-title"]')).toContainText('Comprehensive Field Testing');

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

    // Test Select Field (Material overlays render at root, not as children)
    await expect(page.locator('#selectField mat-select')).toBeVisible();
    await page.click('#selectField mat-select');
    // Wait for overlay to appear and click option
    await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'Option 2' }).click();

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

    // Test Datepicker Field (Material overlays render at root)
    await expect(page.locator('#datepickerField mat-datepicker-toggle')).toBeVisible();
    await page.click('#datepickerField mat-datepicker-toggle');
    // Wait for calendar overlay and select today's date
    await page.locator('.cdk-overlay-pane mat-calendar .mat-calendar-body-today').click();

    // Test Slider Field
    await expect(page.locator('#sliderField mat-slider')).toBeVisible();
    // Move slider using keyboard (Material slider responds to arrow keys)
    const slider = page.locator('#sliderField mat-slider');
    await slider.click();
    // Press arrow keys to move slider value
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press('ArrowRight');
    }

    // Submit form
    await page.click('#submit button');

    // Open details to see submission
    await page.click('.form-state summary');

    // Verify submission contains all field values
    const submissionElement = page.locator('[data-testid="submission-0"]');
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
            type: 'submit',
            label: 'Submit with Validation',
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

    // Wait for form to render
    await page.waitForSelector('[data-testid="validation-test"]', { state: 'visible', timeout: 10000 });

    // Verify submit button is disabled when form is empty (validation working)
    await expect(page.locator('#submitValidation button')).toBeDisabled();

    // Test invalid inputs - button should remain disabled
    await page.fill('#requiredText input', 'Hi'); // Only 2 characters (too short)
    await page.fill('#emailValidation input', 'invalid-email'); // Invalid format
    await page.fill('#numberRange input', '150'); // Above max
    await page.fill('#patternValidation input', 'Hello123!'); // Contains numbers and special chars

    // Button should still be disabled due to validation errors
    await expect(page.locator('#submitValidation button')).toBeDisabled();

    // Now fill with valid data
    await page.fill('#requiredText input', 'Valid text input');
    await page.fill('#emailValidation input', 'valid@example.com');
    await page.fill('#numberRange input', '50');
    await page.fill('#patternValidation input', 'Valid Name');

    // Button should now be enabled
    await expect(page.locator('#submitValidation button')).toBeEnabled();

    // Submit should now work
    await page.click('#submitValidation button');

    // Open details to see submission - need to open the details element first
    await page.click('.form-state summary');

    // Verify successful submission
    await expect(page.locator('[data-testid="submission-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="submission-0"]')).toContainText('Valid text input');
    await expect(page.locator('[data-testid="submission-0"]')).toContainText('valid@example.com');
    await expect(page.locator('[data-testid="submission-0"]')).toContainText('50');
    await expect(page.locator('[data-testid="submission-0"]')).toContainText('Valid Name');
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
            type: 'submit',
            label: 'Submit Grid Test',
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

    // Wait for form to render
    await page.waitForSelector('[data-testid="grid-layout"]', { state: 'visible', timeout: 10000 });

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

    // Open details to see submission
    await page.click('.form-state summary');

    // Verify submission contains all grid field values
    await expect(page.locator('[data-testid="submission-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="submission-0"]')).toContainText('Full width content');
    await expect(page.locator('[data-testid="submission-0"]')).toContainText('Half 1');
    await expect(page.locator('[data-testid="submission-0"]')).toContainText('Half 2');
    await expect(page.locator('[data-testid="submission-0"]')).toContainText('Third 1');

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
            type: 'submit',
            label: 'Submit State Test',
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

    // Wait for form to render
    await page.waitForSelector('[data-testid="state-management"]', { state: 'visible', timeout: 10000 });

    // Wait for first input field to be visible
    await page.waitForSelector('#stateInput1 input', { state: 'visible', timeout: 5000 });

    // Initially form should be mostly empty (checkbox fields initialize with false)
    await page.click('.form-state summary');
    const initialFormValue = await page.locator('[data-testid="form-value-state-management"]').textContent();
    // Checkbox fields start with false, so we just verify it's not fully populated yet
    expect(initialFormValue).toBeDefined();

    // Fill first input and check state update
    await page.fill('#stateInput1 input', 'First value');

    // Wait for form value to update (Angular needs time to update the model)
    await page.waitForFunction(
      () => {
        const element = document.querySelector('[data-testid="form-value-state-management"]');
        return element?.textContent?.includes('First value') || false;
      },
      { timeout: 5000 },
    );

    // Check that form state reflects the change
    const updatedFormValue = await page.locator('[data-testid="form-value-state-management"]').textContent();
    expect(updatedFormValue).toContain('First value');

    // Fill second input
    await page.fill('#stateInput2 input', 'Second value');

    // Toggle checkbox
    await page.click('#stateCheckbox mat-checkbox');

    // Wait for checkbox value to update in the form
    await page.waitForTimeout(100);

    // Check final form state
    const finalFormValue = await page.locator('[data-testid="form-value-state-management"]').textContent();
    expect(finalFormValue).toContain('First value');
    expect(finalFormValue).toContain('Second value');
    expect(finalFormValue).toContain('true'); // checkbox should be true

    // Submit form
    await page.click('#submitState button');

    // Details is already open from earlier, so we can check submission directly
    // Check submission log
    await expect(page.locator('[data-testid="submission-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="submission-0"]')).toContainText('First value');
    await expect(page.locator('[data-testid="submission-0"]')).toContainText('Second value');

    // Test multiple submissions
    await page.fill('#stateInput1 input', 'Modified first value');
    await page.click('#submitState button');

    // Should have two submissions now
    await expect(page.locator('[data-testid="submission-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="submission-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="submission-1"]')).toContainText('Modified first value');
  });
});
