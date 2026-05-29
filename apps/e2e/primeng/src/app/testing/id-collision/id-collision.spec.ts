import { setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import {
  assertExplicitPrefixes,
  assertLabelClickFocusesOwnInput,
  assertLabelForMatchesOwnInput,
  assertToggleCleanup,
  assertTwoFormsScoped,
  FieldSelectors,
} from '@ng-forge/examples-shared-testing/id-collision-spec';

setupTestLogging();
setupConsoleCheck();

// PrimeNG renders native `<label for>` + `<input id>`, so the reported
// focus-jump bug is directly reproducible.
const SELECTORS: FieldSelectors = { inputSelector: 'input', labelSelector: 'label' };

test.describe('ID Collision E2E Tests', () => {
  test.describe('Two identical forms', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/id-collision/two-forms');
    });

    test('scopes each form to a distinct id with no duplicates', async ({ page }) => {
      await assertTwoFormsScoped(page);
    });

    test("each label's for matches an input inside its OWN form", async ({ page }) => {
      await assertLabelForMatchesOwnInput(page, SELECTORS);
    });

    test("clicking form B's label focuses form B's input, not form A's (bug repro)", async ({ page }) => {
      await assertLabelClickFocusesOwnInput(page, SELECTORS);
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
