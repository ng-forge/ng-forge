/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from '@playwright/test';
import { E2EScenarioLoader } from './utils/e2e-form-helpers';

test.describe('Material Components Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/e2e-test');
    await page.waitForFunction(() => window.loadTestScenario !== undefined);
  });

  test.describe('Datepicker Component', () => {
    test('should open calendar and select date', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const config = {
        fields: [
          {
            key: 'birthDate',
            type: 'datepicker',
            label: 'Date of Birth',
            required: true,
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'datepicker-basic' });
      await page.waitForLoadState('networkidle');

      // Click input to open calendar
      await page.click('#birthDate input');
      await page.waitForTimeout(200);

      // Verify calendar is visible
      await expect(page.locator('.mat-datepicker-popup, mat-calendar')).toBeVisible();

      // Select a date (e.g., 15th of current month)
      await page.click('button[aria-label*="15"]').catch(() => {
        // Fallback: click any available date
        return page.click('.mat-calendar-body-cell').first();
      });

      // Calendar should close
      await page.waitForTimeout(300);

      // Value should be set
      const input = page.locator('#birthDate input');
      expect(await input.inputValue()).toBeTruthy();
    });

    test('should respect min/max date constraints', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const today = new Date();
      const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const config = {
        fields: [
          {
            key: 'appointmentDate',
            type: 'datepicker',
            label: 'Appointment Date',
            minDate: minDate.toISOString(),
            maxDate: maxDate.toISOString(),
            required: true,
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'datepicker-constraints' });
      await page.waitForLoadState('networkidle');

      // Open calendar
      await page.click('#appointmentDate input');
      await page.waitForTimeout(200);

      // Verify calendar is visible
      await expect(page.locator('.mat-datepicker-popup, mat-calendar')).toBeVisible();

      // Dates outside range should be disabled
      const disabledDates = page.locator('.mat-calendar-body-disabled');
      expect(await disabledDates.count()).toBeGreaterThan(0);
    });

    test('should show required validation error', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const config = {
        fields: [
          {
            key: 'eventDate',
            type: 'datepicker',
            label: 'Event Date',
            required: true,
          },
          {
            key: 'submit',
            type: 'submit',
            label: 'Submit',
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'datepicker-validation' });
      await page.waitForLoadState('networkidle');

      // Try to submit without selecting date
      await page.click('#submit button');
      await page.waitForTimeout(300);

      // Should show required error
      const error = page.locator('#eventDate mat-error');
      await expect(error).toBeVisible();
    });

    test('should clear date value', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const config = {
        fields: [
          {
            key: 'selectedDate',
            type: 'datepicker',
            label: 'Selected Date',
            value: new Date().toISOString(),
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'datepicker-clear' });
      await page.waitForLoadState('networkidle');

      // Verify date is initially set
      const input = page.locator('#selectedDate input');
      expect(await input.inputValue()).toBeTruthy();

      // Clear the value
      await input.clear();
      await input.blur();
      await page.waitForTimeout(200);

      // Value should be empty
      expect(await input.inputValue()).toBe('');
    });

    test('should be disabled when disabled prop is true', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const config = {
        fields: [
          {
            key: 'lockedDate',
            type: 'datepicker',
            label: 'Locked Date',
            value: new Date().toISOString(),
            disabled: true,
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'datepicker-disabled' });
      await page.waitForLoadState('networkidle');

      // Input should be disabled
      const input = page.locator('#lockedDate input');
      await expect(input).toBeDisabled();

      // Should not be able to open calendar
      await input.click().catch(() => {
        // Expected to fail
      });
      await page.waitForTimeout(200);

      // Calendar should not be visible
      await expect(page.locator('.mat-datepicker-popup, mat-calendar')).not.toBeVisible();
    });

    test('should work with initial value', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const initialDate = new Date(2024, 0, 15); // January 15, 2024

      const config = {
        fields: [
          {
            key: 'presetDate',
            type: 'datepicker',
            label: 'Preset Date',
            value: initialDate.toISOString(),
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'datepicker-initial-value' });
      await page.waitForLoadState('networkidle');

      // Input should show the date
      const input = page.locator('#presetDate input');
      const inputValue = await input.inputValue();
      expect(inputValue).toBeTruthy();
      expect(inputValue).toContain('2024');
    });
  });

  test.describe('Slider Component', () => {
    test('should update value on interaction', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const config = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Volume',
            value: 0,
            minValue: 0,
            maxValue: 100,
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'slider-basic' });
      await page.waitForLoadState('networkidle');

      const slider = page.locator('#volume mat-slider input[type="range"]');
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

    test('should respect min and max bounds', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const config = {
        fields: [
          {
            key: 'temperature',
            type: 'slider',
            label: 'Temperature',
            value: 20,
            minValue: 10,
            maxValue: 30,
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'slider-bounds' });
      await page.waitForLoadState('networkidle');

      const slider = page.locator('#temperature mat-slider input[type="range"]');

      // Check min and max attributes
      const min = await slider.getAttribute('min');
      const max = await slider.getAttribute('max');

      expect(min).toBe('10');
      expect(max).toBe('30');
    });

    test('should work with step increments', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const config = {
        fields: [
          {
            key: 'rating',
            type: 'slider',
            label: 'Rating',
            value: 0,
            minValue: 0,
            maxValue: 10,
            step: 1,
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'slider-steps' });
      await page.waitForLoadState('networkidle');

      const slider = page.locator('#rating mat-slider input[type="range"]');
      const step = await slider.getAttribute('step');

      expect(step).toBe('1');
    });

    test('should be disabled when disabled prop is true', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const config = {
        fields: [
          {
            key: 'lockedSlider',
            type: 'slider',
            label: 'Locked Slider',
            value: 50,
            minValue: 0,
            maxValue: 100,
            disabled: true,
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'slider-disabled' });
      await page.waitForLoadState('networkidle');

      const slider = page.locator('#lockedSlider mat-slider input[type="range"]');
      await expect(slider).toBeDisabled();
    });

    test('should display current value', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const config = {
        fields: [
          {
            key: 'brightness',
            type: 'slider',
            label: 'Brightness',
            value: 75,
            minValue: 0,
            maxValue: 100,
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'slider-value-display' });
      await page.waitForLoadState('networkidle');

      const slider = page.locator('#brightness mat-slider input[type="range"]');
      const value = await slider.inputValue();

      expect(value).toBe('75');
    });
  });

  test.describe('Toggle Component', () => {
    test('should change state on click', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const config = {
        fields: [
          {
            key: 'notifications',
            type: 'toggle',
            label: 'Enable Notifications',
            value: false,
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'toggle-basic' });
      await page.waitForLoadState('networkidle');

      const toggle = page.locator('#notifications mat-slide-toggle');

      // Initially unchecked
      await expect(toggle).not.toHaveClass(/mat-mdc-slide-toggle-checked/);

      // Click to toggle
      await toggle.click();
      await page.waitForTimeout(200);

      // Should be checked
      await expect(toggle).toHaveClass(/mat-mdc-slide-toggle-checked/);
    });

    test('should work with keyboard (Space/Enter)', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const config = {
        fields: [
          {
            key: 'darkMode',
            type: 'toggle',
            label: 'Dark Mode',
            value: false,
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'toggle-keyboard' });
      await page.waitForLoadState('networkidle');

      const toggle = page.locator('#darkMode mat-slide-toggle button');

      // Focus the toggle
      await toggle.focus();

      // Initially unchecked
      const parent = page.locator('#darkMode mat-slide-toggle');
      await expect(parent).not.toHaveClass(/mat-mdc-slide-toggle-checked/);

      // Press Space to toggle
      await page.keyboard.press('Space');
      await page.waitForTimeout(200);

      // Should be checked
      await expect(parent).toHaveClass(/mat-mdc-slide-toggle-checked/);
    });

    test('should be disabled when disabled prop is true', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const config = {
        fields: [
          {
            key: 'lockedToggle',
            type: 'toggle',
            label: 'Locked Toggle',
            value: true,
            disabled: true,
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'toggle-disabled' });
      await page.waitForLoadState('networkidle');

      const toggle = page.locator('#lockedToggle mat-slide-toggle');

      // Should have disabled class
      await expect(toggle).toHaveClass(/mat-mdc-slide-toggle-disabled/);

      // Button should be disabled
      const button = page.locator('#lockedToggle mat-slide-toggle button');
      await expect(button).toBeDisabled();
    });

    test('should show required validation error', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const config = {
        fields: [
          {
            key: 'termsAcceptance',
            type: 'toggle',
            label: 'I accept the terms',
            required: true,
            value: false,
          },
          {
            key: 'submit',
            type: 'submit',
            label: 'Submit',
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'toggle-validation' });
      await page.waitForLoadState('networkidle');

      // Try to submit without toggling
      await page.click('#submit button');
      await page.waitForTimeout(300);

      // Should show required error
      const error = page.locator('#termsAcceptance mat-error');
      await expect(error).toBeVisible();
    });
  });

  test.describe('Multi-Checkbox Component', () => {
    test('should select multiple options', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const config = {
        fields: [
          {
            key: 'interests',
            type: 'multi-checkbox',
            label: 'Interests',
            options: [
              { value: 'sports', label: 'Sports' },
              { value: 'music', label: 'Music' },
              { value: 'reading', label: 'Reading' },
            ],
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'multi-checkbox-basic' });
      await page.waitForLoadState('networkidle');

      // Select multiple options
      await page.check('#interests input[value="sports"]');
      await page.check('#interests input[value="reading"]');

      // Verify both are checked
      await expect(page.locator('#interests input[value="sports"]')).toBeChecked();
      await expect(page.locator('#interests input[value="reading"]')).toBeChecked();
      await expect(page.locator('#interests input[value="music"]')).not.toBeChecked();
    });

    test('should collect values as array on submit', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const config = {
        fields: [
          {
            key: 'skills',
            type: 'multi-checkbox',
            label: 'Skills',
            options: [
              { value: 'javascript', label: 'JavaScript' },
              { value: 'typescript', label: 'TypeScript' },
              { value: 'angular', label: 'Angular' },
            ],
          },
          {
            key: 'submit',
            type: 'submit',
            label: 'Submit',
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'multi-checkbox-array' });
      await page.waitForLoadState('networkidle');

      // Select multiple
      await page.check('#skills input[value="typescript"]');
      await page.check('#skills input[value="angular"]');

      // Submit
      await page.click('#submit button');
      await page.waitForTimeout(500);

      // Verify form value contains array
      await page.click('.form-state summary');
      const formValue = await page.locator('#form-value-multi-checkbox-array').textContent();

      expect(formValue).toContain('typescript');
      expect(formValue).toContain('angular');
    });

    test('should deselect options', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const config = {
        fields: [
          {
            key: 'permissions',
            type: 'multi-checkbox',
            label: 'Permissions',
            options: [
              { value: 'read', label: 'Read' },
              { value: 'write', label: 'Write' },
              { value: 'delete', label: 'Delete' },
            ],
            value: ['read', 'write'],
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'multi-checkbox-deselect' });
      await page.waitForLoadState('networkidle');

      // Verify initial selection
      await expect(page.locator('#permissions input[value="read"]')).toBeChecked();
      await expect(page.locator('#permissions input[value="write"]')).toBeChecked();

      // Deselect one
      await page.uncheck('#permissions input[value="write"]');

      // Verify state
      await expect(page.locator('#permissions input[value="read"]')).toBeChecked();
      await expect(page.locator('#permissions input[value="write"]')).not.toBeChecked();
    });

    test('should handle disabled options', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const config = {
        fields: [
          {
            key: 'features',
            type: 'multi-checkbox',
            label: 'Features',
            options: [
              { value: 'feature1', label: 'Feature 1' },
              { value: 'feature2', label: 'Feature 2', disabled: true },
              { value: 'feature3', label: 'Feature 3' },
            ],
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'multi-checkbox-disabled-options' });
      await page.waitForLoadState('networkidle');

      // Disabled option should be disabled
      await expect(page.locator('#features input[value="feature2"]')).toBeDisabled();

      // Other options should be enabled
      await expect(page.locator('#features input[value="feature1"]')).toBeEnabled();
      await expect(page.locator('#features input[value="feature3"]')).toBeEnabled();
    });

    test('should show required validation error', async ({ page }) => {
      const loader = new E2EScenarioLoader(page);
      const config = {
        fields: [
          {
            key: 'requiredChoices',
            type: 'multi-checkbox',
            label: 'Required Choices',
            options: [
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
            ],
            required: true,
          },
          {
            key: 'submit',
            type: 'submit',
            label: 'Submit',
          },
        ],
      };

      await loader.loadScenario(config, { testId: 'multi-checkbox-validation' });
      await page.waitForLoadState('networkidle');

      // Try to submit without selecting any
      await page.click('#submit button');
      await page.waitForTimeout(300);

      // Should show required error
      const error = page.locator('#requiredChoices mat-error');
      await expect(error).toBeVisible();
    });
  });
});
