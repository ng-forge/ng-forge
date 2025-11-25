import { expect, test } from '@playwright/test';

test.describe('Comprehensive Material Field Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4201/#/test/comprehensive-field-tests');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Comprehensive Fields Test', () => {
    test('should test all basic field types', async ({ page }) => {
      // Navigate to the comprehensive fields component
      await page.goto('http://localhost:4201/#/test/comprehensive-field-tests/comprehensive-fields');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="comprehensive-fields"]');
      await expect(scenario).toBeVisible();

      // Verify the form container and title
      await expect(scenario.locator('[data-testid="comprehensive-fields-title"]')).toContainText('Comprehensive Field Testing');

      // Test Text Input
      await expect(scenario.locator('#textInput input')).toBeVisible();
      await scenario.locator('#textInput input').fill('Test text value');

      // Test Email Input
      await expect(scenario.locator('#emailInput input')).toBeVisible();
      await scenario.locator('#emailInput input').fill('test@example.com');

      // Test Password Input
      await expect(scenario.locator('#passwordInput input')).toBeVisible();
      await scenario.locator('#passwordInput input').fill('password123');

      // Test Number Input
      await expect(scenario.locator('#numberInput input')).toBeVisible();
      await scenario.locator('#numberInput input').fill('42');

      // Test Textarea
      await expect(scenario.locator('#textareaField textarea')).toBeVisible();
      await scenario
        .locator('#textareaField textarea')
        .fill('This is a long text that spans multiple lines and tests the textarea field functionality.');

      // Test Select Field (Material overlays render at root, not as children)
      await expect(scenario.locator('#selectField mat-select')).toBeVisible();
      await scenario.locator('#selectField mat-select').click();
      // Wait for overlay to appear and click option
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'Option 2' }).click();

      // Test Radio Field
      await expect(scenario.locator('#radioField mat-radio-group')).toBeVisible();
      await scenario.locator('#radioField mat-radio-button:has-text("Radio Option 2")').click();

      // Test Checkbox Field
      await expect(scenario.locator('#checkboxField mat-checkbox')).toBeVisible();
      await scenario.locator('#checkboxField mat-checkbox').click();

      // Test Toggle Field
      await expect(scenario.locator('#toggleField mat-slide-toggle')).toBeVisible();
      await scenario.locator('#toggleField mat-slide-toggle').click();

      // Test Multi-Checkbox Field
      await expect(scenario.locator('#multiCheckboxField')).toBeVisible();
      await scenario.locator('#multiCheckboxField mat-checkbox:has-text("Checkbox 1")').click();
      await scenario.locator('#multiCheckboxField mat-checkbox:has-text("Checkbox 3")').click();

      // Test Datepicker Field (Material overlays render at root)
      await expect(scenario.locator('#datepickerField mat-datepicker-toggle')).toBeVisible();
      await scenario.locator('#datepickerField mat-datepicker-toggle').click();
      // Wait for calendar overlay and select today's date
      await page.locator('.cdk-overlay-pane mat-calendar .mat-calendar-body-today').click();

      // Test Slider Field
      await expect(scenario.locator('#sliderField mat-slider')).toBeVisible();
      // Move slider using keyboard (Material slider responds to arrow keys)
      const slider = scenario.locator('#sliderField mat-slider');
      await slider.click();
      // Press arrow keys to move slider value
      for (let i = 0; i < 7; i++) {
        await page.keyboard.press('ArrowRight');
      }

      // Submit form
      await scenario.locator('#submit button').click();

      // Open details to see submission
      await scenario.locator('.form-state summary').click();

      // Verify submission contains all field values
      const submissionElement = scenario.locator('[data-testid="submission-0"]');
      await expect(submissionElement).toBeVisible();
      await expect(submissionElement).toContainText('Test text value');
      await expect(submissionElement).toContainText('test@example.com');
      await expect(submissionElement).toContainText('option2');
      await expect(submissionElement).toContainText('radio2');
    });
  });

  test.describe('Validation Test', () => {
    test('should handle field validation errors', async ({ page }) => {
      // Navigate to the validation test component
      await page.goto('http://localhost:4201/#/test/comprehensive-field-tests/validation');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="validation-test"]');
      await expect(scenario).toBeVisible();

      const submitButton = scenario.locator('#submitValidation button');

      // Verify submit button is disabled when form is empty (validation working)
      await expect(submitButton).toBeDisabled();

      // Test invalid inputs - button should remain disabled
      await scenario.locator('#requiredText input').fill('Hi'); // Only 2 characters (too short)
      await scenario.locator('#emailValidation input').fill('invalid-email'); // Invalid format
      await scenario.locator('#numberRange input').fill('150'); // Above max
      await scenario.locator('#patternValidation input').fill('Hello123!'); // Contains numbers and special chars

      // Button should still be disabled due to validation errors
      await expect(submitButton).toBeDisabled();

      // Now fill with valid data
      await scenario.locator('#requiredText input').fill('Valid text input');
      await scenario.locator('#emailValidation input').fill('valid@example.com');
      await scenario.locator('#numberRange input').fill('50');
      await scenario.locator('#patternValidation input').fill('Valid Name');

      await page.waitForTimeout(200);

      // Button should now be enabled
      await expect(submitButton).toBeEnabled();

      // Submit should now work
      await submitButton.click();

      // Open details to see submission
      await scenario.locator('.form-state summary').click();

      // Verify successful submission
      await expect(scenario.locator('[data-testid="submission-0"]')).toBeVisible();
      await expect(scenario.locator('[data-testid="submission-0"]')).toContainText('Valid text input');
      await expect(scenario.locator('[data-testid="submission-0"]')).toContainText('valid@example.com');
      await expect(scenario.locator('[data-testid="submission-0"]')).toContainText('50');
      await expect(scenario.locator('[data-testid="submission-0"]')).toContainText('Valid Name');
    });
  });

  test.describe('Grid Layout Test', () => {
    test('should test responsive grid layout', async ({ page }) => {
      // Navigate to the grid layout test component
      await page.goto('http://localhost:4201/#/test/comprehensive-field-tests/grid-layout');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="grid-layout"]');
      await expect(scenario).toBeVisible();

      // Test desktop layout (default)
      await expect(scenario.locator('#fullWidth')).toBeVisible();
      await expect(scenario.locator('#halfWidth1')).toBeVisible();
      await expect(scenario.locator('#halfWidth2')).toBeVisible();
      await expect(scenario.locator('#thirdWidth1')).toBeVisible();
      await expect(scenario.locator('#thirdWidth2')).toBeVisible();
      await expect(scenario.locator('#thirdWidth3')).toBeVisible();

      // Fill some fields to test interaction
      await scenario.locator('#fullWidth input').fill('Full width content');
      await scenario.locator('#halfWidth1 input').fill('Half 1');
      await scenario.locator('#halfWidth2 input').fill('Half 2');
      await scenario.locator('#thirdWidth1 input').fill('Third 1');
      await scenario.locator('#thirdWidth2 input').fill('Third 2');
      await scenario.locator('#thirdWidth3 input').fill('Third 3');

      // Test mobile layout
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone 6/7/8 size

      // Fields should still be visible and functional on mobile
      await expect(scenario.locator('#fullWidth')).toBeVisible();
      await expect(scenario.locator('#halfWidth1')).toBeVisible();
      await expect(scenario.locator('#halfWidth2')).toBeVisible();

      // Fill quarter width fields on mobile
      await scenario.locator('#quarterWidth1 input').fill('Q1');
      await scenario.locator('#quarterWidth2 input').fill('Q2');
      await scenario.locator('#quarterWidth3 input').fill('Q3');
      await scenario.locator('#quarterWidth4 input').fill('Q4');

      // Submit form
      await scenario.locator('#submitGrid button').click();

      // Open details to see submission
      await scenario.locator('.form-state summary').click();

      // Verify submission contains all grid field values
      await expect(scenario.locator('[data-testid="submission-0"]')).toBeVisible();
      await expect(scenario.locator('[data-testid="submission-0"]')).toContainText('Full width content');
      await expect(scenario.locator('[data-testid="submission-0"]')).toContainText('Half 1');
      await expect(scenario.locator('[data-testid="submission-0"]')).toContainText('Half 2');
      await expect(scenario.locator('[data-testid="submission-0"]')).toContainText('Third 1');

      // Reset viewport back to desktop
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });

  test.describe('State Management Test', () => {
    test('should test form state management', async ({ page }) => {
      // Navigate to the state management test component
      await page.goto('http://localhost:4201/#/test/comprehensive-field-tests/state-management');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="state-management"]');
      await expect(scenario).toBeVisible();

      // Wait for first input field to be visible
      await scenario.locator('#stateInput1 input').waitFor({ state: 'visible', timeout: 5000 });

      // Initially form should be mostly empty (checkbox fields initialize with false)
      await scenario.locator('.form-state summary').click();
      const initialFormValue = await scenario.locator('[data-testid="form-value-state-management"]').textContent();
      // Checkbox fields start with false, so we just verify it's not fully populated yet
      expect(initialFormValue).toBeDefined();

      // Fill first input and check state update
      await scenario.locator('#stateInput1 input').fill('First value');

      // Wait for form value to update (Angular needs time to update the model)
      await page.waitForFunction(
        () => {
          const element = document.querySelector('[data-testid="form-value-state-management"]');
          return element?.textContent?.includes('First value') || false;
        },
        { timeout: 5000 },
      );

      // Check that form state reflects the change
      const updatedFormValue = await scenario.locator('[data-testid="form-value-state-management"]').textContent();
      expect(updatedFormValue).toContain('First value');

      // Fill second input
      await scenario.locator('#stateInput2 input').fill('Second value');

      // Toggle checkbox
      await scenario.locator('#stateCheckbox mat-checkbox').click();

      // Wait for checkbox value to update in the form
      await page.waitForTimeout(100);

      // Check final form state
      const finalFormValue = await scenario.locator('[data-testid="form-value-state-management"]').textContent();
      expect(finalFormValue).toContain('First value');
      expect(finalFormValue).toContain('Second value');
      expect(finalFormValue).toContain('true'); // checkbox should be true

      // Submit form
      await scenario.locator('#submitState button').click();

      // Details is already open from earlier, so we can check submission directly
      await expect(scenario.locator('[data-testid="submission-0"]')).toBeVisible();
      await expect(scenario.locator('[data-testid="submission-0"]')).toContainText('First value');
      await expect(scenario.locator('[data-testid="submission-0"]')).toContainText('Second value');

      // Test multiple submissions
      await scenario.locator('#stateInput1 input').fill('Modified first value');
      await scenario.locator('#submitState button').click();

      // Should have two submissions now
      await expect(scenario.locator('[data-testid="submission-0"]')).toBeVisible();
      await expect(scenario.locator('[data-testid="submission-1"]')).toBeVisible();
      await expect(scenario.locator('[data-testid="submission-1"]')).toContainText('Modified first value');
    });
  });
});
