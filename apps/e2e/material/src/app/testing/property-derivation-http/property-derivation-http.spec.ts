import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Property Derivation — HTTP source', () => {
  test('an HTTP-driven select populates its options from a backend endpoint as the dependency field changes', async ({
    page,
    helpers,
    mockApi,
  }) => {
    // Mock the search endpoint. Regex (not string-glob) is required so the
    // pattern matches when query parameters like `?q=Main` are appended —
    // Playwright's `**/path` glob anchors at end-of-string.
    await mockApi.mockSuccess(/\/api\/address\/streets\/search/, {
      body: [
        { id: 's-1', streetNameShort: 'Mainstraße' },
        { id: 's-2', streetNameShort: 'Eichenallee' },
      ],
    });

    await page.goto('/#/test/property-derivation-http/http-driven-select-options');
    await page.waitForLoadState('networkidle');

    const scenario = helpers.getScenario('http-driven-select-options');
    await expect(scenario).toBeVisible({ timeout: 10000 });

    const streetInput = helpers.getInput(scenario, 'street');
    await expect(streetInput).toBeVisible({ timeout: 5000 });

    // Type into the dependency field — fires a debounced HTTP request
    // carrying `?q=` from the `queryParams` config.
    await helpers.fillInput(streetInput, 'Main');

    // Wait long enough for: debounceTime(100) → HTTP fire → response → store write → CD.
    await page.waitForTimeout(400);

    // The interceptor recorded the request — confirm the URL and query.
    const requests = mockApi.getInterceptedRequests(/\/api\/address\/streets\/search/);
    expect(requests.length).toBeGreaterThan(0);
    const lastRequest = requests[requests.length - 1];
    expect(lastRequest.method).toBe('GET');
    expect(lastRequest.url).toContain('q=Main');

    // The select dropdown should now contain the mapped options. Open it and
    // verify both option labels are rendered.
    const dropdown = scenario.locator('#streetDropdown mat-select');
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    await dropdown.click();

    const optionPanel = page.locator('.cdk-overlay-pane mat-option');
    await expect(optionPanel).toHaveCount(2, { timeout: 5000 });
    await expect(optionPanel.nth(0)).toContainText('Mainstraße');
    await expect(optionPanel.nth(1)).toContainText('Eichenallee');

    // Picking an option commits the option's value (the response `id`) to the
    // form, confirming the arrow-function + object-literal `responseExpression`
    // produced the expected `{ value, label }` shape.
    await optionPanel.nth(0).click();
    await expect(dropdown.locator('.mat-mdc-select-value-text')).toContainText('Mainstraße');
  });
});
