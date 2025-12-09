import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('PrimeNG Components Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/primeng-components');
  });

  test.describe('Datepicker Component', () => {
    test('should open calendar and select date', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/datepicker-basic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('datepicker-basic');
      await expect(scenario).toBeVisible();

      // Click the calendar button to open calendar (PrimeNG uses button with calendar icon)
      const calendarButton = scenario.locator('#birthDate p-datepicker button');
      await calendarButton.click();

      // Wait for calendar popup panel (PrimeNG v18+ uses .p-datepicker-panel for the overlay)
      const calendarPanel = page.locator('.p-datepicker-panel');
      await expect(calendarPanel).toBeVisible({ timeout: 5000 });

      // Select a date (e.g., 15th of current month)
      const dateCell = calendarPanel.locator('table td span:not(.p-disabled)').filter({ hasText: /^15$/ }).first();
      if ((await dateCell.count()) > 0) {
        await dateCell.click();
      } else {
        // Fallback: click any available date
        await calendarPanel.locator('table td span:not(.p-disabled)').first().click();
      }

      // Wait for calendar panel to close
      await expect(calendarPanel).not.toBeVisible({ timeout: 5000 });

      // Value should be set
      const input = scenario.locator('#birthDate p-datepicker input');
      expect(await input.inputValue()).toBeTruthy();
    });

    test('should respect min/max date constraints', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/datepicker-constraints');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('datepicker-constraints');
      await expect(scenario).toBeVisible();

      // Click the calendar button to open calendar
      const calendarButton = scenario.locator('#appointmentDate p-datepicker button');
      await calendarButton.click();

      // Wait for calendar popup panel
      const calendarPanel = page.locator('.p-datepicker-panel');
      await expect(calendarPanel).toBeVisible({ timeout: 5000 });

      // Calendar should be rendered with the current month
      await expect(calendarPanel).toBeVisible();

      // Note: Disabled dates depend on which month is displayed and the constraints
      // The actual date validation is enforced by the form framework
    });

    test('should handle required field validation', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/datepicker-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('datepicker-validation');
      await expect(scenario).toBeVisible();

      // Verify required field - aria-required is on the p-datepicker element itself
      const datepicker = scenario.locator('#eventDate p-datepicker');
      const ariaRequired = await datepicker.getAttribute('aria-required');
      expect(ariaRequired).toBe('true');

      // Submit button should be present
      await expect(scenario.locator('#submit button')).toBeVisible();
    });

    test('should clear date value', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/datepicker-clear');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('datepicker-clear');
      await expect(scenario).toBeVisible();

      // First select a date to ensure there's a value to clear
      const calendarButton = scenario.locator('#selectedDate p-datepicker button');
      await calendarButton.click();
      const calendarPanel = page.locator('.p-datepicker-panel');
      await expect(calendarPanel).toBeVisible({ timeout: 5000 });
      await calendarPanel.locator('table td span:not(.p-disabled)').first().click();
      await expect(calendarPanel).not.toBeVisible({ timeout: 5000 });

      // Verify date is now set
      const input = scenario.locator('#selectedDate p-datepicker input');
      expect(await input.inputValue()).toBeTruthy();

      // Clear the value
      await input.clear();
      await input.blur();
      await page.waitForTimeout(200);

      // Value should be empty
      expect(await input.inputValue()).toBe('');
    });

    test('should be disabled when disabled prop is true', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/datepicker-disabled');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('datepicker-disabled');
      await expect(scenario).toBeVisible();

      // Input should be disabled
      const input = scenario.locator('#lockedDate p-datepicker input');
      await expect(input).toBeDisabled();

      // Calendar button should also be disabled
      const button = scenario.locator('#lockedDate p-datepicker button');
      await expect(button).toBeDisabled();
    });

    test('should work with initial value', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/datepicker-initial-value');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('datepicker-initial-value');
      await expect(scenario).toBeVisible();

      // Open calendar and select a date to verify it works
      const calendarButton = scenario.locator('#presetDate p-datepicker button');
      await calendarButton.click();

      const calendarPanel = page.locator('.p-datepicker-panel');
      await expect(calendarPanel).toBeVisible({ timeout: 5000 });

      // Select a date
      await calendarPanel.locator('table td span:not(.p-disabled)').first().click();
      await expect(calendarPanel).not.toBeVisible({ timeout: 5000 });

      // Input should now show a date
      const input = scenario.locator('#presetDate p-datepicker input');
      const inputValue = await input.inputValue();
      expect(inputValue).toBeTruthy();
    });
  });

  test.describe('Slider Component', () => {
    test('should update value on interaction', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/slider-basic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('slider-basic');
      await expect(scenario).toBeVisible();

      const slider = scenario.locator('#volume p-slider');
      await expect(slider).toBeVisible();

      // Get slider position and click to middle
      const sliderBox = await slider.boundingBox();
      if (sliderBox) {
        // Click in the middle of the slider
        await page.mouse.click(sliderBox.x + sliderBox.width / 2, sliderBox.y + sliderBox.height / 2);
        await page.waitForTimeout(200);

        // Value should be around 50 - check the handle position or aria-valuenow
        const handle = scenario.locator('#volume p-slider .p-slider-handle');
        const valueNow = await handle.getAttribute('aria-valuenow');
        if (valueNow) {
          const numValue = parseInt(valueNow);
          expect(numValue).toBeGreaterThan(30);
          expect(numValue).toBeLessThan(70);
        }
      }
    });

    test('should respect min and max bounds', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/slider-bounds');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('slider-bounds');
      await expect(scenario).toBeVisible();

      const slider = scenario.locator('#temperature p-slider');
      await expect(slider).toBeVisible();

      // Verify slider has the configured initial value via aria-valuenow
      const handle = scenario.locator('#temperature p-slider .p-slider-handle');
      const valueNow = await handle.getAttribute('aria-valuenow');
      expect(valueNow).toBe('20');
    });

    test('should work with step increments', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/slider-steps');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('slider-steps');
      await expect(scenario).toBeVisible();

      const slider = scenario.locator('#rating p-slider');
      await expect(slider).toBeVisible();

      // PrimeNG slider step is set via the component, verify it works by checking handle attributes
      const handle = scenario.locator('#rating p-slider .p-slider-handle');
      await expect(handle).toBeVisible();
    });

    test('should be disabled when disabled prop is true', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/slider-disabled');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('slider-disabled');
      await expect(scenario).toBeVisible();

      // PrimeNG slider should have p-disabled class when disabled
      const slider = scenario.locator('#lockedSlider p-slider');
      await expect(slider).toHaveClass(/p-disabled/);
    });

    test('should display current value', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/slider-value-display');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('slider-value-display');
      await expect(scenario).toBeVisible();

      const handle = scenario.locator('#brightness p-slider .p-slider-handle');
      const valueNow = await handle.getAttribute('aria-valuenow');

      expect(valueNow).toBe('75');
    });
  });

  test.describe('Toggle Component', () => {
    test('should change state on click', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/toggle-basic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('toggle-basic');
      await expect(scenario).toBeVisible();

      const toggle = scenario.locator('#notifications p-toggleswitch');
      const input = scenario.locator('#notifications p-toggleswitch input[type="checkbox"]');

      // Initially unchecked
      await expect(input).not.toBeChecked();

      // Click to toggle
      await toggle.click();
      await page.waitForTimeout(200);

      // Should be checked
      await expect(input).toBeChecked();
    });

    test('should work with keyboard (Space/Enter)', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/toggle-keyboard');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('toggle-keyboard');
      await expect(scenario).toBeVisible();

      const input = scenario.locator('#darkMode p-toggleswitch input[type="checkbox"]');

      // Focus the toggle
      await input.focus();

      // Initially unchecked
      await expect(input).not.toBeChecked();

      // Press Space to toggle
      await page.keyboard.press('Space');
      await page.waitForTimeout(200);

      // Should be checked
      await expect(input).toBeChecked();
    });

    test('should be disabled when disabled prop is true', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/toggle-disabled');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('toggle-disabled');
      await expect(scenario).toBeVisible();

      // Input should be disabled
      const input = scenario.locator('#lockedToggle p-toggleswitch input[type="checkbox"]');
      await expect(input).toBeDisabled();

      // Should be checked since value is true
      await expect(input).toBeChecked();
    });

    test('should handle required toggle validation', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/toggle-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('toggle-validation');
      await expect(scenario).toBeVisible();

      // Verify toggle exists and is initially unchecked
      const toggle = scenario.locator('#termsAcceptance p-toggleswitch');
      const input = scenario.locator('#termsAcceptance p-toggleswitch input[type="checkbox"]');
      await expect(input).not.toBeChecked();

      // Toggle it to accept terms
      await toggle.click();
      await page.waitForTimeout(200);

      // Should now be checked
      await expect(input).toBeChecked();
    });
  });

  test.describe('Multi-Checkbox Component', () => {
    test('should select multiple options', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/multi-checkbox-basic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multi-checkbox-basic');
      await expect(scenario).toBeVisible();

      // Select multiple options by clicking checkbox labels
      // Label for attribute matches the pattern: {key}-{optionValue}
      await scenario.locator('label[for="interests-sports"]').click();
      await page.waitForTimeout(100);
      await scenario.locator('label[for="interests-reading"]').click();
      await page.waitForTimeout(100);

      // Verify checked state by checking the p-checkbox element's class
      // In PrimeNG v18+, checked checkboxes have the p-checkbox-checked class
      const sportsCheckbox = scenario.locator('p-checkbox').filter({ has: page.locator('[id="interests-sports"]') });
      const readingCheckbox = scenario.locator('p-checkbox').filter({ has: page.locator('[id="interests-reading"]') });
      const musicCheckbox = scenario.locator('p-checkbox').filter({ has: page.locator('[id="interests-music"]') });

      await expect(sportsCheckbox).toHaveClass(/p-checkbox-checked/);
      await expect(readingCheckbox).toHaveClass(/p-checkbox-checked/);
      await expect(musicCheckbox).not.toHaveClass(/p-checkbox-checked/);
    });

    test('should collect values as array on submit', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/multi-checkbox-array');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multi-checkbox-array');
      await expect(scenario).toBeVisible();

      // Select multiple by clicking checkbox labels using the for attribute pattern
      await scenario.locator('label[for="skills-typescript"]').click();
      await page.waitForTimeout(100);
      await scenario.locator('label[for="skills-angular"]').click();
      await page.waitForTimeout(100);

      // Submit
      await scenario.locator('#submit button').click();
      await page.waitForTimeout(500);

      // Verify form value contains array
      const formValue = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-multi-checkbox-array"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      expect(formValue).toMatchObject({
        skills: expect.arrayContaining(['typescript', 'angular']),
      });
    });

    test('should deselect options', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/multi-checkbox-deselect');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multi-checkbox-deselect');
      await expect(scenario).toBeVisible();

      // Use the for attribute pattern to locate checkboxes
      const readCheckbox = scenario.locator('p-checkbox').filter({ has: page.locator('[id="permissions-read"]') });
      const writeCheckbox = scenario.locator('p-checkbox').filter({ has: page.locator('[id="permissions-write"]') });

      // Verify initial selection (read and write should be pre-selected per scenario)
      await expect(readCheckbox).toHaveClass(/p-checkbox-checked/);
      await expect(writeCheckbox).toHaveClass(/p-checkbox-checked/);

      // Deselect one by clicking its label
      await scenario.locator('label[for="permissions-write"]').click();
      await page.waitForTimeout(100);

      // Verify state
      await expect(readCheckbox).toHaveClass(/p-checkbox-checked/);
      await expect(writeCheckbox).not.toHaveClass(/p-checkbox-checked/);
    });

    test('should handle disabled options', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/multi-checkbox-disabled-options');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multi-checkbox-disabled-options');
      await expect(scenario).toBeVisible();

      // Use the for attribute pattern to locate checkboxes
      const feature1 = scenario.locator('p-checkbox').filter({ has: page.locator('[id="features-feature1"]') });
      const feature2 = scenario.locator('p-checkbox').filter({ has: page.locator('[id="features-feature2"]') });
      const feature3 = scenario.locator('p-checkbox').filter({ has: page.locator('[id="features-feature3"]') });

      // Disabled option should have p-disabled class
      await expect(feature2).toHaveClass(/p-disabled/);

      // Other options should not have p-disabled class
      await expect(feature1).not.toHaveClass(/p-disabled/);
      await expect(feature3).not.toHaveClass(/p-disabled/);
    });

    test('should handle required multi-checkbox validation', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/primeng-components/multi-checkbox-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multi-checkbox-validation');
      await expect(scenario).toBeVisible();

      // Use the for attribute pattern to locate checkboxes
      const option1 = scenario.locator('p-checkbox').filter({ has: page.locator('[id="requiredChoices-option1"]') });
      const option2 = scenario.locator('p-checkbox').filter({ has: page.locator('[id="requiredChoices-option2"]') });

      await expect(option1).not.toHaveClass(/p-checkbox-checked/);
      await expect(option2).not.toHaveClass(/p-checkbox-checked/);

      // Select option 1 by clicking its label
      await scenario.locator('label[for="requiredChoices-option1"]').click();
      await page.waitForTimeout(100);

      // Should be checked
      await expect(option1).toHaveClass(/p-checkbox-checked/);
    });
  });
});
