import { Locator, Page } from '@playwright/test';

/**
 * Deterministic Wait Utilities
 *
 * These helpers replace arbitrary timeouts with deterministic waiting strategies
 * that wait for specific DOM states, network conditions, or element states.
 */

export class DeterministicWaitHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for Angular app to stabilize after an action
   * This waits for:
   * 1. No pending network requests
   * 2. DOM to be fully loaded
   *
   * Note: Works without zone.js by relying on network idle state
   */
  async waitForAngularStability(): Promise<void> {
    // Wait for DOM to be loaded
    await this.page.waitForLoadState('domcontentloaded');

    // Wait for network to be idle (no pending requests)
    // This is the key wait for zoneless Angular apps
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If network doesn't go idle in 10s, that's ok - continue anyway
    });

    // Give a moment for any final DOM updates to complete
    // This replaces zone.js change detection waits
    await this.page.evaluate(() => {
      return new Promise((resolve) => {
        // Use requestAnimationFrame to wait for next paint
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
    });
  }

  /**
   * Wait for form field validation to complete
   * Waits for either an error message to appear or the field to become valid
   */
  async waitForFieldValidation(fieldTestId: string): Promise<void> {
    const fieldContainer = this.page.locator(`[data-testid="${fieldTestId}"]`).locator('..');

    // Wait for either:
    // 1. Error message to appear, OR
    // 2. Field to stabilize (no more mutations) indicating validation passed
    try {
      await Promise.race([
        fieldContainer.locator('mat-error, .error-message').waitFor({ state: 'visible', timeout: 3000 }),
        fieldContainer.waitFor({ state: 'attached', timeout: 3000 }),
      ]);
    } catch {
      // If neither happens in 3s, validation likely completed without errors
    }
  }

  /**
   * Wait for a page transition to complete in a multi-page form
   * Waits for the new page's heading/title to be visible
   */
  async waitForPageTransition(expectedTitlePattern?: string | RegExp): Promise<void> {
    await this.waitForAngularStability();

    if (expectedTitlePattern) {
      const titleLocator =
        typeof expectedTitlePattern === 'string'
          ? this.page.locator(`h1:has-text("${expectedTitlePattern}"), h2:has-text("${expectedTitlePattern}")`)
          : this.page.locator('h1, h2').filter({ hasText: expectedTitlePattern });

      await titleLocator.first().waitFor({ state: 'visible', timeout: 5000 });
    } else {
      // Just wait for any title to be visible
      await this.page.locator('h1, h2').first().waitFor({ state: 'visible', timeout: 5000 });
    }
  }

  /**
   * Wait for a button click action to complete
   * This waits for any loading states to finish and DOM to stabilize
   */
  async waitForButtonActionComplete(buttonLocator: Locator): Promise<void> {
    // Check if button goes into loading state
    const isLoading = await buttonLocator.getAttribute('aria-busy').catch(() => null);

    if (isLoading === 'true') {
      // Wait for loading to complete
      await buttonLocator.waitFor({ state: 'attached', timeout: 10000 });
      await this.page.waitForFunction((btn) => btn.getAttribute('aria-busy') !== 'true', await buttonLocator.elementHandle());
    }

    await this.waitForAngularStability();
  }

  /**
   * Wait for conditional field to appear/disappear based on trigger
   */
  async waitForConditionalFieldChange(fieldTestId: string, shouldBeVisible: boolean): Promise<void> {
    const field = this.page.locator(`[data-testid="${fieldTestId}"]`);
    const state = shouldBeVisible ? 'visible' : 'hidden';
    await field.waitFor({ state, timeout: 5000 }).catch(() => {
      // If timeout, field might already be in expected state
    });
  }

  /**
   * Wait for form submission to complete
   * Waits for either success message, error message, or navigation
   */
  async waitForFormSubmission(): Promise<void> {
    // Wait for one of these outcomes:
    // 1. Success message appears
    // 2. Error message appears
    // 3. Navigation occurs
    // 4. Form becomes disabled (submitting state)

    try {
      await Promise.race([
        this.page.locator('.success-message, [role="alert"]:has-text("success")').waitFor({ state: 'visible', timeout: 5000 }),
        this.page.locator('.error-message, [role="alert"]:has-text("error")').waitFor({ state: 'visible', timeout: 5000 }),
        this.page.waitForURL(/.*/, { timeout: 5000 }),
        this.page.waitForLoadState('networkidle', { timeout: 5000 }),
      ]);
    } catch {
      // If none of these happen, submission might have failed silently or completed
      await this.waitForAngularStability();
    }
  }

  /**
   * Wait for dropdown/select options to be populated
   */
  async waitForSelectOptions(selectTestId: string): Promise<void> {
    const select = this.page.locator(`[data-testid="${selectTestId}"]`);
    await select.waitFor({ state: 'visible' });

    // Click to open dropdown
    await select.click();

    // Wait for options to appear
    await this.page.locator('mat-option, option').first().waitFor({ state: 'visible', timeout: 3000 });
  }

  /**
   * Wait for scenario/test config to load in e2e test page
   * This is specific to the dynamic form test harness
   */
  async waitForScenarioLoad(): Promise<void> {
    // Wait for form to be rendered
    await this.page.locator('dynamic-form, form').first().waitFor({ state: 'visible', timeout: 10000 });

    // Wait for Angular to stabilize
    await this.waitForAngularStability();

    // Give Angular a moment to complete all change detection cycles
    await this.page.waitForFunction(
      () => {
        return document.querySelectorAll('dynamic-form, form').length > 0;
      },
      { timeout: 5000 },
    );
  }

  /**
   * Wait for error messages to appear after invalid form submission
   */
  async waitForValidationErrors(): Promise<void> {
    // Wait for at least one error message to appear
    await this.page
      .locator('mat-error, .error-message, [role="alert"]')
      .first()
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => {
        // No errors appeared - validation might have passed
      });
  }

  /**
   * Wait for Material Angular components to initialize
   * Useful after loading new content with Material components
   */
  async waitForMaterialComponentsReady(): Promise<void> {
    await this.page
      .waitForFunction(
        () => {
          // Check if Material components are initialized by looking for mat-* classes
          const matComponents = document.querySelectorAll('[class*="mat-"]');
          return matComponents.length > 0;
        },
        { timeout: 5000 },
      )
      .catch(() => {
        // If no Material components, that's fine
      });

    await this.waitForAngularStability();
  }
}

/**
 * Standalone helper functions for common waiting patterns
 */

/**
 * Wait for element to become stable (no more DOM mutations)
 */
export async function waitForElementStable(locator: Locator, timeout = 3000): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout });

  // Wait a bit more for any animations/transitions to complete
  const element = await locator.elementHandle();
  if (element) {
    await element.waitForElementState('stable', { timeout: 3000 }).catch(() => {
      // If stable check fails, that's ok
    });
  }
}

/**
 * Wait for Angular to stabilize (zoneless compatible)
 * Uses network idle and animation frames instead of zone.js testability
 */
export async function waitForAngularZone(page: Page): Promise<void> {
  // Wait for network idle first
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
    // Continue if network doesn't go idle
  });

  // Wait for DOM to be stable using requestAnimationFrame
  await page.evaluate(() => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  });
}
