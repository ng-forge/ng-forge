import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Ionic Components Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/testing/ionic-components');
  });

  test.describe('Datetime Component', () => {
    test('should render ion-datetime component', async ({ page, helpers }) => {
      await page.goto('/#/testing/ionic-components/datetime-component');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('datetime-component');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Verify the datetime field is rendered
      await page.waitForSelector('[data-testid="datetime-component"] #eventDate', { state: 'visible', timeout: 10000 });
      const datetimeContainer = scenario.locator('#eventDate');
      await expect(datetimeContainer).toBeVisible();

      // Look for ion-datetime component
      const datetime = scenario.locator('#eventDate ion-datetime');
      await expect(datetime).toBeVisible({ timeout: 5000 });
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

    test('should update value on interaction', async ({ page, helpers }) => {
      await page.goto('/#/testing/ionic-components/range-component');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('range-component');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const range = scenario.locator('#volume ion-range');
      await expect(range).toBeVisible({ timeout: 5000 });

      // Get the bounding box and click to change value
      const rangeBox = await range.boundingBox();
      if (rangeBox) {
        // Click near the end of the range to set a higher value
        await page.mouse.click(rangeBox.x + rangeBox.width * 0.8, rangeBox.y + rangeBox.height / 2);
        await page.waitForTimeout(300);

        // Verify value changed
        const newValue = await range.evaluate((el: HTMLIonRangeElement) => el.value);
        expect(newValue).toBeGreaterThan(50);
      }
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

      // Select Sports checkbox
      const sportsCheckbox = scenario.locator('#interests ion-item', { hasText: 'Sports' }).locator('ion-checkbox');
      await sportsCheckbox.click();
      await page.waitForTimeout(100);
      await expect(sportsCheckbox).toHaveAttribute('aria-checked', 'true');

      // Select Reading checkbox
      const readingCheckbox = scenario.locator('#interests ion-item', { hasText: 'Reading' }).locator('ion-checkbox');
      await readingCheckbox.click();
      await page.waitForTimeout(100);
      await expect(readingCheckbox).toHaveAttribute('aria-checked', 'true');

      // Verify Music is still unchecked
      const musicCheckbox = scenario.locator('#interests ion-item', { hasText: 'Music' }).locator('ion-checkbox');
      await expect(musicCheckbox).toHaveAttribute('aria-checked', 'false');
    });

    test('should deselect checkbox on second click', async ({ page, helpers }) => {
      await page.goto('/#/testing/ionic-components/checkbox-array-component');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('checkbox-array-component');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Select Sports checkbox
      const sportsCheckbox = scenario.locator('#interests ion-item', { hasText: 'Sports' }).locator('ion-checkbox');
      await sportsCheckbox.click();
      await page.waitForTimeout(100);
      await expect(sportsCheckbox).toHaveAttribute('aria-checked', 'true');

      // Deselect Sports checkbox
      await sportsCheckbox.click();
      await page.waitForTimeout(100);
      await expect(sportsCheckbox).toHaveAttribute('aria-checked', 'false');
    });

    test('should collect values as array on submit', async ({ page, helpers }) => {
      await page.goto('/#/testing/ionic-components/checkbox-array-component');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('checkbox-array-component');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Select multiple checkboxes
      const sportsCheckbox = scenario.locator('#interests ion-item', { hasText: 'Sports' }).locator('ion-checkbox');
      await sportsCheckbox.click();
      await page.waitForTimeout(100);

      const gamingCheckbox = scenario.locator('#interests ion-item', { hasText: 'Gaming' }).locator('ion-checkbox');
      await gamingCheckbox.click();
      await page.waitForTimeout(100);

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
