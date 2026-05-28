import { expect, Page } from '@playwright/test';

// Shared assertions for the multi-form DOM-id collision fix. The id/no-collision
// checks are adapter-agnostic (core owns them); label↔input checks are parameterized
// and only used by native `for`/`id` adapters (bootstrap, primeng).

export interface FieldSelectors {
  inputSelector: string;
  labelSelector: string;
}

/** Collect any element ids that appear more than once in the live (light-DOM) tree. */
export async function getDuplicateIds(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const ids = Array.from(document.querySelectorAll('[id]'))
      .map((el) => el.id)
      .filter(Boolean);
    return [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  });
}

/** The headline invariant: rendering multiple forms must not duplicate any id. */
export async function assertNoDuplicateIds(page: Page): Promise<void> {
  await expect.poll(() => getDuplicateIds(page), { timeout: 5000 }).toEqual([]);
}

/** Two identical forms → distinct auto-prefixed form ids and zero id collisions. */
export async function assertTwoFormsScoped(page: Page): Promise<void> {
  const formA = page.locator('[data-testid="form-a"] form');
  const formB = page.locator('[data-testid="form-b"] form');
  await expect(formA).toBeVisible({ timeout: 10000 });
  await expect(formB).toBeVisible({ timeout: 10000 });

  // Auto-prefix scopes each form element once two are mounted.
  await expect(formA).toHaveAttribute('id', /^df-\d+$/, { timeout: 10000 });
  await expect(formB).toHaveAttribute('id', /^df-\d+$/, { timeout: 10000 });

  const aId = await formA.getAttribute('id');
  const bId = await formB.getAttribute('id');
  expect(aId).not.toBe(bId);

  await assertNoDuplicateIds(page);
}

/** Explicit `options.idPrefix` wins verbatim and is reflected on the form id. */
export async function assertExplicitPrefixes(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="form-billing"] form')).toHaveAttribute('id', 'billing', { timeout: 10000 });
  await expect(page.locator('[data-testid="form-shipping"] form')).toHaveAttribute('id', 'shipping');
  await assertNoDuplicateIds(page);
}

/** Lone form unprefixed → mounting a second scopes both → unmounting it keeps the survivor's latched prefix and stays collision-free. */
export async function assertToggleCleanup(page: Page): Promise<void> {
  const formA = page.locator('[data-testid="form-a"] form');
  await expect(formA).toBeVisible({ timeout: 10000 });
  await expect(formA).not.toHaveAttribute('id', /.+/, { timeout: 10000 });
  await assertNoDuplicateIds(page);

  await page.locator('[data-testid="toggle-form-b"]').click();
  await expect(page.locator('[data-testid="form-b"] form')).toBeVisible({ timeout: 10000 });
  await expect(formA).toHaveAttribute('id', /^df-\d+$/, { timeout: 10000 });
  const latchedId = await formA.getAttribute('id');
  await assertNoDuplicateIds(page);

  await page.locator('[data-testid="toggle-form-b"]').click();
  await expect(page.locator('[data-testid="form-b"]')).toHaveCount(0);
  await expect(formA).toHaveAttribute('id', latchedId!); // latched: prefix survives the sibling unmount
  await assertNoDuplicateIds(page);
}

/** Native `for`/`id` adapters: each label's `for` matches its OWN form's input, and that id is unique page-wide. */
export async function assertLabelForMatchesOwnInput(page: Page, selectors: FieldSelectors): Promise<void> {
  const formB = page.locator('[data-testid="form-b"]');
  await expect(formB.locator(selectors.inputSelector).first()).toBeVisible({ timeout: 10000 });

  const labelFor = await formB.locator(selectors.labelSelector).first().getAttribute('for');
  const inputId = await formB.locator(selectors.inputSelector).first().getAttribute('id');

  expect(labelFor).toBe(inputId);
  await expect(page.locator(`[id="${inputId}"]`)).toHaveCount(1);
}

/** Native `for`/`id` adapters: the reported bug — clicking form B's label focuses form B's input, not form A's. */
export async function assertLabelClickFocusesOwnInput(page: Page, selectors: FieldSelectors): Promise<void> {
  const aInput = page.locator('[data-testid="form-a"]').locator(selectors.inputSelector).first();
  const bInput = page.locator('[data-testid="form-b"]').locator(selectors.inputSelector).first();
  await expect(bInput).toBeVisible({ timeout: 10000 });

  await page.locator('[data-testid="form-b"]').locator(selectors.labelSelector).first().click();

  await expect(bInput).toBeFocused();
  await expect(aInput).not.toBeFocused();
}
