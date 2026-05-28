import { expect, Page } from '@playwright/test';

/**
 * Shared, mostly adapter-agnostic assertions for the multi-form DOM-id
 * collision fix. The core invariants — "no duplicate element ids" and "form
 * elements are scoped by prefix" — hold for every adapter because they're
 * produced by core (`DynamicForm`'s host `[attr.id]` and the field key
 * pipeline), regardless of how each adapter renders inputs.
 *
 * The `label`/`input` selectors differ per adapter, so the label↔input
 * assertions are parameterized and only used by adapters whose label uses a
 * native `for`/`id` association (bootstrap, primeng).
 */

export interface FieldSelectors {
  /** Selector for a field's focusable input within a form container. */
  inputSelector: string;
  /** Selector for a field's `<label>` within a form container. */
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

/**
 * Toggle/cleanup: a lone form is unprefixed (clean ids); mounting a second
 * scopes both; unmounting it must clean up without breaking the survivor or
 * leaving id collisions behind.
 */
export async function assertToggleCleanup(page: Page): Promise<void> {
  const formA = page.locator('[data-testid="form-a"] form');
  await expect(formA).toBeVisible({ timeout: 10000 });

  // Alone → unprefixed, so the form carries no id attribute (single-form default).
  await expect(formA).not.toHaveAttribute('id', /.+/, { timeout: 10000 });
  await assertNoDuplicateIds(page);

  // Mount form B → both forms scope their ids; no collisions.
  await page.locator('[data-testid="toggle-form-b"]').click();
  await expect(page.locator('[data-testid="form-b"] form')).toBeVisible({ timeout: 10000 });
  await expect(formA).toHaveAttribute('id', /^df-\d+$/, { timeout: 10000 });
  await assertNoDuplicateIds(page);

  // Unmount form B → registry cleans up; survivor stays collision-free.
  await page.locator('[data-testid="toggle-form-b"]').click();
  await expect(page.locator('[data-testid="form-b"]')).toHaveCount(0);
  await assertNoDuplicateIds(page);
}

/**
 * Native `for`/`id` adapters only: each label's `for` matches an input inside
 * its OWN form, and that id is unique page-wide (so it can't resolve to the
 * other form's input).
 */
export async function assertLabelForMatchesOwnInput(page: Page, selectors: FieldSelectors): Promise<void> {
  const formB = page.locator('[data-testid="form-b"]');
  await expect(formB.locator(selectors.inputSelector).first()).toBeVisible({ timeout: 10000 });

  const labelFor = await formB.locator(selectors.labelSelector).first().getAttribute('for');
  const inputId = await formB.locator(selectors.inputSelector).first().getAttribute('id');

  expect(labelFor).toBe(inputId);
  await expect(page.locator(`[id="${inputId}"]`)).toHaveCount(1);
}

/**
 * Native `for`/`id` adapters only: the literal reported bug — clicking form B's
 * label must focus form B's input, not form A's identically-keyed input.
 */
export async function assertLabelClickFocusesOwnInput(page: Page, selectors: FieldSelectors): Promise<void> {
  const aInput = page.locator('[data-testid="form-a"]').locator(selectors.inputSelector).first();
  const bInput = page.locator('[data-testid="form-b"]').locator(selectors.inputSelector).first();
  await expect(bInput).toBeVisible({ timeout: 10000 });

  await page.locator('[data-testid="form-b"]').locator(selectors.labelSelector).first().click();

  await expect(bInput).toBeFocused();
  await expect(aInput).not.toBeFocused();
}
