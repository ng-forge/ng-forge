import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Row Fields E2E Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/row-fields');
  });

  test.describe('Basic Layout', () => {
    test('should render fields horizontally in a row', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('row-basic-layout');
      await page.goto('/#/test/row-fields/row-basic-layout');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Verify first row fields are visible
      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');

      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      await expect(lastNameInput).toBeVisible({ timeout: 5000 });

      // Screenshot: Initial row layout
      await helpers.expectScreenshotMatch(scenario, 'material-row-basic-layout-empty');

      // Fill in the fields
      await firstNameInput.fill('John');
      await lastNameInput.fill('Doe');

      // Verify second row fields
      const emailInput = scenario.locator('#email input');
      const phoneInput = scenario.locator('#phone input');
      const countrySelect = helpers.getSelect(scenario, 'country');

      await expect(emailInput).toBeVisible({ timeout: 5000 });
      await expect(phoneInput).toBeVisible({ timeout: 5000 });
      await expect(countrySelect).toBeVisible({ timeout: 5000 });

      // Fill second row
      await emailInput.fill('john@example.com');
      await phoneInput.fill('555-1234');
      await helpers.selectOption(countrySelect, 'United States');

      // Verify all values are maintained
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
      await expect(emailInput).toHaveValue('john@example.com', { timeout: 5000 });
      await expect(phoneInput).toHaveValue('555-1234', { timeout: 5000 });

      // Screenshot: Filled row layout
      await helpers.expectScreenshotMatch(scenario, 'material-row-basic-layout-filled');
    });
  });

  test.describe('Conditional Visibility', () => {
    test('should show/hide row based on checkbox', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('row-conditional-visibility');
      await page.goto('/#/test/row-fields/row-conditional-visibility');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const showDetailsCheckbox = helpers.getCheckbox(scenario, 'showDetails');
      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const alwaysVisibleInput = scenario.locator('#alwaysVisible input');

      // Initially the row should be hidden
      await expect(showDetailsCheckbox).toBeVisible({ timeout: 5000 });
      await expect(firstNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(lastNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(alwaysVisibleInput).toBeVisible({ timeout: 5000 });

      // Screenshot: Row hidden
      await helpers.expectScreenshotMatch(scenario, 'material-row-conditional-visibility-hidden');

      // Check the checkbox to show the row
      await showDetailsCheckbox.click();

      // Row should now be visible
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      await expect(lastNameInput).toBeVisible({ timeout: 5000 });

      // Screenshot: Row visible
      await helpers.expectScreenshotMatch(scenario, 'material-row-conditional-visibility-visible');

      // Fill in values
      await firstNameInput.fill('John');
      await lastNameInput.fill('Doe');

      // Uncheck the checkbox to hide the row
      await showDetailsCheckbox.click();

      // Row should be hidden again
      await expect(firstNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(lastNameInput).not.toBeVisible({ timeout: 5000 });

      // Re-check to show the row again
      await showDetailsCheckbox.click();

      // Values should be preserved
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
    });

    test('should handle multiple rows with cascading visibility', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('row-multiple-visibility');
      await page.goto('/#/test/row-fields/row-multiple-visibility');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Get radio buttons
      const personalRadio = scenario.locator('#accountType mat-radio-button:has-text("Personal")');
      const businessRadio = scenario.locator('#accountType mat-radio-button:has-text("Business")');
      const enterpriseRadio = scenario.locator('#accountType mat-radio-button:has-text("Enterprise")');

      // Get row fields
      const firstNameInput = scenario.locator('#firstName input');
      const companyNameInput = scenario.locator('#companyName input');
      const corporateNameInput = scenario.locator('#corporateName input');

      // Initially personal is selected, so personal row should be visible
      await expect(personalRadio).toBeVisible({ timeout: 5000 });
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      await expect(companyNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(corporateNameInput).not.toBeVisible({ timeout: 5000 });

      // Fill personal row
      await firstNameInput.fill('John');

      // Screenshot: Personal row visible
      await helpers.expectScreenshotMatch(scenario, 'material-row-multiple-visibility-personal');

      // Switch to business
      await businessRadio.click();

      // Business row should be visible, others hidden
      await expect(firstNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(companyNameInput).toBeVisible({ timeout: 5000 });
      await expect(corporateNameInput).not.toBeVisible({ timeout: 5000 });

      // Fill business row
      await companyNameInput.fill('Acme Corp');

      // Screenshot: Business row visible
      await helpers.expectScreenshotMatch(scenario, 'material-row-multiple-visibility-business');

      // Switch to enterprise
      await enterpriseRadio.click();

      // Enterprise row should be visible, others hidden
      await expect(firstNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(companyNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(corporateNameInput).toBeVisible({ timeout: 5000 });

      // Fill enterprise row
      await corporateNameInput.fill('MegaCorp International');

      // Screenshot: Enterprise row visible
      await helpers.expectScreenshotMatch(scenario, 'material-row-multiple-visibility-enterprise');

      // Switch back to personal - value should be preserved
      await personalRadio.click();
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });

      // Switch to business - value should be preserved
      await businessRadio.click();
      await expect(companyNameInput).toHaveValue('Acme Corp', { timeout: 5000 });

      // Switch to enterprise - value should be preserved
      await enterpriseRadio.click();
      await expect(corporateNameInput).toHaveValue('MegaCorp International', { timeout: 5000 });
    });
  });

  test.describe('Nested Containers', () => {
    test('should render row containing group containers', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('row-containing-group');
      await page.goto('/#/test/row-fields/row-containing-group');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Get group fields
      const personalFirstName = scenario.locator('#personalInfo input').first();
      const personalLastName = scenario.locator('#personalInfo input').nth(1);
      const contactEmail = scenario.locator('#contactInfo input').first();
      const contactPhone = scenario.locator('#contactInfo input').nth(1);

      // All fields should be visible
      await expect(personalFirstName).toBeVisible({ timeout: 5000 });
      await expect(personalLastName).toBeVisible({ timeout: 5000 });
      await expect(contactEmail).toBeVisible({ timeout: 5000 });
      await expect(contactPhone).toBeVisible({ timeout: 5000 });

      // Screenshot: Empty nested layout
      await helpers.expectScreenshotMatch(scenario, 'material-row-containing-group-empty');

      // Fill all fields
      await personalFirstName.fill('John');
      await personalLastName.fill('Doe');
      await contactEmail.fill('john@example.com');
      await contactPhone.fill('555-1234');

      // Verify values are maintained
      await expect(personalFirstName).toHaveValue('John', { timeout: 5000 });
      await expect(personalLastName).toHaveValue('Doe', { timeout: 5000 });
      await expect(contactEmail).toHaveValue('john@example.com', { timeout: 5000 });
      await expect(contactPhone).toHaveValue('555-1234', { timeout: 5000 });

      // Screenshot: Filled nested layout
      await helpers.expectScreenshotMatch(scenario, 'material-row-containing-group-filled');
    });

    test('should handle individual field visibility within a row', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('row-conditional-fields');
      await page.goto('/#/test/row-fields/row-conditional-fields');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Get checkboxes
      const hasMiddleNameCheckbox = helpers.getCheckbox(scenario, 'hasMiddleName');
      const hasNicknameCheckbox = helpers.getCheckbox(scenario, 'hasNickname');

      // Get name fields
      const firstNameInput = scenario.locator('#firstName input');
      const middleNameInput = scenario.locator('#middleName input');
      const lastNameInput = scenario.locator('#lastName input');

      // Get nickname fields
      const nicknameInput = scenario.locator('#nickname input');
      const preferredNameSelect = helpers.getSelect(scenario, 'preferredName');

      // Initially middle name and nickname fields should be hidden
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      await expect(middleNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(lastNameInput).toBeVisible({ timeout: 5000 });
      await expect(nicknameInput).not.toBeVisible({ timeout: 5000 });
      await expect(preferredNameSelect).not.toBeVisible({ timeout: 5000 });

      // Screenshot: Initial state
      await helpers.expectScreenshotMatch(scenario, 'material-row-conditional-fields-initial');

      // Enable middle name
      await hasMiddleNameCheckbox.click();

      // Middle name should now be visible
      await expect(middleNameInput).toBeVisible({ timeout: 5000 });
      await middleNameInput.fill('William');

      // Screenshot: Middle name visible
      await helpers.expectScreenshotMatch(scenario, 'material-row-conditional-fields-middle-name');

      // Enable nickname
      await hasNicknameCheckbox.click();

      // Nickname fields should now be visible
      await expect(nicknameInput).toBeVisible({ timeout: 5000 });
      await expect(preferredNameSelect).toBeVisible({ timeout: 5000 });
      await nicknameInput.fill('Billy');

      // Screenshot: All fields visible
      await helpers.expectScreenshotMatch(scenario, 'material-row-conditional-fields-all');

      // Disable middle name
      await hasMiddleNameCheckbox.click();

      // Middle name should be hidden, but nickname still visible
      await expect(middleNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(nicknameInput).toBeVisible({ timeout: 5000 });

      // Re-enable middle name - value should be preserved
      await hasMiddleNameCheckbox.click();
      await expect(middleNameInput).toHaveValue('William', { timeout: 5000 });
    });
  });

  test.describe('State Preservation', () => {
    test('should preserve row field values through visibility toggles', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('row-state-preservation');
      await page.goto('/#/test/row-fields/row-state-preservation');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Get checkboxes
      const enableAddressCheckbox = helpers.getCheckbox(scenario, 'enableAddress');
      const enablePhoneCheckbox = helpers.getCheckbox(scenario, 'enablePhone');

      // Get address fields
      const streetInput = scenario.locator('#street input');
      const cityInput = scenario.locator('#city input');
      const zipInput = scenario.locator('#zipCode input');

      // Get phone fields
      const phoneTypeSelect = helpers.getSelect(scenario, 'phoneType');
      const phoneNumberInput = scenario.locator('#phoneNumber input');

      // Initially both rows should be hidden
      await expect(streetInput).not.toBeVisible({ timeout: 5000 });
      await expect(phoneNumberInput).not.toBeVisible({ timeout: 5000 });

      // Screenshot: Both rows hidden
      await helpers.expectScreenshotMatch(scenario, 'material-row-state-preservation-initial');

      // Enable address row and fill it
      await enableAddressCheckbox.click();
      await expect(streetInput).toBeVisible({ timeout: 5000 });
      await streetInput.fill('123 Main St');
      await cityInput.fill('Springfield');
      await zipInput.fill('12345');

      // Enable phone row and fill it
      await enablePhoneCheckbox.click();
      await expect(phoneNumberInput).toBeVisible({ timeout: 5000 });
      await helpers.selectOption(phoneTypeSelect, 'Mobile');
      await phoneNumberInput.fill('555-1234');

      // Screenshot: Both rows visible and filled
      await helpers.expectScreenshotMatch(scenario, 'material-row-state-preservation-filled');

      // Toggle address off and on
      await enableAddressCheckbox.click();
      await expect(streetInput).not.toBeVisible({ timeout: 5000 });
      await enableAddressCheckbox.click();
      await expect(streetInput).toBeVisible({ timeout: 5000 });

      // Values should be preserved
      await expect(streetInput).toHaveValue('123 Main St', { timeout: 5000 });
      await expect(cityInput).toHaveValue('Springfield', { timeout: 5000 });
      await expect(zipInput).toHaveValue('12345', { timeout: 5000 });

      // Toggle phone off and on
      await enablePhoneCheckbox.click();
      await expect(phoneNumberInput).not.toBeVisible({ timeout: 5000 });
      await enablePhoneCheckbox.click();
      await expect(phoneNumberInput).toBeVisible({ timeout: 5000 });

      // Values should be preserved
      await expect(phoneNumberInput).toHaveValue('555-1234', { timeout: 5000 });

      // Rapid toggle test - toggle 5 times quickly
      for (let i = 0; i < 5; i++) {
        await enableAddressCheckbox.click();
        await page.waitForTimeout(100);
      }

      // After odd number of toggles, should be hidden
      await expect(streetInput).not.toBeVisible({ timeout: 5000 });

      // One more toggle to show
      await enableAddressCheckbox.click();

      // Values should still be preserved after rapid toggling
      await expect(streetInput).toHaveValue('123 Main St', { timeout: 5000 });
    });
  });
});
