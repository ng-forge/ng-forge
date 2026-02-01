import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Ionic Components Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/testing/ionic-components');
  });

  test.describe('Datetime Component', () => {
    test('should render datepicker trigger input', async ({ page, helpers }) => {
      await page.goto('/#/testing/ionic-components/datetime-component');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('datetime-component');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Verify the datetime field container is rendered
      await page.waitForSelector('[data-testid="datetime-component"] #eventDate', { state: 'visible', timeout: 10000 });
      const datetimeContainer = scenario.locator('#eventDate');
      await expect(datetimeContainer).toBeVisible();

      // Verify the trigger input is rendered (ion-datetime is in a modal, not inline)
      const triggerInput = scenario.locator('#eventDate ion-input');
      await expect(triggerInput).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Range Component', () => {
    test('should display ion-range slider with initial value', async ({ page, helpers }) => {
      await page.goto('/#/testing/ionic-components/range-component');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('range-component');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Verify the range field is rendered
      await page.waitForSelector('[data-testid="range-component"] #volume ion-range', { state: 'visible', timeout: 10000 });
      const range = scenario.locator('#volume ion-range');
      await expect(range).toBeVisible();

      // Verify initial value is set (50)
      const value = await range.evaluate((el: HTMLIonRangeElement) => el.value);
      expect(value).toBe(50);
    });

    test('should update value programmatically', async ({ page, helpers }) => {
      await page.goto('/#/testing/ionic-components/range-component');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('range-component');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const range = scenario.locator('#volume ion-range');
      await expect(range).toBeVisible({ timeout: 5000 });

      // Verify initial value
      const initialValue = await range.evaluate((el: HTMLIonRangeElement) => el.value);
      expect(initialValue).toBe(50);

      // Set value programmatically and dispatch ionChange event
      await range.evaluate((el: HTMLIonRangeElement) => {
        el.value = 75;
        el.dispatchEvent(new CustomEvent('ionChange', { bubbles: true, detail: { value: 75 } }));
      });
      await page.waitForTimeout(200);

      // Verify value changed
      const newValue = await range.evaluate((el: HTMLIonRangeElement) => el.value);
      expect(newValue).toBe(75);
    });

    test('should respect min and max bounds', async ({ page, helpers }) => {
      await page.goto('/#/testing/ionic-components/range-component');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('range-component');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const range = scenario.locator('#volume ion-range');
      await expect(range).toBeVisible({ timeout: 5000 });

      // Verify min and max attributes
      const min = await range.evaluate((el: HTMLIonRangeElement) => el.min);
      const max = await range.evaluate((el: HTMLIonRangeElement) => el.max);

      expect(min).toBe(0);
      expect(max).toBe(100);
    });

    test('should display pin when configured', async ({ page, helpers }) => {
      await page.goto('/#/testing/ionic-components/range-component');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('range-component');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const range = scenario.locator('#volume ion-range');
      await expect(range).toBeVisible({ timeout: 5000 });

      // Verify pin attribute is set
      const hasPin = await range.evaluate((el: HTMLIonRangeElement) => el.pin);
      expect(hasPin).toBe(true);
    });
  });

  test.describe('Toggle Component', () => {
    test('should display ion-toggle with initial state', async ({ page, helpers }) => {
      await page.goto('/#/testing/ionic-components/toggle-component');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('toggle-component');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Verify the toggle field is rendered
      await page.waitForSelector('[data-testid="toggle-component"] #notifications ion-toggle', {
        state: 'visible',
        timeout: 10000,
      });
      const toggle = scenario.locator('#notifications ion-toggle');
      await expect(toggle).toBeVisible();

      // Verify initial state is unchecked (value: false)
      await expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    test('should change state on click', async ({ page, helpers }) => {
      await page.goto('/#/testing/ionic-components/toggle-component');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('toggle-component');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const toggle = scenario.locator('#notifications ion-toggle');
      await expect(toggle).toBeVisible({ timeout: 5000 });

      // Initially unchecked
      await expect(toggle).toHaveAttribute('aria-checked', 'false');

      // Click to toggle
      await toggle.click();
      await page.waitForTimeout(200);

      // Should be checked
      await expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    test('should toggle back to unchecked on second click', async ({ page, helpers }) => {
      await page.goto('/#/testing/ionic-components/toggle-component');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('toggle-component');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const toggle = scenario.locator('#notifications ion-toggle');
      await expect(toggle).toBeVisible({ timeout: 5000 });

      // Click to check
      await toggle.click();
      await page.waitForTimeout(200);
      await expect(toggle).toHaveAttribute('aria-checked', 'true');

      // Click again to uncheck
      await toggle.click();
      await page.waitForTimeout(200);
      await expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    test('should display label correctly', async ({ page, helpers }) => {
      await page.goto('/#/testing/ionic-components/toggle-component');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('toggle-component');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Verify label is displayed
      const toggleContainer = scenario.locator('#notifications');
      await expect(toggleContainer).toContainText('Enable Notifications');
    });
  });

  test.describe('Checkbox Array Component', () => {
    test('should display multiple ion-checkboxes', async ({ page, helpers }) => {
      await page.goto('/#/testing/ionic-components/checkbox-array-component');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('checkbox-array-component');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Verify the multi-checkbox field is rendered
      await page.waitForSelector('[data-testid="checkbox-array-component"] #interests', { state: 'visible', timeout: 10000 });
      const checkboxContainer = scenario.locator('#interests');
      await expect(checkboxContainer).toBeVisible();

      // Verify all checkboxes are rendered
      const checkboxes = scenario.locator('#interests ion-checkbox');
      const count = await checkboxes.count();
      expect(count).toBe(4); // Sports, Music, Reading, Gaming
    });

    test('should select multiple checkboxes', async ({ page, helpers }) => {
      await page.goto('/#/testing/ionic-components/checkbox-array-component');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('checkbox-array-component');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for checkboxes to be fully rendered
      const checkboxes = scenario.locator('#interests ion-checkbox');
      await expect(checkboxes.first()).toBeVisible({ timeout: 5000 });

      // Select first checkbox (Sports)
      const sportsCheckbox = checkboxes.nth(0);
      await sportsCheckbox.click();
      await page.waitForTimeout(200);

      // Verify first checkbox is checked using the checked property
      const sportsChecked = await sportsCheckbox.evaluate((el: HTMLIonCheckboxElement) => el.checked);
      expect(sportsChecked).toBe(true);

      // Select third checkbox (Reading)
      const readingCheckbox = checkboxes.nth(2);
      await readingCheckbox.click();
      await page.waitForTimeout(200);

      // Verify third checkbox is checked
      const readingChecked = await readingCheckbox.evaluate((el: HTMLIonCheckboxElement) => el.checked);
      expect(readingChecked).toBe(true);

      // Verify second checkbox (Music) is still unchecked
      // Ionic returns undefined for unchecked checkboxes, so we check it's not true
      const musicCheckbox = checkboxes.nth(1);
      const musicChecked = await musicCheckbox.evaluate((el: HTMLIonCheckboxElement) => el.checked);
      expect(musicChecked).not.toBe(true);
    });

    test('should deselect checkbox on second click', async ({ page, helpers }) => {
      await page.goto('/#/testing/ionic-components/checkbox-array-component');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('checkbox-array-component');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for checkboxes to be rendered
      const checkboxes = scenario.locator('#interests ion-checkbox');
      await expect(checkboxes.first()).toBeVisible({ timeout: 5000 });

      // Select first checkbox (Sports)
      const sportsCheckbox = checkboxes.nth(0);
      await sportsCheckbox.click();
      await page.waitForTimeout(200);

      // Verify checkbox is checked
      let sportsChecked = await sportsCheckbox.evaluate((el: HTMLIonCheckboxElement) => el.checked);
      expect(sportsChecked).toBe(true);

      // Deselect first checkbox
      await sportsCheckbox.click();
      await page.waitForTimeout(200);

      // Verify checkbox is unchecked
      // Ionic returns undefined for unchecked checkboxes, so we check it's not true
      sportsChecked = await sportsCheckbox.evaluate((el: HTMLIonCheckboxElement) => el.checked);
      expect(sportsChecked).not.toBe(true);
    });

    test('should collect values as array on submit', async ({ page, helpers }) => {
      await page.goto('/#/testing/ionic-components/checkbox-array-component');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('checkbox-array-component');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for checkboxes to be rendered
      const checkboxes = scenario.locator('#interests ion-checkbox');
      await expect(checkboxes.first()).toBeVisible({ timeout: 5000 });

      // Select first checkbox (Sports) and fourth checkbox (Gaming)
      await checkboxes.nth(0).click();
      await page.waitForTimeout(200);

      await checkboxes.nth(3).click();
      await page.waitForTimeout(200);

      // Set up event listener BEFORE clicking submit
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

      // Submit the form
      const submitButton = scenario.locator('#submit ion-button');
      await expect(submitButton).toBeVisible({ timeout: 5000 });
      await submitButton.click();

      // Wait for formSubmitted event
      const submittedData = (await submittedDataPromise) as Record<string, unknown>;

      // Verify submission contains expected array values
      expect(submittedData['interests']).toEqual(expect.arrayContaining(['sports', 'gaming']));
      expect((submittedData['interests'] as string[]).length).toBe(2);
    });

    test('should display all option labels', async ({ page, helpers }) => {
      await page.goto('/#/testing/ionic-components/checkbox-array-component');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('checkbox-array-component');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const checkboxContainer = scenario.locator('#interests');

      // Verify all labels are displayed
      await expect(checkboxContainer).toContainText('Sports');
      await expect(checkboxContainer).toContainText('Music');
      await expect(checkboxContainer).toContainText('Reading');
      await expect(checkboxContainer).toContainText('Gaming');
    });
  });
});
