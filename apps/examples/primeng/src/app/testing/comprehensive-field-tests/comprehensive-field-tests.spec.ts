import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Comprehensive PrimeNG Field Tests', () => {
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
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Visual regression: empty form state
      await helpers.expectScreenshotMatch(scenario, 'primeng-comprehensive-fields-empty');

      // Test Text Input
      await page.waitForSelector('[data-testid="comprehensive-fields-test"] #textInput input', { state: 'visible', timeout: 10000 });
      const textInput = scenario.locator('#textInput input');
      await expect(textInput).toBeVisible({ timeout: 10000 });
      await textInput.fill('Test text value');
      await expect(textInput).toHaveValue('Test text value', { timeout: 5000 });
      await textInput.blur();

      // Test Email Input
      await page.waitForSelector('[data-testid="comprehensive-fields-test"] #emailInput input', { state: 'visible', timeout: 10000 });
      const emailInput = scenario.locator('#emailInput input');
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com', { timeout: 5000 });
      await emailInput.blur();

      // Test Password Input
      await page.waitForSelector('[data-testid="comprehensive-fields-test"] #passwordInput input', { state: 'visible', timeout: 10000 });
      const passwordInput = scenario.locator('#passwordInput input');
      await expect(passwordInput).toBeVisible({ timeout: 10000 });
      await passwordInput.fill('password123');
      await expect(passwordInput).toHaveValue('password123', { timeout: 5000 });
      await passwordInput.blur();

      // Test Number Input
      await page.waitForSelector('[data-testid="comprehensive-fields-test"] #numberInput input', { state: 'visible', timeout: 10000 });
      const numberInput = scenario.locator('#numberInput input');
      await expect(numberInput).toBeVisible({ timeout: 10000 });
      await numberInput.fill('42');
      await expect(numberInput).toHaveValue('42', { timeout: 5000 });
      await numberInput.blur();

      // Test Textarea
      await page.waitForSelector('[data-testid="comprehensive-fields-test"] #textareaField textarea', { state: 'visible', timeout: 10000 });
      const textareaField = scenario.locator('#textareaField textarea');
      await expect(textareaField).toBeVisible({ timeout: 10000 });
      await textareaField.fill('This is a long text that spans multiple lines and tests the textarea field functionality.');
      await expect(textareaField).toHaveValue('This is a long text that spans multiple lines and tests the textarea field functionality.', {
        timeout: 5000,
      });
      await textareaField.blur();

      // Test Select Field (PrimeNG uses p-select)
      await page.waitForSelector('[data-testid="comprehensive-fields-test"] #selectField p-select', { state: 'visible', timeout: 10000 });
      await expect(scenario.locator('#selectField p-select')).toBeVisible({ timeout: 10000 });
      await helpers.selectOption(scenario.locator('#selectField p-select'), 'Option 2');

      // Test Radio Field (PrimeNG uses p-radiobutton)
      await page.waitForSelector('[data-testid="comprehensive-fields-test"] #radioField', { state: 'visible', timeout: 10000 });
      await expect(scenario.locator('#radioField')).toBeVisible({ timeout: 10000 });
      await helpers.selectRadio(scenario, 'radioField', 'Radio Option 2');

      // Test Checkbox Field (PrimeNG uses p-checkbox)
      await page.waitForSelector('[data-testid="comprehensive-fields-test"] #checkboxField p-checkbox', {
        state: 'visible',
        timeout: 10000,
      });
      const checkboxInput = scenario.locator('#checkboxField p-checkbox input');
      await expect(scenario.locator('#checkboxField p-checkbox')).toBeVisible({ timeout: 10000 });
      await checkboxInput.check();
      await expect(checkboxInput).toBeChecked({ timeout: 5000 });

      // Test Toggle Field (PrimeNG uses p-toggleswitch)
      await page.waitForSelector('[data-testid="comprehensive-fields-test"] [data-testid="toggleField"]', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(scenario.getByTestId('toggleField')).toBeVisible({ timeout: 10000 });
      await scenario.locator('#toggleField p-toggleSwitch').click();

      // Test Multi-Checkbox Field (PrimeNG uses p-checkbox with inputId pattern key-value)
      await page.waitForSelector('[data-testid="comprehensive-fields-test"] [data-testid="multiCheckboxField"]', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(scenario.getByTestId('multiCheckboxField')).toBeVisible({ timeout: 10000 });
      const multiCheck1 = scenario.locator('#multiCheckboxField-check1');
      await multiCheck1.click(); // First checkbox (check1)
      const multiCheck3 = scenario.locator('#multiCheckboxField-check3');
      await multiCheck3.click(); // Third checkbox (check3)

      // Test Datepicker Field (PrimeNG uses p-datepicker)
      await page.waitForSelector('[data-testid="comprehensive-fields-test"] [data-testid="datepickerField"]', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(scenario.getByTestId('datepickerField')).toBeVisible({ timeout: 10000 });
      // For PrimeNG datepicker, we can set a value via the input field (format: mm/dd/yyyy)
      const now = new Date();
      const today = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;
      await helpers.fillDatepicker(scenario, 'datepickerField', today);

      // Test Slider Field (PrimeNG uses p-slider)
      await page.waitForSelector('[data-testid="comprehensive-fields-test"] #sliderField p-slider', { state: 'visible', timeout: 10000 });
      await expect(scenario.locator('#sliderField p-slider')).toBeVisible({ timeout: 10000 });
      // For PrimeNG slider, we interact with the slider element directly
      await scenario.locator('#sliderField p-slider').click();

      // Visual regression: filled form state
      await helpers.expectScreenshotMatch(scenario, 'primeng-comprehensive-fields-filled');

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

      // Wait for submit button to be enabled before clicking
      await page.waitForSelector('[data-testid="comprehensive-fields-test"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      const submitButton = scenario.locator('#submit button');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Submit form
      await submitButton.click();

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
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="validation-test"] #submitValidation button', { state: 'visible', timeout: 10000 });
      const submitButton = scenario.locator('#submitValidation button');

      // Verify submit button is disabled when form is empty (validation working)
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Test invalid inputs - button should remain disabled
      await page.waitForSelector('[data-testid="validation-test"] #requiredText input', { state: 'visible', timeout: 10000 });
      const requiredTextInput = scenario.locator('#requiredText input');
      await requiredTextInput.fill('Hi'); // Only 2 characters (too short)
      await expect(requiredTextInput).toHaveValue('Hi', { timeout: 5000 });
      await requiredTextInput.blur();

      await page.waitForSelector('[data-testid="validation-test"] #emailValidation input', { state: 'visible', timeout: 10000 });
      const emailValidationInput = scenario.locator('#emailValidation input');
      await emailValidationInput.fill('invalid-email'); // Invalid format
      await expect(emailValidationInput).toHaveValue('invalid-email', { timeout: 5000 });
      await emailValidationInput.blur();

      await page.waitForSelector('[data-testid="validation-test"] #numberRange input', { state: 'visible', timeout: 10000 });
      const numberRangeInput = scenario.locator('#numberRange input');
      await numberRangeInput.fill('150'); // Above max
      await expect(numberRangeInput).toHaveValue('150', { timeout: 5000 });
      await numberRangeInput.blur();

      await page.waitForSelector('[data-testid="validation-test"] #patternValidation input', { state: 'visible', timeout: 10000 });
      const patternValidationInput = scenario.locator('#patternValidation input');
      await patternValidationInput.fill('Hello123!'); // Contains numbers and special chars
      await expect(patternValidationInput).toHaveValue('Hello123!', { timeout: 5000 });
      await patternValidationInput.blur();

      // Button should still be disabled due to validation errors
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Visual regression: validation errors state
      await helpers.expectScreenshotMatch(scenario, 'primeng-validation-with-errors');

      // Now fill with valid data
      await requiredTextInput.fill('Valid text input');
      await expect(requiredTextInput).toHaveValue('Valid text input', { timeout: 5000 });
      await requiredTextInput.blur();

      await emailValidationInput.fill('valid@example.com');
      await expect(emailValidationInput).toHaveValue('valid@example.com', { timeout: 5000 });
      await emailValidationInput.blur();

      await numberRangeInput.fill('50');
      await expect(numberRangeInput).toHaveValue('50', { timeout: 5000 });
      await numberRangeInput.blur();

      await patternValidationInput.fill('Valid Name');
      await expect(patternValidationInput).toHaveValue('Valid Name', { timeout: 5000 });
      await patternValidationInput.blur();

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="validation-test"] #submitValidation button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Visual regression: valid form state
      await helpers.expectScreenshotMatch(scenario, 'primeng-validation-valid');

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
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Test desktop layout (default)
      await page.waitForSelector('[data-testid="grid-layout-test"] [data-testid="fullWidth"]', { state: 'visible', timeout: 10000 });
      await expect(scenario.getByTestId('fullWidth')).toBeVisible({ timeout: 10000 });
      await expect(scenario.getByTestId('halfWidth1')).toBeVisible({ timeout: 10000 });
      await expect(scenario.getByTestId('halfWidth2')).toBeVisible({ timeout: 10000 });
      await expect(scenario.getByTestId('thirdWidth1')).toBeVisible({ timeout: 10000 });
      await expect(scenario.getByTestId('thirdWidth2')).toBeVisible({ timeout: 10000 });
      await expect(scenario.getByTestId('thirdWidth3')).toBeVisible({ timeout: 10000 });

      // Fill some fields to test interaction
      await page.waitForSelector('[data-testid="grid-layout-test"] #fullWidth input', { state: 'visible', timeout: 10000 });
      const fullWidthInput = scenario.locator('#fullWidth input');
      await fullWidthInput.fill('Full width content');
      await expect(fullWidthInput).toHaveValue('Full width content', { timeout: 5000 });
      await fullWidthInput.blur();

      await page.waitForSelector('[data-testid="grid-layout-test"] #halfWidth1 input', { state: 'visible', timeout: 10000 });
      const halfWidth1Input = scenario.locator('#halfWidth1 input');
      await halfWidth1Input.fill('Half 1');
      await expect(halfWidth1Input).toHaveValue('Half 1', { timeout: 5000 });
      await halfWidth1Input.blur();

      await page.waitForSelector('[data-testid="grid-layout-test"] #halfWidth2 input', { state: 'visible', timeout: 10000 });
      const halfWidth2Input = scenario.locator('#halfWidth2 input');
      await halfWidth2Input.fill('Half 2');
      await expect(halfWidth2Input).toHaveValue('Half 2', { timeout: 5000 });
      await halfWidth2Input.blur();

      await page.waitForSelector('[data-testid="grid-layout-test"] #thirdWidth1 input', { state: 'visible', timeout: 10000 });
      const thirdWidth1Input = scenario.locator('#thirdWidth1 input');
      await thirdWidth1Input.fill('Third 1');
      await expect(thirdWidth1Input).toHaveValue('Third 1', { timeout: 5000 });
      await thirdWidth1Input.blur();

      await page.waitForSelector('[data-testid="grid-layout-test"] #thirdWidth2 input', { state: 'visible', timeout: 10000 });
      const thirdWidth2Input = scenario.locator('#thirdWidth2 input');
      await thirdWidth2Input.fill('Third 2');
      await expect(thirdWidth2Input).toHaveValue('Third 2', { timeout: 5000 });
      await thirdWidth2Input.blur();

      await page.waitForSelector('[data-testid="grid-layout-test"] #thirdWidth3 input', { state: 'visible', timeout: 10000 });
      const thirdWidth3Input = scenario.locator('#thirdWidth3 input');
      await thirdWidth3Input.fill('Third 3');
      await expect(thirdWidth3Input).toHaveValue('Third 3', { timeout: 5000 });
      await thirdWidth3Input.blur();

      // Visual regression: grid layout desktop
      await helpers.expectScreenshotMatch(scenario, 'primeng-grid-layout-desktop');

      // Test mobile layout
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone 6/7/8 size

      // Visual regression: grid layout mobile
      await helpers.expectScreenshotMatch(scenario, 'primeng-grid-layout-mobile');

      // Fields should still be visible and functional on mobile
      await expect(scenario.getByTestId('fullWidth')).toBeVisible({ timeout: 10000 });
      await expect(scenario.getByTestId('halfWidth1')).toBeVisible({ timeout: 10000 });
      await expect(scenario.getByTestId('halfWidth2')).toBeVisible({ timeout: 10000 });

      // Fill quarter width fields on mobile
      await page.waitForSelector('[data-testid="grid-layout-test"] #quarterWidth1 input', { state: 'visible', timeout: 10000 });
      const quarterWidth1Input = scenario.locator('#quarterWidth1 input');
      await quarterWidth1Input.fill('Q1');
      await expect(quarterWidth1Input).toHaveValue('Q1', { timeout: 5000 });
      await quarterWidth1Input.blur();

      await page.waitForSelector('[data-testid="grid-layout-test"] #quarterWidth2 input', { state: 'visible', timeout: 10000 });
      const quarterWidth2Input = scenario.locator('#quarterWidth2 input');
      await quarterWidth2Input.fill('Q2');
      await expect(quarterWidth2Input).toHaveValue('Q2', { timeout: 5000 });
      await quarterWidth2Input.blur();

      await page.waitForSelector('[data-testid="grid-layout-test"] #quarterWidth3 input', { state: 'visible', timeout: 10000 });
      const quarterWidth3Input = scenario.locator('#quarterWidth3 input');
      await quarterWidth3Input.fill('Q3');
      await expect(quarterWidth3Input).toHaveValue('Q3', { timeout: 5000 });
      await quarterWidth3Input.blur();

      await page.waitForSelector('[data-testid="grid-layout-test"] #quarterWidth4 input', { state: 'visible', timeout: 10000 });
      const quarterWidth4Input = scenario.locator('#quarterWidth4 input');
      await quarterWidth4Input.fill('Q4');
      await expect(quarterWidth4Input).toHaveValue('Q4', { timeout: 5000 });
      await quarterWidth4Input.blur();

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

      // Wait for submit button to be enabled before clicking
      await page.waitForSelector('[data-testid="grid-layout-test"] #submitGrid button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      const submitButton = scenario.locator('#submitGrid button');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Submit form
      await submitButton.click();

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
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for first input field to be visible
      await page.waitForSelector('[data-testid="state-management-test"] #stateInput1 input', { state: 'visible', timeout: 10000 });
      await scenario.locator('#stateInput1 input').waitFor({ state: 'visible', timeout: 10000 });

      // Open debug output to see form value
      await scenario.locator('.debug-output summary').click();
      const initialFormValue = await scenario.locator('[data-testid="form-value-state-management-test"]').textContent();
      // Checkbox fields start with false, so we just verify it's not fully populated yet
      expect(initialFormValue).toBeDefined();

      // Fill first input and check state update
      const stateInput1 = scenario.locator('#stateInput1 input');
      await stateInput1.fill('First value');
      await expect(stateInput1).toHaveValue('First value', { timeout: 5000 });
      await stateInput1.blur();

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
      await page.waitForSelector('[data-testid="state-management-test"] #stateInput2 input', { state: 'visible', timeout: 10000 });
      const stateInput2 = scenario.locator('#stateInput2 input');
      await stateInput2.fill('Second value');
      await expect(stateInput2).toHaveValue('Second value', { timeout: 5000 });
      await stateInput2.blur();

      // Toggle checkbox (PrimeNG uses p-checkbox)
      await page.waitForSelector('[data-testid="state-management-test"] #stateCheckbox p-checkbox input', {
        state: 'visible',
        timeout: 10000,
      });
      const stateCheckbox = scenario.locator('#stateCheckbox p-checkbox input');
      await stateCheckbox.check();
      await expect(stateCheckbox).toBeChecked({ timeout: 5000 });

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

      // Wait for submit button to be enabled before clicking
      await page.waitForSelector('[data-testid="state-management-test"] #submitState button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      const submitButton = scenario.locator('#submitState button');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Submit form
      await submitButton.click();

      // Wait for formSubmitted event
      const submittedData = (await submittedDataPromise) as Record<string, unknown>;

      // Verify submitted data
      expect(submittedData['stateInput1']).toBe('First value');
      expect(submittedData['stateInput2']).toBe('Second value');
      expect(submittedData['stateCheckbox']).toBe(true);
    });
  });
});
