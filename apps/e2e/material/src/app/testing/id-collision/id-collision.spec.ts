import { setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { assertExplicitPrefixes, assertToggleCleanup, assertTwoFormsScoped } from '@ng-forge/examples-shared-testing/id-collision-spec';

setupTestLogging();
setupConsoleCheck();

// Material associates `<mat-label>` to the input via aria, not a native
// `for`/`id`, so the focus-jump click isn't a meaningful repro here. The fix is
// still validated by the core invariants: no duplicate ids + form-id scoping,
// which hold regardless of how the adapter renders labels.
test.describe('ID Collision E2E Tests', () => {
  test.describe('Two identical forms', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/id-collision/two-forms');
    });

    test('scopes each form to a distinct id with no duplicates', async ({ page }) => {
      await assertTwoFormsScoped(page);
    });
  });

  test.describe('Explicit prefixes', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/id-collision/explicit');
    });

    test('reflects the configured idPrefix on the form id', async ({ page }) => {
      await assertExplicitPrefixes(page);
    });
  });

  test.describe('Toggle / cleanup', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/id-collision/toggle');
    });

    test('lone form is unprefixed; adding a second scopes both; removing keeps the survivor working', async ({ page }) => {
      await assertToggleCleanup(page);
    });
  });
});
