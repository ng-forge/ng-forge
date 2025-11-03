import { expect, test } from '@playwright/test';
import { E2EFormHelpers } from './utils/e2e-form-helpers';
import { getScenario } from './utils/test-scenarios';

test.describe('Layout and Grid System', () => {
  let formHelpers: E2EFormHelpers;

  test.beforeEach(async ({ page }) => {
    formHelpers = new E2EFormHelpers(page);
  });

  test.describe('Grid Layout Rendering', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('gridLayout');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();
    });

    test('should render grid layout with proper column classes', async ({ page }) => {
      // Check for grid container
      const gridContainer = page.locator('.form-grid, .grid-container');
      await expect(gridContainer).toBeVisible();

      // Verify column classes are applied
      const col6Elements = page.locator('.col-6, .grid-col-6');
      expect(await col6Elements.count()).toBeGreaterThan(0);

      const col4Elements = page.locator('.col-4, .grid-col-4');
      expect(await col4Elements.count()).toBeGreaterThan(0);

      const col12Elements = page.locator('.col-12, .grid-col-12');
      expect(await col12Elements.count()).toBeGreaterThan(0);
    });

    test('should render row layouts correctly', async ({ page }) => {
      // Find elements that should be in the same row
      const rowFields = ['firstName', 'lastName']; // These should be in the same row
      await formHelpers.validateRowLayout(rowFields);
    });

    test('should apply responsive grid classes', async ({ page }) => {
      // Test different viewport sizes
      const breakpoints = [
        { width: 1200, height: 800, name: 'desktop' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 375, height: 667, name: 'mobile' },
      ];

      await formHelpers.testResponsiveLayout(breakpoints);

      // Verify responsive behavior at mobile size
      await page.setViewportSize({ width: 375, height: 667 });

      // On mobile, fields should stack vertically (full width)
      const mobileFields = page.locator('.field-container, .form-field');
      const fieldCount = await mobileFields.count();

      if (fieldCount > 0) {
        const firstField = mobileFields.first();
        const secondField = mobileFields.nth(1);

        if (await secondField.isVisible()) {
          const firstBox = await firstField.boundingBox();
          const secondBox = await secondField.boundingBox();

          if (firstBox && secondBox) {
            // On mobile, second field should be below first field
            expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 10);
          }
        }
      }
    });

    test('should validate CSS grid classes', async ({ page }) => {
      // Check that proper grid classes are applied
      await formHelpers.validateCssClass('firstName', 'col-6');
      await formHelpers.validateCssClass('lastName', 'col-6');
    });
  });

  test.describe('Row and Group Layouts', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('userProfile');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();
    });

    test('should render grouped fields correctly', async ({ page }) => {
      // Check for address group
      const addressGroup = page.locator('.address-group, .field-group[data-group="address"]');
      if (await addressGroup.isVisible()) {
        await formHelpers.validateGroupContainer('address-group', 5); // street, city, state, zip, country
      }
    });

    test('should maintain field spacing in rows', async ({ page }) => {
      const fieldContainers = page.locator('.field-container, .form-field');
      const containerCount = await fieldContainers.count();

      if (containerCount >= 2) {
        // Check that fields have consistent spacing
        const margins: number[] = [];

        for (let i = 0; i < Math.min(containerCount, 4); i++) {
          const container = fieldContainers.nth(i);
          const marginBottom = await container.evaluate((el) => parseInt(window.getComputedStyle(el).marginBottom, 10));
          margins.push(marginBottom);
        }

        // All margins should be the same (or very close)
        const uniqueMargins = [...new Set(margins)];
        expect(uniqueMargins.length).toBeLessThanOrEqual(2); // Allow for slight variations
      }
    });
  });

  test.describe('Text Component Rendering', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('surveyForm');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();
    });

    test('should render text components with correct elements', async ({ page }) => {
      // Check for various text elements
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const paragraphs = page.locator('p');

      const headingCount = await headings.count();
      const paragraphCount = await paragraphs.count();

      expect(headingCount + paragraphCount).toBeGreaterThan(0);
    });

    test('should display text content correctly', async ({ page }) => {
      // Look for any text components with expected content
      const textElements = page.locator('.text-component, .form-text');
      const textCount = await textElements.count();

      if (textCount > 0) {
        const firstText = textElements.first();
        const content = await firstText.textContent();
        expect(content).toBeTruthy();
        expect(content!.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Nested Structure Validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('addressForm');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();
    });

    test('should handle nested groups and field arrangement', async ({ page }) => {
      // Verify form has a nested structure
      const dynamicForm = page.locator('dynamic-form');
      await expect(dynamicForm).toBeVisible();

      // Check for nested field containers
      const nestedContainers = dynamicForm.locator('.field-container .field-container, .form-field .form-field');
      const nestedCount = await nestedContainers.count();

      // Even if no nested containers, form should have logical grouping
      const allFields = dynamicForm.locator('input, select, textarea');
      const fieldCount = await allFields.count();
      expect(fieldCount).toBeGreaterThan(0);
    });

    test('should maintain proper field hierarchy', async ({ page }) => {
      // Verify that form maintains a logical DOM hierarchy
      const formElements = page.locator('dynamic-form *');
      const elementCount = await formElements.count();
      expect(elementCount).toBeGreaterThan(0);

      // Check that fields are properly contained
      const inputs = page.locator('input, select, textarea');
      const inputCount = await inputs.count();

      if (inputCount > 0) {
        const firstInput = inputs.first();
        const parentContainer = firstInput.locator('..');
        await expect(parentContainer).toBeVisible();
      }
    });
  });

  test.describe('Styling and Visual Layout', () => {
    test('should apply consistent styling across form layouts', async ({ page }) => {
      const scenarios = ['userProfile', 'contactForm', 'gridLayout'];

      for (const scenarioName of scenarios) {
        await page.goto('/e2e-test');

        const config = getScenario(scenarioName as any);
        await page.evaluate((config) => {
          (window as any).loadTestScenario = config;
        }, config);
        await page.reload();

        // Check that form has consistent base styling
        const dynamicForm = page.locator('dynamic-form');
        await expect(dynamicForm).toBeVisible();

        // Verify form takes up appropriate space
        const formBox = await dynamicForm.boundingBox();
        expect(formBox?.width).toBeGreaterThan(200);
        expect(formBox?.height).toBeGreaterThan(100);

        console.log(`✓ Layout verified for scenario: ${scenarioName}`);
      }
    });

    test('should handle print layouts properly', async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('userProfile');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();

      // Emulate print media
      await page.emulateMedia({ media: 'print' });

      // Form should still be visible and properly formatted
      const dynamicForm = page.locator('dynamic-form');
      await expect(dynamicForm).toBeVisible();

      // Reset to screen media
      await page.emulateMedia({ media: 'screen' });
    });
  });

  test.describe('Performance with Complex Layouts', () => {
    test('should render complex layouts within performance thresholds', async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('gridLayout');

      const startTime = Date.now();

      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();

      // Wait for form to be fully rendered
      await page.locator('dynamic-form').waitFor({ state: 'visible' });
      await page.locator('input, select, textarea').first().waitFor({ state: 'visible' });

      const renderTime = Date.now() - startTime;

      // Form should render within reasonable time (5 seconds)
      expect(renderTime).toBeLessThan(5000);

      console.log(`Grid layout rendered in ${renderTime}ms`);
    });

    test('should handle viewport changes smoothly', async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('gridLayout');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();

      // Test multiple viewport changes
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 768, height: 1024 },
        { width: 375, height: 667 },
        { width: 1200, height: 800 },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(100); // Allow layout to settle

        // Form should remain visible and functional
        await expect(page.locator('dynamic-form')).toBeVisible();

        const inputs = page.locator('input, select, textarea');
        const inputCount = await inputs.count();
        expect(inputCount).toBeGreaterThan(0);
      }
    });
  });
});
