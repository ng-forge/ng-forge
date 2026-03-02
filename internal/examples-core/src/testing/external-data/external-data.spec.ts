import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('External Data Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/test/external-data');
    await page.waitForLoadState('networkidle');
  });

  test.describe('User Role Based Visibility', () => {
    test('should hide admin notes when user is guest', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('external-data-test');
      await expect(scenario).toBeVisible();

      // Initially guest role is selected
      const adminNotes = scenario.locator('#adminNotes');
      await expect(adminNotes).toBeHidden();

      // User profile should also be hidden for guest
      const userProfile = scenario.locator('#userProfile');
      await expect(userProfile).toBeHidden();
    });

    test('should show user profile but hide admin notes when user is regular user', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('external-data-test');
      await expect(scenario).toBeVisible();

      // Click on "User" role chip
      await scenario.locator('[data-testid="role-user"]').click();
      await page.waitForTimeout(300);

      // Admin notes should still be hidden
      const adminNotes = scenario.locator('#adminNotes');
      await expect(adminNotes).toBeHidden();

      // User profile should now be visible
      const userProfile = scenario.locator('#userProfile');
      await expect(userProfile).toBeVisible();
    });

    test('should show admin notes when user is admin', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('external-data-test');
      await expect(scenario).toBeVisible();

      // Click on "Admin" role chip
      await scenario.locator('[data-testid="role-admin"]').click();
      await page.waitForTimeout(300);

      // Admin notes should now be visible
      const adminNotes = scenario.locator('#adminNotes');
      await expect(adminNotes).toBeVisible();

      // User profile should also be visible for admin
      const userProfile = scenario.locator('#userProfile');
      await expect(userProfile).toBeVisible();
    });
  });

  test.describe('Feature Flag Based Visibility', () => {
    test('should hide advanced settings when advanced mode is off', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('external-data-test');
      await expect(scenario).toBeVisible();

      // Advanced settings should be hidden by default
      const advancedSettings = scenario.locator('#advancedSettings');
      await expect(advancedSettings).toBeHidden();
    });

    test('should show advanced settings when advanced mode is toggled on', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('external-data-test');
      await expect(scenario).toBeVisible();

      // Toggle advanced mode on
      await scenario.locator('[data-testid="flag-advanced"]').click();
      await page.waitForTimeout(300);

      // Advanced settings should now be visible
      const advancedSettings = scenario.locator('#advancedSettings');
      await expect(advancedSettings).toBeVisible();
    });

    test('should hide beta option when beta features is off', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('external-data-test');
      await expect(scenario).toBeVisible();

      // Beta option should be hidden by default
      const betaOption = scenario.locator('#betaOption');
      await expect(betaOption).toBeHidden();
    });

    test('should show beta option when beta features is toggled on', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('external-data-test');
      await expect(scenario).toBeVisible();

      // Toggle beta features on
      await scenario.locator('[data-testid="flag-beta"]').click();
      await page.waitForTimeout(300);

      // Beta option should now be visible
      const betaOption = scenario.locator('#betaOption');
      await expect(betaOption).toBeVisible();
    });
  });

  test.describe('Combined External Data Conditions', () => {
    test('should show all conditional fields when admin with all flags enabled', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('external-data-test');
      await expect(scenario).toBeVisible();

      // Enable admin role
      await scenario.locator('[data-testid="role-admin"]').click();
      await page.waitForTimeout(200);

      // Enable advanced mode
      await scenario.locator('[data-testid="flag-advanced"]').click();
      await page.waitForTimeout(200);

      // Enable beta features
      await scenario.locator('[data-testid="flag-beta"]').click();
      await page.waitForTimeout(300);

      // All conditional fields should be visible
      const adminNotes = scenario.locator('#adminNotes');
      const userProfile = scenario.locator('#userProfile');
      const advancedSettings = scenario.locator('#advancedSettings');
      const betaOption = scenario.locator('#betaOption');

      await expect(adminNotes).toBeVisible();
      await expect(userProfile).toBeVisible();
      await expect(advancedSettings).toBeVisible();
      await expect(betaOption).toBeVisible();
    });

    test('should reactively update field visibility when toggling external state', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('external-data-test');
      await expect(scenario).toBeVisible();

      const adminNotes = scenario.locator('#adminNotes');

      // Start as guest - admin notes hidden
      await expect(adminNotes).toBeHidden();

      // Switch to admin
      await scenario.locator('[data-testid="role-admin"]').click();
      await page.waitForTimeout(300);
      await expect(adminNotes).toBeVisible();

      // Switch back to guest
      await scenario.locator('[data-testid="role-guest"]').click();
      await page.waitForTimeout(300);
      await expect(adminNotes).toBeHidden();

      // Switch to user
      await scenario.locator('[data-testid="role-user"]').click();
      await page.waitForTimeout(300);
      await expect(adminNotes).toBeHidden();

      // Switch to admin again
      await scenario.locator('[data-testid="role-admin"]').click();
      await page.waitForTimeout(300);
      await expect(adminNotes).toBeVisible();
    });
  });

  test.describe('Current State Display', () => {
    test('should display current external state accurately', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('external-data-test');
      await expect(scenario).toBeVisible();

      const currentState = scenario.locator('[data-testid="current-state"]');

      // Initial state
      await expect(currentState).toContainText('Role: guest');
      await expect(currentState).toContainText('Advanced: false');
      await expect(currentState).toContainText('Beta: false');

      // Change role to admin
      await scenario.locator('[data-testid="role-admin"]').click();
      await page.waitForTimeout(200);
      await expect(currentState).toContainText('Role: admin');

      // Toggle advanced mode
      await scenario.locator('[data-testid="flag-advanced"]').click();
      await page.waitForTimeout(200);
      await expect(currentState).toContainText('Advanced: true');

      // Toggle beta features
      await scenario.locator('[data-testid="flag-beta"]').click();
      await page.waitForTimeout(200);
      await expect(currentState).toContainText('Beta: true');
    });
  });
});
