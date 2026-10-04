import { expect, test } from '@playwright/test';
import { formValue, openScenario } from './scenario';

test.describe('group fields', () => {
  test('group value propagation', async ({ page }) => {
    await openScenario(page, 'group-fields', 'group-value-propagation');
    await page.getByTestId('name-input').fill('Test User');
    await page.getByTestId('address_street-input').fill('123 Main St');
    await page.getByTestId('address_city-input').fill('Springfield');
    await page.getByTestId('address_zip-input').fill('12345');

    await expect
      .poll(() => formValue(page))
      .toEqual({
        name: 'Test User',
        address: { street: '123 Main St', city: 'Springfield', zip: '12345' },
      });
  });

  test('group initial values', async ({ page }) => {
    await openScenario(page, 'group-fields', 'group-initial-values');
    await expect(page.getByTestId('profile_firstName-input')).toHaveValue('John');
    await expect(page.getByTestId('profile_lastName-input')).toHaveValue('Doe');
    await expect(page.getByTestId('profile_email-input')).toHaveValue('john.doe@example.com');
  });

  test('multiple groups', async ({ page }) => {
    await openScenario(page, 'group-fields', 'group-nested');
    await page.getByTestId('personal_firstName-input').fill('Jane');
    await page.getByTestId('work_company-input').fill('Acme');

    await expect.poll(async () => (await formValue(page))['personal']).toMatchObject({ firstName: 'Jane' });
    await expect.poll(async () => (await formValue(page))['work']).toMatchObject({ company: 'Acme' });
  });
});
