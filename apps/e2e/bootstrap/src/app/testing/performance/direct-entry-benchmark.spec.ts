import { expect, test } from '@playwright/test';

test.describe('direct-entry performance benchmark', () => {
  test.beforeEach(async ({ browserName }) => {
    test.skip(browserName !== 'chromium', 'Performance benchmark assertions run on Chromium only');
  });

  test('mounts only the active 40-field page when preload is disabled', async ({ page }) => {
    await page.goto('/#/wizard?preload=0', { waitUntil: 'networkidle' });

    const benchmark = page.getByTestId('direct-entry-benchmark');
    await expect(benchmark).toHaveAttribute('data-total-fields', '240');
    await expect(page.locator('section[page-field]')).toHaveCount(1);
    await expect(page.locator('input[id$="-input"]')).toHaveCount(40);
  });

  test('mounts the active page and one neighbour for preload one', async ({ page }) => {
    await page.goto('/#/wizard?preload=1', { waitUntil: 'networkidle' });

    await expect(page.getByTestId('direct-entry-benchmark')).toHaveAttribute('data-preload-window', '1');
    await expect(page.locator('section[page-field]')).toHaveCount(2);
    await expect(page.locator('input[id$="-input"]')).toHaveCount(80);
  });

  test('paints the active page before starting neighbour preload work', async ({ page }) => {
    await page.addInitScript(() => {
      const pending = new Map<number, IdleRequestCallback>();
      let nextHandle = 1;

      window.requestIdleCallback = (callback: IdleRequestCallback): number => {
        const handle = nextHandle++;
        pending.set(handle, callback);
        return handle;
      };
      window.cancelIdleCallback = (handle: number): void => {
        pending.delete(handle);
      };
      Object.defineProperty(window, '__flushBenchmarkIdle', {
        value: () => {
          const callbacks = [...pending.values()];
          pending.clear();
          callbacks.forEach((callback) => callback({ didTimeout: false, timeRemaining: () => 50 }));
        },
      });
    });

    await page.goto('/#/wizard?preload=1', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('direct-entry-benchmark')).toHaveAttribute('data-active-page-ready', 'true');
    await expect(page.locator('section[page-field]')).toHaveCount(1);
    await expect(page.locator('input[id$="-input"]')).toHaveCount(40);

    await page.evaluate(() => {
      (window as typeof window & { __flushBenchmarkIdle: () => void }).__flushBenchmarkIdle();
    });

    await expect(page.locator('section[page-field]')).toHaveCount(2);
    await expect(page.locator('input[id$="-input"]')).toHaveCount(80);
  });

  test('keeps the flat control semantically eager', async ({ page }) => {
    await page.goto('/#/full', { waitUntil: 'networkidle' });

    const benchmark = page.getByTestId('direct-entry-benchmark');
    await expect(benchmark).toHaveAttribute('data-mode', 'full');
    await expect(benchmark).toHaveAttribute('data-total-fields', '240');
    await expect(page.locator('input[id$="-input"]')).toHaveCount(240);
  });

  test('reuses performance timeline entries across page navigation', async ({ page }) => {
    await page.goto('/#/wizard?preload=0', { waitUntil: 'networkidle' });

    const benchmark = page.getByTestId('direct-entry-benchmark');
    const pageStatus = page.locator('[aria-live="polite"]');
    await expect(benchmark).toHaveAttribute('data-active-page-ready', 'true');

    await page.getByRole('button', { name: 'Next' }).click();
    await expect(pageStatus).toHaveText('Page 2 of 6');
    await expect(benchmark).toHaveAttribute('data-active-page-ready', 'true');

    await page.getByRole('button', { name: 'Previous' }).click();
    await expect(pageStatus).toHaveText('Page 1 of 6');
    await expect(benchmark).toHaveAttribute('data-active-page-ready', 'true');

    const activePageMarks = await page.evaluate(() => performance.getEntriesByName('ng-forge:active-page-initialized', 'mark').length);
    expect(activePageMarks).toBe(1);
  });
});
