import { expect, test } from '@playwright/test';
import { formValue, openScenario } from './scenario';

test.describe('conditional logic', () => {
  test('toggle visibility', async ({ page }) => {
    await openScenario(page, 'conditional-logic', 'toggle-visibility');
    const toggle = page.getByTestId('subscribe-toggle');
    await expect(page.getByTestId('email-input')).toHaveCount(0);

    await toggle.click();
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('preferences_frequency-input')).toBeVisible();

    await toggle.click();
    await expect(page.getByTestId('email-input')).toHaveCount(0);
    await expect.poll(async () => (await formValue(page))['subscribe']).toBe(false);
  });

  test('text and textarea', async ({ page }) => {
    await openScenario(page, 'conditional-logic', 'text-and-textarea');
    await expect(page.getByTestId('heading')).toHaveText('Tell us about yourself');
    await expect(page.getByRole('heading', { name: 'Tell us about yourself' })).toBeVisible();

    await page.getByTestId('bio-textarea').fill('Loves forms');
    await expect.poll(async () => (await formValue(page))['bio']).toBe('Loves forms');
  });
});
