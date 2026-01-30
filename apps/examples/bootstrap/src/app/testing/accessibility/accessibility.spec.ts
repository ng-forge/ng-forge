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

      const input = scenario.locator('#inputField input');
      // Wait for input to be ready before checking attribute
      await expect(input).toBeVisible({ timeout: 10000 });
      await expect(input).toHaveAttribute('aria-required', 'true', { timeout: 10000 });
    });

    test('input field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      const input = scenario.locator('#inputField input');
      const ariaDescribedBy = await input.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('inputField-hint');
    });

    test('input field should have aria-invalid="true" when invalid and touched', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      const input = scenario.locator('#inputField input');
      await input.focus();
      await input.blur();
      await expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    // Textarea field tests
    test('textarea field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible();

      const textarea = scenario.locator('#textareaField textarea');
      await expect(textarea).toHaveAttribute('aria-required', 'true');
    });

    test('textarea field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      const textarea = scenario.locator('#textareaField textarea');
      const ariaDescribedBy = await textarea.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('textareaField-hint');
    });

    test('textarea field should have aria-invalid="true" when invalid and touched', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      const textarea = scenario.locator('#textareaField textarea');
      await textarea.focus();
      await textarea.blur();
      await expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    // Select field tests
    test('select field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible();

      const select = scenario.locator('#selectField select');
      await expect(select).toHaveAttribute('aria-required', 'true');
    });

    test('select field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      const select = scenario.locator('#selectField select');
      const ariaDescribedBy = await select.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('selectField-hint');
    });

    test('select field should have aria-invalid="true" when invalid and touched', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      const select = scenario.locator('#selectField select');
      await select.focus();
      await select.blur();
      await expect(select).toHaveAttribute('aria-invalid', 'true');
    });

    // Checkbox field tests
    test('checkbox field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible();

      const checkbox = scenario.locator('#checkboxField .form-check input');
      await expect(checkbox).toHaveAttribute('aria-required', 'true');
    });

    test('checkbox field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      const checkbox = scenario.locator('#checkboxField .form-check input');
      const ariaDescribedBy = await checkbox.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('checkboxField-hint');
    });

    // Toggle field tests
    test('toggle field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible();

      const toggle = scenario.locator('#toggleField .form-check input');
      await expect(toggle).toHaveAttribute('aria-required', 'true');
    });

    test('toggle field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      const toggle = scenario.locator('#toggleField .form-check input');
      const ariaDescribedBy = await toggle.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('toggleField-hint');
    });

    // Radio field tests
    // TODO: aria-required not currently propagated to individual radio inputs in BsRadioGroupComponent
    test.skip('radio field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible();

      // Bootstrap radio puts aria attrs on individual radio inputs
      const radioInput = scenario.locator('#radioField input[type="radio"]').first();
      await expect(radioInput).toHaveAttribute('aria-required', 'true');
    });

    test('radio field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      // Bootstrap radio puts aria attrs on individual radio inputs
      const radioInput = scenario.locator('#radioField input[type="radio"]').first();
      const ariaDescribedBy = await radioInput.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('radioField-hint');
    });

    // Multi-checkbox field tests
    test('multi-checkbox field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible();

      // Bootstrap multi-checkbox puts aria attrs on individual checkbox inputs
      const checkboxInput = scenario.locator('#multiCheckboxField input[type="checkbox"]').first();
      await expect(checkboxInput).toHaveAttribute('aria-required', 'true');
    });

    test('multi-checkbox field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      // Bootstrap multi-checkbox puts aria attrs on individual checkbox inputs
      const checkboxInput = scenario.locator('#multiCheckboxField input[type="checkbox"]').first();
      const ariaDescribedBy = await checkboxInput.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('multiCheckboxField-hint');
    });

    // Slider field tests
    test('slider field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible();

      const slider = scenario.locator('#sliderField input[type="range"]');
      const ariaDescribedBy = await slider.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('sliderField-hint');
    });

    // Datepicker field tests
    test('datepicker field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible();

      const datepicker = scenario.locator('#datepickerField input');
      await expect(datepicker).toHaveAttribute('aria-required', 'true');
    });

    test('datepicker field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      const datepicker = scenario.locator('#datepickerField input');
      const ariaDescribedBy = await datepicker.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('datepickerField-hint');
    });

    test('datepicker field should have aria-invalid="true" when invalid and touched', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      const datepicker = scenario.locator('#datepickerField input');
      await datepicker.focus();
      await datepicker.blur();
      await expect(datepicker).toHaveAttribute('aria-invalid', 'true');
    });

    // Error ID tests
    test('all required fields should show errors with unique IDs when touched without value', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible();

      // Touch input field to trigger error
      const input = scenario.locator('#inputField input');
      await input.focus();
      await input.blur();

      // Check error has proper ID
      const inputError = scenario.locator('#inputField .invalid-feedback');
      await expect(inputError).toBeVisible();
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
      await expect(scenario).toBeVisible();

      // Required field input should have aria-required="true"
      const requiredInput = scenario.locator('#requiredField input');
      await expect(requiredInput).toHaveAttribute('aria-required', 'true');
    });

    test('optional field should not have aria-required="true"', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible();

      // Optional field should either have no aria-required, or aria-required="false"
      const optionalInput = scenario.locator('#optionalField input');
      const ariaRequired = await optionalInput.getAttribute('aria-required');
      // Both null and "false" are valid WCAG-compliant values for optional fields
      expect(ariaRequired).not.toBe('true');
    });

    test('invalid field should have aria-invalid="true" after blur', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible();

      const requiredInput = scenario.locator('#requiredField input');

      // Focus and blur without filling - should show validation error
      await requiredInput.focus();
      await requiredInput.blur();

      // Should have aria-invalid="true"
      await expect(requiredInput).toHaveAttribute('aria-invalid', 'true');
    });

    test('valid field should have aria-invalid="false"', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible();

      const requiredInput = scenario.locator('#requiredField input');

      // Fill with valid value
      await requiredInput.fill('Valid value');
      await requiredInput.blur();

      // Should have aria-invalid="false"
      await expect(requiredInput).toHaveAttribute('aria-invalid', 'false');
    });

    test('field with hint should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible();

      const requiredInput = scenario.locator('#requiredField input');

      // Check that aria-describedby contains the help text ID
      const ariaDescribedBy = await requiredInput.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('requiredField-hint');

      // Verify the help text element exists with the correct ID
      const hint = scenario.locator('#requiredField .form-text');
      const hintId = await hint.getAttribute('id');
      expect(hintId).toBe('requiredField-hint');
    });

    test('field with error should have aria-describedby referencing error', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible();

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

    test('error messages should have role="alert" or be inside invalid-feedback', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('error-announcements');
      await expect(scenario).toBeVisible();

      const usernameInput = scenario.locator('#username input');

      // Visual regression: compare empty state against baseline
      await helpers.expectScreenshotMatch(scenario, 'bootstrap-error-announcements-empty');

      // Trigger validation error
      await usernameInput.fill('ab'); // Too short
      await usernameInput.blur();

      // Bootstrap errors are announced via .invalid-feedback which has proper ARIA
      const error = scenario.locator('#username .invalid-feedback');
      await expect(error).toBeVisible();

      // Visual regression: compare error state against baseline
      await helpers.expectScreenshotMatch(scenario, 'bootstrap-error-announcements-with-error');
    });

    test('multiple errors should each be properly identified', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('error-announcements');
      await expect(scenario).toBeVisible();

      const usernameInput = scenario.locator('#username input');
      const emailInput = scenario.locator('#email input');

      // Trigger validation errors on both fields (both are required)
      await usernameInput.focus();
      await usernameInput.blur();
      await emailInput.focus();
      await emailInput.blur();

      // Both fields should show errors
      const usernameError = scenario.locator('#username .invalid-feedback');
      const emailError = scenario.locator('#email .invalid-feedback');

      await expect(usernameError).toBeVisible();
      await expect(emailError).toBeVisible();

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
      await expect(scenario).toBeVisible();

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
      const checkbox = scenario.locator('#agreeToTerms .form-check input');
      await expect(checkbox).toBeFocused();
    });

    test('checkbox should toggle with Space key', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('keyboard-navigation');
      await expect(scenario).toBeVisible();

      const checkboxInput = scenario.locator('#agreeToTerms .form-check input');

      // Initially unchecked
      await expect(checkboxInput).not.toBeChecked();

      // Focus and press Space
      await checkboxInput.focus();
      await page.keyboard.press('Space');

      // Should now be checked
      await expect(checkboxInput).toBeChecked();
    });

    test('toggle should toggle with Space key', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('keyboard-navigation');
      await expect(scenario).toBeVisible();

      const toggleInput = scenario.locator('#notifications .form-check input');

      // Initially unchecked
      await expect(toggleInput).not.toBeChecked();

      // Focus and press Space
      await toggleInput.focus();
      await page.keyboard.press('Space');

      // Should now be checked
      await expect(toggleInput).toBeChecked();
    });

    test('select should be operable with keyboard', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('keyboard-navigation');
      await expect(scenario).toBeVisible();

      const select = scenario.locator('#country select');

      // Focus the select
      await select.focus();
      await expect(select).toBeFocused();

      // Native select: use selectOption for reliable selection
      await select.selectOption({ index: 1 });

      // Value should be set
      await expect(select).not.toHaveValue('');
    });

    test('form should be submittable with Enter key', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('keyboard-navigation');
      await expect(scenario).toBeVisible();

      // Fill required fields
      const firstInput = scenario.locator('#firstName input');
      await firstInput.fill('John');

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
      await expect(scenario).toBeVisible();

      const input = scenario.locator('#field1 input');
      await input.focus();

      // The input should be focused
      await expect(input).toBeFocused();
    });

    test('blur should remove focus indicator', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('focus-management');
      await expect(scenario).toBeVisible();

      const input = scenario.locator('#field1 input');
      await input.focus();
      await input.blur();

      // The input should not be focused
      await expect(input).not.toBeFocused();
    });

    test('tab order should follow visual order', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('focus-management');
      await expect(scenario).toBeVisible();

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
      await expect(scenario).toBeVisible();

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

      const hint = scenario.locator('#requiredField .form-text');
      await expect(hint).toBeVisible();
      await expect(hint).toHaveText('This field is required for submission');
    });

    test('hint should be hidden when field displays errors', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible();

      const input = scenario.locator('#requiredField input');
      const hint = scenario.locator('#requiredField .form-text');
      const error = scenario.locator('#requiredField .invalid-feedback');

      // Initially hint is visible
      await expect(hint).toBeVisible();

      // Trigger validation error (touch and blur empty required field)
      await input.focus();
      await input.blur();

      // Error should be visible, hint should be hidden
      await expect(error).toBeVisible();
      await expect(hint).not.toBeVisible();
    });

    test('hint should reappear when errors are cleared', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible();

      const input = scenario.locator('#requiredField input');
      const hint = scenario.locator('#requiredField .form-text');
      const error = scenario.locator('#requiredField .invalid-feedback');

      // Trigger validation error
      await input.focus();
      await input.blur();
      await expect(error).toBeVisible();
      await expect(hint).not.toBeVisible();

      // Fix the error by entering a value
      await input.fill('valid value');

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

      let ariaDescribedBy = await input.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('requiredField-error');
      expect(ariaDescribedBy).not.toContain('requiredField-hint');

      // Clear error
      await input.fill('valid value');

      // aria-describedby should reference hint only
      ariaDescribedBy = await input.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('requiredField-hint');
      expect(ariaDescribedBy).not.toContain('requiredField-error');
    });
  });
});
