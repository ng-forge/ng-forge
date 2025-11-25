import { expect, test } from '@playwright/test';

test.describe('Debug Validation Behavior', () => {
  test('inspect password validation manually', async ({ page }) => {
    // Navigate to the page
    await page.goto('http://localhost:4201/#/test/advanced-validation');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Locate the test scenario
    const scenario = page.locator('[data-testid="custom-validator-test"]');
    await expect(scenario).toBeVisible({ timeout: 10000 });

    console.log('=== SCENARIO FOUND ===');

    // Get password field and input
    const passwordField = scenario.locator('#password');
    const passwordInput = passwordField.locator('input');
    const submitButton = scenario.locator('#submit button');

    console.log('=== CHECKING INITIAL STATE ===');

    // Check if mat-error exists initially
    const initialErrors = await passwordField.locator('mat-error').count();
    console.log(`Initial mat-error count: ${initialErrors}`);

    // Check field structure
    const fieldHTML = await passwordField.innerHTML();
    console.log('Password field HTML:', fieldHTML.substring(0, 500));

    console.log('\n=== FILLING WEAK PASSWORD ===');

    // Fill weak password
    await passwordInput.fill('weak');
    await page.waitForTimeout(500);

    // Check errors after fill (before blur)
    const errorsAfterFill = await passwordField.locator('mat-error').count();
    console.log(`mat-error count after fill (no blur): ${errorsAfterFill}`);

    console.log('\n=== BLURRING FIELD ===');

    // Blur the field
    await passwordInput.blur();
    await page.waitForTimeout(500);

    // Check errors after blur
    const errorsAfterBlur = await passwordField.locator('mat-error').count();
    console.log(`mat-error count after blur: ${errorsAfterBlur}`);

    if (errorsAfterBlur > 0) {
      const errorText = await passwordField.locator('mat-error').first().textContent();
      console.log(`Error message: ${errorText}`);
    }

    console.log('\n=== CLICKING SUBMIT (no force) ===');

    // Try normal click (without force)
    await page.waitForTimeout(1000);

    const errorsAfterSubmit = await passwordField.locator('mat-error').count();
    console.log(`mat-error count after submit: ${errorsAfterSubmit}`);

    if (errorsAfterSubmit > 0) {
      const errorText = await passwordField.locator('mat-error').first().textContent();
      console.log(`Error message: ${errorText}`);
    } else {
      console.log('NO ERRORS VISIBLE');

      // Check if mat-error elements exist in DOM but are hidden
      const allMatErrors = await passwordField.locator('mat-error').all();
      console.log(`Total mat-error elements in DOM: ${allMatErrors.length}`);

      for (let i = 0; i < allMatErrors.length; i++) {
        const isVisible = await allMatErrors[i].isVisible();
        const text = await allMatErrors[i].textContent();
        console.log(`  mat-error ${i}: visible=${isVisible}, text="${text}"`);
      }
    }

    console.log('\n=== FILLING STRONG PASSWORD ===');

    // Fill strong password
    await passwordInput.fill('Strong@123');
    await passwordInput.blur();
    await page.waitForTimeout(500);

    const errorsAfterStrong = await passwordField.locator('mat-error').count();
    console.log(`mat-error count after strong password: ${errorsAfterStrong}`);

    console.log('\n=== SUBMITTING STRONG PASSWORD ===');

    await submitButton.click();
    await page.waitForTimeout(1000);

    const finalErrors = await passwordField.locator('mat-error').count();
    console.log(`mat-error count after final submit: ${finalErrors}`);

    // Take screenshot for manual inspection
    await page.screenshot({ path: '/tmp/validation-debug.png', fullPage: true });
    console.log('\n=== SCREENSHOT SAVED TO /tmp/validation-debug.png ===');
  });
});
