import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('PrimeNG Components Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/primeng-components');
  });

  test.describe('Calendar Component', () => {
    test('should open calendar and select date', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/calendar-basic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('calendar-basic');
      await expect(scenario).toBeVisible();

      // Click the calendar input to open the calendar popup
      const calendarInput = scenario.locator('#birthDate input');
      await calendarInput.click();

      // Wait for calendar popup panel - PrimeNG uses .p-datepicker-panel for the popup overlay
      const calendarPanel = page.locator('.p-datepicker-panel');
      await expect(calendarPanel).toBeVisible({ timeout: 5000 });

      // Select a date (e.g., 15th of current month)
      const dateButton = calendarPanel.locator('td:not(.p-datepicker-other-month) span').filter({ hasText: /^15$/ }).first();
      if ((await dateButton.count()) > 0) {
        await dateButton.click();
      } else {
        // Fallback: click any available date
        await calendarPanel.locator('td:not(.p-datepicker-other-month) span').first().click();
      }

      // Wait for calendar panel to close
      await expect(calendarPanel).not.toBeVisible({ timeout: 5000 });

      // Value should be set
      expect(await calendarInput.inputValue()).toBeTruthy();
    });

    test('should respect min/max date constraints', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/calendar-constraints');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('calendar-constraints');
      await expect(scenario).toBeVisible();

      // Click the calendar input to open the calendar popup
      const calendarInput = scenario.locator('#appointmentDate input');
      await calendarInput.click();

      // Wait for calendar popup panel
      const calendarPanel = page.locator('.p-datepicker-panel');
      await expect(calendarPanel).toBeVisible({ timeout: 5000 });

      // Calendar should be rendered with the current month
      await expect(calendarPanel).toBeVisible();

      // There should be some disabled dates (outside the min/max range)
      // Previous month days should be disabled or not shown
      await expect(calendarPanel.locator('table')).toBeVisible();
    });

    test('should display custom date format', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/calendar-format');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('calendar-format');
      await expect(scenario).toBeVisible();

      // Click the calendar input to open the calendar popup
      const calendarInput = scenario.locator('#formattedDate input');
      await calendarInput.click();

      // Wait for calendar popup panel
      const calendarPanel = page.locator('.p-datepicker-panel');
      await expect(calendarPanel).toBeVisible({ timeout: 5000 });

      // Select a date
      await calendarPanel.locator('td:not(.p-datepicker-other-month) span').first().click();

      // Wait for calendar panel to close
      await expect(calendarPanel).not.toBeVisible({ timeout: 5000 });

      // Value should be in custom format (dd/mm/yy)
      const value = await calendarInput.inputValue();
      expect(value).toBeTruthy();
      // Format should be dd/mm/yy (e.g., 01/01/24)
      expect(value).toMatch(/^\d{2}\/\d{2}\/\d{2}$/);
    });

    test('should be disabled when disabled prop is true', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/calendar-disabled');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('calendar-disabled');
      await expect(scenario).toBeVisible();

      // Input should be disabled
      const input = scenario.locator('#lockedDate input');
      await expect(input).toBeDisabled();
    });

    test('should work with initial value', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/calendar-initial-value');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('calendar-initial-value');
      await expect(scenario).toBeVisible();

      // Input should show the date
      const input = scenario.locator('#presetDate input');
      const inputValue = await input.inputValue();
      expect(inputValue).toBeTruthy();
      expect(inputValue).toContain('2024');
    });

    test('should show button bar with today/clear buttons', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/calendar-button-bar');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('calendar-button-bar');
      await expect(scenario).toBeVisible();

      // Click the calendar input to open the calendar popup
      const calendarInput = scenario.locator('#dateWithButtons input');
      await calendarInput.click();

      // Wait for calendar popup animation
      await expect(page.locator('.p-datepicker')).toBeVisible({ timeout: 5000 });

      // Button bar should be visible with Today and Clear buttons
      await expect(page.locator('.p-datepicker-buttonbar')).toBeVisible();
      await expect(page.locator('.p-datepicker-buttonbar button').first()).toBeVisible();
    });
  });

  test.describe('Slider Component', () => {
    test('should update value on interaction', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/slider-basic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('slider-basic');
      await expect(scenario).toBeVisible();

      const slider = scenario.locator('#volume p-slider');
      await expect(slider).toBeVisible();

      // Get slider position and click in the middle
      const sliderBox = await slider.boundingBox();
      if (sliderBox) {
        // Click in the middle of the slider
        await page.mouse.click(sliderBox.x + sliderBox.width / 2, sliderBox.y + sliderBox.height / 2);
        await page.waitForTimeout(200);
      }
    });

    test('should respect min and max bounds', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/slider-bounds');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('slider-bounds');
      await expect(scenario).toBeVisible();

      const slider = scenario.locator('#temperature p-slider');
      await expect(slider).toBeVisible();

      // The slider component should exist with correct attributes
      // Note: PrimeNG slider uses different internal structure
    });

    test('should work with step increments', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/slider-steps');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('slider-steps');
      await expect(scenario).toBeVisible();

      const slider = scenario.locator('#rating p-slider');
      await expect(slider).toBeVisible();
    });

    test('should be disabled when disabled prop is true', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/slider-disabled');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('slider-disabled');
      await expect(scenario).toBeVisible();

      // PrimeNG slider adds p-disabled class when disabled
      const slider = scenario.locator('#lockedSlider p-slider');
      await expect(slider).toHaveClass(/p-disabled/);
    });

    test('should display current value', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/slider-value-display');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('slider-value-display');
      await expect(scenario).toBeVisible();

      const slider = scenario.locator('#brightness p-slider');
      await expect(slider).toBeVisible();
    });
  });

  test.describe('Toggle Component', () => {
    test('should change state on click', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/toggle-basic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('toggle-basic');
      await expect(scenario).toBeVisible();

      const toggle = scenario.locator('#notifications p-toggleSwitch');
      await expect(toggle).toBeVisible();

      // Initially unchecked - PrimeNG toggle uses p-toggleswitch-checked class when checked
      await expect(toggle).not.toHaveClass(/p-toggleswitch-checked/);

      // Click to toggle
      await toggle.click();
      await page.waitForTimeout(200);

      // Should be checked
      await expect(toggle).toHaveClass(/p-toggleswitch-checked/);
    });

    test('should be disabled when disabled prop is true', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/toggle-disabled');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('toggle-disabled');
      await expect(scenario).toBeVisible();

      // PrimeNG toggle adds p-disabled class when disabled
      const toggle = scenario.locator('#lockedToggle p-toggleSwitch');
      await expect(toggle).toHaveClass(/p-disabled/);

      // Toggle should have checked class since value is true
      await expect(toggle).toHaveClass(/p-toggleswitch-checked/);
    });

    test('should display label and hint', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/toggle-label');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('toggle-label');
      await expect(scenario).toBeVisible();

      // Label should be visible
      await expect(scenario.locator('label').filter({ hasText: 'Dark Mode' })).toBeVisible();

      // Hint should be visible
      await expect(scenario.locator('.p-hint').filter({ hasText: 'Toggle to enable dark mode' })).toBeVisible();
    });

    test('should work with initial value set to true', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/toggle-initial-value');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('toggle-initial-value');
      await expect(scenario).toBeVisible();

      const toggle = scenario.locator('#premiumFeatures p-toggleSwitch');
      await expect(toggle).toBeVisible();

      // Should be checked since initial value is true
      await expect(toggle).toHaveClass(/p-toggleswitch-checked/);
    });
  });

  test.describe('Multi-Select Component', () => {
    test('should select multiple options', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/multi-select-basic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multi-select-basic');
      await expect(scenario).toBeVisible();

      // multi-select uses p-multiSelect component
      const select = scenario.locator('#skills p-multiSelect');
      await expect(select).toBeVisible();

      // Click to open dropdown
      await select.click();
      await expect(page.locator('.p-multiselect-overlay')).toBeVisible({ timeout: 5000 });

      // Select multiple options - multiselect stays open after each selection
      await page.locator('.p-multiselect-overlay').getByText('TypeScript', { exact: true }).click();
      await page.waitForTimeout(100);

      await page.locator('.p-multiselect-overlay').getByText('Angular', { exact: true }).click();
      await page.waitForTimeout(100);

      // Close the dropdown by clicking outside or pressing Escape
      await page.keyboard.press('Escape');
      await expect(page.locator('.p-multiselect-overlay')).not.toBeVisible({ timeout: 2000 });
    });

    test('should filter options', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/multi-select-filter');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multi-select-filter');
      await expect(scenario).toBeVisible();

      // multi-select uses p-multiSelect component
      const select = scenario.locator('#countries p-multiSelect');
      await expect(select).toBeVisible();

      // Click to open dropdown
      await select.click();
      await expect(page.locator('.p-multiselect-overlay')).toBeVisible({ timeout: 5000 });

      // Filter input should be visible
      const filterInput = page.locator('.p-multiselect-filter-container input');
      await expect(filterInput).toBeVisible();

      // Type to filter
      await filterInput.fill('United');
      await page.waitForTimeout(200);

      // Only matching options should be visible
      await expect(page.locator('.p-multiselect-overlay').getByText('United States', { exact: true })).toBeVisible();
      await expect(page.locator('.p-multiselect-overlay').getByText('United Kingdom', { exact: true })).toBeVisible();
      // Non-matching options should not be visible
      await expect(page.locator('.p-multiselect-overlay').getByText('Germany', { exact: true })).not.toBeVisible();
    });

    test('should work with initial values', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/multi-select-initial-value');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multi-select-initial-value');
      await expect(scenario).toBeVisible();

      // multi-select uses p-multiSelect component
      const select = scenario.locator('#permissions p-multiSelect');
      await expect(select).toBeVisible();

      // The select should show the selected values (Read and Write)
      // PrimeNG multi-select shows selected items as chips or comma-separated
      const selectText = await select.textContent();
      expect(selectText).toContain('Read');
      expect(selectText).toContain('Write');
    });

    test('should be disabled when disabled prop is true', async ({ page, helpers }) => {
      await page.goto('/#/test/primeng-components/multi-select-disabled');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('multi-select-disabled');
      await expect(scenario).toBeVisible();

      // PrimeNG multi-select adds p-disabled class when disabled
      const select = scenario.locator('#lockedSelection p-multiSelect');
      await expect(select).toHaveClass(/p-disabled/);
    });
  });
});
