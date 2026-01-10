import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Expression-Based Logic Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/expression-based-logic');
  });

  test.describe('Hidden Logic', () => {
    test('should hide/show fields based on fieldValue condition', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/expression-based-logic/hidden-logic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('hidden-logic-test');
      await expect(scenario).toBeVisible();

      // Select free - payment should be hidden
      const subscriptionSelect = scenario.locator('#subscriptionType select');
      await expect(subscriptionSelect).toBeVisible();

      await subscriptionSelect.selectOption({ label: 'Free' });
      await subscriptionSelect.blur();

      const paymentField = scenario.getByTestId('paymentMethod');
      await expect(paymentField).toBeHidden({ timeout: 10000 });

      // Screenshot: Free subscription - payment hidden
      await helpers.expectScreenshotMatch(scenario, 'bootstrap-hidden-logic-free');

      // Select premium - payment should be visible
      await subscriptionSelect.selectOption({ label: 'Premium' });
      await subscriptionSelect.blur();

      await expect(paymentField).toBeVisible({ timeout: 10000 });

      // Screenshot: Premium subscription - payment visible
      await helpers.expectScreenshotMatch(scenario, 'bootstrap-hidden-logic-premium');
    });
  });

  test.describe('Disabled Logic', () => {
    test('should disable fields using JavaScript expressions', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/expression-based-logic/disabled-logic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('disabled-logic-test');
      await expect(scenario).toBeVisible();

      // Initially unchecked - vehicle type should be disabled
      const vehicleInput = scenario.locator('#vehicleType input');
      await expect(vehicleInput).toBeDisabled();

      // Screenshot: Vehicle type disabled
      await helpers.expectScreenshotMatch(scenario, 'bootstrap-disabled-logic-disabled');

      // Check the checkbox - vehicle type should be enabled
      await scenario.locator('#hasVehicle input[type="checkbox"]').check();

      // Use auto-waiting assertion to wait for Angular to update disabled state
      await expect(vehicleInput).toBeEnabled();

      // Screenshot: Vehicle type enabled
      await helpers.expectScreenshotMatch(scenario, 'bootstrap-disabled-logic-enabled');
    });
  });

  test.describe('AND Logic', () => {
    test('should hide fields using AND conditional logic', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/expression-based-logic/and-logic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('and-logic-test');
      await expect(scenario).toBeVisible();

      const regularPriceField = scenario.getByTestId('regularPrice');

      // Initially both unchecked - regular price should be visible
      await expect(regularPriceField).toBeVisible();

      // Screenshot: Initial state - regular price visible
      await helpers.expectScreenshotMatch(scenario, 'bootstrap-and-logic-initial');

      // Check only hasDiscount - regular price should still be visible (only one condition true)
      await scenario.locator('#hasDiscount input[type="checkbox"]').check();
      await expect(regularPriceField).toBeVisible();

      // Check isPremiumMember too - now both conditions true, regular price should be hidden
      await scenario.locator('#isPremiumMember input[type="checkbox"]').check();
      await expect(regularPriceField).toBeHidden();

      // Screenshot: Both conditions true - regular price hidden
      await helpers.expectScreenshotMatch(scenario, 'bootstrap-and-logic-both-true');

      // Uncheck hasDiscount - regular price should be visible again (only one condition true)
      await scenario.locator('#hasDiscount input[type="checkbox"]').uncheck();
      await expect(regularPriceField).toBeVisible();
    });
  });

  test.describe('Readonly Logic', () => {
    test('should make static readonly field always readonly', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/expression-based-logic/readonly-logic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('readonly-logic-test');
      await expect(scenario).toBeVisible();

      // Static readonly field should always have the readonly attribute
      const staticReadonlyInput = scenario.locator('#staticReadonly input');
      await expect(staticReadonlyInput).toHaveAttribute('readonly', '');
    });

    test('should make fields readonly using conditional logic', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/expression-based-logic/readonly-logic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('readonly-logic-test');
      await expect(scenario).toBeVisible();

      // Initially editMode is unchecked, so readonly logic is active
      const usernameInput = scenario.locator('#username input');

      // Verify the field has the readonly attribute when editMode is unchecked
      await expect(usernameInput).toHaveAttribute('readonly', '');

      // Enable edit mode - readonly logic should no longer be active
      await scenario.locator('#editMode input[type="checkbox"]').check();

      // Verify the field no longer has the readonly attribute
      await expect(usernameInput).not.toHaveAttribute('readonly', '');

      // Now user should be able to edit the field
      await usernameInput.fill('new_username');
      await expect(usernameInput).toHaveValue('new_username');

      // Disable edit mode again - readonly should be reapplied
      await scenario.locator('#editMode input[type="checkbox"]').uncheck();

      // Verify the field is readonly again
      await expect(usernameInput).toHaveAttribute('readonly', '');
    });
  });

  test.describe('OR Logic', () => {
    test('should apply OR conditional logic for multiple conditions', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/expression-based-logic/or-logic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('or-logic-test');
      await expect(scenario).toBeVisible();

      const discountInfoField = scenario.getByTestId('discountInfo');

      // Initially both unchecked - both conditions false, discount should be visible
      await expect(discountInfoField).toBeVisible();

      // Check isStudent - one condition becomes true, discount should be hidden (OR: at least one true)
      await scenario.locator('#isStudent input[type="checkbox"]').check();
      await expect(discountInfoField).toBeHidden();

      // Uncheck isStudent and check isSenior - still one condition true, discount should be hidden
      await scenario.locator('#isStudent input[type="checkbox"]').uncheck();
      await scenario.locator('#isSenior input[type="checkbox"]').check();
      await expect(discountInfoField).toBeHidden();

      // Check both - both conditions true, discount should be hidden
      await scenario.locator('#isStudent input[type="checkbox"]').check();
      await expect(discountInfoField).toBeHidden();

      // Uncheck both - back to both false, discount should be visible again
      await scenario.locator('#isStudent input[type="checkbox"]').uncheck();
      await scenario.locator('#isSenior input[type="checkbox"]').uncheck();
      await expect(discountInfoField).toBeVisible();
    });
  });

  test.describe('Nested AND within OR', () => {
    test('should handle nested AND within OR conditions', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/expression-based-logic/nested-and-within-or');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('nested-and-within-or-test');
      await expect(scenario).toBeVisible();

      const specialOfferField = scenario.getByTestId('specialOffer');

      // Initially all unchecked - offer should be visible (no conditions met)
      await expect(specialOfferField).toBeVisible();

      // Check only isStudent - offer still visible (AND not satisfied: missing hasValidID)
      await scenario.locator('#isStudent input[type="checkbox"]').check();
      await expect(specialOfferField).toBeVisible();

      // Check hasValidID too - now (isStudent AND hasValidID) is true, offer should be hidden
      await scenario.locator('#hasValidID input[type="checkbox"]').check();
      await expect(specialOfferField).toBeHidden();

      // Uncheck isStudent but keep hasValidID - offer should be visible again
      await scenario.locator('#isStudent input[type="checkbox"]').uncheck();
      await expect(specialOfferField).toBeVisible();

      // Check isSenior - now (isSenior AND hasValidID) is true, offer should be hidden
      await scenario.locator('#isSenior input[type="checkbox"]').check();
      await expect(specialOfferField).toBeHidden();

      // Uncheck hasValidID - both AND conditions false, offer should be visible
      await scenario.locator('#hasValidID input[type="checkbox"]').uncheck();
      await expect(specialOfferField).toBeVisible();
    });
  });

  test.describe('Nested OR within AND', () => {
    test('should handle nested OR within AND conditions', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/expression-based-logic/nested-or-within-and');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('nested-or-within-and-test');
      await expect(scenario).toBeVisible();

      const premiumField = scenario.getByTestId('premiumFeatures');

      // Initially all unchecked - premium visible (AND not satisfied)
      await expect(premiumField).toBeVisible();

      // Check isPaid - first OR satisfied, but second OR not satisfied
      await scenario.locator('#isPaid input[type="checkbox"]').check();
      await expect(premiumField).toBeVisible();

      // Check isVerified - now both OR conditions true, AND satisfied, premium should be hidden
      await scenario.locator('#isVerified input[type="checkbox"]').check();
      await expect(premiumField).toBeHidden();

      // Uncheck isPaid but check isTrial - first OR still true via isTrial
      await scenario.locator('#isPaid input[type="checkbox"]').uncheck();
      await scenario.locator('#isTrial input[type="checkbox"]').check();
      await expect(premiumField).toBeHidden();

      // Uncheck isVerified but check isAdmin - second OR still true via isAdmin
      await scenario.locator('#isVerified input[type="checkbox"]').uncheck();
      await scenario.locator('#isAdmin input[type="checkbox"]').check();
      await expect(premiumField).toBeHidden();

      // Uncheck isTrial - first OR becomes false, AND not satisfied
      await scenario.locator('#isTrial input[type="checkbox"]').uncheck();
      await expect(premiumField).toBeVisible();
    });
  });

  test.describe('Comparison Operators', () => {
    test('should show underage warning when age < 18', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/expression-based-logic/comparison-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comparison-operators-test');
      await expect(scenario).toBeVisible();

      const ageInput = helpers.getInput(scenario, 'age');
      const underageWarning = scenario.getByTestId('underageWarning');

      // Initial age is 25 - warning should be hidden (age >= 18)
      await expect(underageWarning).toBeHidden();

      // Set age below 18 - warning should appear
      await helpers.clearAndFill(ageInput, '16');
      await expect(underageWarning).toBeVisible();

      // Set age to exactly 18 - warning should be hidden (greaterOrEqual)
      await helpers.clearAndFill(ageInput, '18');
      await expect(underageWarning).toBeHidden();
    });

    test('should show senior discount when age > 65', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/expression-based-logic/comparison-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comparison-operators-test');
      await expect(scenario).toBeVisible();

      const ageInput = helpers.getInput(scenario, 'age');
      const seniorDiscount = scenario.getByTestId('seniorDiscount');

      // Initial age is 25 - discount should be hidden
      await expect(seniorDiscount).toBeHidden();

      // Set age to 65 - still hidden (needs > 65, not >=)
      await helpers.clearAndFill(ageInput, '65');
      await expect(seniorDiscount).toBeHidden();

      // Set age to 66 - discount should appear
      await helpers.clearAndFill(ageInput, '66');
      await expect(seniorDiscount).toBeVisible();
    });

    test('should show bulk order note when quantity > 10', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/expression-based-logic/comparison-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comparison-operators-test');
      await expect(scenario).toBeVisible();

      const quantityInput = helpers.getInput(scenario, 'quantity');
      const bulkOrderNote = scenario.getByTestId('bulkOrderNote');

      // Initial quantity is 5 - note should be hidden
      await expect(bulkOrderNote).toBeHidden();

      // Set quantity to 10 - still hidden
      await helpers.clearAndFill(quantityInput, '10');
      await expect(bulkOrderNote).toBeHidden();

      // Set quantity to 11 - note should appear
      await helpers.clearAndFill(quantityInput, '11');
      await expect(bulkOrderNote).toBeVisible();
    });

    test('should show reactivate option when status != active', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/expression-based-logic/comparison-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comparison-operators-test');
      await expect(scenario).toBeVisible();

      const statusSelect = scenario.locator('#status select');
      const reactivateButton = scenario.getByTestId('reactivateButton');

      // Initial status is active - reactivate should be hidden
      await expect(reactivateButton).toBeHidden();

      // Set status to pending - reactivate should appear
      await statusSelect.selectOption({ label: 'Pending' });
      await expect(reactivateButton).toBeVisible();

      // Set status to inactive - reactivate should still be visible
      await statusSelect.selectOption({ label: 'Inactive' });
      await expect(reactivateButton).toBeVisible();

      // Set status back to active - reactivate should be hidden
      await statusSelect.selectOption({ label: 'Active' });
      await expect(reactivateButton).toBeHidden();
    });

    test('should show pass/fail messages based on score threshold', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/expression-based-logic/comparison-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comparison-operators-test');
      await expect(scenario).toBeVisible();

      const scoreInput = helpers.getInput(scenario, 'score');
      const passMessage = scenario.getByTestId('passMessage');
      const failMessage = scenario.getByTestId('failMessage');

      // Initial score is 75 - pass visible, fail hidden
      await expect(passMessage).toBeVisible();
      await expect(failMessage).toBeHidden();

      // Set score to exactly 60 - pass visible, fail hidden
      await helpers.clearAndFill(scoreInput, '60');
      await expect(passMessage).toBeVisible();
      await expect(failMessage).toBeHidden();

      // Set score to 59 - pass hidden, fail visible
      await helpers.clearAndFill(scoreInput, '59');
      await expect(passMessage).toBeHidden();
      await expect(failMessage).toBeVisible();
    });
  });

  test.describe('String Operators', () => {
    test('should show corporate note when email contains "company"', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/expression-based-logic/string-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('string-operators-test');
      await expect(scenario).toBeVisible();

      const emailInput = helpers.getInput(scenario, 'email');
      const corporateNote = scenario.getByTestId('corporateNote');

      // Initial email contains "company" - note should be visible
      await expect(corporateNote).toBeVisible();

      // Change email to not contain "company"
      await helpers.clearAndFill(emailInput, 'user@gmail.com');
      await expect(corporateNote).toBeHidden();

      // Add "company" back
      await helpers.clearAndFill(emailInput, 'user@mycompany.org');
      await expect(corporateNote).toBeVisible();
    });

    test('should show secure/insecure notes based on URL prefix', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/expression-based-logic/string-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('string-operators-test');
      await expect(scenario).toBeVisible();

      const urlInput = helpers.getInput(scenario, 'url');
      const secureNote = scenario.getByTestId('secureNote');
      const insecureWarning = scenario.getByTestId('insecureWarning');

      // Initial URL starts with https - secure visible, insecure hidden
      await expect(secureNote).toBeVisible();
      await expect(insecureWarning).toBeHidden();

      // Change URL to http
      await helpers.clearAndFill(urlInput, 'http://example.com');
      await expect(secureNote).toBeHidden();
      await expect(insecureWarning).toBeVisible();

      // Change back to https
      await helpers.clearAndFill(urlInput, 'https://secure.example.com');
      await expect(secureNote).toBeVisible();
      await expect(insecureWarning).toBeHidden();
    });

    test('should show PDF viewer when filename ends with .pdf', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/expression-based-logic/string-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('string-operators-test');
      await expect(scenario).toBeVisible();

      const filenameInput = helpers.getInput(scenario, 'filename');
      const pdfViewer = scenario.getByTestId('pdfViewer');
      const imageViewer = scenario.getByTestId('imageViewer');

      // Initial filename ends with .pdf - PDF viewer visible, image viewer hidden
      await expect(pdfViewer).toBeVisible();
      await expect(imageViewer).toBeHidden();

      // Change to .jpg
      await helpers.clearAndFill(filenameInput, 'photo.jpg');
      await expect(pdfViewer).toBeHidden();
      await expect(imageViewer).toBeVisible();

      // Change to .png
      await helpers.clearAndFill(filenameInput, 'screenshot.png');
      await expect(pdfViewer).toBeHidden();
      await expect(imageViewer).toBeVisible();

      // Change to .txt (neither)
      await helpers.clearAndFill(filenameInput, 'notes.txt');
      await expect(pdfViewer).toBeHidden();
      await expect(imageViewer).toBeHidden();

      // Change back to .pdf
      await helpers.clearAndFill(filenameInput, 'report.pdf');
      await expect(pdfViewer).toBeVisible();
      await expect(imageViewer).toBeHidden();
    });

    test('should show international shipping note when country != US', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/expression-based-logic/string-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('string-operators-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country select');
      const internationalShipping = scenario.getByTestId('internationalShipping');

      // Initial country is US - international shipping hidden
      await expect(internationalShipping).toBeHidden();

      // Change to UK
      await countrySelect.selectOption({ label: 'United Kingdom' });
      await expect(internationalShipping).toBeVisible();

      // Change to Canada
      await countrySelect.selectOption({ label: 'Canada' });
      await expect(internationalShipping).toBeVisible();

      // Change back to US
      await countrySelect.selectOption({ label: 'United States' });
      await expect(internationalShipping).toBeHidden();
    });
  });
});
