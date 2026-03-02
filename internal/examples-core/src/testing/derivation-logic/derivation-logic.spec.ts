import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { testUrl } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck({
  ignorePatterns: [/Failed to load resource/],
});

test.describe('Value Derivation Logic Tests', () => {
  test.describe('Static Value Derivation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/derivation-logic/static-value'));
      await page.waitForLoadState('networkidle');
    });

    test('should derive phone prefix and currency from country selection', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('static-value-derivation-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const phonePrefixInput = helpers.getInput(scenario, 'phonePrefix');
      const currencyInput = helpers.getInput(scenario, 'currency');

      // Select United States
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await page.waitForTimeout(500);

      await expect(phonePrefixInput).toHaveValue('+1');
      await expect(currencyInput).toHaveValue('USD');

      // Select United Kingdom
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United Kingdom")').click();
      await page.waitForTimeout(500);

      await expect(phonePrefixInput).toHaveValue('+44');
      await expect(currencyInput).toHaveValue('GBP');

      // Select Germany
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Germany")').click();
      await page.waitForTimeout(500);

      await expect(phonePrefixInput).toHaveValue('+49');
      await expect(currencyInput).toHaveValue('EUR');

      // Select Japan
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Japan")').click();
      await page.waitForTimeout(500);

      await expect(phonePrefixInput).toHaveValue('+81');
      await expect(currencyInput).toHaveValue('JPY');
    });
  });

  test.describe('Expression-Based Derivation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/derivation-logic/expression'));
      await page.waitForLoadState('networkidle');
    });

    test('should calculate subtotal, tax, and total from quantity and price', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('expression-derivation-test');
      await expect(scenario).toBeVisible();

      const quantityInput = helpers.getInput(scenario, 'quantity');
      const unitPriceInput = helpers.getInput(scenario, 'unitPrice');
      const subtotalInput = helpers.getInput(scenario, 'subtotal');
      const taxInput = helpers.getInput(scenario, 'tax');
      const totalInput = helpers.getInput(scenario, 'total');

      // Initial values: quantity=1, unitPrice=10, taxRate=10
      // subtotal = 1 * 10 = 10
      // tax = 10 * 10 / 100 = 1
      // total = 10 + 1 = 11
      await expect(subtotalInput).toHaveValue('10');
      await expect(taxInput).toHaveValue('1');
      await expect(totalInput).toHaveValue('11');

      // Change quantity to 5
      await helpers.clearAndFill(quantityInput, '5');
      await page.waitForTimeout(500);

      // subtotal = 5 * 10 = 50
      // tax = 50 * 10 / 100 = 5
      // total = 50 + 5 = 55
      await expect(subtotalInput).toHaveValue('50');
      await expect(taxInput).toHaveValue('5');
      await expect(totalInput).toHaveValue('55');

      // Change unit price to 20
      await helpers.clearAndFill(unitPriceInput, '20');
      await page.waitForTimeout(500);

      // subtotal = 5 * 20 = 100
      // tax = 100 * 10 / 100 = 10
      // total = 100 + 10 = 110
      await expect(subtotalInput).toHaveValue('100');
      await expect(taxInput).toHaveValue('10');
      await expect(totalInput).toHaveValue('110');
    });

    test('should concatenate first and last name into full name', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('expression-derivation-test');
      await expect(scenario).toBeVisible();

      const firstNameInput = helpers.getInput(scenario, 'firstName');
      const lastNameInput = helpers.getInput(scenario, 'lastName');
      const fullNameInput = helpers.getInput(scenario, 'fullName');

      // Enter first name
      await helpers.fillInput(firstNameInput, 'John');
      await page.waitForTimeout(500);
      await expect(fullNameInput).toHaveValue('John ');

      // Enter last name
      await helpers.fillInput(lastNameInput, 'Doe');
      await page.waitForTimeout(500);
      await expect(fullNameInput).toHaveValue('John Doe');

      // Change first name
      await helpers.clearAndFill(firstNameInput, 'Jane');
      await page.waitForTimeout(500);
      await expect(fullNameInput).toHaveValue('Jane Doe');
    });
  });

  test.describe('Function-Based Derivation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/derivation-logic/function'));
      await page.waitForLoadState('networkidle');
    });

    test('should calculate discounted price using custom function', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('function-derivation-test');
      await expect(scenario).toBeVisible();

      const priceInput = helpers.getInput(scenario, 'price');
      const discountCodeSelect = scenario.locator('#discountCode');
      const discountedPriceInput = helpers.getInput(scenario, 'discountedPrice');

      // Initial price is 100, no discount
      await expect(discountedPriceInput).toHaveValue('100');

      // Apply SAVE10 (10% off)
      await discountCodeSelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("SAVE10")').click();
      await page.waitForTimeout(500);

      await expect(discountedPriceInput).toHaveValue('90');

      // Apply SAVE25 (25% off)
      await discountCodeSelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("SAVE25")').click();
      await page.waitForTimeout(500);

      await expect(discountedPriceInput).toHaveValue('75');

      // Apply HALF (50% off)
      await discountCodeSelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("HALF")').click();
      await page.waitForTimeout(500);

      await expect(discountedPriceInput).toHaveValue('50');

      // Change base price to 200
      await helpers.clearAndFill(priceInput, '200');
      await page.waitForTimeout(500);

      // 200 * 0.5 = 100
      await expect(discountedPriceInput).toHaveValue('100');
    });
  });

  test.describe('Conditional Derivation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/derivation-logic/conditional'));
      await page.waitForLoadState('networkidle');
    });

    test('should derive discount percentage and free shipping based on membership type', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('conditional-derivation-test');
      await expect(scenario).toBeVisible();

      const membershipSelect = scenario.locator('#membershipType');
      const discountInput = helpers.getInput(scenario, 'discountPercent');
      // Material toggle uses a button with role="switch" for the actual toggle control
      const freeShippingToggle = scenario.locator('#freeShipping button[role="switch"]');

      // Initial: Basic membership
      await expect(discountInput).toHaveValue('0');
      await expect(freeShippingToggle).not.toBeChecked();

      // Select Premium
      await membershipSelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Premium")').click();
      await page.waitForTimeout(500);

      await expect(discountInput).toHaveValue('15');
      await expect(freeShippingToggle).toBeChecked();

      // Select VIP
      await membershipSelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("VIP")').click();
      await page.waitForTimeout(500);

      await expect(discountInput).toHaveValue('30');
      await expect(freeShippingToggle).toBeChecked();

      // Back to Basic
      await membershipSelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Basic")').click();
      await page.waitForTimeout(500);

      await expect(discountInput).toHaveValue('0');
      await expect(freeShippingToggle).not.toBeChecked();
    });

    test('should derive age category based on age value', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('conditional-derivation-test');
      await expect(scenario).toBeVisible();

      const ageInput = helpers.getInput(scenario, 'age');
      const ageCategoryInput = helpers.getInput(scenario, 'ageCategory');

      // Initial: Age 25 = Adult
      await expect(ageCategoryInput).toHaveValue('Adult');

      // Change to 15 = Minor
      await helpers.clearAndFill(ageInput, '15');
      await page.waitForTimeout(500);
      await expect(ageCategoryInput).toHaveValue('Minor');

      // Change to 17 = Minor (boundary)
      await helpers.clearAndFill(ageInput, '17');
      await page.waitForTimeout(500);
      await expect(ageCategoryInput).toHaveValue('Minor');

      // Change to 18 = Adult (boundary)
      await helpers.clearAndFill(ageInput, '18');
      await page.waitForTimeout(500);
      await expect(ageCategoryInput).toHaveValue('Adult');

      // Change to 64 = Adult
      await helpers.clearAndFill(ageInput, '64');
      await page.waitForTimeout(500);
      await expect(ageCategoryInput).toHaveValue('Adult');

      // Change to 65 = Senior (boundary)
      await helpers.clearAndFill(ageInput, '65');
      await page.waitForTimeout(500);
      await expect(ageCategoryInput).toHaveValue('Senior');

      // Change to 70 = Senior
      await helpers.clearAndFill(ageInput, '70');
      await page.waitForTimeout(500);
      await expect(ageCategoryInput).toHaveValue('Senior');
    });
  });

  test.describe('Self-Transform Derivation (Debounced)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/derivation-logic/self-transform'));
      await page.waitForLoadState('networkidle');
    });

    test('should lowercase email after debounce', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('self-transform-test');
      await expect(scenario).toBeVisible();

      const emailInput = helpers.getInput(scenario, 'email');

      // Type mixed case email
      await emailInput.fill('John.Doe@EXAMPLE.COM');

      // Wait for debounce (500ms default + buffer)
      await page.waitForTimeout(700);

      // Value should be lowercase after debounce completes
      await expect(emailInput).toHaveValue('john.doe@example.com');
    });

    test('should trim username after debounce', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('self-transform-test');
      await expect(scenario).toBeVisible();

      const usernameInput = helpers.getInput(scenario, 'username');

      // Type username with spaces
      await usernameInput.fill('  johndoe  ');

      // Wait for debounce
      await page.waitForTimeout(700);

      // Value should be trimmed after debounce
      await expect(usernameInput).toHaveValue('johndoe');
    });

    test('should format phone number after debounce', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('self-transform-test');
      await expect(scenario).toBeVisible();

      const phoneInput = helpers.getInput(scenario, 'phone');

      // Type 10-digit phone number
      await phoneInput.fill('5551234567');

      // Wait for debounce
      await page.waitForTimeout(700);

      // Value should be formatted after debounce
      await expect(phoneInput).toHaveValue('(555) 123-4567');
    });

    test('should mask credit card after debounce', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('self-transform-test');
      await expect(scenario).toBeVisible();

      const creditCardInput = helpers.getInput(scenario, 'creditCard');

      // Type credit card number
      await creditCardInput.fill('4111111111111111');

      // Wait for debounce
      await page.waitForTimeout(700);

      // Value should be masked after debounce (showing only last 4 digits)
      await expect(creditCardInput).toHaveValue('************1111');
    });
  });

  test.describe('Chain Derivation (A -> B -> C)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/derivation-logic/chain'));
      await page.waitForLoadState('networkidle');
    });

    test('should cascade price calculations through chain derivation', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('chain-derivation-test');
      await expect(scenario).toBeVisible();

      const basePriceInput = helpers.getInput(scenario, 'basePrice');
      const priceWithMarkupInput = helpers.getInput(scenario, 'priceWithMarkup');
      const priceWithTaxInput = helpers.getInput(scenario, 'priceWithTax');
      const shippingCostInput = helpers.getInput(scenario, 'shippingCost');
      const finalPriceInput = helpers.getInput(scenario, 'finalPrice');

      // Initial values:
      // basePrice = 100
      // priceWithMarkup = 100 * 1.2 = 120
      // priceWithTax = 120 * 1.1 = 132
      // shippingCost = 10
      // finalPrice = 132 + 10 = 142
      await expect(priceWithMarkupInput).toHaveValue('120');
      await expect(priceWithTaxInput).toHaveValue('132');
      await expect(finalPriceInput).toHaveValue('142');

      // Change base price to 200
      await helpers.clearAndFill(basePriceInput, '200');
      await page.waitForTimeout(500);

      // priceWithMarkup = 200 * 1.2 = 240
      // priceWithTax = 240 * 1.1 = 264
      // finalPrice = 264 + 10 = 274
      await expect(priceWithMarkupInput).toHaveValue('240');
      await expect(priceWithTaxInput).toHaveValue('264');
      await expect(finalPriceInput).toHaveValue('274');

      // Change shipping cost to 20
      await helpers.clearAndFill(shippingCostInput, '20');
      await page.waitForTimeout(500);

      // finalPrice = 264 + 20 = 284
      await expect(finalPriceInput).toHaveValue('284');
    });

    test('should cascade initials to display name', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('chain-derivation-test');
      await expect(scenario).toBeVisible();

      const firstNameInput = helpers.getInput(scenario, 'firstName');
      const lastNameInput = helpers.getInput(scenario, 'lastName');
      const initialsInput = helpers.getInput(scenario, 'initials');
      const displayNameInput = helpers.getInput(scenario, 'displayName');

      // Initial: John Doe -> JD -> JD - John Doe
      await expect(initialsInput).toHaveValue('JD');
      await expect(displayNameInput).toHaveValue('JD - John Doe');

      // Change first name to Jane
      await helpers.clearAndFill(firstNameInput, 'Jane');
      await page.waitForTimeout(500);

      // initials = JD, displayName = JD - Jane Doe
      await expect(initialsInput).toHaveValue('JD');
      await expect(displayNameInput).toHaveValue('JD - Jane Doe');

      // Change last name to Smith
      await helpers.clearAndFill(lastNameInput, 'Smith');
      await page.waitForTimeout(500);

      // initials = JS, displayName = JS - Jane Smith
      await expect(initialsInput).toHaveValue('JS');
      await expect(displayNameInput).toHaveValue('JS - Jane Smith');
    });
  });

  test.describe('Shorthand Derivation Property', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/derivation-logic/shorthand'));
      await page.waitForLoadState('networkidle');
    });

    test('should calculate area from width and height using shorthand derivation', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('shorthand-derivation-test');
      await expect(scenario).toBeVisible();

      const widthInput = helpers.getInput(scenario, 'width');
      const heightInput = helpers.getInput(scenario, 'height');
      const areaInput = helpers.getInput(scenario, 'area');

      // Initial: 10 * 5 = 50
      await expect(areaInput).toHaveValue('50');

      // Change width to 20
      await helpers.clearAndFill(widthInput, '20');
      await page.waitForTimeout(500);

      // 20 * 5 = 100
      await expect(areaInput).toHaveValue('100');

      // Change height to 10
      await helpers.clearAndFill(heightInput, '10');
      await page.waitForTimeout(500);

      // 20 * 10 = 200
      await expect(areaInput).toHaveValue('200');
    });

    test('should calculate total from price and quantity using shorthand derivation', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('shorthand-derivation-test');
      await expect(scenario).toBeVisible();

      const priceInput = helpers.getInput(scenario, 'price');
      const quantityInput = helpers.getInput(scenario, 'quantity');
      const totalInput = helpers.getInput(scenario, 'total');

      // Initial: 100 * 2 = 200
      await expect(totalInput).toHaveValue('200');

      // Change price to 150
      await helpers.clearAndFill(priceInput, '150');
      await page.waitForTimeout(500);
      await expect(totalInput).toHaveValue('300');

      // Change quantity to 4
      await helpers.clearAndFill(quantityInput, '4');
      await page.waitForTimeout(500);
      await expect(totalInput).toHaveValue('600');
    });

    test('should calculate weekly salary from hours and rate', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('shorthand-derivation-test');
      await expect(scenario).toBeVisible();

      const hoursInput = helpers.getInput(scenario, 'hours');
      const hourlyRateInput = helpers.getInput(scenario, 'hourlyRate');
      const salaryInput = helpers.getInput(scenario, 'salary');

      // Initial: 40 * 25 = 1000
      await expect(salaryInput).toHaveValue('1000');

      // Change hours to 50
      await helpers.clearAndFill(hoursInput, '50');
      await page.waitForTimeout(500);

      // 50 * 25 = 1250
      await expect(salaryInput).toHaveValue('1250');

      // Change rate to 30
      await helpers.clearAndFill(hourlyRateInput, '30');
      await page.waitForTimeout(500);

      // 50 * 30 = 1500
      await expect(salaryInput).toHaveValue('1500');
    });
  });

  test.describe('Array Field Derivation with Relative Paths', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/derivation-logic/array-field'));
      await page.waitForLoadState('networkidle');
    });

    test('should calculate line total for each array item independently', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-field-derivation-test');
      await expect(scenario).toBeVisible();

      // Get first line item fields using nth() since array items have index suffixes (e.g., quantity_0)
      // Use [id^="fieldName"] to match elements whose ID starts with the field name
      const quantityInputs = scenario.locator('[id^="quantity"] input');
      const unitPriceInputs = scenario.locator('[id^="unitPrice"] input');
      const lineTotalInputs = scenario.locator('[id^="lineTotal"] input');

      const firstQuantity = quantityInputs.nth(0);
      const firstUnitPrice = unitPriceInputs.nth(0);
      const firstLineTotal = lineTotalInputs.nth(0);
      const secondLineTotal = lineTotalInputs.nth(1);

      // Wait for initial render
      await expect(firstLineTotal).toBeVisible();

      // Initial values for first item: quantity=2, unitPrice=50, lineTotal=100
      await expect(firstLineTotal).toHaveValue('100');

      // Change first item quantity to 5 using the helper that works for other tests
      await helpers.clearAndFill(firstQuantity, '5');
      await page.waitForTimeout(500);

      // 5 * 50 = 250
      await expect(firstLineTotal).toHaveValue('250');

      // Change first item unit price to 100
      await helpers.clearAndFill(firstUnitPrice, '100');
      await page.waitForTimeout(500);

      // 5 * 100 = 500
      await expect(firstLineTotal).toHaveValue('500');

      // Verify second item is still correct (quantity=3, unitPrice=30, lineTotal=90)
      await expect(secondLineTotal).toHaveValue('90');
    });

    test('should add array item and verify derivation calculates correctly', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-field-derivation-test');
      await expect(scenario).toBeVisible();

      const lineTotalInputs = scenario.locator('[id^="lineTotal"] input');
      const addButton = scenario.locator('#addLineItem button');

      // Initial: 2 items
      await expect(lineTotalInputs).toHaveCount(2);

      // Click add button to add a new item
      await addButton.click();
      await page.waitForTimeout(500);

      // Should now have 3 items
      await expect(lineTotalInputs).toHaveCount(3);

      // Fill the new item's quantity and unit price (using prefix selector for index-suffixed IDs)
      const quantityInputs = scenario.locator('[id^="quantity"] input');
      const unitPriceInputs = scenario.locator('[id^="unitPrice"] input');
      const newQuantity = quantityInputs.nth(2);
      const newUnitPrice = unitPriceInputs.nth(2);
      const newLineTotal = lineTotalInputs.nth(2);

      // Fill new item: quantity=4, unitPrice=25
      await helpers.clearAndFill(newQuantity, '4');
      await page.waitForTimeout(300);
      await helpers.clearAndFill(newUnitPrice, '25');
      await page.waitForTimeout(500);

      // Verify new item's lineTotal = 4 * 25 = 100
      await expect(newLineTotal).toHaveValue('100');

      // Verify existing items are unaffected
      const firstLineTotal = lineTotalInputs.nth(0);
      const secondLineTotal = lineTotalInputs.nth(1);
      await expect(firstLineTotal).toHaveValue('100'); // 2 * 50
      await expect(secondLineTotal).toHaveValue('90'); // 3 * 30
    });

    test('should remove array item and verify remaining derivations', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-field-derivation-test');
      await expect(scenario).toBeVisible();

      const lineTotalInputs = scenario.locator('[id^="lineTotal"] input');
      const removeButton = scenario.locator('#removeLineItem button');

      // Initial: 2 items
      await expect(lineTotalInputs).toHaveCount(2);

      // Verify initial values
      const firstLineTotal = lineTotalInputs.nth(0);
      const secondLineTotal = lineTotalInputs.nth(1);
      await expect(firstLineTotal).toHaveValue('100'); // 2 * 50
      await expect(secondLineTotal).toHaveValue('90'); // 3 * 30

      // Remove last item
      await removeButton.click();
      await page.waitForTimeout(500);

      // Should now have 1 item
      await expect(lineTotalInputs).toHaveCount(1);

      // Verify remaining item still has correct derivation
      await expect(firstLineTotal).toHaveValue('100'); // 2 * 50
    });

    test('should clear all items and re-add with correct derivations', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-field-derivation-test');
      await expect(scenario).toBeVisible();

      const lineTotalInputs = scenario.locator('[id^="lineTotal"] input');
      const addButton = scenario.locator('#addLineItem button');
      const removeButton = scenario.locator('#removeLineItem button');

      // Remove all items
      await removeButton.click();
      await page.waitForTimeout(300);
      await removeButton.click();
      await page.waitForTimeout(500);

      // Should have 0 items
      await expect(lineTotalInputs).toHaveCount(0);

      // Add new item
      await addButton.click();
      await page.waitForTimeout(500);

      // Should have 1 item
      await expect(lineTotalInputs).toHaveCount(1);

      // Fill the new item (using prefix selector for index-suffixed IDs)
      const quantityInputs = scenario.locator('[id^="quantity"] input');
      const unitPriceInputs = scenario.locator('[id^="unitPrice"] input');
      await helpers.clearAndFill(quantityInputs.nth(0), '10');
      await page.waitForTimeout(300);
      await helpers.clearAndFill(unitPriceInputs.nth(0), '15');
      await page.waitForTimeout(500);

      // Verify derivation works on fresh item: 10 * 15 = 150
      await expect(lineTotalInputs.nth(0)).toHaveValue('150');
    });

    test('should maintain independence of array item derivations', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-field-derivation-test');
      await expect(scenario).toBeVisible();

      const quantityInputs = scenario.locator('[id^="quantity"] input');
      const lineTotalInputs = scenario.locator('[id^="lineTotal"] input');

      // Verify initial state
      const firstLineTotal = lineTotalInputs.nth(0);
      const secondLineTotal = lineTotalInputs.nth(1);
      await expect(firstLineTotal).toHaveValue('100'); // 2 * 50
      await expect(secondLineTotal).toHaveValue('90'); // 3 * 30

      // Modify second item only
      await helpers.clearAndFill(quantityInputs.nth(1), '10');
      await page.waitForTimeout(500);

      // Second item should update: 10 * 30 = 300
      await expect(secondLineTotal).toHaveValue('300');

      // First item should remain unchanged
      await expect(firstLineTotal).toHaveValue('100');

      // Now modify first item
      await helpers.clearAndFill(quantityInputs.nth(0), '7');
      await page.waitForTimeout(500);

      // First item should update: 7 * 50 = 350
      await expect(firstLineTotal).toHaveValue('350');

      // Second item should remain at its updated value
      await expect(secondLineTotal).toHaveValue('300');
    });
  });

  test.describe('Derivation in Group', () => {
    test.skip(true, 'Library limitation: derivation expressions inside group containers do not evaluate correctly');
    test('should derive fullName from firstName and lastName inside a group', async ({ page, helpers }) => {
      await page.goto(testUrl('/test/derivation-logic/derivation-in-group'));
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('derivation-in-group');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const firstNameInput = scenario.locator('#person #firstName input');
      const lastNameInput = scenario.locator('#person #lastName input');
      const fullNameInput = scenario.locator('#person #fullName input');

      await expect(firstNameInput).toBeVisible({ timeout: 5000 });

      // Type first name
      await firstNameInput.fill('John');
      await page.waitForTimeout(500);
      await expect(fullNameInput).toHaveValue('John ', { timeout: 5000 });

      // Type last name
      await lastNameInput.fill('Doe');
      await page.waitForTimeout(500);
      await expect(fullNameInput).toHaveValue('John Doe', { timeout: 5000 });

      // Submit and verify
      const data = await helpers.submitFormAndCapture(scenario);
      const person = data['person'] as Record<string, unknown>;
      expect(person['fullName']).toBe('John Doe');
    });
  });

  test.describe('Stop On User Override', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/derivation-logic/stop-on-user-override'));
      await page.waitForLoadState('networkidle');
    });

    test('should auto-derive displayName from firstName and lastName', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('stop-on-user-override-test');
      await expect(scenario).toBeVisible();

      const firstNameInput = helpers.getInput(scenario, 'firstName');
      const lastNameInput = helpers.getInput(scenario, 'lastName');
      const displayNameInput = helpers.getInput(scenario, 'displayName');

      // Enter first name
      await helpers.fillInput(firstNameInput, 'John');
      await page.waitForTimeout(500);
      await expect(displayNameInput).toHaveValue('John ');

      // Enter last name
      await helpers.fillInput(lastNameInput, 'Doe');
      await page.waitForTimeout(500);
      await expect(displayNameInput).toHaveValue('John Doe');
    });

    test('should stop deriving after user manually edits displayName', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('stop-on-user-override-test');
      await expect(scenario).toBeVisible();

      const firstNameInput = helpers.getInput(scenario, 'firstName');
      const lastNameInput = helpers.getInput(scenario, 'lastName');
      const displayNameInput = helpers.getInput(scenario, 'displayName');

      // First derive a value
      await helpers.fillInput(firstNameInput, 'John');
      await helpers.fillInput(lastNameInput, 'Doe');
      await page.waitForTimeout(500);
      await expect(displayNameInput).toHaveValue('John Doe');

      // User manually overrides displayName
      await helpers.clearAndFill(displayNameInput, 'Custom Name');
      await page.waitForTimeout(500);

      // Change firstName — displayName should NOT update
      await helpers.clearAndFill(firstNameInput, 'Jane');
      await page.waitForTimeout(500);
      await expect(displayNameInput).toHaveValue('Custom Name');
    });

    test('should propagate chain derivation: firstName/lastName → displayName → greeting', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('stop-on-user-override-test');
      await expect(scenario).toBeVisible();

      const firstNameInput = helpers.getInput(scenario, 'firstName');
      const lastNameInput = helpers.getInput(scenario, 'lastName');
      const displayNameInput = helpers.getInput(scenario, 'displayName');
      const greetingInput = helpers.getInput(scenario, 'greeting');

      // Enter first name and last name
      await helpers.fillInput(firstNameInput, 'John');
      await helpers.fillInput(lastNameInput, 'Doe');
      await page.waitForTimeout(500);

      await expect(displayNameInput).toHaveValue('John Doe');
      await expect(greetingInput).toHaveValue('Hello, John Doe');

      // Change firstName — both displayName and greeting should update
      await helpers.clearAndFill(firstNameInput, 'Jane');
      await page.waitForTimeout(500);

      await expect(displayNameInput).toHaveValue('Jane Doe');
      await expect(greetingInput).toHaveValue('Hello, Jane Doe');
    });

    test('should not treat derivation-applied values as user override in chain', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('stop-on-user-override-test');
      await expect(scenario).toBeVisible();

      const firstNameInput = helpers.getInput(scenario, 'firstName');
      const lastNameInput = helpers.getInput(scenario, 'lastName');
      const displayNameInput = helpers.getInput(scenario, 'displayName');
      const greetingInput = helpers.getInput(scenario, 'greeting');

      // Derive displayName via firstName/lastName
      await helpers.fillInput(firstNameInput, 'John');
      await helpers.fillInput(lastNameInput, 'Doe');
      await page.waitForTimeout(500);
      await expect(greetingInput).toHaveValue('Hello, John Doe');

      // Change firstName — displayName updates via derivation (not user edit),
      // so greeting's derivation should keep running
      await helpers.clearAndFill(firstNameInput, 'Alice');
      await page.waitForTimeout(500);

      await expect(displayNameInput).toHaveValue('Alice Doe');
      await expect(greetingInput).toHaveValue('Hello, Alice Doe');

      // Now manually override greeting — it should stop deriving
      await helpers.clearAndFill(greetingInput, 'Custom Greeting');
      await page.waitForTimeout(500);

      await helpers.clearAndFill(firstNameInput, 'Bob');
      await page.waitForTimeout(500);

      await expect(displayNameInput).toHaveValue('Bob Doe');
      await expect(greetingInput).toHaveValue('Custom Greeting');
    });

    test('should not re-engage after user clears the derived field', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('stop-on-user-override-test');
      await expect(scenario).toBeVisible();

      const firstNameInput = helpers.getInput(scenario, 'firstName');
      const lastNameInput = helpers.getInput(scenario, 'lastName');
      const displayNameInput = helpers.getInput(scenario, 'displayName');

      // Derive a value first
      await helpers.fillInput(firstNameInput, 'John');
      await helpers.fillInput(lastNameInput, 'Doe');
      await page.waitForTimeout(500);
      await expect(displayNameInput).toHaveValue('John Doe');

      // User clears the field (still a user edit — field is dirty)
      await displayNameInput.clear();
      await page.waitForTimeout(500);

      // Change firstName — derivation should still NOT re-run
      await helpers.clearAndFill(firstNameInput, 'Jane');
      await page.waitForTimeout(500);
      await expect(displayNameInput).toHaveValue('');
    });

    test('should submit the user-overridden value correctly', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('stop-on-user-override-test');
      await expect(scenario).toBeVisible();

      const firstNameInput = helpers.getInput(scenario, 'firstName');
      const lastNameInput = helpers.getInput(scenario, 'lastName');
      const displayNameInput = helpers.getInput(scenario, 'displayName');

      // Derive a value
      await helpers.fillInput(firstNameInput, 'John');
      await helpers.fillInput(lastNameInput, 'Doe');
      await page.waitForTimeout(500);

      // Override it
      await helpers.clearAndFill(displayNameInput, 'My Custom Name');
      await page.waitForTimeout(500);

      // Change firstName to verify override persists
      await helpers.clearAndFill(firstNameInput, 'Jane');
      await page.waitForTimeout(500);

      // Submit and verify the overridden value is submitted
      const data = await helpers.submitFormAndCapture(scenario);
      expect(data['displayName']).toBe('My Custom Name');
    });
  });

  test.describe('Re-engage On Dependency Change', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/derivation-logic/re-engage-on-dependency-change'));
      await page.waitForLoadState('networkidle');
    });

    test('should auto-derive phonePrefix from country selection', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('re-engage-on-dependency-change-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const phonePrefixInput = helpers.getInput(scenario, 'phonePrefix');

      // Select United States
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await page.waitForTimeout(500);

      await expect(phonePrefixInput).toHaveValue('+1');

      // Select United Kingdom
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United Kingdom")').click();
      await page.waitForTimeout(500);

      await expect(phonePrefixInput).toHaveValue('+44');

      // Select Germany
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Germany")').click();
      await page.waitForTimeout(500);

      await expect(phonePrefixInput).toHaveValue('+49');
    });

    test('should re-engage derivation when dependency changes after user override', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('re-engage-on-dependency-change-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const phonePrefixInput = helpers.getInput(scenario, 'phonePrefix');

      // Select United States → derives +1
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await page.waitForTimeout(500);
      await expect(phonePrefixInput).toHaveValue('+1');

      // User manually overrides phonePrefix
      await helpers.clearAndFill(phonePrefixInput, '+99');
      await page.waitForTimeout(500);
      await expect(phonePrefixInput).toHaveValue('+99');

      // Change country → derivation should re-engage
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United Kingdom")').click();
      await page.waitForTimeout(500);

      await expect(phonePrefixInput).toHaveValue('+44');
    });

    test('should handle multiple override/re-engage cycles', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('re-engage-on-dependency-change-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const phonePrefixInput = helpers.getInput(scenario, 'phonePrefix');

      // Cycle 1: Select US → override → change to UK → re-engages
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await page.waitForTimeout(500);
      await expect(phonePrefixInput).toHaveValue('+1');

      await helpers.clearAndFill(phonePrefixInput, '+99');
      await page.waitForTimeout(500);

      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United Kingdom")').click();
      await page.waitForTimeout(500);
      await expect(phonePrefixInput).toHaveValue('+44');

      // Cycle 2: Override again → change to Germany → re-engages again
      await helpers.clearAndFill(phonePrefixInput, '+88');
      await page.waitForTimeout(500);
      await expect(phonePrefixInput).toHaveValue('+88');

      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Germany")').click();
      await page.waitForTimeout(500);
      await expect(phonePrefixInput).toHaveValue('+49');
    });

    test('should persist override without reEngageOnDependencyChange', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('re-engage-on-dependency-change-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const phonePrefixInput = helpers.getInput(scenario, 'phonePrefix');
      const permanentPrefixInput = helpers.getInput(scenario, 'permanentPrefix');

      // Select US → both derive +1
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await page.waitForTimeout(500);
      await expect(phonePrefixInput).toHaveValue('+1');
      await expect(permanentPrefixInput).toHaveValue('+1');

      // Override permanentPrefix
      await helpers.clearAndFill(permanentPrefixInput, '+99');
      await page.waitForTimeout(500);

      // Change country to UK → phonePrefix re-engages to +44, permanentPrefix stays overridden
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United Kingdom")').click();
      await page.waitForTimeout(500);

      await expect(phonePrefixInput).toHaveValue('+44');
      await expect(permanentPrefixInput).toHaveValue('+99');
    });

    test('should not re-engage when same dependency value is re-selected', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('re-engage-on-dependency-change-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const phonePrefixInput = helpers.getInput(scenario, 'phonePrefix');

      // Select US → derives +1
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await page.waitForTimeout(500);
      await expect(phonePrefixInput).toHaveValue('+1');

      // Override phonePrefix
      await helpers.clearAndFill(phonePrefixInput, '+99');
      await page.waitForTimeout(500);

      // Re-select US (same value) → should NOT re-engage since value didn't change
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await page.waitForTimeout(500);

      await expect(phonePrefixInput).toHaveValue('+99');
    });

    test('should handle static value + condition with stopOnUserOverride (no reEngage)', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('re-engage-on-dependency-change-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const permanentPrefixInput = helpers.getInput(scenario, 'permanentPrefix');

      // Select US → permanentPrefix gets +1
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await page.waitForTimeout(500);
      await expect(permanentPrefixInput).toHaveValue('+1');

      // Override permanentPrefix
      await helpers.clearAndFill(permanentPrefixInput, '+77');
      await page.waitForTimeout(500);

      // Change to UK → permanentPrefix stays overridden (no reEngageOnDependencyChange)
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United Kingdom")').click();
      await page.waitForTimeout(500);
      await expect(permanentPrefixInput).toHaveValue('+77');

      // Change to DE → still overridden
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Germany")').click();
      await page.waitForTimeout(500);
      await expect(permanentPrefixInput).toHaveValue('+77');
    });
  });

  test.describe('Field State Condition', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/derivation-logic/field-state-condition'));
      await page.waitForLoadState('networkidle');
    });

    test('should derive emailStatus as DIRTY when email is edited', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('field-state-condition-test');
      await expect(scenario).toBeVisible();

      const emailInput = helpers.getInput(scenario, 'email');
      const emailStatusInput = helpers.getInput(scenario, 'emailStatus');

      // Initially email is pristine → emailStatus should be PRISTINE
      await expect(emailStatusInput).toHaveValue('PRISTINE');

      // Type in email → makes it dirty → emailStatus should become DIRTY
      await helpers.fillInput(emailInput, 'test@example.com');
      await page.waitForTimeout(500);

      await expect(emailStatusInput).toHaveValue('DIRTY');
    });

    test('should derive usernameStatus as TOUCHED when username is focused and blurred', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('field-state-condition-test');
      await expect(scenario).toBeVisible();

      const usernameInput = helpers.getInput(scenario, 'username');
      const usernameStatusInput = helpers.getInput(scenario, 'usernameStatus');

      // Initially username is untouched → usernameStatus should be UNTOUCHED
      await expect(usernameStatusInput).toHaveValue('UNTOUCHED');

      // Focus and blur username → makes it touched (but no value change → no derivation yet)
      await usernameInput.focus();
      await usernameInput.blur();
      await page.waitForTimeout(300);

      // Type in username → value change triggers derivation, which now reads touched=true
      await helpers.fillInput(usernameInput, 'testuser');
      await page.waitForTimeout(500);

      await expect(usernameStatusInput).toHaveValue('TOUCHED');
    });

    test('should react to dirty and touched independently', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('field-state-condition-test');
      await expect(scenario).toBeVisible();

      const emailInput = helpers.getInput(scenario, 'email');
      const usernameInput = helpers.getInput(scenario, 'username');
      const emailStatusInput = helpers.getInput(scenario, 'emailStatus');
      const usernameStatusInput = helpers.getInput(scenario, 'usernameStatus');

      // Both should be in initial state
      await expect(emailStatusInput).toHaveValue('PRISTINE');
      await expect(usernameStatusInput).toHaveValue('UNTOUCHED');

      // Edit email → only emailStatus changes
      await helpers.fillInput(emailInput, 'test@example.com');
      await page.waitForTimeout(500);

      await expect(emailStatusInput).toHaveValue('DIRTY');
      await expect(usernameStatusInput).toHaveValue('UNTOUCHED');

      // Touch username (focus + blur), then type to trigger derivation
      await usernameInput.focus();
      await usernameInput.blur();
      await page.waitForTimeout(300);
      await helpers.fillInput(usernameInput, 'testuser');
      await page.waitForTimeout(500);

      await expect(emailStatusInput).toHaveValue('DIRTY');
      await expect(usernameStatusInput).toHaveValue('TOUCHED');
    });
  });

  test.describe('Field State Advanced', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/derivation-logic/field-state-advanced'));
      await page.waitForLoadState('networkidle');
    });

    test('should derive passwordStrength based on password length', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('field-state-advanced-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const passwordStrengthInput = helpers.getInput(scenario, 'passwordStrength');

      // Initially TOO_SHORT (no value)
      await expect(passwordStrengthInput).toHaveValue('TOO_SHORT');

      // Type 6+ chars → VALID
      await helpers.fillInput(passwordInput, 'secret');
      await page.waitForTimeout(500);
      await expect(passwordStrengthInput).toHaveValue('VALID');

      // Clear to <6 chars → TOO_SHORT again
      await helpers.clearAndFill(passwordInput, 'abc');
      await page.waitForTimeout(500);
      await expect(passwordStrengthInput).toHaveValue('TOO_SHORT');
    });

    // Angular Signal Forms limitation: readonly()/hidden()/disabled() logic conditions
    // that read fieldState or formFieldState create reactive cycles inside Angular's
    // internal FieldNodeState computation graph. The readonly() computed depends on the
    // LogicFn result, but Angular internally links dirty ↔ readonly, causing a cycle
    // regardless of how our code reads signals. This is NOT a library bug — it's an
    // Angular Signal Forms constraint. Use derivation conditions with fieldState instead.
    test.skip('should make lockOnEdit readonly after user types (self-state dirty)', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('field-state-advanced-test');
      await expect(scenario).toBeVisible();

      const lockOnEditInput = helpers.getInput(scenario, 'lockOnEdit');

      // Initially editable
      await expect(lockOnEditInput).not.toHaveAttribute('readonly');

      // Type something → becomes dirty → readonly
      await helpers.fillInput(lockOnEditInput, 'test');
      await page.waitForTimeout(500);

      await expect(lockOnEditInput).toHaveAttribute('readonly');
    });

    test('should make lockedAfterPasswordTouch readonly when password is touched', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('field-state-advanced-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const lockedInput = helpers.getInput(scenario, 'lockedAfterPasswordTouch');

      // Initially editable
      await expect(lockedInput).not.toHaveAttribute('readonly');

      // Focus and blur password → touched
      await passwordInput.focus();
      await passwordInput.blur();
      await page.waitForTimeout(500);

      // Type in password to trigger re-evaluation that reads touched state
      await helpers.fillInput(passwordInput, 'a');
      await page.waitForTimeout(500);

      await expect(lockedInput).toHaveAttribute('readonly');
    });

    test('should stop autoTag derivation after user override (stopOnUserOverride + formFieldState)', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('field-state-advanced-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const autoTagInput = helpers.getInput(scenario, 'autoTag');

      // Initially password is pristine → autoTag derives "needs-input"
      await expect(autoTagInput).toHaveValue('needs-input');

      // Type password → dirty → autoTag derives "tag-<value>"
      await helpers.fillInput(passwordInput, 'secret');
      await page.waitForTimeout(500);
      await expect(autoTagInput).toHaveValue('tag-secret');

      // User overrides autoTag
      await helpers.clearAndFill(autoTagInput, 'my-custom-tag');
      await page.waitForTimeout(500);

      // Change password → autoTag should NOT update (stopOnUserOverride)
      await helpers.clearAndFill(passwordInput, 'newpass');
      await page.waitForTimeout(500);
      await expect(autoTagInput).toHaveValue('my-custom-tag');
    });

    test('should keep lockOnEdit independent from password changes', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('field-state-advanced-test');
      await expect(scenario).toBeVisible();

      const passwordInput = helpers.getInput(scenario, 'password');
      const lockOnEditInput = helpers.getInput(scenario, 'lockOnEdit');

      // lockOnEdit is editable initially
      await expect(lockOnEditInput).not.toHaveAttribute('readonly');

      // Changing password should not affect lockOnEdit's readonly state
      await helpers.fillInput(passwordInput, 'secret');
      await page.waitForTimeout(500);

      // lockOnEdit should still be editable (its own dirty state hasn't changed)
      await expect(lockOnEditInput).not.toHaveAttribute('readonly');
    });
  });

  test.describe('Array Field Stop On User Override', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/derivation-logic/array-stop-on-user-override'));
      await page.waitForLoadState('networkidle');
    });

    test('should auto-derive lineTotal for each array item', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-stop-on-user-override-test');
      await expect(scenario).toBeVisible();

      const lineTotalInputs = scenario.locator('[id^="lineTotal"] input');

      // Initial values: item 0 = 2*50*(1-0/100)=100, item 1 = 3*30*(1-0/100)=90
      await expect(lineTotalInputs.nth(0)).toHaveValue('100');
      await expect(lineTotalInputs.nth(1)).toHaveValue('90');
    });

    test('should stop deriving permanentTotal after user manually edits it (per-item)', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-stop-on-user-override-test');
      await expect(scenario).toBeVisible();

      const quantityInputs = scenario.locator('[id^="quantity"] input');
      const permanentTotalInputs = scenario.locator('[id^="permanentTotal"] input');
      const firstPermanentTotal = permanentTotalInputs.nth(0);
      const secondPermanentTotal = permanentTotalInputs.nth(1);

      // User manually overrides item 0's permanentTotal
      await helpers.clearAndFill(firstPermanentTotal, '999');
      await page.waitForTimeout(500);

      // Change item 0's quantity → permanentTotal should NOT update
      // (user override persists because no reEngageOnDependencyChange)
      await helpers.clearAndFill(quantityInputs.nth(0), '10');
      await page.waitForTimeout(500);
      await expect(firstPermanentTotal).toHaveValue('999');

      // Change item 1's quantity → permanentTotal SHOULD update (no override on item 1)
      await helpers.clearAndFill(quantityInputs.nth(1), '10');
      await page.waitForTimeout(500);
      await expect(secondPermanentTotal).toHaveValue('300'); // 10 * 30
    });

    test('should re-engage lineTotal when top-level dependency (discountRate) changes after override', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-stop-on-user-override-test');
      await expect(scenario).toBeVisible();

      const discountRateInput = helpers.getInput(scenario, 'discountRate');
      const lineTotalInputs = scenario.locator('[id^="lineTotal"] input');
      const firstLineTotal = lineTotalInputs.nth(0);
      const secondLineTotal = lineTotalInputs.nth(1);

      // User overrides item 0's lineTotal
      await helpers.clearAndFill(firstLineTotal, '999');
      await page.waitForTimeout(500);
      await expect(firstLineTotal).toHaveValue('999');

      // Change discountRate (top-level dependency) → lineTotal should re-engage
      // because reEngageOnDependencyChange: true and dependsOn includes 'discountRate'
      await helpers.clearAndFill(discountRateInput, '10');
      await page.waitForTimeout(500);

      // Item 0 re-engages: 2 * 50 * (1 - 10/100) = 90
      await expect(firstLineTotal).toHaveValue('90');
      // Item 1 was never overridden, applies discount: 3 * 30 * 0.9 = 81
      await expect(secondLineTotal).toHaveValue('81');
    });

    test('should NOT re-engage permanentTotal when discountRate changes after override', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-stop-on-user-override-test');
      await expect(scenario).toBeVisible();

      const discountRateInput = helpers.getInput(scenario, 'discountRate');
      const permanentTotalInputs = scenario.locator('[id^="permanentTotal"] input');
      const firstPermanentTotal = permanentTotalInputs.nth(0);

      // Initial: 2 * 50 = 100
      await expect(firstPermanentTotal).toHaveValue('100');

      // User overrides item 0's permanentTotal
      await helpers.clearAndFill(firstPermanentTotal, '777');
      await page.waitForTimeout(500);
      await expect(firstPermanentTotal).toHaveValue('777');

      // Change discountRate → permanentTotal should NOT re-engage
      // because permanentTotal doesn't depend on discountRate
      await helpers.clearAndFill(discountRateInput, '10');
      await page.waitForTimeout(500);
      await expect(firstPermanentTotal).toHaveValue('777');
    });

    test('should handle multiple override/re-engage cycles via top-level dependency', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('array-stop-on-user-override-test');
      await expect(scenario).toBeVisible();

      const discountRateInput = helpers.getInput(scenario, 'discountRate');
      const lineTotalInputs = scenario.locator('[id^="lineTotal"] input');
      const firstLineTotal = lineTotalInputs.nth(0);

      // Cycle 1: override → change discountRate → re-engage
      await helpers.clearAndFill(firstLineTotal, '999');
      await page.waitForTimeout(500);
      await expect(firstLineTotal).toHaveValue('999');

      await helpers.clearAndFill(discountRateInput, '10');
      await page.waitForTimeout(500);
      await expect(firstLineTotal).toHaveValue('90'); // re-engaged: 2 * 50 * 0.9

      // Cycle 2: override again → change discountRate → re-engage again
      await helpers.clearAndFill(firstLineTotal, '888');
      await page.waitForTimeout(500);
      await expect(firstLineTotal).toHaveValue('888');

      await helpers.clearAndFill(discountRateInput, '20');
      await page.waitForTimeout(500);
      await expect(firstLineTotal).toHaveValue('80'); // re-engaged: 2 * 50 * 0.8
    });
  });

  test.describe('HTTP Derivation', () => {
    test.beforeEach(async ({ page, mockApi }) => {
      // Set up default mock before navigation (trailing * matches query params)
      await mockApi.mockSuccess('/api/exchange-rate*', {
        body: { rate: 0.85 },
      });
      await page.goto(testUrl('/test/derivation-logic/http-derivation'));
      await page.waitForLoadState('networkidle');
    });

    test('should derive exchange rate via HTTP when currency changes', async ({ page, helpers, mockApi }) => {
      const scenario = helpers.getScenario('http-derivation-test');
      await expect(scenario).toBeVisible();

      const currencySelect = scenario.locator('#currency');
      const exchangeRateInput = helpers.getInput(scenario, 'exchangeRate');

      // Select EUR → HTTP fires → exchangeRate = 0.85
      await currencySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Euro (EUR)")').click();
      await page.waitForTimeout(1000);

      await expect(exchangeRateInput).toHaveValue('0.85');
    });

    test('should update derived value when currency changes again', async ({ page, helpers, mockApi }) => {
      const scenario = helpers.getScenario('http-derivation-test');
      await expect(scenario).toBeVisible();

      const currencySelect = scenario.locator('#currency');
      const exchangeRateInput = helpers.getInput(scenario, 'exchangeRate');

      // Select EUR → rate = 0.85
      await currencySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Euro (EUR)")').click();
      await page.waitForTimeout(1000);
      await expect(exchangeRateInput).toHaveValue('0.85');

      // Re-route to return a different rate for GBP
      await page.unroute('**/api/exchange-rate*');
      await mockApi.mockSuccess('/api/exchange-rate*', {
        body: { rate: 0.73 },
      });

      // Select GBP → rate = 0.73
      await currencySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("British Pound (GBP)")').click();
      await page.waitForTimeout(1000);
      await expect(exchangeRateInput).toHaveValue('0.73');
    });

    test('should chain HTTP derivation to expression derivation (currency → rate → convertedAmount)', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('http-derivation-test');
      await expect(scenario).toBeVisible();

      const currencySelect = scenario.locator('#currency');
      const exchangeRateInput = helpers.getInput(scenario, 'exchangeRate');
      const amountInput = helpers.getInput(scenario, 'amount');
      const convertedAmountInput = helpers.getInput(scenario, 'convertedAmount');

      // Initial amount is 100
      await expect(amountInput).toHaveValue('100');

      // Select EUR → rate = 0.85 → converted = 100 * 0.85 = 85
      await currencySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Euro (EUR)")').click();
      await page.waitForTimeout(1000);

      await expect(exchangeRateInput).toHaveValue('0.85');
      await expect(convertedAmountInput).toHaveValue('85');

      // Change amount to 200 → converted = 200 * 0.85 = 170
      await helpers.clearAndFill(amountInput, '200');
      await page.waitForTimeout(500);
      await expect(convertedAmountInput).toHaveValue('170');
    });
  });

  test.describe('HTTP Derivation Error Handling', () => {
    test('should retain previous value on HTTP error and recover on next valid request', async ({ page, helpers, mockApi }) => {
      // First mock success (trailing * matches query params)
      await mockApi.mockSuccess('/api/lookup-city*', {
        body: { city: 'New York' },
      });

      await page.goto(testUrl('/test/derivation-logic/http-derivation-error'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('http-derivation-error-test');
      await expect(scenario).toBeVisible();

      const zipCodeInput = helpers.getInput(scenario, 'zipCode');
      const cityInput = helpers.getInput(scenario, 'city');

      // Enter valid zip → city populates
      await helpers.fillInput(zipCodeInput, '10001');
      await page.waitForTimeout(1000);
      await expect(cityInput).toHaveValue('New York');

      // Now mock an error for the next request
      await page.unroute('**/api/lookup-city*');
      await mockApi.mockError('/api/lookup-city*', {
        status: 500,
        body: { error: 'Internal server error' },
      });

      // Enter another zip → HTTP 500 → city should keep previous value
      await helpers.clearAndFill(zipCodeInput, '99999');
      await page.waitForTimeout(1000);
      await expect(cityInput).toHaveValue('New York');

      // Restore success mock
      await page.unroute('**/api/lookup-city*');
      await mockApi.mockSuccess('/api/lookup-city*', {
        body: { city: 'Los Angeles' },
      });

      // Enter new valid zip → city updates again (stream recovered)
      await helpers.clearAndFill(zipCodeInput, '90001');
      await page.waitForTimeout(1000);
      await expect(cityInput).toHaveValue('Los Angeles');
    });
  });

  test.describe('HTTP Derivation Stop On User Override', () => {
    test.beforeEach(async ({ page, mockApi }) => {
      // Set up mock with different responses per country
      await page.route('**/api/timezone*', async (route) => {
        const url = new URL(route.request().url());
        const country = url.searchParams.get('country');
        const timezones: Record<string, string> = {
          US: 'America/New_York',
          UK: 'Europe/London',
          DE: 'Europe/Berlin',
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ timezone: timezones[country ?? ''] ?? 'UTC' }),
        });
      });

      await page.goto(testUrl('/test/derivation-logic/http-derivation-stop-override'));
      await page.waitForLoadState('networkidle');
    });

    test('should derive timezone via HTTP when country changes', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('http-derivation-stop-override-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const timezoneInput = helpers.getInput(scenario, 'timezone');

      // Select US → timezone = America/New_York
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await page.waitForTimeout(1000);
      await expect(timezoneInput).toHaveValue('America/New_York');

      // Select UK → timezone = Europe/London
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United Kingdom")').click();
      await page.waitForTimeout(1000);
      await expect(timezoneInput).toHaveValue('Europe/London');
    });

    test('should stop HTTP derivation after user manually edits timezone', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('http-derivation-stop-override-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const timezoneInput = helpers.getInput(scenario, 'timezone');

      // Select US → timezone derived via HTTP
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await page.waitForTimeout(1000);
      await expect(timezoneInput).toHaveValue('America/New_York');

      // User manually overrides timezone
      await helpers.clearAndFill(timezoneInput, 'Custom/Timezone');
      await page.waitForTimeout(500);

      // Change country to UK → timezone should NOT update (user override)
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United Kingdom")').click();
      await page.waitForTimeout(1000);
      await expect(timezoneInput).toHaveValue('Custom/Timezone');
    });

    test('should submit the user-overridden HTTP-derived value correctly', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('http-derivation-stop-override-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const timezoneInput = helpers.getInput(scenario, 'timezone');

      // Derive a value via HTTP
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await page.waitForTimeout(1000);
      await expect(timezoneInput).toHaveValue('America/New_York');

      // Override it
      await helpers.clearAndFill(timezoneInput, 'My/Timezone');
      await page.waitForTimeout(500);

      // Change country to verify override persists
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Germany")').click();
      await page.waitForTimeout(1000);

      // Submit and verify the overridden value
      const data = await helpers.submitFormAndCapture(scenario);
      expect(data['timezone']).toBe('My/Timezone');
    });
  });

  test.describe('HTTP Derivation Re-Engage', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/api/timezone*', async (route) => {
        const url = new URL(route.request().url());
        const country = url.searchParams.get('country');
        const timezones: Record<string, string> = {
          US: 'America/New_York',
          UK: 'Europe/London',
          DE: 'Europe/Berlin',
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ timezone: timezones[country ?? ''] ?? 'UTC' }),
        });
      });

      await page.goto(testUrl('/test/derivation-logic/http-derivation-re-engage'));
      await page.waitForLoadState('networkidle');
    });

    test('should derive timezone via HTTP when country changes', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('http-derivation-re-engage-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const timezoneInput = helpers.getInput(scenario, 'timezone');

      // Select US → timezone = America/New_York
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await page.waitForTimeout(1000);
      await expect(timezoneInput).toHaveValue('America/New_York');
    });

    test('should stop deriving after user manually edits timezone', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('http-derivation-re-engage-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const timezoneInput = helpers.getInput(scenario, 'timezone');

      // Derive initial value
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await page.waitForTimeout(1000);
      await expect(timezoneInput).toHaveValue('America/New_York');

      // User manually overrides timezone
      await helpers.clearAndFill(timezoneInput, 'Custom/Timezone');
      await page.waitForTimeout(500);
      await expect(timezoneInput).toHaveValue('Custom/Timezone');
    });

    test('should re-engage HTTP derivation when country changes after user override', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('http-derivation-re-engage-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const timezoneInput = helpers.getInput(scenario, 'timezone');

      // Step 1: Derive timezone via HTTP
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await page.waitForTimeout(1000);
      await expect(timezoneInput).toHaveValue('America/New_York');

      // Step 2: User manually overrides timezone (marks field as dirty)
      await helpers.clearAndFill(timezoneInput, 'Custom/Timezone');
      await page.waitForTimeout(500);

      // Step 3: Change country → re-engagement clears dirty, HTTP fires again
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United Kingdom")').click();
      await page.waitForTimeout(1000);
      await expect(timezoneInput).toHaveValue('Europe/London');
    });
  });

  test.describe('HTTP Derivation Condition', () => {
    test.beforeEach(async ({ page, mockApi }) => {
      await mockApi.mockSuccess('/api/lookup-city*', {
        body: { city: 'Springfield' },
      });

      await page.goto(testUrl('/test/derivation-logic/http-derivation-condition'));
      await page.waitForLoadState('networkidle');
    });

    test('should not fire HTTP when condition is false (toggle off)', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('http-derivation-condition-test');
      await expect(scenario).toBeVisible();

      const zipCodeInput = helpers.getInput(scenario, 'zipCode');
      const cityInput = helpers.getInput(scenario, 'city');

      // Toggle is off by default — type zip code
      await helpers.fillInput(zipCodeInput, '62701');
      await page.waitForTimeout(1000);

      // City should remain empty (HTTP not fired due to condition)
      await expect(cityInput).toHaveValue('');
    });

    test('should fire HTTP when condition becomes true (toggle on)', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('http-derivation-condition-test');
      await expect(scenario).toBeVisible();

      const toggleField = scenario.locator('#enableLookup');
      const zipCodeInput = helpers.getInput(scenario, 'zipCode');
      const cityInput = helpers.getInput(scenario, 'city');

      // Enable lookup
      await toggleField.locator('button[role="switch"]').click();
      await page.waitForTimeout(300);

      // Type zip code → HTTP fires → city derived
      await helpers.fillInput(zipCodeInput, '62701');
      await page.waitForTimeout(1000);
      await expect(cityInput).toHaveValue('Springfield');
    });
  });

  test.describe('Async Derivation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/derivation-logic/async-derivation'));
      await page.waitForLoadState('networkidle');
    });

    test('should derive price via async function when product changes', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('async-derivation-test');
      await expect(scenario).toBeVisible();

      const productSelect = scenario.locator('#product');
      const priceInput = helpers.getInput(scenario, 'price');

      // Select Widget A → fetchPrice returns 9.99
      await productSelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Widget A")').click();
      await expect(priceInput).toHaveValue('9.99', { timeout: 5000 });
    });

    test('should update derived value when product changes again', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('async-derivation-test');
      await expect(scenario).toBeVisible();

      const productSelect = scenario.locator('#product');
      const priceInput = helpers.getInput(scenario, 'price');

      // Select Widget A → price = 9.99
      await productSelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Widget A")').click();
      await expect(priceInput).toHaveValue('9.99', { timeout: 5000 });

      // Select Widget C → price = 29.99
      await productSelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Widget C")').click();
      await expect(priceInput).toHaveValue('29.99', { timeout: 5000 });
    });

    test('should chain async derivation to expression derivation (product → price → total)', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('async-derivation-test');
      await expect(scenario).toBeVisible();

      const productSelect = scenario.locator('#product');
      const priceInput = helpers.getInput(scenario, 'price');
      const quantityInput = helpers.getInput(scenario, 'quantity');
      const totalInput = helpers.getInput(scenario, 'total');

      // Initial quantity is 1
      await expect(quantityInput).toHaveValue('1');

      // Select Widget B → price = 19.99 → total = 19.99 * 1 = 19.99
      await productSelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Widget B")').click();

      await expect(priceInput).toHaveValue('19.99', { timeout: 5000 });
      await expect(totalInput).toHaveValue('19.99', { timeout: 5000 });

      // Change quantity to 3 → total = 19.99 * 3 = 59.97
      await helpers.clearAndFill(quantityInput, '3');
      await expect(totalInput).toHaveValue('59.97', { timeout: 5000 });
    });
  });

  test.describe('Async Derivation Error Handling', () => {
    test('should retain previous value on error and recover on next valid input', async ({ page, helpers }) => {
      await page.goto(testUrl('/test/derivation-logic/async-derivation-error'));
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('async-derivation-error-test');
      await expect(scenario).toBeVisible();

      const lookupKeyInput = helpers.getInput(scenario, 'lookupKey');
      const resultInput = helpers.getInput(scenario, 'result');

      // Enter valid key → result populates
      await helpers.fillInput(lookupKeyInput, 'ABC');
      await expect(resultInput).toHaveValue('Result for ABC', { timeout: 5000 });

      // Enter 'INVALID' → function throws → result retains previous value
      await helpers.clearAndFill(lookupKeyInput, 'INVALID');
      // Wait for debounce + async to settle, then verify value unchanged
      await page.waitForTimeout(600);
      await expect(resultInput).toHaveValue('Result for ABC');

      // Enter new valid key → stream recovers
      await helpers.clearAndFill(lookupKeyInput, 'XYZ');
      await expect(resultInput).toHaveValue('Result for XYZ', { timeout: 5000 });
    });
  });

  test.describe('Async Derivation Stop On User Override', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/derivation-logic/async-derivation-stop-override'));
      await page.waitForLoadState('networkidle');
    });

    test('should derive timezone via async function when country changes', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('async-derivation-stop-override-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const timezoneInput = helpers.getInput(scenario, 'timezone');

      // Select US → timezone = America/New_York
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await expect(timezoneInput).toHaveValue('America/New_York', { timeout: 5000 });

      // Select UK → timezone = Europe/London
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United Kingdom")').click();
      await expect(timezoneInput).toHaveValue('Europe/London', { timeout: 5000 });
    });

    test('should stop async derivation after user manually edits timezone', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('async-derivation-stop-override-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const timezoneInput = helpers.getInput(scenario, 'timezone');

      // Select US → timezone derived via async
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await expect(timezoneInput).toHaveValue('America/New_York', { timeout: 5000 });

      // User manually overrides timezone
      await helpers.clearAndFill(timezoneInput, 'Custom/Timezone');

      // Change country to UK → timezone should NOT update (user override)
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United Kingdom")').click();
      // Wait for debounce + async to settle, then verify override persists
      await page.waitForTimeout(600);
      await expect(timezoneInput).toHaveValue('Custom/Timezone');
    });

    test('should submit the user-overridden async-derived value correctly', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('async-derivation-stop-override-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const timezoneInput = helpers.getInput(scenario, 'timezone');

      // Derive a value via async
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await expect(timezoneInput).toHaveValue('America/New_York', { timeout: 5000 });

      // Override it
      await helpers.clearAndFill(timezoneInput, 'My/Timezone');

      // Change country to verify override persists
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("Germany")').click();
      // Wait for debounce + async to settle, then verify override persists
      await page.waitForTimeout(600);

      // Submit and verify the overridden value
      const data = await helpers.submitFormAndCapture(scenario);
      expect(data['timezone']).toBe('My/Timezone');
    });
  });

  test.describe('Async Derivation Re-Engage', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/derivation-logic/async-derivation-re-engage'));
      await page.waitForLoadState('networkidle');
    });

    test('should derive timezone via async function when country changes', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('async-derivation-re-engage-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const timezoneInput = helpers.getInput(scenario, 'timezone');

      // Select US → timezone = America/New_York
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await expect(timezoneInput).toHaveValue('America/New_York', { timeout: 5000 });
    });

    test('should stop deriving after user manually edits timezone', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('async-derivation-re-engage-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const timezoneInput = helpers.getInput(scenario, 'timezone');

      // Derive initial value
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await expect(timezoneInput).toHaveValue('America/New_York', { timeout: 5000 });

      // User manually overrides timezone
      await helpers.clearAndFill(timezoneInput, 'Custom/Timezone');
      await expect(timezoneInput).toHaveValue('Custom/Timezone');
    });

    test('should re-engage async derivation when country changes after user override', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('async-derivation-re-engage-test');
      await expect(scenario).toBeVisible();

      const countrySelect = scenario.locator('#country');
      const timezoneInput = helpers.getInput(scenario, 'timezone');

      // Step 1: Derive timezone via async
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United States")').click();
      await expect(timezoneInput).toHaveValue('America/New_York', { timeout: 5000 });

      // Step 2: User manually overrides timezone (marks field as dirty)
      await helpers.clearAndFill(timezoneInput, 'Custom/Timezone');

      // Step 3: Change country → re-engagement clears dirty, async fires again
      await countrySelect.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option:has-text("United Kingdom")').click();
      await expect(timezoneInput).toHaveValue('Europe/London', { timeout: 5000 });
    });
  });

  test.describe('Async Derivation Condition', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/derivation-logic/async-derivation-condition'));
      await page.waitForLoadState('networkidle');
    });

    test('should not fire async function when condition is false (toggle off)', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('async-derivation-condition-test');
      await expect(scenario).toBeVisible();

      const zipCodeInput = helpers.getInput(scenario, 'zipCode');
      const cityInput = helpers.getInput(scenario, 'city');

      // Toggle is off by default — type zip code
      await helpers.fillInput(zipCodeInput, '62701');
      // Wait for debounce + async to settle, then verify city unchanged
      await page.waitForTimeout(600);
      await expect(cityInput).toHaveValue('');
    });

    test('should fire async function when condition becomes true (toggle on)', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('async-derivation-condition-test');
      await expect(scenario).toBeVisible();

      const toggleField = scenario.locator('#enableLookup');
      const zipCodeInput = helpers.getInput(scenario, 'zipCode');
      const cityInput = helpers.getInput(scenario, 'city');

      // Enable lookup
      await toggleField.locator('button[role="switch"]').click();

      // Type zip code → async fires → city derived
      await helpers.fillInput(zipCodeInput, '62701');
      await expect(cityInput).toHaveValue('Springfield', { timeout: 5000 });
    });
  });
});
