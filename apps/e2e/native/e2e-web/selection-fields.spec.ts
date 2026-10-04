import { expect, test } from '@playwright/test';
import { formValue, lastSubmission, openScenario } from './scenario';

test.describe('selection fields', () => {
  test('required checkbox', async ({ page }) => {
    await openScenario(page, 'selection-fields', 'checkbox-required');
    const terms = page.getByRole('checkbox', { name: 'I accept the terms' });
    const submit = page.getByTestId('submitTerms-button');
    await expect(submit).toHaveAttribute('aria-disabled', 'true');

    // Checking and unchecking touches the field, so the required error shows.
    await terms.click();
    await terms.click();
    await expect(terms).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByTestId('terms-error')).toHaveText('You must accept the terms');

    await terms.click();
    await expect(terms).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('terms-error')).toHaveCount(0);
    await submit.click();
    await expect.poll(() => lastSubmission(page)).toMatchObject({ terms: true });
  });

  test('radio group', async ({ page }) => {
    await openScenario(page, 'selection-fields', 'radio-plan');
    await page.getByTestId('plan-free').click();
    await page.getByTestId('plan-pro').click();
    await expect.poll(async () => (await formValue(page))['plan']).toBe('pro');

    // The disabled option ignores taps.
    await page.getByTestId('plan-team').click({ force: true });
    await expect.poll(async () => (await formValue(page))['plan']).toBe('pro');
  });

  test('multi-checkbox', async ({ page }) => {
    await openScenario(page, 'selection-fields', 'multi-checkbox-tags');
    await page.getByTestId('interests-angular').click();
    await page.getByTestId('interests-forms').click();
    await expect.poll(async () => (await formValue(page))['interests']).toEqual(['angular', 'forms']);

    await page.getByTestId('interests-angular').click();
    await expect.poll(async () => (await formValue(page))['interests']).toEqual(['forms']);
  });
});
