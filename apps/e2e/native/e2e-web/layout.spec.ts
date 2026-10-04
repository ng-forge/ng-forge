import { expect, test, type Locator } from '@playwright/test';
import { formValue, openScenario } from './scenario';

const box = async (locator: Locator) => (await locator.boundingBox())!;

test.describe('layout', () => {
  test('row columns stack on a phone', async ({ page }) => {
    await openScenario(page, 'layout', 'row-columns');
    const first = await box(page.getByTestId('firstName-input'));
    const last = await box(page.getByTestId('lastName-input'));
    expect(last.y).toBeGreaterThan(first.y + first.height);

    await page.getByTestId('firstName-input').fill('Ada');
    await page.getByTestId('lastName-input').fill('Lovelace');
    await page.getByTestId('zip-input').fill('N1');
    await expect.poll(() => formValue(page)).toMatchObject({ firstName: 'Ada', lastName: 'Lovelace', zip: 'N1' });
  });

  test('row columns sit side by side on a tablet @tablet', async ({ page }) => {
    await openScenario(page, 'layout', 'row-columns');
    const first = await box(page.getByTestId('firstName'));
    const last = await box(page.getByTestId('lastName'));
    const city = await box(page.getByTestId('city'));
    const zip = await box(page.getByTestId('zip'));

    expect(last.y).toBe(first.y);
    expect(last.width).toBeCloseTo(first.width, 0);
    expect(zip.y).toBe(city.y);
    // col 8 and col 4.
    expect(city.width / zip.width).toBeCloseTo(2, 1);
  });

  test('array container validator', async ({ page }) => {
    await openScenario(page, 'layout', 'array-container-validator');
    await page.getByTestId('from_0-input').fill('2026');
    await page.getByTestId('to_0-input').fill('2025');
    await page.getByTestId('to_0-input').blur();

    await expect(page.getByText('The end must not be before the start.')).toBeVisible();
    await expect(page.getByTestId('submitPeriods-button')).toHaveAttribute('aria-disabled', 'true');
  });
});
