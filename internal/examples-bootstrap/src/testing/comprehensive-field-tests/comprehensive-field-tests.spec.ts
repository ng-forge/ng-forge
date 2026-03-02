import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Comprehensive Bootstrap Field Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/comprehensive-field-tests');
  });

  test.describe('Comprehensive Fields Test', () => {
    test('should test all basic field types', async ({ page, helpers }) => {
      // Navigate to the comprehensive fields component
      await page.goto('/#/test/comprehensive-field-tests/comprehensive-fields');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('comprehensive-fields-test');
      await expect(scenario).toBeVisible();

      // Visual regression: empty form state
      await helpers.expectScreenshotMatch(scenario, 'bootstrap-comprehensive-fields-empty');

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

      // Test Select Field (Bootstrap uses native select element)
      await expect(scenario.locator('#selectField select')).toBeVisible();
      await scenario.locator('#selectField select').selectOption({ label: 'Option 2' });

      // Test Radio Field
      await expect(scenario.locator('#radioField')).toBeVisible();
      await scenario.locator('#radioField input[type="radio"][value="radio2"]').check();

      // Test Checkbox Field (Bootstrap uses .form-check)
      await expect(scenario.locator('#checkboxField .form-check')).toBeVisible();
      await scenario.locator('#checkboxField input[type="checkbox"]').check();

      // Test Toggle Field
      await expect(scenario.getByTestId('toggleField')).toBeVisible();
      await scenario.locator('#toggleField input[type="checkbox"]').check();

      // Test Multi-Checkbox Field
      await expect(scenario.getByTestId('multiCheckboxField')).toBeVisible();
      await scenario.locator('#multiCheckboxField_0').check(); // First checkbox (check1)
      await scenario.locator('#multiCheckboxField_2').check(); // Third checkbox (check3)

      // Test Datepicker Field (Bootstrap uses native date input or third-party datepicker)
      await expect(scenario.getByTestId('datepickerField')).toBeVisible();
      // For native date input, we can set a value directly
      const today = new Date().toISOString().split('T')[0];
      await scenario.locator('#datepickerField input[type="date"]').fill(today);

      // Test Slider Field (Bootstrap uses native range input)
      await expect(scenario.locator('#sliderField input[type="range"]')).toBeVisible();
      await scenario.locator('#sliderField input[type="range"]').fill('70');

      // Visual regression: filled form state
      await helpers.expectScreenshotMatch(scenario, 'bootstrap-comprehensive-fields-filled');

      // Set up event listener BEFORE clicking submit
      const submittedDataPromise = page.evaluate(
        () =>
          new Promise((resolve) => {
            window.addEventListener(
              'formSubmitted',
              (event: any) => {
                resolve(event.detail.data);
              },
              { once: true },
            );
          }),
      );

      // Submit form
      await scenario.locator('#submit button').click();

      // Wait for formSubmitted event
      const submittedData = (await submittedDataPromise) as Record<string, unknown>;

      // Verify submission contains expected field values
      expect(submittedData['textInput']).toBe('Test text value');
      expect(submittedData['emailInput']).toBe('test@example.com');
      expect(submittedData['selectField']).toBe('option2');
      expect(submittedData['radioField']).toBe('radio2');
      expect(submittedData['checkboxField']).toBe(true);
      expect(submittedData['toggleField']).toBe(true);
    });
  });

  test.describe('Validation Test', () => {
    test('should handle field validation errors', async ({ page, helpers }) => {
      // Navigate to the validation test component
      await page.goto('/#/test/comprehensive-field-tests/validation');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('validation-test');
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

      // Visual regression: validation errors state
      await helpers.expectScreenshotMatch(scenario, 'bootstrap-validation-with-errors');

      // Now fill with valid data
      await scenario.locator('#requiredText input').fill('Valid text input');
      await scenario.locator('#emailValidation input').fill('valid@example.com');
      await scenario.locator('#numberRange input').fill('50');
      await scenario.locator('#patternValidation input').fill('Valid Name');

      // Button should now be enabled
      await expect(submitButton).toBeEnabled();

      // Visual regression: valid form state
      await helpers.expectScreenshotMatch(scenario, 'bootstrap-validation-valid');

      // Set up event listener BEFORE clicking submit
      const submittedDataPromise = page.evaluate(
        () =>
          new Promise((resolve) => {
            window.addEventListener(
              'formSubmitted',
              (event: any) => {
                resolve(event.detail.data);
              },
              { once: true },
            );
          }),
      );

      // Submit should now work
      await submitButton.click();

      // Wait for formSubmitted event
      const submittedData = (await submittedDataPromise) as Record<string, unknown>;

      // Verify successful submission
      expect(submittedData['requiredText']).toBe('Valid text input');
      expect(submittedData['emailValidation']).toBe('valid@example.com');
      expect(submittedData['numberRange']).toBe(50);
      expect(submittedData['patternValidation']).toBe('Valid Name');
    });
  });

  test.describe('Grid Layout Test', () => {
    test('should test responsive grid layout', async ({ page, helpers }) => {
      // Navigate to the grid layout test component
      await page.goto('/#/test/comprehensive-field-tests/grid-layout');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('grid-layout-test');
      await expect(scenario).toBeVisible();

      // Test desktop layout (default)
      await expect(scenario.getByTestId('fullWidth')).toBeVisible();
      await expect(scenario.getByTestId('halfWidth1')).toBeVisible();
      await expect(scenario.getByTestId('halfWidth2')).toBeVisible();
      await expect(scenario.getByTestId('thirdWidth1')).toBeVisible();
      await expect(scenario.getByTestId('thirdWidth2')).toBeVisible();
      await expect(scenario.getByTestId('thirdWidth3')).toBeVisible();

      // Fill some fields to test interaction
      await scenario.locator('#fullWidth input').fill('Full width content');
      await scenario.locator('#halfWidth1 input').fill('Half 1');
      await scenario.locator('#halfWidth2 input').fill('Half 2');
      await scenario.locator('#thirdWidth1 input').fill('Third 1');
      await scenario.locator('#thirdWidth2 input').fill('Third 2');
      await scenario.locator('#thirdWidth3 input').fill('Third 3');

      // Visual regression: grid layout desktop
      await helpers.expectScreenshotMatch(scenario, 'bootstrap-grid-layout-desktop');

      // Test mobile layout
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone 6/7/8 size

      // Visual regression: grid layout mobile
      await helpers.expectScreenshotMatch(scenario, 'bootstrap-grid-layout-mobile');

      // Fields should still be visible and functional on mobile
      await expect(scenario.getByTestId('fullWidth')).toBeVisible();
      await expect(scenario.getByTestId('halfWidth1')).toBeVisible();
      await expect(scenario.getByTestId('halfWidth2')).toBeVisible();

      // Fill quarter width fields on mobile
      await scenario.locator('#quarterWidth1 input').fill('Q1');
      await scenario.locator('#quarterWidth2 input').fill('Q2');
      await scenario.locator('#quarterWidth3 input').fill('Q3');
      await scenario.locator('#quarterWidth4 input').fill('Q4');

      // Set up event listener BEFORE clicking submit
      const submittedDataPromise = page.evaluate(
        () =>
          new Promise((resolve) => {
            window.addEventListener(
              'formSubmitted',
              (event: any) => {
                resolve(event.detail.data);
              },
              { once: true },
            );
          }),
      );

      // Submit form
      await scenario.locator('#submitGrid button').click();

      // Wait for formSubmitted event
      const submittedData = (await submittedDataPromise) as Record<string, unknown>;

      // Verify submission contains all grid field values
      expect(submittedData['fullWidth']).toBe('Full width content');
      expect(submittedData['halfWidth1']).toBe('Half 1');
      expect(submittedData['halfWidth2']).toBe('Half 2');
      expect(submittedData['thirdWidth1']).toBe('Third 1');
      expect(submittedData['quarterWidth1']).toBe('Q1');

      // Reset viewport back to desktop
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });

  test.describe('State Management Test', () => {
    test('should test form state management', async ({ page, helpers }) => {
      // Navigate to the state management test component
      await page.goto('/#/test/comprehensive-field-tests/state-management');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('state-management-test');
      await expect(scenario).toBeVisible();

      // Wait for first input field to be visible
      await scenario.locator('#stateInput1 input').waitFor({ state: 'visible', timeout: 5000 });

      // Open debug output to see form value
      await scenario.locator('.debug-output summary').click();
      const initialFormValue = await scenario.locator('[data-testid="form-value-state-management-test"]').textContent();
      // Checkbox fields start with false, so we just verify it's not fully populated yet
      expect(initialFormValue).toBeDefined();

      // Fill first input and check state update
      await scenario.locator('#stateInput1 input').fill('First value');

      // Wait for form value to update (Angular needs time to update the model)
      await page.waitForFunction(
        () => {
          const element = document.querySelector('[data-testid="form-value-state-management-test"]');
          return element?.textContent?.includes('First value') || false;
        },
        { timeout: 5000 },
      );

      // Check that form state reflects the change
      const updatedFormValue = await scenario.locator('[data-testid="form-value-state-management-test"]').textContent();
      expect(updatedFormValue).toContain('First value');

      // Fill second input
      await scenario.locator('#stateInput2 input').fill('Second value');

      // Toggle checkbox (Bootstrap uses native checkbox input)
      await scenario.locator('#stateCheckbox input[type="checkbox"]').check();

      // Wait for form value to update with checkbox state
      const formValueElement = scenario.locator('[data-testid="form-value-state-management-test"]');
      await expect(formValueElement).toContainText('First value');
      await expect(formValueElement).toContainText('Second value');
      await expect(formValueElement).toContainText('true'); // checkbox should be true

      // Set up event listener BEFORE clicking submit
      const submittedDataPromise = page.evaluate(
        () =>
          new Promise((resolve) => {
            window.addEventListener(
              'formSubmitted',
              (event: any) => {
                resolve(event.detail.data);
              },
              { once: true },
            );
          }),
      );

      // Submit form
      await scenario.locator('#submitState button').click();

      // Wait for formSubmitted event
      const submittedData = (await submittedDataPromise) as Record<string, unknown>;

      // Verify submitted data
      expect(submittedData['stateInput1']).toBe('First value');
      expect(submittedData['stateInput2']).toBe('Second value');
      expect(submittedData['stateCheckbox']).toBe(true);
    });
  });
});
