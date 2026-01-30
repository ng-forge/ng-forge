import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { testUrl } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck();

test.describe('Value Derivation Logic Tests', () => {
  test.describe('Static Value Derivation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(testUrl('/test/derivation-logic/static-value'));
      await page.waitForLoadState('networkidle');
    });

    test('should derive phone prefix and currency from country selection', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('static-value-derivation-test');
      await expect(scenario).toBeVisible();

      const countrySelect = helpers.getSelect(scenario, 'country');
      const phonePrefixInput = helpers.getInput(scenario, 'phonePrefix');
      const currencyInput = helpers.getInput(scenario, 'currency');

      // Select United States
      await helpers.selectOption(countrySelect, 'United States');
      await page.waitForTimeout(500);

      await expect(phonePrefixInput).toHaveValue('+1');
      await expect(currencyInput).toHaveValue('USD');

      // Select United Kingdom
      await helpers.selectOption(countrySelect, 'United Kingdom');
      await page.waitForTimeout(500);

      await expect(phonePrefixInput).toHaveValue('+44');
      await expect(currencyInput).toHaveValue('GBP');

      // Select Germany
      await helpers.selectOption(countrySelect, 'Germany');
      await page.waitForTimeout(500);

      await expect(phonePrefixInput).toHaveValue('+49');
      await expect(currencyInput).toHaveValue('EUR');

      // Select Japan
      await helpers.selectOption(countrySelect, 'Japan');
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
      const discountCodeSelect = helpers.getSelect(scenario, 'discountCode');
      const discountedPriceInput = helpers.getInput(scenario, 'discountedPrice');

      // Initial price is 100, no discount
      await expect(discountedPriceInput).toHaveValue('100');

      // Apply SAVE10 (10% off)
      await helpers.selectOption(discountCodeSelect, 'SAVE10 (10% off)');
      await page.waitForTimeout(500);

      await expect(discountedPriceInput).toHaveValue('90');

      // Apply SAVE25 (25% off)
      await helpers.selectOption(discountCodeSelect, 'SAVE25 (25% off)');
      await page.waitForTimeout(500);

      await expect(discountedPriceInput).toHaveValue('75');

      // Apply HALF (50% off)
      await helpers.selectOption(discountCodeSelect, 'HALF (50% off)');
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

      const membershipSelect = helpers.getSelect(scenario, 'membershipType');
      const discountInput = helpers.getInput(scenario, 'discountPercent');
      // PrimeNG toggle uses p-togglebutton or p-inputswitch - look for the actual input
      const freeShippingToggle = scenario.locator('#freeShipping input[type="checkbox"]');

      // Initial: Basic membership
      await expect(discountInput).toHaveValue('0');
      await expect(freeShippingToggle).not.toBeChecked();

      // Select Premium
      await helpers.selectOption(membershipSelect, 'Premium');
      await page.waitForTimeout(500);

      await expect(discountInput).toHaveValue('15');
      await expect(freeShippingToggle).toBeChecked();

      // Select VIP
      await helpers.selectOption(membershipSelect, 'VIP');
      await page.waitForTimeout(500);

      await expect(discountInput).toHaveValue('30');
      await expect(freeShippingToggle).toBeChecked();

      // Back to Basic
      await helpers.selectOption(membershipSelect, 'Basic');
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

      // Get first line item fields using nth() since array items don't have indexed data-testid
      const quantityInputs = scenario.locator('#quantity input');
      const unitPriceInputs = scenario.locator('#unitPrice input');
      const lineTotalInputs = scenario.locator('#lineTotal input');

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
  });
});
