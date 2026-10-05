import { expect, test } from '@playwright/test';
import { lastSubmission, openScenario } from './scenario';

test.describe('submission behavior', () => {
  test('basic submission', async ({ page }) => {
    await openScenario(page, 'submission-behavior', 'basic-submission');
    await page.getByTestId('email-input').fill('user@example.com');
    await page.getByTestId('name-input').fill('Jane Doe');
    await page.getByTestId('submitForm-button').click();

    await expect(page.getByTestId('submission-count')).toHaveText('1');
    expect(await lastSubmission(page)).toMatchObject({ email: 'user@example.com', name: 'Jane Doe' });
  });

  test('submit disabled while invalid', async ({ page }) => {
    await openScenario(page, 'submission-behavior', 'button-disabled-invalid');
    const submit = page.getByTestId('submitInvalid-button');
    await expect(submit).toHaveAttribute('aria-disabled', 'true');

    // Leaving a required field empty shows its error once touched.
    await page.getByTestId('email-input').focus();
    await page.getByTestId('name-input').focus();
    await expect(page.getByTestId('email-error')).toHaveText('This field is required');

    await page.getByTestId('email-input').fill('user@example.com');
    await page.getByTestId('name-input').fill('Jane Doe');
    await expect(page.getByTestId('email-error')).toHaveCount(0);
    await expect(submit).not.toHaveAttribute('aria-disabled', 'true');

    await submit.click();
    await expect(page.getByTestId('submission-count')).toHaveText('1');
  });

  test('hidden fields are submitted', async ({ page }) => {
    await openScenario(page, 'submission-behavior', 'hidden-field');
    await page.getByTestId('name-input').fill('Jane');
    await page.getByTestId('submitHidden-button').click();

    await expect(page.getByTestId('submission-count')).toHaveText('1');
    expect(await lastSubmission(page)).toMatchObject({
      id: 'uuid-550e8400',
      version: 42,
      metadata: { source: 'mobile-form' },
      name: 'Jane',
    });
  });
});
