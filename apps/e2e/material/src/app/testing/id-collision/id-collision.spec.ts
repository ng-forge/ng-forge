import { setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { assertExplicitPrefixes, assertToggleCleanup, assertTwoFormsScoped } from '@ng-forge/examples-shared-testing/id-collision-spec';

setupTestLogging();
setupConsoleCheck();

// Material's <mat-label> uses aria, not native for/id — core invariants (no dup ids + form-id scoping) cover the fix.
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
