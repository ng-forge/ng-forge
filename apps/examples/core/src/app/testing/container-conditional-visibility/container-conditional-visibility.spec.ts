import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Container Conditional Visibility Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/container-conditional-visibility');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Group - Child Field Visibility
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Group - Child Field Visibility', () => {
    test('should show/hide entire group based on radio selection', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('group-conditional-visibility');
      await page.goto('/#/test/container-conditional-visibility/group-conditional-visibility');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Get radio buttons
      const personalRadio = scenario.locator('#accountType mat-radio-button:has-text("Personal")');
      const businessRadio = scenario.locator('#accountType mat-radio-button:has-text("Business")');

      // Get business group fields
      const companyNameInput = scenario.locator('#companyName input');
      const taxIdInput = scenario.locator('#taxId input');
      const employeeCountSelect = helpers.getSelect(scenario, 'employeeCount');

      // Common field should always be visible
      const emailInput = scenario.locator('#commonField input');
      await expect(emailInput).toBeVisible({ timeout: 5000 });

      // Initially personal is selected, so business group should be hidden
      await expect(personalRadio).toBeVisible({ timeout: 5000 });
      await expect(companyNameInput).not.toBeVisible({ timeout: 5000 });

      // Switch to business
      await businessRadio.click();

      // Business group should now be visible
      await expect(companyNameInput).toBeVisible({ timeout: 5000 });
      await expect(taxIdInput).toBeVisible({ timeout: 5000 });
      await expect(employeeCountSelect).toBeVisible({ timeout: 5000 });

      // Fill business fields
      await companyNameInput.fill('Acme Corp');
      await taxIdInput.fill('12-3456789');
      await helpers.selectOption(employeeCountSelect, '11-50');

      // Switch back to personal
      await personalRadio.click();

      // Business group should be hidden
      await expect(companyNameInput).not.toBeVisible({ timeout: 5000 });

      // Switch to business again - values should be preserved
      await businessRadio.click();
      await expect(companyNameInput).toHaveValue('Acme Corp', { timeout: 5000 });
      await expect(taxIdInput).toHaveValue('12-3456789', { timeout: 5000 });
    });

    test('should handle nested conditional fields inside conditional group', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('group-nested-conditional');
      await page.goto('/#/test/container-conditional-visibility/group-nested-conditional');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Get controls
      const showPersonalCheckbox = helpers.getCheckbox(scenario, 'showPersonal');
      const hasMiddleNameCheckbox = helpers.getCheckbox(scenario, 'hasMiddleName');
      const emailRadio = scenario.locator('#personal mat-radio-button:has-text("Email")');
      const phoneRadio = scenario.locator('#personal mat-radio-button:has-text("Phone")');

      // Get fields
      const firstNameInput = scenario.locator('#personal #firstName input');
      const middleNameInput = scenario.locator('#personal #middleName input');
      const emailInput = scenario.locator('#personal #email input');
      const phoneInput = scenario.locator('#personal #phone input');

      // Initially group is visible (checkbox is checked by default)
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      await expect(middleNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(emailInput).toBeVisible({ timeout: 5000 });
      await expect(phoneInput).not.toBeVisible({ timeout: 5000 });

      // Fill first name
      await firstNameInput.fill('John');

      // Enable middle name
      await hasMiddleNameCheckbox.click();
      await expect(middleNameInput).toBeVisible({ timeout: 5000 });
      await middleNameInput.fill('William');

      // Fill email
      await emailInput.fill('john@example.com');

      // Switch to phone
      await phoneRadio.click();
      await expect(emailInput).not.toBeVisible({ timeout: 5000 });
      await expect(phoneInput).toBeVisible({ timeout: 5000 });
      await phoneInput.fill('555-1234');

      // Hide the entire group
      await showPersonalCheckbox.click();
      await expect(firstNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(middleNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(phoneInput).not.toBeVisible({ timeout: 5000 });

      // Show the group again
      await showPersonalCheckbox.click();

      // All values should be preserved
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await expect(middleNameInput).toHaveValue('William', { timeout: 5000 });
      await expect(phoneInput).toHaveValue('555-1234', { timeout: 5000 });

      // Switch back to email - value should be preserved
      await emailRadio.click();
      await expect(emailInput).toHaveValue('john@example.com', { timeout: 5000 });
    });

    test('should preserve group values through visibility toggle', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('group-state-preservation');
      await page.goto('/#/test/container-conditional-visibility/group-state-preservation');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Get checkboxes
      const includeAddressCheckbox = helpers.getCheckbox(scenario, 'includeAddress');
      const includeBillingCheckbox = helpers.getCheckbox(scenario, 'includeBilling');

      // Get address group fields
      const streetInput = scenario.locator('#street input');
      const cityInput = scenario.locator('#city input');
      const stateSelect = helpers.getSelect(scenario, 'state');

      // Get billing group fields
      const billingStreetInput = scenario.locator('#billingStreet input');

      // Initially both groups should be hidden
      await expect(streetInput).not.toBeVisible({ timeout: 5000 });
      await expect(billingStreetInput).not.toBeVisible({ timeout: 5000 });

      // Enable address group
      await includeAddressCheckbox.click();
      await expect(streetInput).toBeVisible({ timeout: 5000 });

      // Fill address fields
      await streetInput.fill('123 Main St');
      await cityInput.fill('Springfield');
      await helpers.selectOption(stateSelect, 'California');

      // Enable billing group
      await includeBillingCheckbox.click();
      await expect(billingStreetInput).toBeVisible({ timeout: 5000 });
      await billingStreetInput.fill('456 Billing Ave');

      // Toggle address off and on
      await includeAddressCheckbox.click();
      await expect(streetInput).not.toBeVisible({ timeout: 5000 });
      await includeAddressCheckbox.click();
      await expect(streetInput).toBeVisible({ timeout: 5000 });

      // Values should be preserved
      await expect(streetInput).toHaveValue('123 Main St', { timeout: 5000 });
      await expect(cityInput).toHaveValue('Springfield', { timeout: 5000 });

      // Toggle billing off and on
      await includeBillingCheckbox.click();
      await expect(billingStreetInput).not.toBeVisible({ timeout: 5000 });
      await includeBillingCheckbox.click();
      await expect(billingStreetInput).toBeVisible({ timeout: 5000 });

      // Values should be preserved
      await expect(billingStreetInput).toHaveValue('456 Billing Ave', { timeout: 5000 });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Row - Child Field Visibility
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Row - Child Field Visibility', () => {
    test('should show/hide row based on checkbox', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('row-conditional-visibility');
      await page.goto('/#/test/container-conditional-visibility/row-conditional-visibility');
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

      // Check the checkbox to show the row
      await showDetailsCheckbox.click();

      // Row should now be visible
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      await expect(lastNameInput).toBeVisible({ timeout: 5000 });

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
      await page.goto('/#/test/container-conditional-visibility/row-multiple-visibility');
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

      // Switch to business
      await businessRadio.click();

      // Business row should be visible, others hidden
      await expect(firstNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(companyNameInput).toBeVisible({ timeout: 5000 });
      await expect(corporateNameInput).not.toBeVisible({ timeout: 5000 });

      // Fill business row
      await companyNameInput.fill('Acme Corp');

      // Switch to enterprise
      await enterpriseRadio.click();

      // Enterprise row should be visible, others hidden
      await expect(firstNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(companyNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(corporateNameInput).toBeVisible({ timeout: 5000 });

      // Fill enterprise row
      await corporateNameInput.fill('MegaCorp International');

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

    test('should preserve row field values through visibility toggles', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('row-state-preservation');
      await page.goto('/#/test/container-conditional-visibility/row-state-preservation');
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

    test('should handle individual field visibility within a row', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('row-conditional-fields');
      await page.goto('/#/test/container-conditional-visibility/row-conditional-fields');
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

      // Enable middle name
      await hasMiddleNameCheckbox.click();

      // Middle name should now be visible
      await expect(middleNameInput).toBeVisible({ timeout: 5000 });
      await middleNameInput.fill('William');

      // Enable nickname
      await hasNicknameCheckbox.click();

      // Nickname fields should now be visible
      await expect(nicknameInput).toBeVisible({ timeout: 5000 });
      await expect(preferredNameSelect).toBeVisible({ timeout: 5000 });
      await nicknameInput.fill('Billy');

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

  // ─────────────────────────────────────────────────────────────────────────
  // Array - Child Field Visibility
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Array - Child Field Visibility', () => {
    test('should show/hide entire array based on radio selection', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-conditional-visibility');
      await page.goto('/#/test/container-conditional-visibility/array-conditional-visibility');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Get radio buttons
      const freeRadio = scenario.locator('#subscriptionType mat-radio-button:has-text("Free")');
      const proRadio = scenario.locator('#subscriptionType mat-radio-button:has-text("Pro")');

      // Get array elements - exclude hidden field components
      const teamMemberInputs = scenario.locator('#teamMembers df-mat-input:not([hidden]) input');
      const addButton = scenario.locator('button:has-text("Add Team Member")');

      // Notes field should always be visible
      const notesField = scenario.locator('#notes textarea');
      await expect(notesField).toBeVisible({ timeout: 5000 });

      // Initially free is selected, so array should be hidden
      await expect(freeRadio).toBeVisible({ timeout: 5000 });
      await expect(teamMemberInputs).toHaveCount(0, { timeout: 5000 });
      await expect(addButton).not.toBeVisible({ timeout: 5000 });

      // Switch to pro
      await proRadio.click();

      // Array should now be visible with initial item
      await expect(teamMemberInputs).toHaveCount(1, { timeout: 10000 });
      await expect(addButton).toBeVisible({ timeout: 5000 });

      // Fill array item
      await teamMemberInputs.first().fill('John Doe');
      const roleSelect = helpers.getSelect(scenario, 'role_0');
      await helpers.selectOption(roleSelect, 'Admin');

      // Add another team member
      await addButton.click();
      await expect(teamMemberInputs).toHaveCount(2, { timeout: 10000 });
      await teamMemberInputs.nth(1).fill('Jane Smith');

      // Switch back to free
      await freeRadio.click();

      // Array should be hidden
      await expect(teamMemberInputs).toHaveCount(0, { timeout: 5000 });
      await expect(addButton).not.toBeVisible({ timeout: 5000 });

      // Switch to pro again - values should be preserved
      await proRadio.click();
      await expect(teamMemberInputs).toHaveCount(2, { timeout: 10000 });
      await expect(teamMemberInputs.first()).toHaveValue('John Doe', { timeout: 5000 });
      await expect(teamMemberInputs.nth(1)).toHaveValue('Jane Smith', { timeout: 5000 });
    });

    test('should preserve array items through visibility toggle', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-state-preservation');
      await page.goto('/#/test/container-conditional-visibility/array-state-preservation');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Get controls - exclude hidden field components
      const enableContactsCheckbox = helpers.getCheckbox(scenario, 'enableContacts');
      const contactInputs = scenario.locator('#contacts df-mat-input:not([hidden]) input');
      const addButton = scenario.locator('button:has-text("Add Contact")');

      // Always visible field
      const alwaysVisibleInput = scenario.locator('#alwaysVisibleField input');
      await expect(alwaysVisibleInput).toBeVisible({ timeout: 5000 });

      // Initially array should be hidden
      await expect(contactInputs).toHaveCount(0, { timeout: 5000 });
      await expect(addButton).not.toBeVisible({ timeout: 5000 });

      // Enable contacts
      await enableContactsCheckbox.click();

      // Array should be visible with 2 initial items (6 inputs: 2 items x 3 fields)
      await expect(contactInputs).toHaveCount(6, { timeout: 10000 });
      await expect(addButton).toBeVisible({ timeout: 5000 });

      // Fill first contact
      await contactInputs.nth(0).fill('Alice');
      await contactInputs.nth(1).fill('alice@example.com');
      await contactInputs.nth(2).fill('555-1111');

      // Fill second contact
      await contactInputs.nth(3).fill('Bob');
      await contactInputs.nth(4).fill('bob@example.com');
      await contactInputs.nth(5).fill('555-2222');

      // Add a third contact
      await addButton.click();
      await expect(contactInputs).toHaveCount(9, { timeout: 10000 });
      await contactInputs.nth(6).fill('Charlie');

      // Toggle off and on
      await enableContactsCheckbox.click();
      await expect(contactInputs).toHaveCount(0, { timeout: 5000 });

      await enableContactsCheckbox.click();
      await expect(contactInputs).toHaveCount(9, { timeout: 10000 });

      // Values should be preserved
      await expect(contactInputs.nth(0)).toHaveValue('Alice', { timeout: 5000 });
      await expect(contactInputs.nth(1)).toHaveValue('alice@example.com', { timeout: 5000 });
      await expect(contactInputs.nth(3)).toHaveValue('Bob', { timeout: 5000 });
      await expect(contactInputs.nth(6)).toHaveValue('Charlie', { timeout: 5000 });
    });

    test('should handle conditional fields within array items', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-items-conditional-fields');
      await page.goto('/#/test/container-conditional-visibility/array-items-conditional-fields');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Get first item's fields (fields inside array have index suffix)
      const streetInput = scenario.locator('#addresses #street_0 input');
      const cityInput = scenario.locator('#addresses #city_0 input');
      const hasApartmentCheckbox = helpers.getCheckbox(scenario, 'hasApartment_0');
      const apartmentInput = scenario.locator('#addresses #apartmentNumber_0 input');
      const residentialRadio = scenario.locator('#addresses #addressType_0 mat-radio-button:has-text("Residential")');
      const commercialRadio = scenario.locator('#addresses #addressType_0 mat-radio-button:has-text("Commercial")');
      const businessNameInput = scenario.locator('#addresses #businessName_0 input');

      // Initial state - apartment and business fields should be hidden
      await expect(streetInput).toBeVisible({ timeout: 5000 });
      await expect(cityInput).toBeVisible({ timeout: 5000 });
      await expect(apartmentInput).not.toBeVisible({ timeout: 5000 });
      await expect(businessNameInput).not.toBeVisible({ timeout: 5000 });

      // Fill basic fields
      await streetInput.fill('123 Main St');
      await cityInput.fill('Springfield');

      // Enable apartment number
      await hasApartmentCheckbox.click();
      await expect(apartmentInput).toBeVisible({ timeout: 5000 });
      await apartmentInput.fill('4B');

      // Switch to commercial
      await commercialRadio.click();
      await expect(businessNameInput).toBeVisible({ timeout: 5000 });
      await businessNameInput.fill('Acme Corp');

      // Add a second address
      const addButton = scenario.locator('button:has-text("Add Address")');
      await addButton.click();

      // Second item should have its own independent visibility
      const secondStreetInput = scenario.locator('#addresses #street_1 input');
      const secondApartmentInput = scenario.locator('#addresses #apartmentNumber_1 input');
      const secondBusinessInput = scenario.locator('#addresses #businessName_1 input');

      await expect(secondStreetInput).toBeVisible({ timeout: 5000 });
      // Second item starts with default values (no apartment, residential)
      await expect(secondApartmentInput).not.toBeVisible({ timeout: 5000 });
      await expect(secondBusinessInput).not.toBeVisible({ timeout: 5000 });

      // First item's values should be preserved
      await expect(streetInput).toHaveValue('123 Main St', { timeout: 5000 });
      await expect(apartmentInput).toHaveValue('4B', { timeout: 5000 });
      await expect(businessNameInput).toHaveValue('Acme Corp', { timeout: 5000 });

      // Toggle first item's apartment off and on
      await hasApartmentCheckbox.click();
      await expect(apartmentInput).not.toBeVisible({ timeout: 5000 });
      await hasApartmentCheckbox.click();
      await expect(apartmentInput).toBeVisible({ timeout: 5000 });
      await expect(apartmentInput).toHaveValue('4B', { timeout: 5000 });

      // Switch first item back to residential
      await residentialRadio.click();
      await expect(businessNameInput).not.toBeVisible({ timeout: 5000 });

      // Switch back to commercial - value should be preserved
      await commercialRadio.click();
      await expect(businessNameInput).toHaveValue('Acme Corp', { timeout: 5000 });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Submission - Child Field Visibility
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Submission - Child Field Visibility', () => {
    test('should include visible container fields in submission', async ({ page, helpers }) => {
      await page.goto('/#/test/container-conditional-visibility/submit-conditional-containers');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('submit-conditional-containers');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // With address included (default)
      const data = await helpers.submitFormAndCapture(scenario);
      expect(data['name']).toBe('Test User');
      expect(data).toHaveProperty('addressGroup');
      const address = data['addressGroup'] as Record<string, unknown>;
      expect(address['street']).toBe('456 Oak Ave');
      expect(address['city']).toBe('Portland');
    });

    test('should handle hidden container fields in submission', async ({ page, helpers }) => {
      await page.goto('/#/test/container-conditional-visibility/submit-conditional-containers');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('submit-conditional-containers');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Uncheck "Include Address" to hide the group fields
      const checkbox = helpers.getCheckbox(scenario, 'includeAddress');
      await checkbox.click();

      // Wait for fields to hide
      const streetInput = scenario.locator('#addressGroup #street input');
      await expect(streetInput).not.toBeVisible({ timeout: 5000 });

      // Submit and check data
      const data = await helpers.submitFormAndCapture(scenario);
      expect(data['name']).toBe('Test User');
      // Hidden fields should still be in the form value (they're hidden, not removed)
      expect(data).toHaveProperty('addressGroup');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Group - Container-Level Logic
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Group - Container-Level Logic', () => {
    test('should hide/show entire group via container-level hidden logic', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('group-hidden-logic');
      await page.goto('/#/test/container-conditional-visibility/group-hidden-logic');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Get controls
      const showAddressCheckbox = helpers.getCheckbox(scenario, 'showAddress');

      // Get group child fields
      const streetInput = scenario.locator('#street input');
      const cityInput = scenario.locator('#city input');
      const zipInput = scenario.locator('#zip input');

      // Notes field should always be visible
      const notesInput = scenario.locator('#notes input');
      await expect(notesInput).toBeVisible({ timeout: 5000 });

      // Initially checkbox is checked, group should be visible
      await expect(streetInput).toBeVisible({ timeout: 5000 });
      await expect(cityInput).toBeVisible({ timeout: 5000 });
      await expect(zipInput).toBeVisible({ timeout: 5000 });

      // Fill group fields
      await streetInput.fill('789 Elm St');
      await cityInput.fill('Portland');
      await zipInput.fill('97201');

      // Uncheck to hide the group
      await showAddressCheckbox.click();

      // All group children should be hidden
      await expect(streetInput).not.toBeVisible({ timeout: 5000 });
      await expect(cityInput).not.toBeVisible({ timeout: 5000 });
      await expect(zipInput).not.toBeVisible({ timeout: 5000 });

      // Notes field should still be visible
      await expect(notesInput).toBeVisible({ timeout: 5000 });

      // Re-check to show the group
      await showAddressCheckbox.click();

      // All group children should be visible again with preserved values
      await expect(streetInput).toBeVisible({ timeout: 5000 });
      await expect(streetInput).toHaveValue('789 Elm St', { timeout: 5000 });
      await expect(cityInput).toHaveValue('Portland', { timeout: 5000 });
      await expect(zipInput).toHaveValue('97201', { timeout: 5000 });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Row - Container-Level Logic
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Row - Container-Level Logic', () => {
    test('should hide/show entire row via container-level hidden logic', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('row-hidden-logic');
      await page.goto('/#/test/container-conditional-visibility/row-hidden-logic');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Get controls
      const showContactCheckbox = helpers.getCheckbox(scenario, 'showContactInfo');

      // Get row child fields
      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const phoneInput = scenario.locator('#phone input');

      // Notes field should always be visible
      const notesInput = scenario.locator('#notes input');
      await expect(notesInput).toBeVisible({ timeout: 5000 });

      // Initially checkbox is checked, row should be visible
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      await expect(lastNameInput).toBeVisible({ timeout: 5000 });
      await expect(phoneInput).toBeVisible({ timeout: 5000 });

      // Fill row fields
      await firstNameInput.fill('John');
      await lastNameInput.fill('Doe');
      await phoneInput.fill('555-9876');

      // Uncheck to hide the row
      await showContactCheckbox.click();

      // All row children should be hidden
      await expect(firstNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(lastNameInput).not.toBeVisible({ timeout: 5000 });
      await expect(phoneInput).not.toBeVisible({ timeout: 5000 });

      // Notes field should still be visible
      await expect(notesInput).toBeVisible({ timeout: 5000 });

      // Re-check to show the row
      await showContactCheckbox.click();

      // All row children should be visible again with preserved values
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
      await expect(phoneInput).toHaveValue('555-9876', { timeout: 5000 });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Array - Container-Level Logic
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Array - Container-Level Logic', () => {
    test('should hide/show entire array via container-level hidden logic', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-hidden-logic');
      await page.goto('/#/test/container-conditional-visibility/array-hidden-logic');
      await page.waitForLoadState('networkidle');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Get controls
      const enableMembersCheckbox = helpers.getCheckbox(scenario, 'enableMembers');

      // Get array elements
      const memberInputs = scenario.locator('#members input');
      const addButton = scenario.locator('button:has-text("Add Member")');

      // Notes field should always be visible
      const notesInput = scenario.locator('#notes input');
      await expect(notesInput).toBeVisible({ timeout: 5000 });

      // Initially checkbox is checked, array should be visible
      await expect(memberInputs.first()).toBeVisible({ timeout: 10000 });
      await expect(addButton).toBeVisible({ timeout: 5000 });

      // Fill array item fields (first item has name and email)
      const nameInput = memberInputs.first();
      const emailInput = memberInputs.nth(1);
      await nameInput.fill('Alice');
      await emailInput.fill('alice@example.com');

      // Add another member
      await addButton.click();
      await expect(memberInputs).toHaveCount(4, { timeout: 10000 }); // 2 items x 2 fields
      await memberInputs.nth(2).fill('Bob');
      await memberInputs.nth(3).fill('bob@example.com');

      // Uncheck to hide the array
      await enableMembersCheckbox.click();

      // Array and add button should be hidden
      await expect(memberInputs.first()).not.toBeVisible({ timeout: 5000 });
      await expect(addButton).not.toBeVisible({ timeout: 5000 });

      // Notes field should still be visible
      await expect(notesInput).toBeVisible({ timeout: 5000 });

      // Re-check to show the array
      await enableMembersCheckbox.click();

      // Array should be visible again with preserved values
      await expect(memberInputs).toHaveCount(4, { timeout: 10000 });
      await expect(memberInputs.nth(0)).toHaveValue('Alice', { timeout: 5000 });
      await expect(memberInputs.nth(1)).toHaveValue('alice@example.com', { timeout: 5000 });
      await expect(memberInputs.nth(2)).toHaveValue('Bob', { timeout: 5000 });
      await expect(memberInputs.nth(3)).toHaveValue('bob@example.com', { timeout: 5000 });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Submission - Container-Level Logic
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Submission - Container-Level Logic', () => {
    test('should include hidden container child values in submission', async ({ page, helpers }) => {
      await page.goto('/#/test/container-conditional-visibility/container-level-submission');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('container-level-submission');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Verify initial state - group is visible
      const streetInput = scenario.locator('#street input');
      const cityInput = scenario.locator('#city input');
      await expect(streetInput).toBeVisible({ timeout: 5000 });
      await expect(streetInput).toHaveValue('123 Main St', { timeout: 5000 });
      await expect(cityInput).toHaveValue('Springfield', { timeout: 5000 });

      // Submit with group visible - verify all values included
      const data = await helpers.submitFormAndCapture(scenario);
      expect(data['name']).toBe('Test User');
      expect(data).toHaveProperty('addressGroup');
      const address = data['addressGroup'] as Record<string, unknown>;
      expect(address['street']).toBe('123 Main St');
      expect(address['city']).toBe('Springfield');
    });

    test('should still include child values when container is hidden via logic', async ({ page, helpers }) => {
      await page.goto('/#/test/container-conditional-visibility/container-level-submission');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('container-level-submission');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Hide the group container
      const showAddressCheckbox = helpers.getCheckbox(scenario, 'showAddress');
      await showAddressCheckbox.click();

      // Verify group is hidden
      const streetInput = scenario.locator('#street input');
      await expect(streetInput).not.toBeVisible({ timeout: 5000 });

      // Submit and check data - child values should still be in submission (V1 behavior: CSS-only hiding)
      const data = await helpers.submitFormAndCapture(scenario);
      expect(data['name']).toBe('Test User');
      expect(data).toHaveProperty('addressGroup');
      const address = data['addressGroup'] as Record<string, unknown>;
      expect(address['street']).toBe('123 Main St');
      expect(address['city']).toBe('Springfield');
    });
  });
});
