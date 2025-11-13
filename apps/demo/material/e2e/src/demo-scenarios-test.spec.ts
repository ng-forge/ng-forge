import { expect, test } from '@playwright/test';

test.describe('Demo Scenarios Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/scenarios');
  });

  test.describe('Cross-Field Validation', () => {
    test('should load cross-field validation scenario', async ({ page }) => {
      // Click on Cross-Field Validation scenario
      await page.getByRole('button', { name: 'Cross-Field Validation' }).click();

      // Wait for the demo page to load
      await page.waitForURL('**/cross-field-validation');

      // Check that all three tabs are visible
      await expect(page.getByText('Password Matching')).toBeVisible();
      await expect(page.getByText('Conditional Fields')).toBeVisible();
      await expect(page.getByText('Dependent Validation')).toBeVisible();
    });

    test('should validate password matching', async ({ page }) => {
      await page.goto('http://localhost:4200/cross-field-validation');

      // Fill in passwords that don't match
      await page.getByLabel('Password').fill('password123');
      await page.getByLabel('Confirm Password').fill('password456');

      // Check for validation error
      await page.getByLabel('Confirm Password').blur();
      await expect(page.getByText('Passwords must match')).toBeVisible();

      // Fix the password
      await page.getByLabel('Confirm Password').fill('password123');
      await expect(page.getByText('Passwords must match')).not.toBeVisible();
    });

    test('should show/hide conditional fields based on age', async ({ page }) => {
      await page.goto('http://localhost:4200/cross-field-validation');

      // Click on Conditional Fields tab
      await page.getByText('Conditional Fields').click();

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
      await page.getByText('Dependent Validation').click();

      // Select a country
      await page.getByLabel('Country').selectOption('US');

      // State should be enabled
      await expect(page.getByLabel('State')).toBeEnabled();

      // Select a state
      await page.getByLabel('State').selectOption('CA');

      // City should be enabled
      await expect(page.getByLabel('City')).toBeEnabled();
    });
  });

  test.describe('User Registration', () => {
    test('should load user registration scenario', async ({ page }) => {
      await page.getByRole('button', { name: 'User Registration' }).click();

      await page.waitForURL('**/user-registration');

      // Check that all three steps are visible
      await expect(page.getByText('Personal Information')).toBeVisible();
      await expect(page.getByText('Account Setup')).toBeVisible();
      await expect(page.getByText('Confirmation')).toBeVisible();
    });

    test('should navigate through registration steps', async ({ page }) => {
      await page.goto('http://localhost:4200/user-registration');

      // Step 1: Personal Information
      await page.getByLabel('First Name').fill('John');
      await page.getByLabel('Last Name').fill('Doe');
      await page.getByLabel('Email').fill('john.doe@example.com');

      // Click Next
      await page.locator('[data-testid="next-button"]').click();

      // Step 2: Account Setup should be active
      await expect(page.getByText('Account Setup').locator('..')).toHaveClass(/mat-mdc-tab-label-active/);

      // Fill account details
      await page.getByLabel('Username').fill('johndoe');
      await page.getByLabel('Password').fill('SecurePass123!');
      await page.getByLabel('Confirm Password').fill('SecurePass123!');

      // Click Next
      await page.locator('[data-testid="next-button"]').click();

      // Step 3: Confirmation should be active
      await expect(page.getByText('Confirmation').locator('..')).toHaveClass(/mat-mdc-tab-label-active/);

      // Accept terms
      await page.getByLabel('I agree to the Terms of Service').check();
      await page.getByLabel('I agree to the Privacy Policy').check();

      // Submit button should be enabled
      await expect(page.locator('[data-testid="submit-button"]')).toBeEnabled();
    });
  });

  test.describe('Profile Management', () => {
    test('should load profile management scenario', async ({ page }) => {
      await page.getByRole('button', { name: 'Profile Management' }).click();

      await page.waitForURL('**/profile-management');

      // Check that all three tabs are visible
      await expect(page.getByText('Profile Edit')).toBeVisible();
      await expect(page.getByText('Settings')).toBeVisible();
      await expect(page.getByText('Preferences')).toBeVisible();
    });

    test('should have form fields in profile edit', async ({ page }) => {
      await page.goto('http://localhost:4200/profile-management');

      // Check that form fields exist (no value anymore)
      await expect(page.getByLabel('First Name')).toBeVisible();
      await expect(page.getByLabel('Last Name')).toBeVisible();
      await expect(page.getByLabel('Email Address')).toBeVisible();

      // Fill in some data
      await page.getByLabel('First Name').fill('Jane');
      await page.getByLabel('Last Name').fill('Smith');
      await page.getByLabel('Email Address').fill('jane.smith@example.com');

      // Submit button should work
      await expect(page.getByRole('button', { name: 'Save Profile' })).toBeEnabled();
    });

    test('should handle settings form', async ({ page }) => {
      await page.goto('http://localhost:4200/profile-management');

      // Click on Settings tab
      await page.getByText('Settings').click();

      // Password fields should be visible
      await expect(page.getByLabel('Current Password')).toBeVisible();
      await expect(page.getByLabel('New Password')).toBeVisible();
      await expect(page.getByLabel('Confirm New Password')).toBeVisible();

      // Radio buttons should work
      await page.getByLabel('Private - Only you can see your profile').check();
      await expect(page.getByLabel('Private - Only you can see your profile')).toBeChecked();
    });

    test('should handle preferences form', async ({ page }) => {
      await page.goto('http://localhost:4200/profile-management');

      // Click on Preferences tab
      await page.getByText('Preferences').click();

      // Check multi-checkbox functionality
      await page.getByLabel('Weekly newsletter').check();
      await page.getByLabel('Product updates').check();

      // Theme radio buttons
      await page.getByLabel('Dark mode').check();
      await expect(page.getByLabel('Dark mode')).toBeChecked();

      // Submit button should work
      await expect(page.getByRole('button', { name: 'Save Preferences' })).toBeEnabled();
    });
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Visit all three scenarios
    await page.goto('http://localhost:4200/cross-field-validation');
    await page.goto('http://localhost:4200/user-registration');
    await page.goto('http://localhost:4200/profile-management');

    // Check for console errors
    expect(consoleErrors).toHaveLength(0);
  });
});
