import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Expression-Based Logic Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/expression-based-logic');
  });

  test.describe('Hidden Logic', () => {
    test('should hide/show fields based on fieldValue condition', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/expression-based-logic/hidden-logic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('hidden-logic-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for subscription select to be visible
      await page.waitForSelector('[data-testid="hidden-logic-test"] #subscriptionType p-select', { state: 'visible', timeout: 10000 });

      // Select free - payment should be hidden
      const subscriptionSelect = scenario.locator('#subscriptionType p-select');
      await expect(subscriptionSelect).toBeVisible({ timeout: 10000 });

      await helpers.selectOption(subscriptionSelect, 'Free');
      await subscriptionSelect.blur();

      const paymentField = scenario.getByTestId('paymentMethod');
      await expect(paymentField).toBeHidden({ timeout: 10000 });

      // Screenshot: Free subscription - payment hidden
      await helpers.expectScreenshotMatch(scenario, 'primeng-hidden-logic-free');

      // Select premium - payment should be visible
      await helpers.selectOption(subscriptionSelect, 'Premium');
      await subscriptionSelect.blur();

      await expect(paymentField).toBeVisible({ timeout: 10000 });

      // Screenshot: Premium subscription - payment visible
      await helpers.expectScreenshotMatch(scenario, 'primeng-hidden-logic-premium');
    });
  });

  test.describe('Disabled Logic', () => {
    test('should disable fields using JavaScript expressions', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/expression-based-logic/disabled-logic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('disabled-logic-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for vehicle input to be visible
      await page.waitForSelector('[data-testid="disabled-logic-test"] #vehicleType input', { state: 'visible', timeout: 10000 });

      // Initially unchecked - vehicle type should be disabled
      const vehicleInput = scenario.locator('#vehicleType input');
      await expect(vehicleInput).toBeDisabled({ timeout: 10000 });

      // Screenshot: Vehicle type disabled
      await helpers.expectScreenshotMatch(scenario, 'primeng-disabled-logic-disabled');

      // Wait for checkbox to be visible
      await page.waitForSelector('[data-testid="disabled-logic-test"] #hasVehicle p-checkbox input', { state: 'visible', timeout: 10000 });

      // Check the checkbox - vehicle type should be enabled
      const checkbox = scenario.locator('#hasVehicle p-checkbox input');
      await checkbox.check();
      await expect(checkbox).toBeChecked({ timeout: 5000 });

      // Use auto-waiting assertion to wait for Angular to update disabled state
      await expect(vehicleInput).toBeEnabled({ timeout: 10000 });

      // Screenshot: Vehicle type enabled
      await helpers.expectScreenshotMatch(scenario, 'primeng-disabled-logic-enabled');
    });
  });

  test.describe('AND Logic', () => {
    test('should hide fields using AND conditional logic', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/expression-based-logic/and-logic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('and-logic-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for checkboxes to be visible
      await page.waitForSelector('[data-testid="and-logic-test"] #hasDiscount p-checkbox input', { state: 'visible', timeout: 10000 });

      const regularPriceField = scenario.getByTestId('regularPrice');

      // Initially both unchecked - regular price should be visible
      await expect(regularPriceField).toBeVisible({ timeout: 10000 });

      // Screenshot: Initial state - regular price visible
      await helpers.expectScreenshotMatch(scenario, 'primeng-and-logic-initial');

      // Check only hasDiscount - regular price should still be visible (only one condition true)
      const hasDiscountCheckbox = scenario.locator('#hasDiscount p-checkbox input');
      await hasDiscountCheckbox.check();
      await expect(hasDiscountCheckbox).toBeChecked({ timeout: 5000 });
      await expect(regularPriceField).toBeVisible({ timeout: 10000 });

      // Check isPremiumMember too - now both conditions true, regular price should be hidden
      const isPremiumCheckbox = scenario.locator('#isPremiumMember p-checkbox input');
      await isPremiumCheckbox.check();
      await expect(isPremiumCheckbox).toBeChecked({ timeout: 5000 });
      await expect(regularPriceField).toBeHidden({ timeout: 10000 });

      // Screenshot: Both conditions true - regular price hidden
      await helpers.expectScreenshotMatch(scenario, 'primeng-and-logic-both-true');

      // Uncheck hasDiscount - regular price should be visible again (only one condition true)
      await hasDiscountCheckbox.uncheck();
      await expect(hasDiscountCheckbox).not.toBeChecked({ timeout: 5000 });
      await expect(regularPriceField).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Readonly Logic', () => {
    test('should make static readonly field always readonly', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/expression-based-logic/readonly-logic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('readonly-logic-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for input to be visible
      await page.waitForSelector('[data-testid="readonly-logic-test"] #staticReadonly input', { state: 'visible', timeout: 10000 });

      // Static readonly field should always have the readonly attribute
      const staticReadonlyInput = scenario.locator('#staticReadonly input');
      await expect(staticReadonlyInput).toHaveAttribute('readonly', '');
    });

    test('should make fields readonly using conditional logic', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/expression-based-logic/readonly-logic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('readonly-logic-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for username input to be visible
      await page.waitForSelector('[data-testid="readonly-logic-test"] #username input', { state: 'visible', timeout: 10000 });

      // Initially editMode is unchecked, so readonly logic is active
      const usernameInput = scenario.locator('#username input');

      // Verify the field has the readonly attribute when editMode is unchecked
      await expect(usernameInput).toHaveAttribute('readonly', '');

      // Wait for checkbox to be visible
      await page.waitForSelector('[data-testid="readonly-logic-test"] #editMode p-checkbox input', { state: 'visible', timeout: 10000 });

      // Enable edit mode - readonly logic should no longer be active
      const editModeCheckbox = scenario.locator('#editMode p-checkbox input');
      await editModeCheckbox.check();
      await expect(editModeCheckbox).toBeChecked({ timeout: 5000 });

      // Verify the field no longer has the readonly attribute
      await expect(usernameInput).not.toHaveAttribute('readonly', '');

      // Now user should be able to edit the field
      await usernameInput.fill('new_username');
      await expect(usernameInput).toHaveValue('new_username', { timeout: 5000 });

      // Disable edit mode again - readonly should be reapplied
      await editModeCheckbox.uncheck();
      await expect(editModeCheckbox).not.toBeChecked({ timeout: 5000 });

      // Verify the field is readonly again
      await expect(usernameInput).toHaveAttribute('readonly', '');
    });
  });

  test.describe('OR Logic', () => {
    test('should apply OR conditional logic for multiple conditions', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/expression-based-logic/or-logic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('or-logic-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for checkboxes to be visible
      await page.waitForSelector('[data-testid="or-logic-test"] #isStudent p-checkbox input', { state: 'visible', timeout: 10000 });

      const discountInfoField = scenario.getByTestId('discountInfo');
      const isStudentCheckbox = scenario.locator('#isStudent p-checkbox input');
      const isSeniorCheckbox = scenario.locator('#isSenior p-checkbox input');

      // Initially both unchecked - both conditions false, discount should be visible
      await expect(discountInfoField).toBeVisible({ timeout: 10000 });

      // Check isStudent - one condition becomes true, discount should be hidden (OR: at least one true)
      await isStudentCheckbox.check();
      await expect(isStudentCheckbox).toBeChecked({ timeout: 5000 });
      await expect(discountInfoField).toBeHidden({ timeout: 10000 });

      // Uncheck isStudent and check isSenior - still one condition true, discount should be hidden
      await isStudentCheckbox.uncheck();
      await expect(isStudentCheckbox).not.toBeChecked({ timeout: 5000 });
      await isSeniorCheckbox.check();
      await expect(isSeniorCheckbox).toBeChecked({ timeout: 5000 });
      await expect(discountInfoField).toBeHidden({ timeout: 10000 });

      // Check both - both conditions true, discount should be hidden
      await isStudentCheckbox.check();
      await expect(isStudentCheckbox).toBeChecked({ timeout: 5000 });
      await expect(discountInfoField).toBeHidden({ timeout: 10000 });

      // Uncheck both - back to both false, discount should be visible again
      await isStudentCheckbox.uncheck();
      await expect(isStudentCheckbox).not.toBeChecked({ timeout: 5000 });
      await isSeniorCheckbox.uncheck();
      await expect(isSeniorCheckbox).not.toBeChecked({ timeout: 5000 });
      await expect(discountInfoField).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Nested AND within OR', () => {
    test('should handle nested AND within OR conditions', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/expression-based-logic/nested-and-within-or');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('nested-and-within-or-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for checkboxes to be visible
      await page.waitForSelector('[data-testid="nested-and-within-or-test"] #isStudent p-checkbox input', {
        state: 'visible',
        timeout: 10000,
      });

      const specialOfferField = scenario.getByTestId('specialOffer');
      const isStudentCheckbox = scenario.locator('#isStudent p-checkbox input');
      const hasValidIDCheckbox = scenario.locator('#hasValidID p-checkbox input');
      const isSeniorCheckbox = scenario.locator('#isSenior p-checkbox input');

      // Initially all unchecked - offer should be visible (no conditions met)
      await expect(specialOfferField).toBeVisible({ timeout: 10000 });

      // Check only isStudent - offer still visible (AND not satisfied: missing hasValidID)
      await isStudentCheckbox.check();
      await expect(isStudentCheckbox).toBeChecked({ timeout: 5000 });
      await expect(specialOfferField).toBeVisible({ timeout: 10000 });

      // Check hasValidID too - now (isStudent AND hasValidID) is true, offer should be hidden
      await hasValidIDCheckbox.check();
      await expect(hasValidIDCheckbox).toBeChecked({ timeout: 5000 });
      await expect(specialOfferField).toBeHidden({ timeout: 10000 });

      // Uncheck isStudent but keep hasValidID - offer should be visible again
      await isStudentCheckbox.uncheck();
      await expect(isStudentCheckbox).not.toBeChecked({ timeout: 5000 });
      await expect(specialOfferField).toBeVisible({ timeout: 10000 });

      // Check isSenior - now (isSenior AND hasValidID) is true, offer should be hidden
      await isSeniorCheckbox.check();
      await expect(isSeniorCheckbox).toBeChecked({ timeout: 5000 });
      await expect(specialOfferField).toBeHidden({ timeout: 10000 });

      // Uncheck hasValidID - both AND conditions false, offer should be visible
      await hasValidIDCheckbox.uncheck();
      await expect(hasValidIDCheckbox).not.toBeChecked({ timeout: 5000 });
      await expect(specialOfferField).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Nested OR within AND', () => {
    test('should handle nested OR within AND conditions', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/expression-based-logic/nested-or-within-and');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('nested-or-within-and-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for checkboxes to be visible
      await page.waitForSelector('[data-testid="nested-or-within-and-test"] #isPaid p-checkbox input', {
        state: 'visible',
        timeout: 10000,
      });

      const premiumField = scenario.getByTestId('premiumFeatures');
      const isPaidCheckbox = scenario.locator('#isPaid p-checkbox input');
      const isVerifiedCheckbox = scenario.locator('#isVerified p-checkbox input');
      const isTrialCheckbox = scenario.locator('#isTrial p-checkbox input');
      const isAdminCheckbox = scenario.locator('#isAdmin p-checkbox input');

      // Initially all unchecked - premium visible (AND not satisfied)
      await expect(premiumField).toBeVisible({ timeout: 10000 });

      // Check isPaid - first OR satisfied, but second OR not satisfied
      await isPaidCheckbox.check();
      await expect(isPaidCheckbox).toBeChecked({ timeout: 5000 });
      await expect(premiumField).toBeVisible({ timeout: 10000 });

      // Check isVerified - now both OR conditions true, AND satisfied, premium should be hidden
      await isVerifiedCheckbox.check();
      await expect(isVerifiedCheckbox).toBeChecked({ timeout: 5000 });
      await expect(premiumField).toBeHidden({ timeout: 10000 });

      // Uncheck isPaid but check isTrial - first OR still true via isTrial
      await isPaidCheckbox.uncheck();
      await expect(isPaidCheckbox).not.toBeChecked({ timeout: 5000 });
      await isTrialCheckbox.check();
      await expect(isTrialCheckbox).toBeChecked({ timeout: 5000 });
      await expect(premiumField).toBeHidden({ timeout: 10000 });

      // Uncheck isVerified but check isAdmin - second OR still true via isAdmin
      await isVerifiedCheckbox.uncheck();
      await expect(isVerifiedCheckbox).not.toBeChecked({ timeout: 5000 });
      await isAdminCheckbox.check();
      await expect(isAdminCheckbox).toBeChecked({ timeout: 5000 });
      await expect(premiumField).toBeHidden({ timeout: 10000 });

      // Uncheck isTrial - first OR becomes false, AND not satisfied
      await isTrialCheckbox.uncheck();
      await expect(isTrialCheckbox).not.toBeChecked({ timeout: 5000 });
      await expect(premiumField).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Comparison Operators', () => {
    test('should show underage warning when age < 18', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/expression-based-logic/comparison-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comparison-operators-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for age input to be visible
      await page.waitForSelector('[data-testid="comparison-operators-test"] #age input', { state: 'visible', timeout: 10000 });

      const ageInput = helpers.getInput(scenario, 'age');
      const underageWarning = scenario.getByTestId('underageWarning');

      // Initial age is 25 - warning should be hidden (age >= 18)
      await expect(underageWarning).toBeHidden({ timeout: 10000 });

      // Set age below 18 - warning should appear
      await helpers.clearAndFill(ageInput, '16');
      await expect(ageInput).toHaveValue('16', { timeout: 5000 });
      await ageInput.blur();
      await expect(underageWarning).toBeVisible({ timeout: 10000 });

      // Set age to exactly 18 - warning should be hidden (greaterOrEqual)
      await helpers.clearAndFill(ageInput, '18');
      await expect(ageInput).toHaveValue('18', { timeout: 5000 });
      await ageInput.blur();
      await expect(underageWarning).toBeHidden({ timeout: 10000 });
    });

    test('should show senior discount when age > 65', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/expression-based-logic/comparison-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comparison-operators-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for age input to be visible
      await page.waitForSelector('[data-testid="comparison-operators-test"] #age input', { state: 'visible', timeout: 10000 });

      const ageInput = helpers.getInput(scenario, 'age');
      const seniorDiscount = scenario.getByTestId('seniorDiscount');

      // Initial age is 25 - discount should be hidden
      await expect(seniorDiscount).toBeHidden({ timeout: 10000 });

      // Set age to 65 - still hidden (needs > 65, not >=)
      await helpers.clearAndFill(ageInput, '65');
      await expect(ageInput).toHaveValue('65', { timeout: 5000 });
      await ageInput.blur();
      await expect(seniorDiscount).toBeHidden({ timeout: 10000 });

      // Set age to 66 - discount should appear
      await helpers.clearAndFill(ageInput, '66');
      await expect(ageInput).toHaveValue('66', { timeout: 5000 });
      await ageInput.blur();
      await expect(seniorDiscount).toBeVisible({ timeout: 10000 });
    });

    test('should show bulk order note when quantity > 10', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/expression-based-logic/comparison-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comparison-operators-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for quantity input to be visible
      await page.waitForSelector('[data-testid="comparison-operators-test"] #quantity input', { state: 'visible', timeout: 10000 });

      const quantityInput = helpers.getInput(scenario, 'quantity');
      const bulkOrderNote = scenario.getByTestId('bulkOrderNote');

      // Initial quantity is 5 - note should be hidden
      await expect(bulkOrderNote).toBeHidden({ timeout: 10000 });

      // Set quantity to 10 - still hidden
      await helpers.clearAndFill(quantityInput, '10');
      await expect(quantityInput).toHaveValue('10', { timeout: 5000 });
      await quantityInput.blur();
      await expect(bulkOrderNote).toBeHidden({ timeout: 10000 });

      // Set quantity to 11 - note should appear
      await helpers.clearAndFill(quantityInput, '11');
      await expect(quantityInput).toHaveValue('11', { timeout: 5000 });
      await quantityInput.blur();
      await expect(bulkOrderNote).toBeVisible({ timeout: 10000 });
    });

    test('should show reactivate option when status != active', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/expression-based-logic/comparison-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comparison-operators-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for status select to be visible
      await page.waitForSelector('[data-testid="comparison-operators-test"] #status p-select', { state: 'visible', timeout: 10000 });

      const statusSelect = scenario.locator('#status p-select');
      const reactivateButton = scenario.getByTestId('reactivateButton');

      // Initial status is active - reactivate should be hidden
      await expect(reactivateButton).toBeHidden({ timeout: 10000 });

      // Set status to pending - reactivate should appear
      await helpers.selectOption(statusSelect, 'Pending');
      await statusSelect.blur();
      await expect(reactivateButton).toBeVisible({ timeout: 10000 });

      // Set status to inactive - reactivate should still be visible
      await helpers.selectOption(statusSelect, 'Inactive');
      await statusSelect.blur();
      await expect(reactivateButton).toBeVisible({ timeout: 10000 });

      // Set status back to active - reactivate should be hidden
      await helpers.selectOption(statusSelect, 'Active');
      await statusSelect.blur();
      await expect(reactivateButton).toBeHidden({ timeout: 10000 });
    });

    test('should show pass/fail messages based on score threshold', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/expression-based-logic/comparison-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comparison-operators-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for score input to be visible
      await page.waitForSelector('[data-testid="comparison-operators-test"] #score input', { state: 'visible', timeout: 10000 });

      const scoreInput = helpers.getInput(scenario, 'score');
      const passMessage = scenario.getByTestId('passMessage');
      const failMessage = scenario.getByTestId('failMessage');

      // Initial score is 75 - pass visible, fail hidden
      await expect(passMessage).toBeVisible({ timeout: 10000 });
      await expect(failMessage).toBeHidden({ timeout: 10000 });

      // Set score to exactly 60 - pass visible, fail hidden
      await helpers.clearAndFill(scoreInput, '60');
      await expect(scoreInput).toHaveValue('60', { timeout: 5000 });
      await scoreInput.blur();
      await expect(passMessage).toBeVisible({ timeout: 10000 });
      await expect(failMessage).toBeHidden({ timeout: 10000 });

      // Set score to 59 - pass hidden, fail visible
      await helpers.clearAndFill(scoreInput, '59');
      await expect(scoreInput).toHaveValue('59', { timeout: 5000 });
      await scoreInput.blur();
      await expect(passMessage).toBeHidden({ timeout: 10000 });
      await expect(failMessage).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('String Operators', () => {
    test('should show corporate note when email contains "company"', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/expression-based-logic/string-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('string-operators-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for email input to be visible
      await page.waitForSelector('[data-testid="string-operators-test"] #email input', { state: 'visible', timeout: 10000 });

      const emailInput = helpers.getInput(scenario, 'email');
      const corporateNote = scenario.getByTestId('corporateNote');

      // Initial email contains "company" - note should be visible
      await expect(corporateNote).toBeVisible({ timeout: 10000 });

      // Change email to not contain "company"
      await helpers.clearAndFill(emailInput, 'user@gmail.com');
      await expect(emailInput).toHaveValue('user@gmail.com', { timeout: 5000 });
      await emailInput.blur();
      await expect(corporateNote).toBeHidden({ timeout: 10000 });

      // Add "company" back
      await helpers.clearAndFill(emailInput, 'user@mycompany.org');
      await expect(emailInput).toHaveValue('user@mycompany.org', { timeout: 5000 });
      await emailInput.blur();
      await expect(corporateNote).toBeVisible({ timeout: 10000 });
    });

    test('should show secure/insecure notes based on URL prefix', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/expression-based-logic/string-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('string-operators-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for url input to be visible
      await page.waitForSelector('[data-testid="string-operators-test"] #url input', { state: 'visible', timeout: 10000 });

      const urlInput = helpers.getInput(scenario, 'url');
      const secureNote = scenario.getByTestId('secureNote');
      const insecureWarning = scenario.getByTestId('insecureWarning');

      // Initial URL starts with https - secure visible, insecure hidden
      await expect(secureNote).toBeVisible({ timeout: 10000 });
      await expect(insecureWarning).toBeHidden({ timeout: 10000 });

      // Change URL to http
      await helpers.clearAndFill(urlInput, 'http://example.com');
      await expect(urlInput).toHaveValue('http://example.com', { timeout: 5000 });
      await urlInput.blur();
      await expect(secureNote).toBeHidden({ timeout: 10000 });
      await expect(insecureWarning).toBeVisible({ timeout: 10000 });

      // Change back to https
      await helpers.clearAndFill(urlInput, 'https://secure.example.com');
      await expect(urlInput).toHaveValue('https://secure.example.com', { timeout: 5000 });
      await urlInput.blur();
      await expect(secureNote).toBeVisible({ timeout: 10000 });
      await expect(insecureWarning).toBeHidden({ timeout: 10000 });
    });

    test('should show PDF viewer when filename ends with .pdf', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/expression-based-logic/string-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('string-operators-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for filename input to be visible
      await page.waitForSelector('[data-testid="string-operators-test"] #filename input', { state: 'visible', timeout: 10000 });

      const filenameInput = helpers.getInput(scenario, 'filename');
      const pdfViewer = scenario.getByTestId('pdfViewer');
      const imageViewer = scenario.getByTestId('imageViewer');

      // Initial filename ends with .pdf - PDF viewer visible, image viewer hidden
      await expect(pdfViewer).toBeVisible({ timeout: 10000 });
      await expect(imageViewer).toBeHidden({ timeout: 10000 });

      // Change to .jpg
      await helpers.clearAndFill(filenameInput, 'photo.jpg');
      await expect(filenameInput).toHaveValue('photo.jpg', { timeout: 5000 });
      await filenameInput.blur();
      await expect(pdfViewer).toBeHidden({ timeout: 10000 });
      await expect(imageViewer).toBeVisible({ timeout: 10000 });

      // Change to .png
      await helpers.clearAndFill(filenameInput, 'screenshot.png');
      await expect(filenameInput).toHaveValue('screenshot.png', { timeout: 5000 });
      await filenameInput.blur();
      await expect(pdfViewer).toBeHidden({ timeout: 10000 });
      await expect(imageViewer).toBeVisible({ timeout: 10000 });

      // Change to .txt (neither)
      await helpers.clearAndFill(filenameInput, 'notes.txt');
      await expect(filenameInput).toHaveValue('notes.txt', { timeout: 5000 });
      await filenameInput.blur();
      await expect(pdfViewer).toBeHidden({ timeout: 10000 });
      await expect(imageViewer).toBeHidden({ timeout: 10000 });

      // Change back to .pdf
      await helpers.clearAndFill(filenameInput, 'report.pdf');
      await expect(filenameInput).toHaveValue('report.pdf', { timeout: 5000 });
      await filenameInput.blur();
      await expect(pdfViewer).toBeVisible({ timeout: 10000 });
      await expect(imageViewer).toBeHidden({ timeout: 10000 });
    });

    test('should show international shipping note when country != US', async ({ page, helpers }) => {
      await page.goto('http://localhost:4202/#/test/expression-based-logic/string-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('string-operators-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for country select to be visible
      await page.waitForSelector('[data-testid="string-operators-test"] #country p-select', { state: 'visible', timeout: 10000 });

      const countrySelect = scenario.locator('#country p-select');
      const internationalShipping = scenario.getByTestId('internationalShipping');

      // Initial country is US - international shipping hidden
      await expect(internationalShipping).toBeHidden({ timeout: 10000 });

      // Change to UK
      await helpers.selectOption(countrySelect, 'United Kingdom');
      await countrySelect.blur();
      await expect(internationalShipping).toBeVisible({ timeout: 10000 });

      // Change to Canada
      await helpers.selectOption(countrySelect, 'Canada');
      await countrySelect.blur();
      await expect(internationalShipping).toBeVisible({ timeout: 10000 });

      // Change back to US
      await helpers.selectOption(countrySelect, 'United States');
      await countrySelect.blur();
      await expect(internationalShipping).toBeHidden({ timeout: 10000 });
    });
  });
});
