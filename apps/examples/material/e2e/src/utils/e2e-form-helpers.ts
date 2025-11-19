import { expect, Page } from '@playwright/test';

/**
 * E2E Form Helper Utilities
 * Provides reusable methods for interacting with dynamic forms in e2e tests
 */
export class E2EFormHelpers {
  constructor(private page: Page) {}

  /**
   * Form State Inspection Utilities
   */
  async getFormValue(): Promise<Record<string, unknown>> {
    // Get form data from the form output div (assuming JSON display)
    const outputElement = this.page.locator('.output pre');
    if (await outputElement.isVisible()) {
      const jsonText = await outputElement.textContent();
      return jsonText ? JSON.parse(jsonText) : {};
    }
    return {};
  }

  async isFormValid(): Promise<boolean> {
    // Check if submit button is enabled (assuming it's disabled for invalid forms)
    const submitButton = this.page.locator('[data-testid="submit-button"]');
    return await submitButton.isEnabled();
  }

  async getFieldErrors(fieldTestId: string): Promise<string[]> {
    const fieldContainer = this.page.locator(`[data-testid="${fieldTestId}"]`).locator('..');
    const errorElements = fieldContainer.locator('mat-error, .error-message');
    const errors: string[] = [];

    const count = await errorElements.count();
    for (let i = 0; i < count; i++) {
      const errorText = await errorElements.nth(i).textContent();
      if (errorText) {
        errors.push(errorText.trim());
      }
    }

    return errors;
  }

  /**
   * Field Interaction Utilities
   */
  async fillInput(testId: string, value: string): Promise<void> {
    const input = this.page.locator(`[data-testid="${testId}"]`);
    await input.clear();
    await input.fill(value);
    await input.blur(); // Trigger validation
  }

  async selectOption(testId: string, value: string): Promise<void> {
    const select = this.page.locator(`[data-testid="${testId}"]`);
    await select.click();

    // Wait for options to appear and select the value
    const option = this.page.locator(`mat-option[value="${value}"], [value="${value}"]`);
    await option.click();
  }

  async selectMultipleOptions(testId: string, values: string[]): Promise<void> {
    const select = this.page.locator(`[data-testid="${testId}"]`);
    await select.click();

    for (const value of values) {
      const option = this.page.locator(`mat-option[value="${value}"], [value="${value}"]`);
      await option.click();
    }

    // Click outside to close dropdown
    await this.page.locator('body').click();
  }

  async toggleCheckbox(testId: string, checked = true): Promise<void> {
    const checkbox = this.page.locator(`[data-testid="${testId}"]`);
    const isCurrentlyChecked = await checkbox.isChecked();

    if (isCurrentlyChecked !== checked) {
      await checkbox.click();
    }
  }

  async clickButton(testId: string): Promise<void> {
    const button = this.page.locator(`[data-testid="${testId}"]`);
    await button.click();
  }

  /**
   * Layout and Styling Validation
   */
  async validateCssClass(testId: string, expectedClass: string): Promise<void> {
    const element = this.page.locator(`[data-testid="${testId}"]`).locator('..');
    await expect(element).toHaveClass(new RegExp(expectedClass));
  }

  async validateRowLayout(rowTestIds: string[]): Promise<void> {
    // Verify elements are in the same row (approximately same Y position)
    const positions: number[] = [];

    for (const testId of rowTestIds) {
      const element = this.page.locator(`[data-testid="${testId}"]`);
      const box = await element.boundingBox();
      if (box) {
        positions.push(box.y);
      }
    }

    // Check that all Y positions are within a reasonable threshold (e.g., 50px)
    if (positions.length > 1) {
      const minY = Math.min(...positions);
      const maxY = Math.max(...positions);
      expect(maxY - minY).toBeLessThan(50);
    }
  }

  async validateGroupContainer(groupClass: string, expectedChildCount: number): Promise<void> {
    const groupContainer = this.page.locator(`.${groupClass}`);
    await expect(groupContainer).toBeVisible();

    const children = groupContainer.locator('> *');
    await expect(children).toHaveCount(expectedChildCount);
  }

  /**
   * Responsive Layout Testing
   */
  async testResponsiveLayout(breakpoints: Array<{ width: number; height: number; name: string }>): Promise<void> {
    for (const breakpoint of breakpoints) {
      await this.page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      // Wait for CSS transitions to complete by waiting for network idle and animations
      await this.page.waitForLoadState('domcontentloaded');

      // Take screenshot for visual validation if needed
      await this.page.screenshot({
        path: `screenshots/responsive-${breakpoint.name}.png`,
        fullPage: true,
      });
    }
  }

  /**
   * Text Component Validation
   */
  async validateTextComponent(textClass: string, expectedContent: string): Promise<void> {
    const textElement = this.page.locator(`.${textClass}`);
    await expect(textElement).toBeVisible();
    await expect(textElement).toContainText(expectedContent);
  }
}

/**
 * Pagination Helper for Multi-Page Forms
 */
export class E2EPaginationHelpers {
  constructor(private page: Page) {}

  async getCurrentPageTitle(): Promise<string> {
    const pageTitle = this.page.locator('h1, h2, .page-title');
    return (await pageTitle.textContent()) || '';
  }

  async isNextButtonEnabled(): Promise<boolean> {
    const nextButton = this.page.locator('[data-testid="next-button"]');
    return await nextButton.isEnabled();
  }

  async isPreviousButtonEnabled(): Promise<boolean> {
    const prevButton = this.page.locator('[data-testid="previous-button"]');
    return await prevButton.isEnabled();
  }

  async clickNext(): Promise<void> {
    const nextButton = this.page.locator('[data-testid="next-button"]');
    await nextButton.click();
    // Wait for page transition by waiting for Angular to stabilize
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for any page title/heading to be stable (no more DOM mutations)
    await this.page.locator('h1, h2, .page-title').first().waitFor({ state: 'visible' });
  }

  async clickPrevious(): Promise<void> {
    const prevButton = this.page.locator('[data-testid="previous-button"]');
    await prevButton.click();
    // Wait for page transition by waiting for Angular to stabilize
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for any page title/heading to be stable (no more DOM mutations)
    await this.page.locator('h1, h2, .page-title').first().waitFor({ state: 'visible' });
  }

  async navigateToPage(pageNumber: number): Promise<void> {
    // Navigate through pages sequentially if direct navigation isn't available
    const currentPage = await this.getCurrentPageNumber();

    if (pageNumber > currentPage) {
      for (let i = currentPage; i < pageNumber; i++) {
        await this.clickNext();
      }
    } else if (pageNumber < currentPage) {
      for (let i = currentPage; i > pageNumber; i--) {
        await this.clickPrevious();
      }
    }
  }

  async getCurrentPageNumber(): Promise<number> {
    // Attempt to determine current page number from URL, page indicator, or title
    const url = this.page.url();
    const pageMatch = url.match(/page=(\d+)/);
    if (pageMatch) {
      return parseInt(pageMatch[1], 10);
    }

    // Fallback: check for page indicators
    const pageIndicator = this.page.locator('.page-indicator, .current-page');
    if (await pageIndicator.isVisible()) {
      const text = await pageIndicator.textContent();
      const match = text?.match(/(\d+)/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    return 1; // Default to first page
  }

  async validatePageTransition(fromPageTitle: string, toPageTitle: string): Promise<void> {
    // Verify we started on the expected page
    await expect(this.page.locator(`h1:has-text("${fromPageTitle}"), h2:has-text("${fromPageTitle}")`)).toBeVisible();

    await this.clickNext();

    // Verify we navigated to the expected page
    await expect(this.page.locator(`h1:has-text("${toPageTitle}"), h2:has-text("${toPageTitle}")`)).toBeVisible();
  }

  async validatePageValidation(requiredFields: string[]): Promise<void> {
    // Attempt to navigate to next page without filling required fields
    const nextButton = this.page.locator('[data-testid="next-button"]');
    await nextButton.click();

    // Wait for validation to trigger - check first error message appears
    if (requiredFields.length > 0) {
      const firstFieldContainer = this.page.locator(`[data-testid="${requiredFields[0]}"]`).locator('..');
      const firstErrorElement = firstFieldContainer.locator('mat-error, .error-message');
      await firstErrorElement.waitFor({ state: 'visible', timeout: 5000 });
    }

    // Check that validation errors are displayed for required fields
    for (const fieldTestId of requiredFields) {
      const fieldContainer = this.page.locator(`[data-testid="${fieldTestId}"]`).locator('..');
      const errorElement = fieldContainer.locator('mat-error, .error-message');
      await expect(errorElement).toBeVisible();
    }
  }
}

/**
 * Cross-Field Validation Helper
 */
export class E2ECrossFieldValidationHelpers {
  constructor(private page: Page) {}

  async validatePasswordMatch(passwordTestId: string, confirmPasswordTestId: string): Promise<void> {
    // Fill different passwords
    await this.page.locator(`[data-testid="${passwordTestId}"]`).fill('password123');
    await this.page.locator(`[data-testid="${confirmPasswordTestId}"]`).fill('different456');
    await this.page.locator(`[data-testid="${confirmPasswordTestId}"]`).blur();

    // Should show mismatch error
    const confirmField = this.page.locator(`[data-testid="${confirmPasswordTestId}"]`).locator('..');
    const errorElement = confirmField.locator('mat-error:has-text("match"), .error-message:has-text("match")');
    await expect(errorElement).toBeVisible();

    // Fill matching passwords
    await this.page.locator(`[data-testid="${confirmPasswordTestId}"]`).fill('password123');
    await this.page.locator(`[data-testid="${confirmPasswordTestId}"]`).blur();

    // Error should disappear
    await expect(errorElement).not.toBeVisible();
  }

  async validateConditionalField(triggerTestId: string, conditionalTestId: string, triggerValue: string): Promise<void> {
    // Initially, conditional field might not be visible or required
    const conditionalField = this.page.locator(`[data-testid="${conditionalTestId}"]`);

    // Set trigger value that should make conditional field required
    const triggerField = this.page.locator(`[data-testid="${triggerTestId}"]`);
    if ((await triggerField.getAttribute('type')) === 'checkbox') {
      await triggerField.check();
    } else {
      await triggerField.fill(triggerValue);
      await triggerField.blur();
    }

    // Conditional field should now be visible and/or required
    await expect(conditionalField).toBeVisible();

    // If it's required, attempting to submit should show validation error
    const submitButton = this.page.locator('[data-testid="submit-button"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();

      const conditionalContainer = conditionalField.locator('..');
      const errorElement = conditionalContainer.locator('mat-error, .error-message');
      await expect(errorElement).toBeVisible();
    }
  }
}

/**
 * Test Scenario Loading Helper
 * Provides utilities for loading test scenarios with proper initialization handling
 */
export class E2EScenarioLoader {
  constructor(private page: Page) {}

  /**
   * Waits for the window.loadTestScenario function to become available
   * This is crucial for parallel test execution to avoid race conditions
   */
  async waitForScenarioLoader(timeout = 10000): Promise<void> {
    await this.page.waitForFunction(() => typeof (window as any).loadTestScenario === 'function', { timeout });
  }

  /**
   * Loads a test scenario configuration safely
   * Automatically waits for the loader to be available before proceeding
   */
  async loadScenario(
    config: any,
    options?: {
      testId?: string;
      title?: string;
      description?: string;
      initialValue?: Record<string, unknown>;
    },
  ): Promise<void> {
    // Wait for the loadTestScenario function to be available
    await this.waitForScenarioLoader();

    // Load the scenario
    await this.page.evaluate(
      ({ config, options }) => {
        (window as any).loadTestScenario(config, options);
      },
      { config, options },
    );

    // Wait for Angular to stabilize after loading the scenario
    await this.page.waitForLoadState('domcontentloaded');

    // Wait for the dynamic form to be visible
    await this.page.locator('dynamic-form, e2e-test-host').first().waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Clears the current test scenario
   */
  async clearScenario(): Promise<void> {
    await this.page.evaluate(() => {
      if (typeof (window as any).clearTestScenario === 'function') {
        (window as any).clearTestScenario();
      }
    });
  }
}

/**
 * Translation Testing Helper
 */
export class E2ETranslationHelpers {
  constructor(private page: Page) {}

  async switchLanguage(languageCode: string): Promise<void> {
    // Look for language selector (could be dropdown or buttons)
    const languageSelector = this.page.locator(`[data-testid="language-selector"], select[name="language"]`);

    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption(languageCode);
    } else {
      // Try language buttons
      const languageButton = this.page.locator(`button:has-text("${languageCode.toUpperCase()}"), [data-testid="lang-${languageCode}"]`);
      if (await languageButton.isVisible()) {
        await languageButton.click();
      }
    }

    // Wait for translations to load by checking DOM is stable
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for any visible text to be present (indicating translation loaded)
    await this.page.locator('body').waitFor({ state: 'visible' });
  }

  async validateTranslatedContent(testId: string, expectedTranslations: Record<string, string>): Promise<void> {
    for (const [lang, expectedText] of Object.entries(expectedTranslations)) {
      await this.switchLanguage(lang);

      const element = this.page.locator(`[data-testid="${testId}"]`);
      await expect(element).toContainText(expectedText);
    }
  }

  async validateFormInLanguage(languageCode: string, expectedLabels: Record<string, string>): Promise<void> {
    await this.switchLanguage(languageCode);

    for (const [fieldTestId, expectedLabel] of Object.entries(expectedLabels)) {
      const fieldContainer = this.page.locator(`[data-testid="${fieldTestId}"]`).locator('..');
      const label = fieldContainer.locator('label, mat-label');
      await expect(label).toContainText(expectedLabel);
    }
  }
}
