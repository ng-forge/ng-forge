import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Accessibility Tests', () => {
  test.describe('All Fields ARIA Attributes', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/#/test/accessibility/all-fields-aria');
      await page.waitForLoadState('networkidle');
    });

    // Input field tests
    test('input field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="all-fields-aria"] #inputField input', { state: 'visible', timeout: 10000 });
      const input = scenario.locator('#inputField input');
      // Wait for input to be ready before checking attribute
      await expect(input).toBeVisible({ timeout: 10000 });
      await expect(input).toHaveAttribute('aria-required', 'true', { timeout: 10000 });
    });

    test('input field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await page.waitForSelector('[data-testid="all-fields-aria"] #inputField input', { state: 'visible', timeout: 10000 });
      const input = scenario.locator('#inputField input');
      await expect(input).toBeVisible({ timeout: 10000 });
      const ariaDescribedBy = await input.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('inputField-hint');
    });

    test('input field should have aria-invalid="true" when invalid and touched', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await page.waitForSelector('[data-testid="all-fields-aria"] #inputField input', { state: 'visible', timeout: 10000 });
      const input = scenario.locator('#inputField input');
      await input.focus();
      await input.blur();
      await expect(input).toHaveAttribute('aria-invalid', 'true', { timeout: 10000 });
    });

    // Textarea field tests
    test('textarea field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="all-fields-aria"] #textareaField textarea', { state: 'visible', timeout: 10000 });
      const textarea = scenario.locator('#textareaField textarea');
      await expect(textarea).toHaveAttribute('aria-required', 'true', { timeout: 10000 });
    });

    test('textarea field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await page.waitForSelector('[data-testid="all-fields-aria"] #textareaField textarea', { state: 'visible', timeout: 10000 });
      const textarea = scenario.locator('#textareaField textarea');
      await expect(textarea).toBeVisible({ timeout: 10000 });
      const ariaDescribedBy = await textarea.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('textareaField-hint');
    });

    test('textarea field should have aria-invalid="true" when invalid and touched', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await page.waitForSelector('[data-testid="all-fields-aria"] #textareaField textarea', { state: 'visible', timeout: 10000 });
      const textarea = scenario.locator('#textareaField textarea');
      await textarea.focus();
      await textarea.blur();
      await expect(textarea).toHaveAttribute('aria-invalid', 'true', { timeout: 10000 });
    });

    // Select field tests
    test('select field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="all-fields-aria"] #selectField p-select', { state: 'visible', timeout: 10000 });
      const select = scenario.locator('#selectField p-select');
      await expect(select).toHaveAttribute('aria-required', 'true', { timeout: 10000 });
    });

    test('select field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await page.waitForSelector('[data-testid="all-fields-aria"] #selectField p-select', { state: 'visible', timeout: 10000 });
      const select = scenario.locator('#selectField p-select');
      await expect(select).toBeVisible({ timeout: 10000 });
      const ariaDescribedBy = await select.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('selectField-hint');
    });

    test('select field should have aria-invalid="true" when invalid and touched', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const select = scenario.locator('#selectField p-select');
      await expect(select).toBeVisible({ timeout: 10000 });

      // Click to open dropdown
      await select.click();
      // Wait for overlay to appear
      const overlay = page.locator('.p-select-overlay');
      await expect(overlay).toBeVisible({ timeout: 5000 });

      // Close with Escape and wait for overlay to close
      await page.keyboard.press('Escape');
      await expect(overlay).not.toBeVisible({ timeout: 5000 });

      // Wait for aria-invalid to update after touched state
      await expect(select).toHaveAttribute('aria-invalid', 'true', { timeout: 5000 });
    });

    // Checkbox field tests - ARIA attrs are on p-checkbox element
    test('checkbox field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="all-fields-aria"] #checkboxField p-checkbox', { state: 'visible', timeout: 10000 });
      const checkbox = scenario.locator('#checkboxField p-checkbox');
      await expect(checkbox).toHaveAttribute('aria-required', 'true', { timeout: 10000 });
    });

    test('checkbox field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await page.waitForSelector('[data-testid="all-fields-aria"] #checkboxField p-checkbox', { state: 'visible', timeout: 10000 });
      const checkbox = scenario.locator('#checkboxField p-checkbox');
      await expect(checkbox).toBeVisible({ timeout: 10000 });
      const ariaDescribedBy = await checkbox.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('checkboxField-hint');
    });

    // Toggle field tests - ARIA attrs are on p-toggleSwitch element
    test('toggle field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="all-fields-aria"] #toggleField p-toggleSwitch', { state: 'visible', timeout: 10000 });
      const toggle = scenario.locator('#toggleField p-toggleSwitch');
      await expect(toggle).toHaveAttribute('aria-required', 'true', { timeout: 10000 });
    });

    test('toggle field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await page.waitForSelector('[data-testid="all-fields-aria"] #toggleField p-toggleSwitch', { state: 'visible', timeout: 10000 });
      const toggle = scenario.locator('#toggleField p-toggleSwitch');
      await expect(toggle).toBeVisible({ timeout: 10000 });
      const ariaDescribedBy = await toggle.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('toggleField-hint');
    });

    // Radio field tests - ARIA attrs are on radio group container
    test('radio field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="all-fields-aria"] #radioField df-prime-radio-group', { state: 'visible', timeout: 10000 });
      // PrimeNG radio puts aria-describedby on the radio group component
      const radioGroup = scenario.locator('#radioField df-prime-radio-group');
      await expect(radioGroup).toBeVisible({ timeout: 10000 });
      const ariaDescribedBy = await radioGroup.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('radioField-hint');
    });

    // Multi-checkbox field tests - ARIA attrs are on checkbox group container
    test('multi-checkbox field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="all-fields-aria"] #multiCheckboxField .checkbox-group', {
        state: 'visible',
        timeout: 10000,
      });
      // PrimeNG multi-checkbox puts aria-describedby on the checkbox group div
      const checkboxGroup = scenario.locator('#multiCheckboxField .checkbox-group');
      await expect(checkboxGroup).toBeVisible({ timeout: 10000 });
      const ariaDescribedBy = await checkboxGroup.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('multiCheckboxField-hint');
    });

    // Slider field tests - ARIA attrs are on p-slider element
    test('slider field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="all-fields-aria"] #sliderField p-slider', { state: 'visible', timeout: 10000 });
      const slider = scenario.locator('#sliderField p-slider');
      await expect(slider).toBeVisible({ timeout: 10000 });
      const ariaDescribedBy = await slider.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('sliderField-hint');
    });

    // Datepicker field tests - ARIA attrs are on p-datepicker element
    test('datepicker field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="all-fields-aria"] #datepickerField p-datepicker', { state: 'visible', timeout: 10000 });
      const datepicker = scenario.locator('#datepickerField p-datepicker');
      await expect(datepicker).toHaveAttribute('aria-required', 'true', { timeout: 10000 });
    });

    test('datepicker field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await page.waitForSelector('[data-testid="all-fields-aria"] #datepickerField p-datepicker', { state: 'visible', timeout: 10000 });
      const datepicker = scenario.locator('#datepickerField p-datepicker');
      await expect(datepicker).toBeVisible({ timeout: 10000 });
      const ariaDescribedBy = await datepicker.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('datepickerField-hint');
    });

    test('datepicker field should have aria-invalid="true" when invalid and touched', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await page.waitForSelector('[data-testid="all-fields-aria"] #datepickerField p-datepicker', { state: 'visible', timeout: 10000 });
      const datepicker = scenario.locator('#datepickerField p-datepicker');
      const datepickerInput = scenario.locator('#datepickerField input');
      // Click to open and then click away to trigger touched state
      await datepickerInput.click();
      await page.keyboard.press('Escape');
      await page.locator('body').click({ position: { x: 0, y: 0 } });
      await expect(datepicker).toHaveAttribute('aria-invalid', 'true', { timeout: 10000 });
    });

    // Error ID tests
    test('all required fields should show errors with unique IDs when touched without value', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="all-fields-aria"] #inputField input', { state: 'visible', timeout: 10000 });
      // Touch input field to trigger error
      const input = scenario.locator('#inputField input');
      await input.focus();
      await input.blur();

      // Check error has proper ID (PrimeNG uses p-error class)
      const inputError = scenario.locator('#inputField .p-error');
      await expect(inputError).toBeVisible({ timeout: 10000 });
      const inputErrorId = await inputError.getAttribute('id');
      expect(inputErrorId).toContain('inputField-error');
    });
  });

  test.describe('ARIA Attributes', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/#/test/accessibility/aria-attributes');
      await page.waitForLoadState('networkidle');
    });

    test('required field should have aria-required attribute', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="aria-attributes"] #requiredField input', { state: 'visible', timeout: 10000 });
      // Required field input should have aria-required="true"
      const requiredInput = scenario.locator('#requiredField input');
      await expect(requiredInput).toHaveAttribute('aria-required', 'true', { timeout: 10000 });
    });

    test('optional field should not have aria-required="true"', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="aria-attributes"] #optionalField input', { state: 'visible', timeout: 10000 });
      // Optional field should either have no aria-required, or aria-required="false"
      const optionalInput = scenario.locator('#optionalField input');
      const ariaRequired = await optionalInput.getAttribute('aria-required');
      // Both null and "false" are valid WCAG-compliant values for optional fields
      expect(ariaRequired).not.toBe('true');
    });

    test('invalid field should have aria-invalid="true" after blur', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="aria-attributes"] #requiredField input', { state: 'visible', timeout: 10000 });
      const requiredInput = scenario.locator('#requiredField input');

      // Focus and blur without filling - should show validation error
      await requiredInput.focus();
      await requiredInput.blur();

      // Should have aria-invalid="true"
      await expect(requiredInput).toHaveAttribute('aria-invalid', 'true', { timeout: 10000 });
    });

    test('valid field should have aria-invalid="false"', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="aria-attributes"] #requiredField input', { state: 'visible', timeout: 10000 });
      const requiredInput = scenario.locator('#requiredField input');

      // Fill with valid value
      await requiredInput.fill('Valid value');
      await expect(requiredInput).toHaveValue('Valid value', { timeout: 5000 });
      await requiredInput.blur();

      // Should have aria-invalid="false"
      await expect(requiredInput).toHaveAttribute('aria-invalid', 'false', { timeout: 10000 });
    });

    test('field with hint should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="aria-attributes"] #requiredField input', { state: 'visible', timeout: 10000 });
      const requiredInput = scenario.locator('#requiredField input');
      await expect(requiredInput).toBeVisible({ timeout: 10000 });

      // Check that aria-describedby contains the hint ID
      const ariaDescribedBy = await requiredInput.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('requiredField-hint');

      // Verify the hint element exists with the correct ID
      const hint = scenario.locator('#requiredField .df-prime-hint');
      const hintId = await hint.getAttribute('id');
      expect(hintId).toBe('requiredField-hint');
    });

    test('field with error should have aria-describedby referencing error', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="aria-attributes"] #requiredField input', { state: 'visible', timeout: 10000 });
      const requiredInput = scenario.locator('#requiredField input');

      // Trigger validation error
      await requiredInput.focus();
      await requiredInput.blur();

      // Check that aria-describedby includes error ID
      const ariaDescribedBy = await requiredInput.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('requiredField-error');
    });
  });

  test.describe('Error Announcements', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/#/test/accessibility/error-announcements');
      await page.waitForLoadState('networkidle');
    });

    test('error messages should have role="alert"', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('error-announcements');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="error-announcements"] #username input', { state: 'visible', timeout: 10000 });
      const usernameInput = scenario.locator('#username input');

      // Visual regression: compare empty state against baseline
      await helpers.expectScreenshotMatch(scenario, 'primeng-error-announcements-empty');

      // Trigger validation error
      await usernameInput.fill('ab'); // Too short
      await expect(usernameInput).toHaveValue('ab', { timeout: 5000 });
      await usernameInput.blur();

      // PrimeNG errors use .p-error class with role="alert"
      const error = scenario.locator('#username .p-error');
      await expect(error).toBeVisible({ timeout: 10000 });
      await expect(error).toHaveAttribute('role', 'alert', { timeout: 10000 });

      // Visual regression: compare error state against baseline
      await helpers.expectScreenshotMatch(scenario, 'primeng-error-announcements-with-error');
    });

    test('multiple errors should each be properly identified', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('error-announcements');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="error-announcements"] #username input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="error-announcements"] #email input', { state: 'visible', timeout: 10000 });
      const usernameInput = scenario.locator('#username input');
      const emailInput = scenario.locator('#email input');

      // Trigger validation errors on both fields (both are required)
      await usernameInput.focus();
      await usernameInput.blur();
      await emailInput.focus();
      await emailInput.blur();

      // Both fields should show errors (PrimeNG uses .p-error class)
      const usernameError = scenario.locator('#username .p-error');
      const emailError = scenario.locator('#email .p-error');

      await expect(usernameError).toBeVisible({ timeout: 10000 });
      await expect(emailError).toBeVisible({ timeout: 10000 });

      // Errors should have unique IDs
      const usernameErrorId = await usernameError.getAttribute('id');
      const emailErrorId = await emailError.getAttribute('id');

      expect(usernameErrorId).toContain('username-error');
      expect(emailErrorId).toContain('email-error');
    });
  });

  test.describe('Keyboard Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/#/test/accessibility/keyboard-navigation');
      await page.waitForLoadState('networkidle');
    });

    test('should be able to tab through all form fields', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('keyboard-navigation');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="keyboard-navigation"] #firstName input', { state: 'visible', timeout: 10000 });
      // Focus the first input
      const firstInput = scenario.locator('#firstName input');
      await firstInput.focus();

      // Tab to next field
      await page.keyboard.press('Tab');

      // Second field should be focused
      const lastNameInput = scenario.locator('#lastName input');
      await expect(lastNameInput).toBeFocused();

      // Tab to checkbox
      await page.keyboard.press('Tab');
      const checkbox = scenario.locator('#agreeToTerms p-checkbox input');
      await expect(checkbox).toBeFocused();
    });

    test('checkbox should toggle with Space key', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('keyboard-navigation');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="keyboard-navigation"] #agreeToTerms p-checkbox input', {
        state: 'visible',
        timeout: 10000,
      });
      const checkboxInput = scenario.locator('#agreeToTerms p-checkbox input');

      // Initially unchecked
      await expect(checkboxInput).not.toBeChecked();

      // Focus and press Space
      await checkboxInput.focus();
      await page.keyboard.press('Space');

      // Should now be checked
      await expect(checkboxInput).toBeChecked({ timeout: 5000 });
    });

    test('toggle should toggle with Space key', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('keyboard-navigation');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="keyboard-navigation"] #notifications p-toggleSwitch input', {
        state: 'visible',
        timeout: 10000,
      });
      // PrimeNG toggle uses p-toggleSwitch with an input inside
      const toggleInput = scenario.locator('#notifications p-toggleSwitch input');

      // Initially unchecked
      await expect(toggleInput).not.toBeChecked();

      // Focus and press Space
      await toggleInput.focus();
      await page.keyboard.press('Space');

      // Should now be checked
      await expect(toggleInput).toBeChecked({ timeout: 5000 });
    });

    test('select should be operable with keyboard', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('keyboard-navigation');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="keyboard-navigation"] #country p-select', { state: 'visible', timeout: 10000 });
      const select = scenario.locator('#country p-select');
      await expect(select).toBeVisible({ timeout: 10000 });

      // Focus the select and open with Enter
      await select.click();

      // Wait for dropdown overlay to appear
      const overlay = page.locator('.p-select-overlay');
      await expect(overlay).toBeVisible({ timeout: 5000 });

      // Navigate with arrow keys and select
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // Overlay should close
      await expect(overlay).not.toBeVisible({ timeout: 5000 });
    });

    test('form should be submittable with Enter key', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('keyboard-navigation');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="keyboard-navigation"] #firstName input', { state: 'visible', timeout: 10000 });
      // Fill required fields
      const firstInput = scenario.locator('#firstName input');
      await firstInput.fill('John');
      await expect(firstInput).toHaveValue('John', { timeout: 5000 });
      await firstInput.blur();

      // Set up submission listener
      const submittedDataPromise = page.evaluate(
        () =>
          new Promise((resolve) => {
            window.addEventListener(
              'formSubmitted',
              (event: Event) => {
                resolve((event as CustomEvent).detail.data);
              },
              { once: true },
            );
          }),
      );

      await page.waitForSelector('[data-testid="keyboard-navigation"] #submit button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      // Focus submit button and press Enter
      const submitButton = scenario.locator('#submit button');
      await submitButton.focus();
      await page.keyboard.press('Enter');

      // Form should submit
      const submittedData = await submittedDataPromise;
      expect(submittedData).toBeDefined();
    });
  });

  test.describe('Focus Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/#/test/accessibility/focus-management');
      await page.waitForLoadState('networkidle');
    });

    test('focused input should have visible focus indicator', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('focus-management');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="focus-management"] #field1 input', { state: 'visible', timeout: 10000 });
      const input = scenario.locator('#field1 input');
      await input.focus();

      // The input should be focused
      await expect(input).toBeFocused();
    });

    test('blur should remove focus indicator', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('focus-management');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="focus-management"] #field1 input', { state: 'visible', timeout: 10000 });
      const input = scenario.locator('#field1 input');
      await input.focus();
      await input.blur();

      // The input should not be focused
      await expect(input).not.toBeFocused();
    });

    test('tab order should follow visual order', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('focus-management');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="focus-management"] #field1 input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="focus-management"] #field2 input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="focus-management"] #field3 input', { state: 'visible', timeout: 10000 });
      const field1 = scenario.locator('#field1 input');
      const field2 = scenario.locator('#field2 input');
      const field3 = scenario.locator('#field3 input');

      // Focus first field
      await field1.focus();
      await expect(field1).toBeFocused();

      // Tab to second
      await page.keyboard.press('Tab');
      await expect(field2).toBeFocused();

      // Tab to third
      await page.keyboard.press('Tab');
      await expect(field3).toBeFocused();
    });

    test('shift+tab should navigate backwards', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('focus-management');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('[data-testid="focus-management"] #field1 input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="focus-management"] #field2 input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="focus-management"] #field3 input', { state: 'visible', timeout: 10000 });
      const field1 = scenario.locator('#field1 input');
      const field2 = scenario.locator('#field2 input');
      const field3 = scenario.locator('#field3 input');

      // Focus third field
      await field3.focus();
      await expect(field3).toBeFocused();

      // Shift+Tab to second
      await page.keyboard.press('Shift+Tab');
      await expect(field2).toBeFocused();

      // Shift+Tab to first
      await page.keyboard.press('Shift+Tab');
      await expect(field1).toBeFocused();
    });
  });

  test.describe('Hint and Error Display', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/#/test/accessibility/aria-attributes');
      await page.waitForLoadState('networkidle');
    });

    test('hint should be visible when field has no errors', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible();

      const hint = scenario.locator('#requiredField .df-prime-hint');
      await expect(hint).toBeVisible();
      await expect(hint).toHaveText('This field is required for submission');
    });

    test('hint should be hidden when field displays errors', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible();

      const input = scenario.locator('#requiredField input');
      const hint = scenario.locator('#requiredField .df-prime-hint');
      const error = scenario.locator('#requiredField .p-error');

      // Initially hint is visible
      await expect(hint).toBeVisible();

      // Trigger validation error (touch and blur empty required field)
      await input.focus();
      await input.blur();
      await page.waitForTimeout(200);

      // Error should be visible, hint should be hidden
      await expect(error).toBeVisible();
      await expect(hint).not.toBeVisible();
    });

    test('hint should reappear when errors are cleared', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible();

      const input = scenario.locator('#requiredField input');
      const hint = scenario.locator('#requiredField .df-prime-hint');
      const error = scenario.locator('#requiredField .p-error');

      // Trigger validation error
      await input.focus();
      await input.blur();
      await page.waitForTimeout(200);
      await expect(error).toBeVisible();
      await expect(hint).not.toBeVisible();

      // Fix the error by entering a value
      await input.fill('valid value');
      await page.waitForTimeout(200);

      // Error should be hidden, hint should reappear
      await expect(error).not.toBeVisible();
      await expect(hint).toBeVisible();
    });

    test('aria-describedby should switch from hint to error when errors appear', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible();

      const input = scenario.locator('#requiredField input');

      // Initially aria-describedby references hint only
      let ariaDescribedBy = await input.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('requiredField-hint');
      expect(ariaDescribedBy).not.toContain('requiredField-error');

      // Trigger validation error
      await input.focus();
      await input.blur();
      await page.waitForTimeout(200);

      // Now aria-describedby should reference error only (not hint)
      ariaDescribedBy = await input.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('requiredField-error');
      expect(ariaDescribedBy).not.toContain('requiredField-hint');
    });

    test('aria-describedby should switch back to hint when errors are cleared', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible();

      const input = scenario.locator('#requiredField input');

      // Trigger error
      await input.focus();
      await input.blur();
      await page.waitForTimeout(200);

      let ariaDescribedBy = await input.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('requiredField-error');
      expect(ariaDescribedBy).not.toContain('requiredField-hint');

      // Clear error
      await input.fill('valid value');
      await page.waitForTimeout(200);

      // aria-describedby should reference hint only
      ariaDescribedBy = await input.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('requiredField-hint');
      expect(ariaDescribedBy).not.toContain('requiredField-error');
    });
  });
});
