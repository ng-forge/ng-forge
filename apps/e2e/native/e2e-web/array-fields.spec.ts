import { expect, test } from '@playwright/test';
import { formValue, openScenario } from './scenario';

test.describe('array fields', () => {
  test('add array items', async ({ page }) => {
    await openScenario(page, 'array-fields', 'array-add');
    await expect(page.getByTestId('email_0-input')).toBeVisible();
    await expect(page.getByTestId('email_1-input')).toHaveCount(0);

    await page.getByTestId('addEmailButton-button').click();
    await page.getByTestId('email_1-input').fill('second@example.com');

    await expect.poll(async () => (await formValue(page))['emails']).toHaveLength(2);
    await expect.poll(async () => (await formValue(page))['emails']).toMatchObject([{}, { email: 'second@example.com' }]);
  });

  test('remove array items', async ({ page }) => {
    await openScenario(page, 'array-fields', 'array-remove');
    await expect(page.getByTestId('phone_1-input')).toBeVisible();

    await page.getByTestId('removePhoneButton-button').click();

    await expect(page.getByTestId('phone_1-input')).toHaveCount(0);
    await expect.poll(async () => (await formValue(page))['phones']).toEqual([{ phone: '555-0001' }]);
  });
});
