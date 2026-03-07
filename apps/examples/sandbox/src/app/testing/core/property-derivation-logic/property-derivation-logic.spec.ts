import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { testUrl } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck();

test.describe('Property Derivation Logic Tests', () => {
  test.describe('Expression-Based Property Derivation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/property-derivation-logic/expression-property'));
      await page.waitForLoadState('networkidle');
    });

    test('should show derived label using string concatenation on initial load', async ({ helpers }) => {
      const scenario = helpers.getScenario('expression-property-test');
      await expect(scenario).toBeVisible();

      // Initial department is "Engineering", label should be "Job Title (Engineering)"
      const titleLabel = scenario.locator('#title mat-label');
      await expect(titleLabel).toHaveText('Job Title (Engineering)');
    });

    test('should update derived label when select value changes', async ({ helpers }) => {
      const scenario = helpers.getScenario('expression-property-test');
      await expect(scenario).toBeVisible();

      const departmentSelect = helpers.getSelect(scenario, 'department');
      const titleLabel = scenario.locator('#title mat-label');

      // Change to Marketing — Playwright auto-retries toHaveText until reactivity settles
      await helpers.selectOption(departmentSelect, 'Marketing');
      await expect(titleLabel).toHaveText('Job Title (Marketing)');

      // Change to Design
      await helpers.selectOption(departmentSelect, 'Design');
      await expect(titleLabel).toHaveText('Job Title (Design)');
    });
  });

  test.describe('Conditional Static Value Property Derivation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/property-derivation-logic/conditional-property'));
      await page.waitForLoadState('networkidle');
    });

    test('should show derived label based on initial condition', async ({ helpers }) => {
      const scenario = helpers.getScenario('conditional-property-test');
      await expect(scenario).toBeVisible();

      // Initial accountType is "personal", so label should be "Personal Email"
      const emailLabel = scenario.locator('#email mat-label');
      await expect(emailLabel).toHaveText('Personal Email');
    });

    test('should update derived label when condition changes', async ({ helpers }) => {
      const scenario = helpers.getScenario('conditional-property-test');
      await expect(scenario).toBeVisible();

      const accountTypeSelect = helpers.getSelect(scenario, 'accountType');
      const emailLabel = scenario.locator('#email mat-label');

      // Change to business — Playwright auto-retries toHaveText until reactivity settles
      await helpers.selectOption(accountTypeSelect, 'Business');
      await expect(emailLabel).toHaveText('Work Email');

      // Change back to personal
      await helpers.selectOption(accountTypeSelect, 'Personal');
      await expect(emailLabel).toHaveText('Personal Email');
    });
  });

  test.describe('Custom Function Property Derivation (Dynamic Options)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/property-derivation-logic/function-property'));
      await page.waitForLoadState('networkidle');
    });

    test('should derive select options from custom function when country is selected', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('function-property-test');
      await expect(scenario).toBeVisible();

      const countrySelect = helpers.getSelect(scenario, 'country');
      const citySelect = helpers.getSelect(scenario, 'city');

      // Select USA
      await helpers.selectOption(countrySelect, 'USA');

      // Open city select and verify US city options — toHaveCount auto-retries
      await citySelect.click();

      const options = page.locator('mat-option');
      await expect(options).toHaveCount(3);
      await expect(options.nth(0)).toContainText('New York');
      await expect(options.nth(1)).toContainText('Los Angeles');
      await expect(options.nth(2)).toContainText('Chicago');

      await page.keyboard.press('Escape');
    });

    test('should update derived options when country changes', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('function-property-test');
      await expect(scenario).toBeVisible();

      const countrySelect = helpers.getSelect(scenario, 'country');
      const citySelect = helpers.getSelect(scenario, 'city');

      // First select USA
      await helpers.selectOption(countrySelect, 'USA');

      // Now change to Germany
      await helpers.selectOption(countrySelect, 'Germany');

      // Open city select and verify German city options — toHaveCount auto-retries
      await citySelect.click();

      const options = page.locator('mat-option');
      await expect(options).toHaveCount(2);
      await expect(options.nth(0)).toContainText('Berlin');
      await expect(options.nth(1)).toContainText('Munich');

      await page.keyboard.press('Escape');
    });

    test('should allow selecting a derived option and include it in form value', async ({ helpers }) => {
      const scenario = helpers.getScenario('function-property-test');
      await expect(scenario).toBeVisible();

      const countrySelect = helpers.getSelect(scenario, 'country');
      const citySelect = helpers.getSelect(scenario, 'city');

      // Select USA then pick a city — Playwright auto-waits for options to appear
      await helpers.selectOption(countrySelect, 'USA');
      await helpers.selectOption(citySelect, 'New York');

      // Submit and verify the form value includes the selected city
      const formData = await helpers.submitFormAndCapture(scenario);
      expect(formData['country']).toBe('US');
      expect(formData['city']).toBe('nyc');
    });
  });

  test.describe('Datepicker minDate Property Derivation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/property-derivation-logic/datepicker-mindate'));
      await page.waitForLoadState('networkidle');
    });

    test('should derive minDate from startDate and restrict endDate calendar', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('datepicker-mindate-test');
      await expect(scenario).toBeVisible();

      // startDate is pre-set to the 15th of current month via initialValue
      // Open endDate calendar
      const endDateToggle = scenario.locator('#endDate mat-datepicker-toggle button');
      await endDateToggle.click();

      // Verify some calendar cells are disabled (dates before 15th)
      const disabledCells = page.locator('.mat-calendar-body-cell[aria-disabled="true"]');
      await expect(disabledCells.first()).toBeVisible({ timeout: 5000 });

      // Verify some cells are enabled (dates from 15th onwards)
      const enabledCells = page.locator('.mat-calendar-body-cell:not([aria-disabled="true"])');
      await expect(enabledCells.first()).toBeVisible({ timeout: 5000 });

      await page.keyboard.press('Escape');
    });

    test('should update minDate restriction when startDate changes', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('datepicker-mindate-test');
      await expect(scenario).toBeVisible();

      // Change startDate from 15th to 25th BEFORE opening the calendar
      // The initial startDate (15th) would disable ~14 cells (dates 1-14),
      // so after changing to 25th, there should be ~24 disabled cells (dates 1-24)
      const startDateInput = helpers.getInput(scenario, 'startDate');
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      await helpers.clearAndFill(startDateInput, `${month}/25/${year}`);

      // Open endDate calendar and verify more dates are now disabled
      const endDateToggle = scenario.locator('#endDate mat-datepicker-toggle button');
      await endDateToggle.click();
      await expect(page.locator('.mat-calendar-body-cell').first()).toBeVisible();

      // With startDate=25th, there should be more disabled cells than with startDate=15th
      // The initial config had 15th → ~14 disabled cells; now with 25th → ~24 disabled cells
      await expect
        .poll(async () => {
          return page.locator('.mat-calendar-body-cell[aria-disabled="true"]').count();
        })
        .toBeGreaterThan(14);

      await page.keyboard.press('Escape');
    });
  });

  test.describe('Nested Property Derivation (props.appearance)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/property-derivation-logic/appearance-property'));
      await page.waitForLoadState('networkidle');
    });

    test('should show outline appearance based on initial condition', async ({ helpers }) => {
      const scenario = helpers.getScenario('appearance-property-test');
      await expect(scenario).toBeVisible();

      // Initial style is "modern", so notes should have outline appearance
      const notesFormField = scenario.locator('#notes mat-form-field');
      await expect(notesFormField).toHaveClass(/mat-form-field-appearance-outline/);
    });

    test('should switch to fill appearance when style changes', async ({ helpers }) => {
      const scenario = helpers.getScenario('appearance-property-test');
      await expect(scenario).toBeVisible();

      const styleSelect = helpers.getSelect(scenario, 'style');
      const notesFormField = scenario.locator('#notes mat-form-field');

      // Change to classic — Playwright auto-retries toHaveClass until reactivity settles
      await helpers.selectOption(styleSelect, 'Classic');
      await expect(notesFormField).toHaveClass(/mat-form-field-appearance-fill/);

      // Change back to modern
      await helpers.selectOption(styleSelect, 'Modern');
      await expect(notesFormField).toHaveClass(/mat-form-field-appearance-outline/);
    });
  });

  test.describe('Array Item Scoped Property Derivation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/property-derivation-logic/array-property'));
      await page.waitForLoadState('networkidle');
    });

    test('should derive label within array item based on its own select value', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-property-test');
      await expect(scenario).toBeVisible();

      // First item defaults to contactType='email', so label should be 'Email Address'
      const firstItemLabel = scenario.locator('#contactValue_0 mat-label');
      await expect(firstItemLabel).toHaveText('Email Address', { timeout: 5000 });

      // Change first item to 'phone'
      const firstContactType = scenario.locator('#contactType_0 mat-select');
      await firstContactType.click();
      await page.locator('mat-option:has-text("Phone")').click();

      await expect(firstItemLabel).toHaveText('Phone Number');
    });

    test('should derive labels independently across multiple array items', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-property-test');
      await expect(scenario).toBeVisible();

      // Add a second contact item
      const addButton = scenario.locator('button:has-text("Add Contact")');
      await addButton.click();

      // Both items default to 'email', so both should show 'Email Address'
      const firstItemLabel = scenario.locator('#contactValue_0 mat-label');
      const secondItemLabel = scenario.locator('#contactValue_1 mat-label');
      await expect(firstItemLabel).toHaveText('Email Address', { timeout: 5000 });
      await expect(secondItemLabel).toHaveText('Email Address', { timeout: 5000 });

      // Change second item to 'phone' - only second label should change
      const secondContactType = scenario.locator('#contactType_1 mat-select');
      await secondContactType.click();
      await page.locator('mat-option:has-text("Phone")').click();

      // First item still 'Email Address', second is now 'Phone Number'
      await expect(firstItemLabel).toHaveText('Email Address');
      await expect(secondItemLabel).toHaveText('Phone Number');
    });
  });
});
