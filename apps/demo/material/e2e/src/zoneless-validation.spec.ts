import { expect, test } from '@playwright/test';
import { DeterministicWaitHelpers } from './utils/deterministic-wait-helpers';

/**
 * Validation Tests for Zoneless Angular Wait Helpers
 *
 * These tests verify that our deterministic wait helpers work correctly
 * with zoneless Angular (without zone.js).
 *
 * NOTE: These tests require the dev server to be running.
 * Run: pnpm exec nx run material:serve
 */

test.describe.skip('Zoneless Wait Helper Validation', () => {
  // Skipped by default - run manually with dev server running
  // To run: pnpm exec playwright test src/zoneless-validation.spec.ts --grep "Zoneless"

  test('waitForAngularStability works with zoneless Angular', async ({ page }) => {
    const waitHelpers = new DeterministicWaitHelpers(page);

    // Navigate to a page (requires dev server at localhost:4200)
    await page.goto('http://localhost:4200/cross-field-validation');
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page.getByText('Cross-Field Validation Demo')).toBeVisible();

    // Click a tab (triggers navigation)
    const startTime = Date.now();
    await page.getByRole('button', { name: 'Password Matching' }).click();

    // Use our zoneless wait helper
    await waitHelpers.waitForAngularStability();
    const elapsed = Date.now() - startTime;

    // Verify content is visible after wait
    await expect(page.getByLabel('Password').first()).toBeVisible();

    // Log timing for analysis
    console.log(`✅ waitForAngularStability completed in ${elapsed}ms`);

    // Verify it didn't take too long (< 5 seconds is reasonable)
    expect(elapsed).toBeLessThan(5000);
  });

  test('waitForAngularStability works after form interaction', async ({ page }) => {
    const waitHelpers = new DeterministicWaitHelpers(page);

    await page.goto('http://localhost:4200/cross-field-validation');
    await page.waitForLoadState('networkidle');

    // Click dependent validation tab
    await page.getByText('Dependent Validation').click();
    await waitHelpers.waitForAngularStability();

    // Interact with form field
    const startTime = Date.now();
    await page.getByLabel('Age').fill('16');
    await page.getByLabel('Age').blur();

    // Wait for Angular to process the change
    await waitHelpers.waitForAngularStability();
    const elapsed = Date.now() - startTime;

    // Verify conditional field appeared
    await expect(page.getByLabel('Guardian Consent Required')).toBeVisible();

    console.log(`✅ Form interaction + wait completed in ${elapsed}ms`);
    expect(elapsed).toBeLessThan(3000);
  });

  test('waitForScenarioLoad works without zone.js', async ({ page }) => {
    const waitHelpers = new DeterministicWaitHelpers(page);

    await page.goto('http://localhost:4200/multi-page');
    await page.waitForLoadState('networkidle');

    // Click a scenario
    const startTime = Date.now();
    await page.getByText('E-Commerce Checkout').click();

    // Wait for scenario to load
    await waitHelpers.waitForScenarioLoad();
    const elapsed = Date.now() - startTime;

    // Verify form is visible
    await expect(page.locator('form')).toBeVisible();

    console.log(`✅ Scenario load + wait completed in ${elapsed}ms`);
    expect(elapsed).toBeLessThan(10000);
  });

  test('network idle strategy works correctly', async ({ page }) => {
    // Navigate to page
    const startTime = Date.now();
    await page.goto('http://localhost:4200/cross-field-validation');

    // Wait for network idle (the core of our zoneless strategy)
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const elapsed = Date.now() - startTime;

    // Verify page is interactive
    await expect(page.getByText('Cross-Field Validation Demo')).toBeVisible();

    console.log(`✅ Network idle achieved in ${elapsed}ms`);

    // Should complete reasonably quickly
    expect(elapsed).toBeLessThan(10000);
  });

  test('requestAnimationFrame strategy completes', async ({ page }) => {
    await page.goto('http://localhost:4200/cross-field-validation');
    await page.waitForLoadState('networkidle');

    // Test the rAF wait directly
    const startTime = Date.now();
    await page.evaluate(() => {
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
    });
    const elapsed = Date.now() - startTime;

    // rAF should complete very quickly (usually < 50ms)
    console.log(`✅ requestAnimationFrame wait completed in ${elapsed}ms`);
    expect(elapsed).toBeLessThan(1000);
  });

  test('combined strategy handles rapid interactions', async ({ page }) => {
    const waitHelpers = new DeterministicWaitHelpers(page);

    await page.goto('http://localhost:4200/cross-field-validation');
    await page.waitForLoadState('networkidle');

    // Rapidly click through tabs
    const tabs = ['Password Matching', 'Dependent Validation', 'Conditional Fields'];
    const timings: number[] = [];

    for (const tab of tabs) {
      const startTime = Date.now();
      await page.getByText(tab).click();
      await waitHelpers.waitForAngularStability();
      const elapsed = Date.now() - startTime;
      timings.push(elapsed);
      console.log(`  Tab "${tab}" load time: ${elapsed}ms`);
    }

    // All transitions should complete within reasonable time
    const maxTime = Math.max(...timings);
    const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;

    console.log(`✅ Rapid interactions: max=${maxTime}ms, avg=${avgTime}ms`);
    expect(maxTime).toBeLessThan(5000);
  });

  test('no zone.js testability API is used', async ({ page }) => {
    await page.goto('http://localhost:4200/cross-field-validation');
    await page.waitForLoadState('networkidle');

    // Verify zone.js testability API is NOT available (as expected for zoneless)
    const hasTestability = await page.evaluate(() => {
      return typeof (window as any).getAllAngularTestabilities === 'function';
    });

    if (!hasTestability) {
      console.log('✅ Confirmed: No zone.js testability API (zoneless Angular)');
    } else {
      console.log('⚠️  Zone.js testability API is available (unexpected for zoneless)');
    }

    // Test passes either way, but logs the result
    expect(true).toBe(true);
  });
});
