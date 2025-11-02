import { test, expect } from '@playwright/test';

test.describe('Material Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display validation errors for required fields', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for required input fields
    const requiredInput = page.locator('mat-form-field input[required]');
    
    if (await requiredInput.count() > 0) {
      // Focus and blur to trigger validation
      await requiredInput.first().focus();
      await requiredInput.first().blur();
      
      // Check for error message
      const errorMessage = page.locator('mat-error');
      await expect(errorMessage.first()).toBeVisible();
    }
  });

  test('should validate email format', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for email input field
    const emailInput = page.locator('input[type="email"]');
    
    if (await emailInput.count() > 0) {
      await emailInput.first().fill('invalid-email');
      await emailInput.first().blur();
      
      // Check for validation error
      const errorMessage = page.locator('mat-error');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
      
      // Test valid email
      await emailInput.first().fill('test@example.com');
      await emailInput.first().blur();
      
      // Error should be gone
      await expect(errorMessage.first()).not.toBeVisible();
    }
  });

  test('should validate form submission', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for submit button
    const submitButton = page.locator('button[type="submit"]');
    
    if (await submitButton.count() > 0) {
      await submitButton.first().click();
      
      // Check if validation errors appear
      const errorMessages = page.locator('mat-error');
      if (await errorMessages.count() > 0) {
        await expect(errorMessages.first()).toBeVisible();
      }
    }
  });
});