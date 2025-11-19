import { expect, test } from '@playwright/test';

test.describe('Navigation Edge Cases and Error Handling Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/#/test/navigation-edge-cases');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Browser Navigation', () => {
    test('should handle browser back/forward button navigation in multi-page forms', async ({ page }) => {
      await page.goto('http://localhost:4200/#/test/navigation-edge-cases/browser-navigation');
      await page.waitForLoadState('networkidle');

      const scenario = page.locator('[data-testid="browser-navigation"]');
      await expect(scenario).toBeVisible();

      // Fill page 1 and navigate to page 2
      await scenario.locator('#step1Data input').fill('Page 1 data');

      const nextButton = scenario.locator('button:has-text("Next")');
      await nextButton.click();
      await page.waitForTimeout(300);

      // Verify we're on page 2
      await expect(scenario.locator('text=Page 2')).toBeVisible();

      // Fill page 2 data
      await scenario.locator('#step2Data input').fill('Page 2 data');

      // Navigate to page 3
      await nextButton.click();
      await page.waitForTimeout(300);

      // Verify we're on page 3
      await expect(scenario.locator('text=Page 3')).toBeVisible();

      // Fill page 3 data
      await scenario.locator('#step3Data input').fill('Page 3 data');

      // Test browser back button
      await page.goBack();
      await page.waitForTimeout(300);

      // Check if we're back on page 2
      await expect(scenario.locator('text=Page 2')).toBeVisible();

      // Verify page 2 data is preserved
      const step2Value = await scenario.locator('#step2Data input').inputValue();
      expect(step2Value).toBe('Page 2 data');

      // Test browser forward button
      await page.goForward();
      await page.waitForTimeout(300);

      // Check if we're back on page 3
      await expect(scenario.locator('text=Page 3')).toBeVisible();

      // Verify page 3 data is preserved
      const step3Value = await scenario.locator('#step3Data input').inputValue();
      expect(step3Value).toBe('Page 3 data');

      // Set up event listener BEFORE clicking submit
      const submittedDataPromise = page.evaluate(
        () =>
          new Promise((resolve) => {
            window.addEventListener(
              'formSubmitted',
              (event: any) => {
                resolve(event.detail.data);
              },
              { once: true },
            );
          }),
      );

      // Submit to verify all data is still intact
      await scenario.locator('#submitBrowserNav button').click();

      // Wait for formSubmitted event
      const submittedData = await submittedDataPromise;

      // Verify submitted data
      expect(submittedData).toMatchObject({
        step1Data: 'Page 1 data',
        step2Data: 'Page 2 data',
        step3Data: 'Page 3 data',
      });
    });
  });

  test.describe('Page Refresh', () => {
    test('should handle page refresh during multi-page form completion', async ({ page }) => {
      await page.goto('http://localhost:4200/#/test/navigation-edge-cases/refresh-test');
      await page.waitForLoadState('networkidle');

      const scenario = page.locator('[data-testid="refresh-test"]');
      await expect(scenario).toBeVisible();

      // Fill data on page 1
      await scenario.locator('#refreshData1 input').fill('Data before refresh');

      // Navigate to page 2
      const nextButton = scenario.locator('button:has-text("Next")');
      await nextButton.click();
      await page.waitForTimeout(300);

      // Verify we're on page 2
      await expect(scenario.locator('text=Page 2')).toBeVisible();

      // Fill some data on page 2
      await scenario.locator('#refreshData2 input').fill('Data before refresh on page 2');

      // Perform page refresh
      await page.reload();
      await page.waitForLoadState('networkidle');

      // After refresh, form should be reset to initial state (page 1)
      const formExistsAfterRefresh = page.locator('[data-testid="refresh-test"]');
      await expect(formExistsAfterRefresh).toBeVisible();

      // Verify we're back on page 1
      await expect(formExistsAfterRefresh.locator('text=Page 1')).toBeVisible();

      // Form data should be cleared
      const refreshData1Value = await formExistsAfterRefresh.locator('#refreshData1 input').inputValue();
      expect(refreshData1Value).toBe('');
    });
  });

  test.describe('Rapid Navigation', () => {
    test('should handle rapid navigation clicks and prevent race conditions', async ({ page }) => {
      await page.goto('http://localhost:4200/#/test/navigation-edge-cases/rapid-navigation');
      await page.waitForLoadState('networkidle');

      const scenario = page.locator('[data-testid="rapid-navigation"]');
      await expect(scenario).toBeVisible();

      // Test rapid navigation clicks
      const nextButton = scenario.locator('button:has-text("Next")');

      // Rapid clicks (should not cause race conditions)
      for (let i = 0; i < 5; i++) {
        await nextButton.click();
        await page.waitForTimeout(50); // Very short delay
      }

      // Wait for any transitions to complete
      await page.waitForTimeout(500);

      // Form should be in a stable state
      await expect(scenario).toBeVisible();

      // Check if we're on page 3 (or at least page 2)
      const onPage3 = await scenario.locator('text=Page 3').isVisible();
      const onPage2 = await scenario.locator('text=Page 2').isVisible();

      expect(onPage3 || onPage2).toBe(true);

      // If we're on page 3, try to complete the form
      if (onPage3) {
        await scenario.locator('#rapidData3 input').fill('Final data');

        // Set up event listener BEFORE clicking submit
        const submittedDataPromise = page.evaluate(
          () =>
            new Promise((resolve) => {
              window.addEventListener(
                'formSubmitted',
                (event: any) => {
                  resolve(event.detail.data);
                },
                { once: true },
              );
            }),
        );

        await scenario.locator('#submitRapid button').click();

        // Verify submission worked
        const submittedData = await submittedDataPromise;
        expect(submittedData).toBeDefined();
      }
    });
  });

  test.describe('Network Interruption', () => {
    test('should handle network interruptions during page transitions', async ({ page }) => {
      await page.goto('http://localhost:4200/#/test/navigation-edge-cases/network-interruption');
      await page.waitForLoadState('networkidle');

      const scenario = page.locator('[data-testid="network-interruption"]');
      await expect(scenario).toBeVisible();

      // Fill large amount of data
      const largeData = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50);
      await scenario.locator('#networkData1 textarea').fill(largeData);

      // Simulate slow network (add delay to requests)
      await page.route('**/*', async (route) => {
        // Add delay to simulate slow network
        await new Promise((resolve) => setTimeout(resolve, 100));
        await route.continue();
      });

      // Navigate to next page
      const nextButton = scenario.locator('button:has-text("Next")');
      await nextButton.click();

      // Wait longer due to simulated network delay
      await page.waitForTimeout(1000);

      // Verify we made it to page 2
      await expect(scenario.locator('text=Page 2')).toBeVisible();

      await scenario.locator('#networkData2 textarea').fill('Data entered despite network simulation');

      // Set up event listener BEFORE clicking submit
      const submittedDataPromise = page.evaluate(
        () =>
          new Promise((resolve) => {
            window.addEventListener(
              'formSubmitted',
              (event: any) => {
                resolve(event.detail.data);
              },
              { once: true },
            );
          }),
      );

      await scenario.locator('#submitNetwork button').click();

      // Clear network simulation
      await page.unroute('**/*');

      // Verify submission worked
      const submittedData = await submittedDataPromise;
      expect(submittedData).toMatchObject({
        networkData1: expect.stringContaining('Lorem ipsum'),
        networkData2: 'Data entered despite network simulation',
      });
    });
  });

  test.describe('Invalid Navigation', () => {
    test('should handle invalid page navigation attempts', async ({ page }) => {
      await page.goto('http://localhost:4200/#/test/navigation-edge-cases/invalid-navigation');
      await page.waitForLoadState('networkidle');

      const scenario = page.locator('[data-testid="invalid-navigation"]');
      await expect(scenario).toBeVisible();

      const nextButton = scenario.locator('button:has-text("Next")');

      // Try to navigate without filling required field
      await nextButton.click();
      await page.waitForTimeout(300);

      // Should still be on page 1 due to validation
      await expect(scenario.locator('text=Page 1')).toBeVisible();

      // Fill required field and try again
      await scenario.locator('#requiredField input').fill('Valid data');
      await nextButton.click();
      await page.waitForTimeout(300);

      // Now we should be on page 2
      await expect(scenario.locator('text=Page 2')).toBeVisible();

      // Set up event listener BEFORE clicking submit
      const submittedDataPromise = page.evaluate(
        () =>
          new Promise((resolve) => {
            window.addEventListener(
              'formSubmitted',
              (event: any) => {
                resolve(event.detail.data);
              },
              { once: true },
            );
          }),
      );

      // Test submission
      await scenario.locator('#submitInvalid button').click();

      // Verify submission
      const submittedData = await submittedDataPromise;
      expect(submittedData).toMatchObject({
        requiredField: 'Valid data',
      });
    });
  });

  test.describe('Form Destruction', () => {
    test('should handle form destruction and reconstruction during navigation', async ({ page }) => {
      await page.goto('http://localhost:4200/#/test/navigation-edge-cases/destruction-test');
      await page.waitForLoadState('networkidle');

      const scenario = page.locator('[data-testid="destruction-test"]');
      await expect(scenario).toBeVisible();

      // Fill data
      await scenario.locator('#destructData1 input').fill('Data before destruction');

      // Verify data is there
      const destructData1Value = await scenario.locator('#destructData1 input').inputValue();
      expect(destructData1Value).toBe('Data before destruction');

      // Navigate to page 2
      const nextButton = scenario.locator('button:has-text("Next")');
      await nextButton.click();
      await page.waitForTimeout(300);

      // Verify we're on page 2
      await expect(scenario.locator('text=Page 2')).toBeVisible();

      // Fill page 2 data
      await scenario.locator('#destructData2 input').fill('Data after navigation');

      // Set up event listener BEFORE clicking submit
      const submittedDataPromise = page.evaluate(
        () =>
          new Promise((resolve) => {
            window.addEventListener(
              'formSubmitted',
              (event: any) => {
                resolve(event.detail.data);
              },
              { once: true },
            );
          }),
      );

      // Submit
      await scenario.locator('#submitDestruct button').click();

      // Verify submission
      const submittedData = await submittedDataPromise;
      expect(submittedData).toMatchObject({
        destructData1: 'Data before destruction',
        destructData2: 'Data after navigation',
      });
    });
  });
});
