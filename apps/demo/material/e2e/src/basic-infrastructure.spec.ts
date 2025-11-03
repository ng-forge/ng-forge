import { expect, test } from '@playwright/test';

test.describe('Basic E2E Infrastructure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e-test');
  });

  test('should load the e2e test page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Simple E2E Test Environment');
    await expect(page.locator('.no-scenario h2')).toContainText('No Scenario Loaded');
  });

  test('should load and interact with basic scenario', async ({ page }) => {
    // Click the button to load basic scenario
    await page.click('.load-basic-btn');

    // Verify form is loaded
    await expect(page.locator('dynamic-form')).toBeVisible();
    await expect(page.locator('[data-testid="basic-test-title"]')).toContainText('Basic Test Scenario');

    // Fill out the form
    await page.fill('[data-testid="firstName"]', 'John');
    await page.fill('[data-testid="lastName"]', 'Doe');
    await page.fill('[data-testid="email"]', 'john.doe@example.com');

    // Submit the form
    await page.click('button[type="submit"]');

    // Verify submission
    await expect(page.locator('[data-testid="submission-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="submission-0"]')).toContainText('john.doe@example.com');
  });

  test('should allow loading custom scenarios via JavaScript', async ({ page }) => {
    // Load a custom scenario via JavaScript
    await page.evaluate(() => {
      const customConfig = {
        fields: [
          {
            key: 'customField',
            type: 'input',
            label: 'Custom Field',
            props: {
              placeholder: 'Enter custom data',
            },
            required: true,
          },
          {
            key: 'submit',
            type: 'button',
            label: 'Submit Custom',
            props: {
              type: 'submit',
            },
          },
        ],
      };

      (window as any).loadTestScenario(customConfig, {
        testId: 'custom-test',
        title: 'Custom Test',
        description: 'Custom test scenario',
      });
    });

    // Verify custom scenario loaded
    await expect(page.locator('[data-testid="custom-test-title"]')).toContainText('Custom Test');
    await expect(page.locator('[data-testid="customField"]')).toBeVisible();

    // Test custom field
    await page.fill('[data-testid="customField"]', 'test data');
    await page.click('button[type="submit"]');

    // Verify submission
    await expect(page.locator('[data-testid="submission-0"]')).toContainText('test data');
  });

  test('should show form state in debug output', async ({ page }) => {
    // Load basic scenario
    await page.click('.load-basic-btn');

    // Fill some data
    await page.fill('[data-testid="firstName"]', 'Debug');
    await page.fill('[data-testid="lastName"]', 'Test');

    // Open debug details
    await page.click('.form-state summary');

    // Verify form value is displayed
    await expect(page.locator('[data-testid="form-value-basic-test"]')).toContainText('Debug');
    await expect(page.locator('[data-testid="form-value-basic-test"]')).toContainText('Test');
  });

  test('should handle form validation', async ({ page }) => {
    // Load basic scenario
    await page.click('.load-basic-btn');

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Should not have submissions yet (form should be invalid)
    const submissionExists = await page.locator('[data-testid="submission-0"]').isVisible();
    expect(submissionExists).toBeFalsy();

    // Fill all required fields
    await page.fill('[data-testid="firstName"]', 'Valid');
    await page.fill('[data-testid="lastName"]', 'User');
    await page.fill('[data-testid="email"]', 'valid@example.com');

    // Now submit should work
    await page.click('button[type="submit"]');

    // Should have submission now
    await expect(page.locator('[data-testid="submission-0"]')).toBeVisible();
  });

  test('should clear scenarios', async ({ page }) => {
    // Load basic scenario
    await page.click('.load-basic-btn');
    await expect(page.locator('dynamic-form')).toBeVisible();

    // Clear scenario via JavaScript
    await page.evaluate(() => {
      (window as any).clearTestScenario();
    });

    // Should be back to no scenario state
    await expect(page.locator('.no-scenario')).toBeVisible();
    await expect(page.locator('dynamic-form')).not.toBeVisible();
  });
});
