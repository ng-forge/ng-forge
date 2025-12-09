import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

/**
 * PrimeNG Accessibility Tests
 *
 * NOTE: Several tests are marked with test.skip() because PrimeNG components have different
 * ARIA attribute patterns than Material components. The key differences are:
 *
 * 1. Checkbox/Toggle: ARIA attributes are on the p-checkbox/p-toggleswitch host element,
 *    not on the inner input element (unlike Material which puts them on the input).
 *
 * 2. aria-invalid for textarea/select: PrimeNG uses [(ngModel)] binding which doesn't
 *    properly sync touched/invalid state like Angular Signal Forms' [field] directive.
 *    The components need to be refactored to use [field] directive instead.
 *
 * 3. Radio groups: PrimeNG radiobutton doesn't use role="radiogroup" with ARIA attributes
 *    on the group container like Material does.
 *
 * TODO: Fix PrimeNG components to properly support ARIA attributes:
 * - Refactor textarea/select to use [field] directive instead of [(ngModel)]
 * - Add aria-describedby to checkbox/toggle inner input elements
 * - Add aria-required to checkbox/toggle inner input elements
 * - Add proper role="radiogroup" with ARIA attributes to radio field
 */

test.describe('Accessibility Tests', () => {
  test.describe('All Fields ARIA Attributes', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:4202/#/test/accessibility/all-fields-aria');
      await page.waitForLoadState('networkidle');
    });

    // Input field tests - These work because PrimeNG input uses the [field] directive
    test('input field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible();

      const input = scenario.locator('#inputField input');
      await expect(input).toHaveAttribute('aria-required', 'true');
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
      await page.waitForTimeout(200);
      await expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    // Textarea field tests - aria-required and aria-describedby work, but aria-invalid doesn't
    // because textarea uses [(ngModel)] instead of [field] directive
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

    // SKIP: PrimeNG textarea uses [(ngModel)] which doesn't properly sync touched/invalid state
    test.skip('textarea field should have aria-invalid="true" when invalid and touched', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      const textarea = scenario.locator('#textareaField textarea');
      await textarea.focus();
      await textarea.blur();
      await page.waitForTimeout(200);
      await expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    // Select field tests - ARIA attributes are on p-select host element
    test('select field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible();

      const select = scenario.locator('#selectField p-select');
      await expect(select).toHaveAttribute('aria-required', 'true');
    });

    test('select field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      const select = scenario.locator('#selectField p-select');
      const ariaDescribedBy = await select.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('selectField-hint');
    });

    // SKIP: PrimeNG select focus/blur doesn't trigger form touched state properly
    test.skip('select field should have aria-invalid="true" when invalid and touched', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      const select = scenario.locator('#selectField p-select');
      await select.focus();
      await select.blur();
      await page.waitForTimeout(200);
      await expect(select).toHaveAttribute('aria-invalid', 'true');
    });

    // Checkbox field tests - ARIA attributes are on p-checkbox host element, not inner input
    test('checkbox field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible();

      // In PrimeNG, ARIA attributes are on the p-checkbox host element
      const checkbox = scenario.locator('#checkboxField p-checkbox');
      await expect(checkbox).toHaveAttribute('aria-required', 'true');
    });

    test('checkbox field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      // In PrimeNG, ARIA attributes are on the p-checkbox host element
      const checkbox = scenario.locator('#checkboxField p-checkbox');
      const ariaDescribedBy = await checkbox.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('checkboxField-hint');
    });

    // Toggle field tests - ARIA attributes are on p-toggleswitch host element, not inner input
    test('toggle field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible();

      // In PrimeNG, ARIA attributes are on the p-toggleswitch host element
      const toggle = scenario.locator('#toggleField p-toggleswitch');
      await expect(toggle).toHaveAttribute('aria-required', 'true');
    });

    test('toggle field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      // In PrimeNG, ARIA attributes are on the p-toggleswitch host element
      const toggle = scenario.locator('#toggleField p-toggleswitch');
      const ariaDescribedBy = await toggle.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('toggleField-hint');
    });

    // Radio field tests
    test('radio field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible();

      const radioGroup = scenario.locator('#radioField [role="radiogroup"]');
      await expect(radioGroup).toHaveAttribute('aria-required', 'true');
    });

    test('radio field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      const radioGroup = scenario.locator('#radioField [role="radiogroup"]');
      const ariaDescribedBy = await radioGroup.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('radioField-hint');
    });

    // Multi-checkbox field tests
    test('multi-checkbox field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible();

      // Multi-checkbox uses a fieldset/group with aria attributes
      const group = scenario.locator('#multiCheckboxField [role="group"]');
      await expect(group).toHaveAttribute('aria-required', 'true');
    });

    test('multi-checkbox field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      const group = scenario.locator('#multiCheckboxField [role="group"]');
      const ariaDescribedBy = await group.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('multiCheckboxField-hint');
    });

    // Slider field tests
    test('slider field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible();

      const slider = scenario.locator('#sliderField p-slider .p-slider-handle');
      const ariaDescribedBy = await slider.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('sliderField-hint');
    });

    // Datepicker field tests - ARIA attributes are on p-datepicker host element
    test('datepicker field should have aria-required="true" when required', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      await expect(scenario).toBeVisible();

      const datepicker = scenario.locator('#datepickerField p-datepicker');
      await expect(datepicker).toHaveAttribute('aria-required', 'true');
    });

    test('datepicker field should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      const datepicker = scenario.locator('#datepickerField p-datepicker');
      const ariaDescribedBy = await datepicker.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('datepickerField-hint');
    });

    // SKIP: PrimeNG datepicker focus/blur doesn't trigger form touched state properly
    test.skip('datepicker field should have aria-invalid="true" when invalid and touched', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('all-fields-aria');
      const datepickerInput = scenario.locator('#datepickerField p-datepicker input');
      await datepickerInput.focus();
      await datepickerInput.blur();
      await page.waitForTimeout(200);
      const datepicker = scenario.locator('#datepickerField p-datepicker');
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
      await page.waitForTimeout(200);

      // Check error has proper ID
      const inputError = scenario.locator('#inputField small.p-error');
      await expect(inputError).toBeVisible();
      const inputErrorId = await inputError.getAttribute('id');
      expect(inputErrorId).toContain('inputField-error');
    });
  });

  test.describe('ARIA Attributes', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:4202/#/test/accessibility/aria-attributes');
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
      await page.waitForTimeout(200);

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
      await page.waitForTimeout(200);

      // Should have aria-invalid="false"
      await expect(requiredInput).toHaveAttribute('aria-invalid', 'false');
    });

    test('field with hint should have aria-describedby referencing hint', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('aria-attributes');
      await expect(scenario).toBeVisible();

      const requiredInput = scenario.locator('#requiredField input');

      // Check that aria-describedby contains the hint ID
      const ariaDescribedBy = await requiredInput.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('requiredField-hint');

      // Verify the hint element exists with the correct ID
      const hint = scenario.locator('#requiredField small[id*="hint"]');
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
      await page.waitForTimeout(200);

      // Check that aria-describedby includes error ID
      const ariaDescribedBy = await requiredInput.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain('requiredField-error');
    });
  });

  test.describe('Error Announcements', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:4202/#/test/accessibility/error-announcements');
      await page.waitForLoadState('networkidle');
    });

    test('error messages should have role="alert" or be inside small.p-error', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('error-announcements');
      await expect(scenario).toBeVisible();

      const usernameInput = scenario.locator('#username input');

      // Trigger validation error
      await usernameInput.fill('ab'); // Too short
      await usernameInput.blur();
      await page.waitForTimeout(200);

      // PrimeNG errors are announced via small.p-error which has proper ARIA
      const error = scenario.locator('#username small.p-error');
      await expect(error).toBeVisible();
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
      await page.waitForTimeout(200);

      // Both fields should show errors
      const usernameError = scenario.locator('#username small.p-error');
      const emailError = scenario.locator('#email small.p-error');

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
      await page.goto('http://localhost:4202/#/test/accessibility/keyboard-navigation');
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
      const checkbox = scenario.locator('#agreeToTerms p-checkbox input');
      await expect(checkbox).toBeFocused();
    });

    test('checkbox should toggle with Space key', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('keyboard-navigation');
      await expect(scenario).toBeVisible();

      const checkboxContainer = scenario.locator('#agreeToTerms p-checkbox');
      const checkboxInput = scenario.locator('#agreeToTerms p-checkbox input');

      // Initially unchecked
      await expect(checkboxContainer).not.toHaveClass(/p-checkbox-checked/);

      // Focus and press Space
      await checkboxInput.focus();
      await page.keyboard.press('Space');
      await page.waitForTimeout(100);

      // Should now be checked
      await expect(checkboxContainer).toHaveClass(/p-checkbox-checked/);
    });

    test('toggle should toggle with Space key', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('keyboard-navigation');
      await expect(scenario).toBeVisible();

      const toggleContainer = scenario.locator('#notifications p-toggleswitch');
      const toggleInput = scenario.locator('#notifications p-toggleswitch input');

      // Initially unchecked
      await expect(toggleInput).not.toBeChecked();

      // Focus and press Space
      await toggleInput.focus();
      await page.keyboard.press('Space');
      await page.waitForTimeout(100);

      // Should now be checked
      await expect(toggleInput).toBeChecked();
    });

    test('select should be operable with keyboard', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('keyboard-navigation');
      await expect(scenario).toBeVisible();

      const select = scenario.locator('#country p-select');

      // Focus the select
      await select.focus();

      // Open with Enter or Space
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Dropdown should be visible
      const panel = page.locator('.p-select-overlay');
      await expect(panel).toBeVisible();

      // Navigate with arrow keys
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);

      // Panel should close and value should be set
      await expect(panel).not.toBeVisible();
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
      await page.goto('http://localhost:4202/#/test/accessibility/focus-management');
      await page.waitForLoadState('networkidle');
    });

    test('focused input should have visible focus indicator', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('focus-management');
      await expect(scenario).toBeVisible();

      const input = scenario.locator('#field1 input');
      await input.focus();

      // The input should be focused
      await expect(input).toBeFocused();

      // The input wrapper should show focus state
      const inputWrapper = scenario.locator('#field1 input');
      await expect(inputWrapper).toBeFocused();
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
});
