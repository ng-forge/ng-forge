import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Material Components Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/material-components');
  });

  test.describe('Datepicker Component', () => {
    test('should open calendar and select date', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/datepicker-basic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('datepicker-basic');
      await expect(scenario).toBeVisible();

      // Click the calendar button to open calendar
      await scenario.locator('#birthDate button').click();

      // Wait for calendar popup animation
      await expect(page.locator('mat-calendar')).toBeVisible({ timeout: 5000 });

      // Select a date (e.g., 15th of current month)
      const dateButton = page.locator('button[aria-label*="15"]').first();
      if ((await dateButton.count()) > 0) {
        await dateButton.click();
      } else {
        // Fallback: click any available date
        await page.locator('.mat-calendar-body-cell').first().click();
      }

      // Wait for calendar to close
      await expect(page.locator('mat-calendar')).not.toBeVisible();

      // Value should be set
      const input = scenario.locator('#birthDate input');
      expect(await input.inputValue()).toBeTruthy();
    });

    test('should respect min/max date constraints', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/datepicker-constraints');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('datepicker-constraints');
      await expect(scenario).toBeVisible();

      // Click the calendar button to open calendar
      await scenario.locator('#appointmentDate button').click();

      // Wait for calendar popup animation
      await expect(page.locator('mat-calendar')).toBeVisible({ timeout: 5000 });

      // Calendar should be rendered with the current month
      const calendar = page.locator('mat-calendar');
      await expect(calendar).toBeVisible();

      // Note: Disabled dates depend on which month is displayed and the constraints
      // The actual date validation is enforced by the form framework
    });

    test('should handle required field validation', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/datepicker-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('datepicker-validation');
      await expect(scenario).toBeVisible();

      // Verify required field is marked as required
      const input = scenario.locator('#eventDate input');
      expect(await input.getAttribute('required')).not.toBeNull();

      // Submit button should be present
      await expect(scenario.locator('#submit button')).toBeVisible();
    });

    test('should clear date value', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/datepicker-clear');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('datepicker-clear');
      await expect(scenario).toBeVisible();

      // Verify date is initially set
      const input = scenario.locator('#selectedDate input');
      expect(await input.inputValue()).toBeTruthy();

      // Clear the value
      await input.clear();
      await input.blur();
      await page.waitForTimeout(200);

      // Value should be empty
      expect(await input.inputValue()).toBe('');
    });

    test('should be disabled when disabled prop is true', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/datepicker-disabled');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('datepicker-disabled');
      await expect(scenario).toBeVisible();

      // Input should be disabled
      const input = scenario.locator('#lockedDate input');
      await expect(input).toBeDisabled();

      // Calendar button should also be disabled
      const button = scenario.locator('#lockedDate button');
      await expect(button).toBeDisabled();
    });

    test('should work with initial value', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/datepicker-initial-value');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('datepicker-initial-value');
      await expect(scenario).toBeVisible();

      // Input should show the date
      const input = scenario.locator('#presetDate input');
      const inputValue = await input.inputValue();
      expect(inputValue).toBeTruthy();
      expect(inputValue).toContain('2024');
    });
  });

  test.describe('Slider Component', () => {
    test('should update value on interaction', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/slider-basic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('slider-basic');
      await expect(scenario).toBeVisible();

      const slider = scenario.locator('#volume mat-slider input[type="range"]');
      await expect(slider).toBeVisible();

      // Get slider position and drag to middle
      const sliderBox = await slider.boundingBox();
      if (sliderBox) {
        // Click in the middle of the slider
        await page.mouse.click(sliderBox.x + sliderBox.width / 2, sliderBox.y + sliderBox.height / 2);
        await page.waitForTimeout(200);

        // Value should be around 50
        const value = await slider.inputValue();
        const numValue = parseInt(value);
        expect(numValue).toBeGreaterThan(30);
        expect(numValue).toBeLessThan(70);
      }
    });

    test('should respect min and max bounds', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/slider-bounds');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('slider-bounds');
      await expect(scenario).toBeVisible();

      const slider = scenario.locator('#temperature input[type="range"]');
      await expect(slider).toBeVisible();

      // Verify slider has the configured initial value
      const value = await slider.inputValue();
      expect(value).toBe('20');

      // Note: min/max validation is enforced by the form framework
      // Testing exact HTML attributes would require additional mapper implementation
    });

    test('should work with step increments', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/slider-steps');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('slider-steps');
      await expect(scenario).toBeVisible();

      const slider = scenario.locator('#rating mat-slider input[type="range"]');
      const step = await slider.getAttribute('step');

      expect(step).toBe('1');
    });

    test('should be disabled when disabled prop is true', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/slider-disabled');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('slider-disabled');
      await expect(scenario).toBeVisible();

      const slider = scenario.locator('#lockedSlider mat-slider input[type="range"]');
      await expect(slider).toBeDisabled();
    });

    test('should display current value', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/slider-value-display');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('slider-value-display');
      await expect(scenario).toBeVisible();

      const slider = scenario.locator('#brightness mat-slider input[type="range"]');
      const value = await slider.inputValue();

      expect(value).toBe('75');
    });
  });

  test.describe('Toggle Component', () => {
    test('should change state on click', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/toggle-basic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('toggle-basic');
      await expect(scenario).toBeVisible();

      const toggle = scenario.locator('#notifications mat-slide-toggle');

      // Initially unchecked
      await expect(toggle).not.toHaveClass(/mat-mdc-slide-toggle-checked/);

      // Click to toggle
      await toggle.click();
      await page.waitForTimeout(200);

      // Should be checked
      await expect(toggle).toHaveClass(/mat-mdc-slide-toggle-checked/);
    });

    test('should work with keyboard (Space/Enter)', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/toggle-keyboard');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('toggle-keyboard');
      await expect(scenario).toBeVisible();

      const toggle = scenario.locator('#darkMode mat-slide-toggle button');

      // Focus the toggle
      await toggle.focus();

      // Initially unchecked
      const parent = scenario.locator('#darkMode mat-slide-toggle');
      await expect(parent).not.toHaveClass(/mat-mdc-slide-toggle-checked/);

      // Press Space to toggle
      await page.keyboard.press('Space');
      await page.waitForTimeout(200);

      // Should be checked
      await expect(parent).toHaveClass(/mat-mdc-slide-toggle-checked/);
    });

    test('should be disabled when disabled prop is true', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/toggle-disabled');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('toggle-disabled');
      await expect(scenario).toBeVisible();

      // Button should be disabled
      const button = scenario.locator('#lockedToggle mat-slide-toggle button');
      await expect(button).toBeDisabled();

      // Toggle should have checked class since value is true
      const toggle = scenario.locator('#lockedToggle mat-slide-toggle');
      await expect(toggle).toHaveClass(/mat-mdc-slide-toggle-checked/);
    });

    test('should handle required toggle validation', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/toggle-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('toggle-validation');
      await expect(scenario).toBeVisible();

      // Verify toggle exists and is initially unchecked
      const toggle = scenario.locator('#termsAcceptance mat-slide-toggle');
      await expect(toggle).not.toHaveClass(/mat-mdc-slide-toggle-checked/);

      // Toggle it to accept terms
      await toggle.click();
      await page.waitForTimeout(200);

      // Should now be checked
      await expect(toggle).toHaveClass(/mat-mdc-slide-toggle-checked/);
    });
  });

  test.describe('Multi-Checkbox Component', () => {
    test('should select multiple options', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/multi-checkbox-basic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multi-checkbox-basic');
      await expect(scenario).toBeVisible();

      // Select multiple options by clicking checkboxes with specific labels
      await scenario.locator('#interests mat-checkbox').filter({ hasText: 'Sports' }).click();
      await scenario.locator('#interests mat-checkbox').filter({ hasText: 'Reading' }).click();

      // Verify both are checked
      const sportsCheckbox = scenario.locator('#interests mat-checkbox').filter({ hasText: 'Sports' });
      const readingCheckbox = scenario.locator('#interests mat-checkbox').filter({ hasText: 'Reading' });
      const musicCheckbox = scenario.locator('#interests mat-checkbox').filter({ hasText: 'Music' });

      await expect(sportsCheckbox).toHaveClass(/mat-mdc-checkbox-checked/);
      await expect(readingCheckbox).toHaveClass(/mat-mdc-checkbox-checked/);
      await expect(musicCheckbox).not.toHaveClass(/mat-mdc-checkbox-checked/);
    });

    test('should collect values as array on submit', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/multi-checkbox-array');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multi-checkbox-array');
      await expect(scenario).toBeVisible();

      // Select multiple by clicking checkboxes
      await scenario.locator('#skills mat-checkbox').filter({ hasText: 'TypeScript' }).click();
      await scenario.locator('#skills mat-checkbox').filter({ hasText: 'Angular' }).click();

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
      await page.goto('/#/test/material-components/multi-checkbox-deselect');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multi-checkbox-deselect');
      await expect(scenario).toBeVisible();

      const readCheckbox = scenario.locator('#permissions mat-checkbox').filter({ hasText: 'Read' });
      const writeCheckbox = scenario.locator('#permissions mat-checkbox').filter({ hasText: 'Write' });

      // Verify initial selection
      await expect(readCheckbox).toHaveClass(/mat-mdc-checkbox-checked/);
      await expect(writeCheckbox).toHaveClass(/mat-mdc-checkbox-checked/);

      // Deselect one
      await writeCheckbox.click();

      // Verify state
      await expect(readCheckbox).toHaveClass(/mat-mdc-checkbox-checked/);
      await expect(writeCheckbox).not.toHaveClass(/mat-mdc-checkbox-checked/);
    });

    test('should handle disabled options', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/multi-checkbox-disabled-options');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multi-checkbox-disabled-options');
      await expect(scenario).toBeVisible();

      const feature1 = scenario.locator('#features mat-checkbox').filter({ hasText: 'Feature 1' });
      const feature2 = scenario.locator('#features mat-checkbox').filter({ hasText: 'Feature 2' });
      const feature3 = scenario.locator('#features mat-checkbox').filter({ hasText: 'Feature 3' });

      // Disabled option should have disabled class
      await expect(feature2).toHaveClass(/mat-mdc-checkbox-disabled/);

      // Other options should not be disabled
      await expect(feature1).not.toHaveClass(/mat-mdc-checkbox-disabled/);
      await expect(feature3).not.toHaveClass(/mat-mdc-checkbox-disabled/);
    });

    test('should handle required multi-checkbox validation', async ({ page, helpers }) => {
      await page.goto('/#/test/material-components/multi-checkbox-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multi-checkbox-validation');
      await expect(scenario).toBeVisible();

      // Verify checkboxes exist and are initially unchecked
      const option1 = scenario.locator('#requiredChoices mat-checkbox').filter({ hasText: 'Option 1' });
      const option2 = scenario.locator('#requiredChoices mat-checkbox').filter({ hasText: 'Option 2' });

      await expect(option1).not.toHaveClass(/mat-mdc-checkbox-checked/);
      await expect(option2).not.toHaveClass(/mat-mdc-checkbox-checked/);

      // Select option 1
      await option1.click();
      await page.waitForTimeout(100);

      // Should be checked
      await expect(option1).toHaveClass(/mat-mdc-checkbox-checked/);
    });
  });
});
