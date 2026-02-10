import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Expression-Based Logic Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/expression-based-logic');
  });

  test.describe('Hidden Logic', () => {
    test('should hide/show fields based on fieldValue condition', async ({ page, helpers }) => {
      await page.goto('/#/test/expression-based-logic/hidden-logic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('hidden-logic-test');
      await expect(scenario).toBeVisible();

      // Select free - payment should be hidden
      await scenario.locator('#subscriptionType').click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Free")').click();
      await page.waitForTimeout(500);

      const paymentField = scenario.locator('#paymentMethod');
      await expect(paymentField).toBeHidden();

      // Select premium - payment should be visible
      await scenario.locator('#subscriptionType').click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Premium")').click();
      await page.waitForTimeout(500);

      await expect(paymentField).toBeVisible();
    });
  });

  test.describe('Disabled Logic', () => {
    test('should disable fields using JavaScript expressions', async ({ page, helpers }) => {
      await page.goto('/#/test/expression-based-logic/disabled-logic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('disabled-logic-test');
      await expect(scenario).toBeVisible();

      // Initially unchecked - vehicle type should be disabled
      const vehicleInput = scenario.locator('#vehicleType input');
      const isDisabled = await vehicleInput.isDisabled();
      expect(isDisabled).toBeTruthy();

      // Check the checkbox - vehicle type should be enabled
      await scenario.locator('#hasVehicle input[type="checkbox"]').check();
      await page.waitForTimeout(500);

      const isEnabled = await vehicleInput.isEnabled();
      expect(isEnabled).toBeTruthy();
    });
  });

  test.describe('AND Logic', () => {
    test('should hide fields using AND conditional logic', async ({ page, helpers }) => {
      await page.goto('/#/test/expression-based-logic/and-logic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('and-logic-test');
      await expect(scenario).toBeVisible();

      const regularPriceField = scenario.locator('#regularPrice');

      // Initially both unchecked - regular price should be visible
      await expect(regularPriceField).toBeVisible();

      // Check only hasDiscount - regular price should still be visible (only one condition true)
      await scenario.locator('#hasDiscount input[type="checkbox"]').check();
      await page.waitForTimeout(500);
      await expect(regularPriceField).toBeVisible();

      // Check isPremiumMember too - now both conditions true, regular price should be hidden
      await scenario.locator('#isPremiumMember input[type="checkbox"]').check();
      await page.waitForTimeout(500);
      await expect(regularPriceField).toBeHidden();

      // Uncheck hasDiscount - regular price should be visible again (only one condition true)
      await scenario.locator('#hasDiscount input[type="checkbox"]').uncheck();
      await page.waitForTimeout(500);
      await expect(regularPriceField).toBeVisible();
    });
  });

  test.describe('Readonly Logic', () => {
    test('should make static readonly field always readonly', async ({ page, helpers }) => {
      await page.goto('/#/test/expression-based-logic/readonly-logic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('readonly-logic-test');
      await expect(scenario).toBeVisible();

      // Static readonly field should always have the readonly attribute
      const staticReadonlyInput = scenario.locator('#staticReadonly input');
      await expect(staticReadonlyInput).toHaveAttribute('readonly', '');
    });

    test('should make fields readonly using conditional logic', async ({ page, helpers }) => {
      await page.goto('/#/test/expression-based-logic/readonly-logic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('readonly-logic-test');
      await expect(scenario).toBeVisible();

      // Initially editMode is unchecked, so readonly logic is active
      const usernameInput = scenario.locator('#username input');

      // Verify the field has the readonly attribute when editMode is unchecked
      await expect(usernameInput).toHaveAttribute('readonly', '');

      // Enable edit mode - readonly logic should no longer be active
      await scenario.locator('#editMode input[type="checkbox"]').check();
      await page.waitForTimeout(300);

      // Verify the field no longer has the readonly attribute
      await expect(usernameInput).not.toHaveAttribute('readonly', '');

      // Now user should be able to edit the field
      await usernameInput.fill('new_username');
      await page.waitForTimeout(200);
      const finalValue = await usernameInput.inputValue();
      expect(finalValue).toBe('new_username');

      // Disable edit mode again - readonly should be reapplied
      await scenario.locator('#editMode input[type="checkbox"]').uncheck();
      await page.waitForTimeout(300);

      // Verify the field is readonly again
      await expect(usernameInput).toHaveAttribute('readonly', '');
    });
  });

  test.describe('OR Logic', () => {
    test('should apply OR conditional logic for multiple conditions', async ({ page, helpers }) => {
      await page.goto('/#/test/expression-based-logic/or-logic');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('or-logic-test');
      await expect(scenario).toBeVisible();

      const discountInfoField = scenario.locator('#discountInfo');

      // Initially both unchecked - both conditions false, discount should be visible
      await expect(discountInfoField).toBeVisible();

      // Check isStudent - one condition becomes true, discount should be hidden (OR: at least one true)
      await scenario.locator('#isStudent input[type="checkbox"]').check();
      await page.waitForTimeout(500);
      await expect(discountInfoField).toBeHidden();

      // Uncheck isStudent and check isSenior - still one condition true, discount should be hidden
      await scenario.locator('#isStudent input[type="checkbox"]').uncheck();
      await page.waitForTimeout(500);
      await scenario.locator('#isSenior input[type="checkbox"]').check();
      await page.waitForTimeout(500);
      await expect(discountInfoField).toBeHidden();

      // Check both - both conditions true, discount should be hidden
      await scenario.locator('#isStudent input[type="checkbox"]').check();
      await page.waitForTimeout(500);
      await expect(discountInfoField).toBeHidden();

      // Uncheck both - back to both false, discount should be visible again
      await scenario.locator('#isStudent input[type="checkbox"]').uncheck();
      await scenario.locator('#isSenior input[type="checkbox"]').uncheck();
      await page.waitForTimeout(500);
      await expect(discountInfoField).toBeVisible();
    });
  });

  test.describe('Nested AND within OR', () => {
    test('should handle nested AND within OR conditions', async ({ page, helpers }) => {
      await page.goto('/#/test/expression-based-logic/nested-and-within-or');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('nested-and-within-or-test');
      await expect(scenario).toBeVisible();

      const specialOfferField = scenario.locator('#specialOffer');

      // Initially all unchecked - offer should be visible (no conditions met)
      await expect(specialOfferField).toBeVisible();

      // Check only isStudent - offer still visible (AND not satisfied: missing hasValidID)
      await scenario.locator('#isStudent input[type="checkbox"]').check();
      await page.waitForTimeout(500);
      await expect(specialOfferField).toBeVisible();

      // Check hasValidID too - now (isStudent AND hasValidID) is true, offer should be hidden
      await scenario.locator('#hasValidID input[type="checkbox"]').check();
      await page.waitForTimeout(500);
      await expect(specialOfferField).toBeHidden();

      // Uncheck isStudent but keep hasValidID - offer should be visible again
      await scenario.locator('#isStudent input[type="checkbox"]').uncheck();
      await page.waitForTimeout(500);
      await expect(specialOfferField).toBeVisible();

      // Check isSenior - now (isSenior AND hasValidID) is true, offer should be hidden
      await scenario.locator('#isSenior input[type="checkbox"]').check();
      await page.waitForTimeout(500);
      await expect(specialOfferField).toBeHidden();

      // Uncheck hasValidID - both AND conditions false, offer should be visible
      await scenario.locator('#hasValidID input[type="checkbox"]').uncheck();
      await page.waitForTimeout(500);
      await expect(specialOfferField).toBeVisible();
    });
  });

  test.describe('Nested OR within AND', () => {
    test('should handle nested OR within AND conditions', async ({ page, helpers }) => {
      await page.goto('/#/test/expression-based-logic/nested-or-within-and');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('nested-or-within-and-test');
      await expect(scenario).toBeVisible();

      const premiumField = scenario.locator('#premiumFeatures');

      // Initially all unchecked - premium visible (AND not satisfied)
      await expect(premiumField).toBeVisible();

      // Check isPaid - first OR satisfied, but second OR not satisfied
      await scenario.locator('#isPaid input[type="checkbox"]').check();
      await page.waitForTimeout(500);
      await expect(premiumField).toBeVisible();

      // Check isVerified - now both OR conditions true, AND satisfied, premium should be hidden
      await scenario.locator('#isVerified input[type="checkbox"]').check();
      await page.waitForTimeout(500);
      await expect(premiumField).toBeHidden();

      // Uncheck isPaid but check isTrial - first OR still true via isTrial
      await scenario.locator('#isPaid input[type="checkbox"]').uncheck();
      await page.waitForTimeout(500);
      await scenario.locator('#isTrial input[type="checkbox"]').check();
      await page.waitForTimeout(500);
      await expect(premiumField).toBeHidden();

      // Uncheck isVerified but check isAdmin - second OR still true via isAdmin
      await scenario.locator('#isVerified input[type="checkbox"]').uncheck();
      await page.waitForTimeout(500);
      await scenario.locator('#isAdmin input[type="checkbox"]').check();
      await page.waitForTimeout(500);
      await expect(premiumField).toBeHidden();

      // Uncheck isTrial - first OR becomes false, AND not satisfied
      await scenario.locator('#isTrial input[type="checkbox"]').uncheck();
      await page.waitForTimeout(500);
      await expect(premiumField).toBeVisible();
    });
  });

  test.describe('Comparison Operators', () => {
    test('should show underage warning when age < 18', async ({ page, helpers }) => {
      await page.goto('/#/test/expression-based-logic/comparison-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comparison-operators-test');
      await expect(scenario).toBeVisible();

      const ageInput = helpers.getInput(scenario, 'age');
      const underageWarning = scenario.locator('#underageWarning');

      // Initial age is 25 - warning should be hidden (age >= 18)
      await expect(underageWarning).toBeHidden();

      // Set age below 18 - warning should appear
      await helpers.clearAndFill(ageInput, '16');
      await page.waitForTimeout(500);
      await expect(underageWarning).toBeVisible();

      // Set age to exactly 18 - warning should be hidden (greaterOrEqual)
      await helpers.clearAndFill(ageInput, '18');
      await page.waitForTimeout(500);
      await expect(underageWarning).toBeHidden();
    });

    test('should show senior discount when age > 65', async ({ page, helpers }) => {
      await page.goto('/#/test/expression-based-logic/comparison-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comparison-operators-test');
      await expect(scenario).toBeVisible();

      const ageInput = helpers.getInput(scenario, 'age');
      const seniorDiscount = scenario.locator('#seniorDiscount');

      // Initial age is 25 - discount should be hidden
      await expect(seniorDiscount).toBeHidden();

      // Set age to 65 - still hidden (needs > 65, not >=)
      await helpers.clearAndFill(ageInput, '65');
      await page.waitForTimeout(500);
      await expect(seniorDiscount).toBeHidden();

      // Set age to 66 - discount should appear
      await helpers.clearAndFill(ageInput, '66');
      await page.waitForTimeout(500);
      await expect(seniorDiscount).toBeVisible();
    });

    test('should show bulk order note when quantity > 10', async ({ page, helpers }) => {
      await page.goto('/#/test/expression-based-logic/comparison-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comparison-operators-test');
      await expect(scenario).toBeVisible();

      const quantityInput = helpers.getInput(scenario, 'quantity');
      const bulkOrderNote = scenario.locator('#bulkOrderNote');

      // Initial quantity is 5 - note should be hidden
      await expect(bulkOrderNote).toBeHidden();

      // Set quantity to 10 - still hidden
      await helpers.clearAndFill(quantityInput, '10');
      await page.waitForTimeout(500);
      await expect(bulkOrderNote).toBeHidden();

      // Set quantity to 11 - note should appear
      await helpers.clearAndFill(quantityInput, '11');
      await page.waitForTimeout(500);
      await expect(bulkOrderNote).toBeVisible();
    });

    test('should show reactivate option when status != active', async ({ page, helpers }) => {
      await page.goto('/#/test/expression-based-logic/comparison-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comparison-operators-test');
      await expect(scenario).toBeVisible();

      const statusSelect = scenario.locator('#status');
      const reactivateButton = scenario.locator('#reactivateButton');

      // Initial status is active - reactivate should be hidden
      await expect(reactivateButton).toBeHidden();

      // Set status to pending - reactivate should appear
      await statusSelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Pending")').click();
      await page.waitForTimeout(500);
      await expect(reactivateButton).toBeVisible();

      // Set status to inactive - reactivate should still be visible
      await statusSelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Inactive")').click();
      await page.waitForTimeout(500);
      await expect(reactivateButton).toBeVisible();

      // Set status back to active - reactivate should be hidden
      await statusSelect.click();
      await page.waitForTimeout(300);
      await page.getByRole('option', { name: 'Active', exact: true }).click();
      await page.waitForTimeout(500);
      await expect(reactivateButton).toBeHidden();
    });

    test('should show pass/fail messages based on score threshold', async ({ page, helpers }) => {
      await page.goto('/#/test/expression-based-logic/comparison-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('comparison-operators-test');
      await expect(scenario).toBeVisible();

      const scoreInput = helpers.getInput(scenario, 'score');
      const passMessage = scenario.locator('#passMessage');
      const failMessage = scenario.locator('#failMessage');

      // Initial score is 75 - pass visible, fail hidden
      await expect(passMessage).toBeVisible();
      await expect(failMessage).toBeHidden();

      // Set score to exactly 60 - pass visible, fail hidden
      await helpers.clearAndFill(scoreInput, '60');
      await page.waitForTimeout(500);
      await expect(passMessage).toBeVisible();
      await expect(failMessage).toBeHidden();

      // Set score to 59 - pass hidden, fail visible
      await helpers.clearAndFill(scoreInput, '59');
      await page.waitForTimeout(500);
      await expect(passMessage).toBeHidden();
      await expect(failMessage).toBeVisible();
    });
  });

  test.describe('String Operators', () => {
    test('should show corporate note when email contains "company"', async ({ page, helpers }) => {
      await page.goto('/#/test/expression-based-logic/string-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('string-operators-test');
      await expect(scenario).toBeVisible();

      const emailInput = helpers.getInput(scenario, 'email');
      const corporateNote = scenario.locator('#corporateNote');

      // Initial email contains "company" - note should be visible
      await expect(corporateNote).toBeVisible();

      // Change email to not contain "company"
      await helpers.clearAndFill(emailInput, 'user@gmail.com');
      await page.waitForTimeout(500);
      await expect(corporateNote).toBeHidden();

      // Add "company" back
      await helpers.clearAndFill(emailInput, 'user@mycompany.org');
      await page.waitForTimeout(500);
      await expect(corporateNote).toBeVisible();
    });

    test('should show secure/insecure notes based on URL prefix', async ({ page, helpers }) => {
      await page.goto('/#/test/expression-based-logic/string-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('string-operators-test');
      await expect(scenario).toBeVisible();

      const urlInput = helpers.getInput(scenario, 'url');
      const secureNote = scenario.locator('#secureNote');
      const insecureWarning = scenario.locator('#insecureWarning');

      // Initial URL starts with https - secure visible, insecure hidden
      await expect(secureNote).toBeVisible();
      await expect(insecureWarning).toBeHidden();

      // Change URL to http
      await helpers.clearAndFill(urlInput, 'http://example.com');
      await page.waitForTimeout(500);
      await expect(secureNote).toBeHidden();
      await expect(insecureWarning).toBeVisible();

      // Change back to https
      await helpers.clearAndFill(urlInput, 'https://secure.example.com');
      await page.waitForTimeout(500);
      await expect(secureNote).toBeVisible();
      await expect(insecureWarning).toBeHidden();
    });

    test('should show PDF viewer when filename ends with .pdf', async ({ page, helpers }) => {
      await page.goto('/#/test/expression-based-logic/string-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('string-operators-test');
      await expect(scenario).toBeVisible();

      const filenameInput = helpers.getInput(scenario, 'filename');
      const pdfViewer = scenario.locator('#pdfViewer');
      const imageViewer = scenario.locator('#imageViewer');

      // Initial filename ends with .pdf - PDF viewer visible, image viewer hidden
      await expect(pdfViewer).toBeVisible();
      await expect(imageViewer).toBeHidden();

      // Change to .jpg
      await helpers.clearAndFill(filenameInput, 'photo.jpg');
      await page.waitForTimeout(500);
      await expect(pdfViewer).toBeHidden();
      await expect(imageViewer).toBeVisible();

      // Change to .png
      await helpers.clearAndFill(filenameInput, 'screenshot.png');
      await page.waitForTimeout(500);
      await expect(pdfViewer).toBeHidden();
      await expect(imageViewer).toBeVisible();

      // Change to .txt (neither)
      await helpers.clearAndFill(filenameInput, 'notes.txt');
      await page.waitForTimeout(500);
      await expect(pdfViewer).toBeHidden();
      await expect(imageViewer).toBeHidden();

      // Change back to .pdf
      await helpers.clearAndFill(filenameInput, 'report.pdf');
      await page.waitForTimeout(500);
      await expect(pdfViewer).toBeVisible();
      await expect(imageViewer).toBeHidden();
    });

    test('should show international shipping note when country != US', async ({ page, helpers }) => {
      await page.goto('/#/test/expression-based-logic/string-operators');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('string-operators-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const internationalShipping = scenario.locator('#internationalShipping');

      // Initial country is US - international shipping hidden
      await expect(internationalShipping).toBeHidden();

      // Change to UK
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United Kingdom")').click();
      await page.waitForTimeout(500);
      await expect(internationalShipping).toBeVisible();

      // Change to Canada
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Canada")').click();
      await page.waitForTimeout(500);
      await expect(internationalShipping).toBeVisible();

      // Change back to US
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await page.waitForTimeout(500);
      await expect(internationalShipping).toBeHidden();
    });
  });
});
