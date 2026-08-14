import { Page } from '@playwright/test';
import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

/** Four pages; `a`, `b`, `c` required, `d` optional. Page 2 hides when `a === 'skip'`. */
const SESSION_CONFIG = {
  fields: [
    {
      key: 'p1',
      type: 'page',
      fields: [
        { key: 'a', type: 'input', label: 'A', required: true },
        { key: 'next1', type: 'next', label: 'Next' },
      ],
    },
    {
      key: 'p2',
      type: 'page',
      fields: [
        { key: 'b', type: 'input', label: 'B', required: true },
        { key: 'next2', type: 'next', label: 'Next' },
      ],
    },
    {
      key: 'p3',
      type: 'page',
      logic: [{ type: 'hidden', condition: { field: 'a', operator: 'eq', value: 'skip' } }],
      fields: [
        { key: 'c', type: 'input', label: 'C', required: true },
        { key: 'next3', type: 'next', label: 'Next' },
      ],
    },
    { key: 'p4', type: 'page', fields: [{ key: 'd', type: 'input', label: 'D' }] },
  ],
};

/** Registers the mocked backend. `value` decides how complete the saved session is. */
async function mockSession(
  page: Page,
  options: { value?: Record<string, unknown>; savedPage?: number; fail?: boolean } = {},
): Promise<void> {
  await page.route('**/api/saved-session/**', (route) => {
    if (options.fail) {
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
      return;
    }
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        config: SESSION_CONFIG,
        value: options.value ?? {},
        ...(options.savedPage !== undefined ? { savedPage: options.savedPage } : {}),
      }),
    });
  });
}

async function open(page: Page, query: string): Promise<void> {
  await page.goto(`/#/test/deep-linking${query}`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('deep-link')).toBeVisible();
}

/** The page the orchestrator settled on. */
function currentPage(page: Page) {
  return page.getByTestId('current-page');
}

const COMPLETE = { a: 'one', b: 'two', c: 'three' };
const HALF_FILLED = { a: 'one' };

test.describe('Deep Linking / Session Resume', () => {
  test.describe('declarative initialPage', () => {
    test('lands on the requested page when the saved session is complete', async ({ page }) => {
      await mockSession(page, { value: COMPLETE });
      await open(page, '?page=3');

      await expect(currentPage(page)).toHaveText('3');
      await expect(page.locator('#d input')).toBeVisible();
    });

    test('lands on the requested page even when an earlier page is incomplete', async ({ page }) => {
      // The core resume case: saved on page 3 with page 2 never filled in.
      await mockSession(page, { value: HALF_FILLED });
      await open(page, '?page=3');

      await expect(currentPage(page)).toHaveText('3');
    });

    test('honours the page the backend saved when no param is given', async ({ page }) => {
      await mockSession(page, { value: COMPLETE, savedPage: 2 });
      await open(page, '');

      await expect(currentPage(page)).toHaveText('2');
    });

    test('an explicit param overrides the saved page', async ({ page }) => {
      await mockSession(page, { value: COMPLETE, savedPage: 2 });
      await open(page, '?page=1');

      await expect(currentPage(page)).toHaveText('1');
    });

    test('stops on the first invalid page when the gate is on', async ({ page }) => {
      await mockSession(page, { value: HALF_FILLED });
      await open(page, '?page=3&gate=on');

      // page 2 (`b`) is empty, so the gated landing stops there
      await expect(currentPage(page)).toHaveText('1');
    });
  });

  test.describe('malformed parameters', () => {
    test('clamps an out-of-range page to the last page', async ({ page }) => {
      await mockSession(page, { value: COMPLETE });
      await open(page, '?page=99');

      await expect(currentPage(page)).toHaveText('3');
    });

    test('falls back to page 0 for a non-numeric page', async ({ page }) => {
      await mockSession(page, { value: COMPLETE });
      await open(page, '?page=abc');

      await expect(page.getByTestId('requested-page')).toHaveText('invalid');
      await expect(currentPage(page)).toHaveText('0');
    });

    test('falls back to page 0 for a negative page', async ({ page }) => {
      await mockSession(page, { value: COMPLETE });
      await open(page, '?page=-2');

      await expect(currentPage(page)).toHaveText('0');
    });

    test('page 0 is a no-op', async ({ page }) => {
      await mockSession(page, { value: COMPLETE });
      await open(page, '?page=0');

      await expect(currentPage(page)).toHaveText('0');
    });
  });

  test.describe('interaction with hidden pages', () => {
    test('resolves to the nearest visible page when the target is hidden', async ({ page }) => {
      // `a === 'skip'` hides page 3 (index 2), so a deep link to it must not strand the user.
      await mockSession(page, { value: { a: 'skip', b: 'two' } });
      await open(page, '?page=2');

      await expect(currentPage(page)).not.toHaveText('2');
      await expect(currentPage(page)).toHaveText('3');
    });

    test('a hidden earlier page does not shift the landing', async ({ page }) => {
      await mockSession(page, { value: { a: 'skip', b: 'two' } });
      await open(page, '?page=3');

      await expect(currentPage(page)).toHaveText('3');
      await expect(page.locator('#d input')).toBeVisible();
    });
  });

  test.describe('effect-driven navigation', () => {
    test('an effect lands the user on the requested page after load', async ({ page }) => {
      await mockSession(page, { value: COMPLETE });
      await open(page, '?page=3&mode=effect');

      await expect(page.getByTestId('mode')).toHaveText('effect');
      await expect(currentPage(page)).toHaveText('3');
    });

    test('an ungated effect resumes onto an incomplete form', async ({ page }) => {
      await mockSession(page, { value: HALF_FILLED });
      await open(page, '?page=3&mode=effect');

      await expect(currentPage(page)).toHaveText('3');
    });

    test('a gated effect stops on the first invalid page', async ({ page }) => {
      await mockSession(page, { value: HALF_FILLED });
      await open(page, '?page=3&mode=effect&gate=on');

      await expect(currentPage(page)).toHaveText('1');
    });

    test('re-navigates when the query param changes in place', async ({ page }) => {
      await mockSession(page, { value: COMPLETE });
      await open(page, '?page=3&mode=effect');
      await expect(currentPage(page)).toHaveText('3');

      // No reload: the router pushes a new param and the effect reacts.
      await page.evaluate(() => {
        window.location.hash = '#/test/deep-linking?page=1&mode=effect';
      });

      await expect(currentPage(page)).toHaveText('1');
    });
  });

  test.describe('URL synchronisation', () => {
    test('writes the active page back to the URL as the user advances', async ({ page }) => {
      await mockSession(page, { value: COMPLETE });
      await open(page, '?page=0');

      await page.locator('#next1 button').click();
      await expect(currentPage(page)).toHaveText('1');
      await expect(page).toHaveURL(/page=1/);
    });

    test('a refresh resumes on the mirrored page', async ({ page }) => {
      await mockSession(page, { value: COMPLETE });
      await open(page, '?page=0');

      await page.locator('#next1 button').click();
      await expect(page).toHaveURL(/page=1/);

      await page.reload();
      await page.waitForLoadState('networkidle');

      await expect(currentPage(page)).toHaveText('1');
    });
  });

  test.describe('backend failures', () => {
    test('surfaces a load error without rendering a form', async ({ page }) => {
      await mockSession(page, { fail: true });
      await open(page, '?page=2');

      await expect(page.getByTestId('load-error')).toBeVisible();
    });
  });
});
