import { expect, test } from '@playwright/test';

test.describe('Demo Scenarios Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/scenarios');
  });

  test.describe('Cross-Field Validation', () => {
    test('should load cross-field validation scenario', async ({ page }) => {
      // Click on Cross-Field Validation scenario (it's a link)
      await page.getByRole('link', { name: 'Cross-Field Validation' }).click();

      // Wait for the demo page to load
      await page.waitForURL('**/cross-field-validation');

      // Check that all three scenario buttons are visible
      await expect(page.getByRole('button', { name: 'Password Matching' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Conditional Fields' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Dependent Validation' })).toBeVisible();
    });

    test('should have password matching form', async ({ page }) => {
      await page.goto('http://localhost:4200/cross-field-validation');

      // Password Matching is the default tab
      await expect(page.getByRole('button', { name: 'Password Matching' })).toHaveClass(/active/);

      // Check that form fields are visible - use first() to avoid strict mode
      await expect(page.getByLabel('Email Address')).toBeVisible();
      const passwordFields = page.getByLabel('Password');
      await expect(passwordFields.first()).toBeVisible();
      await expect(page.getByLabel('Confirm Password')).toBeVisible();
    });

    test('should show/hide conditional fields', async ({ page }) => {
      await page.goto('http://localhost:4200/cross-field-validation');

      // Click on Dependent Validation tab (has age/guardian consent)
      await page.getByRole('button', { name: 'Dependent Validation' }).click();

      // Wait for tab to load
      await page.waitForTimeout(300);

      // Enter age under 18
      await page.getByLabel('Age').fill('16');

      // Guardian consent should be visible
      await expect(page.getByLabel('Guardian Consent Required')).toBeVisible();

      // Change age to over 18
      await page.getByLabel('Age').clear();
      await page.getByLabel('Age').fill('25');

      // Guardian consent should be hidden
      await expect(page.getByLabel('Guardian Consent Required')).not.toBeVisible();
    });

    test('should handle cascading dropdowns', async ({ page }) => {
      await page.goto('http://localhost:4200/cross-field-validation');

      // Click on Dependent Validation tab
      await page.getByRole('button', { name: 'Dependent Validation' }).click();

      // Wait for tab to load
      await page.waitForTimeout(300);

      // State should be disabled initially
      await expect(page.getByLabel('State/Province')).toBeDisabled();

      // Select a country (Material select requires clicking the select then clicking the option)
      await page.getByLabel('Country').click();
      await page.getByRole('option', { name: 'United States' }).click();

      // State should be enabled
      await expect(page.getByLabel('State/Province')).toBeEnabled();

      // Select a state
      await page.getByLabel('State/Province').click();
      await page.getByRole('option', { name: 'California' }).click();

      // City should be enabled
      await expect(page.getByLabel('City')).toBeEnabled();
    });
  });

  test.describe('User Registration', () => {
    test('should load user registration scenario', async ({ page }) => {
      // Click on User Registration scenario (it's a link)
      await page.getByRole('link', { name: 'User Registration Flow' }).click();

      await page.waitForURL('**/user-registration');

      // Check the page heading is visible
      await expect(page.getByRole('heading', { name: /User Registration/i })).toBeVisible();

      // Check that all three scenario buttons are visible
      await expect(page.getByRole('button', { name: 'Personal Information' }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: 'Account Setup' }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: 'Review & Confirmation' }).first()).toBeVisible();
    });

    test('should have personal information form', async ({ page }) => {
      await page.goto('http://localhost:4200/user-registration');

      // Personal Information is the default tab
      await expect(page.getByRole('button', { name: 'Personal Information' })).toHaveClass(/active/);

      // Check that form fields are visible
      await expect(page.getByLabel('First Name')).toBeVisible();
      await expect(page.getByLabel('Last Name')).toBeVisible();
      await expect(page.getByLabel('Email Address')).toBeVisible();
    });
  });

  test.describe('Profile Management', () => {
    test('should load profile management scenario', async ({ page }) => {
      // Click on Profile Management scenario (it's a link)
      await page.getByRole('link', { name: 'Profile Management' }).click();

      await page.waitForURL('**/profile-management');

      // Check the page heading is visible
      await expect(page.getByRole('heading', { name: /Profile Management/i })).toBeVisible();

      // Check that all three scenario buttons are visible
      await expect(page.getByRole('button', { name: 'Profile Editing' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Account Settings' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Preferences' })).toBeVisible();
    });

    test('should have profile edit form', async ({ page }) => {
      await page.goto('http://localhost:4200/profile-management');

      // Profile Editing is the default tab
      await expect(page.getByRole('button', { name: 'Profile Editing' })).toHaveClass(/active/);

      // Check that the dynamic form is loaded
      await expect(page.locator('dynamic-form')).toBeVisible({ timeout: 10000 });
    });

    test('should have settings form with password fields', async ({ page }) => {
      await page.goto('http://localhost:4200/profile-management');

      // Click on Account Settings tab
      await page.getByRole('button', { name: 'Account Settings' }).click();

      // Wait for tab to load
      await page.waitForTimeout(300);

      // Check that password fields are visible
      await expect(page.getByLabel('Current Password')).toBeVisible();
      await expect(page.getByLabel('New Password').first()).toBeVisible();
      await expect(page.getByLabel('Confirm New Password')).toBeVisible();
    });
  });

  test('should not have console errors', async ({ page, browserName }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Visit all three scenarios and wait for them to load
    await page.goto('http://localhost:4200/cross-field-validation', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500); // Allow Angular to stabilize

    await page.goto('http://localhost:4200/user-registration', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    await page.goto('http://localhost:4200/profile-management', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Check for console errors
    // Note: Webkit has module import issues that are browser-specific, so we filter those out
    const relevantErrors = consoleErrors.filter((error) => !error.includes('Importing a module script failed'));
    expect(relevantErrors).toHaveLength(0);
  });
});
