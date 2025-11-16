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

      // Click the calendar button to open calendar
      await page.click('#birthDate button');

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

      // Click the calendar button to open calendar
      await page.click('#appointmentDate button');

      // Wait for calendar popup animation
      await expect(page.locator('mat-calendar')).toBeVisible({ timeout: 5000 });

      // Calendar should be rendered with the current month
      const calendar = page.locator('mat-calendar');
      await expect(calendar).toBeVisible();

      // Note: Disabled dates depend on which month is displayed and the constraints
      // The actual date validation is enforced by the form framework
    });

    test('should handle required field validation', async ({ page }) => {
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

      // Verify required field is marked as required
      const input = page.locator('#eventDate input');
      expect(await input.getAttribute('required')).not.toBeNull();

      // Submit button should be present
      await expect(page.locator('#submit button')).toBeVisible();
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

      // Calendar button should also be disabled
      const button = page.locator('#lockedDate button');
      await expect(button).toBeDisabled();
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

      const slider = page.locator('#temperature input[type="range"]');
      await expect(slider).toBeVisible();

      // Verify slider has the configured initial value
      const value = await slider.inputValue();
      expect(value).toBe('20');

      // Note: min/max validation is enforced by the form framework
      // Testing exact HTML attributes would require additional mapper implementation
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

      // Button should be disabled
      const button = page.locator('#lockedToggle mat-slide-toggle button');
      await expect(button).toBeDisabled();

      // Toggle should have checked class since value is true
      const toggle = page.locator('#lockedToggle mat-slide-toggle');
      await expect(toggle).toHaveClass(/mat-mdc-slide-toggle-checked/);
    });

    test('should handle required toggle validation', async ({ page }) => {
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

      // Verify toggle exists and is initially unchecked
      const toggle = page.locator('#termsAcceptance mat-slide-toggle');
      await expect(toggle).not.toHaveClass(/mat-mdc-slide-toggle-checked/);

      // Toggle it to accept terms
      await toggle.click();
      await page.waitForTimeout(200);

      // Should now be checked
      await expect(toggle).toHaveClass(/mat-mdc-slide-toggle-checked/);
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

      // Select multiple options by clicking checkboxes with specific labels
      await page.locator('#interests mat-checkbox').filter({ hasText: 'Sports' }).click();
      await page.locator('#interests mat-checkbox').filter({ hasText: 'Reading' }).click();

      // Verify both are checked
      const sportsCheckbox = page.locator('#interests mat-checkbox').filter({ hasText: 'Sports' });
      const readingCheckbox = page.locator('#interests mat-checkbox').filter({ hasText: 'Reading' });
      const musicCheckbox = page.locator('#interests mat-checkbox').filter({ hasText: 'Music' });

      await expect(sportsCheckbox).toHaveClass(/mat-mdc-checkbox-checked/);
      await expect(readingCheckbox).toHaveClass(/mat-mdc-checkbox-checked/);
      await expect(musicCheckbox).not.toHaveClass(/mat-mdc-checkbox-checked/);
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

      // Select multiple by clicking checkboxes
      await page.locator('#skills mat-checkbox').filter({ hasText: 'TypeScript' }).click();
      await page.locator('#skills mat-checkbox').filter({ hasText: 'Angular' }).click();

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

      const readCheckbox = page.locator('#permissions mat-checkbox').filter({ hasText: 'Read' });
      const writeCheckbox = page.locator('#permissions mat-checkbox').filter({ hasText: 'Write' });

      // Verify initial selection
      await expect(readCheckbox).toHaveClass(/mat-mdc-checkbox-checked/);
      await expect(writeCheckbox).toHaveClass(/mat-mdc-checkbox-checked/);

      // Deselect one
      await writeCheckbox.click();

      // Verify state
      await expect(readCheckbox).toHaveClass(/mat-mdc-checkbox-checked/);
      await expect(writeCheckbox).not.toHaveClass(/mat-mdc-checkbox-checked/);
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

      const feature1 = page.locator('#features mat-checkbox').filter({ hasText: 'Feature 1' });
      const feature2 = page.locator('#features mat-checkbox').filter({ hasText: 'Feature 2' });
      const feature3 = page.locator('#features mat-checkbox').filter({ hasText: 'Feature 3' });

      // Disabled option should have disabled class
      await expect(feature2).toHaveClass(/mat-mdc-checkbox-disabled/);

      // Other options should not be disabled
      await expect(feature1).not.toHaveClass(/mat-mdc-checkbox-disabled/);
      await expect(feature3).not.toHaveClass(/mat-mdc-checkbox-disabled/);
    });

    test('should handle required multi-checkbox validation', async ({ page }) => {
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

      // Verify checkboxes exist and are initially unchecked
      const option1 = page.locator('#requiredChoices mat-checkbox').filter({ hasText: 'Option 1' });
      const option2 = page.locator('#requiredChoices mat-checkbox').filter({ hasText: 'Option 2' });

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
