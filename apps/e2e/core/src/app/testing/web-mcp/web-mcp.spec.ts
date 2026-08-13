import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

/**
 * Installs a fake `navigator.modelContext` before the app boots and records
 * every tool the app registers.
 *
 * A recording fake is deliberate: the browser-side contract is a single
 * `registerTool(tool, { signal })` call, so faking it exercises the real
 * registration path while staying deterministic. Driving a real agent would
 * make these tests non-reproducible for no extra coverage.
 */
async function installModelContext(page: import('@playwright/test').Page): Promise<void> {
  await page.addInitScript(() => {
    const tools: Record<string, unknown> = {};
    (window as unknown as Record<string, unknown>)['__mcpTools'] = tools;

    (navigator as unknown as Record<string, unknown>)['modelContext'] = {
      registerTool: (tool: { name: string }) => {
        tools[tool.name] = tool;
      },
    };
  });
}

/** Calls a registered tool from page context and returns its text result. */
async function callTool(page: import('@playwright/test').Page, name: string, args: unknown): Promise<string> {
  return page.evaluate(
    async ({ toolName, toolArgs }) => {
      const tools = (window as unknown as Record<string, Record<string, unknown>>)['__mcpTools'];
      const tool = tools[toolName] as { execute: (a: unknown, c: unknown) => unknown } | undefined;
      if (!tool) throw new Error(`Tool "${toolName}" was never registered. Have: ${Object.keys(tools).join(', ')}`);
      return String(await tool.execute(toolArgs, {}));
    },
    { toolName: name, toolArgs: args },
  );
}

test.describe('WebMCP Tests', () => {
  test.beforeEach(async ({ page }) => {
    await installModelContext(page);
  });

  test('registers inspect and submit tools for an opted-in form', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    const names = await page.evaluate(() => Object.keys((window as unknown as Record<string, object>)['__mcpTools']));

    expect(names).toContain('signup_inspect');
    expect(names).toContain('signup_submit');
  });

  test('exposes select options as an enum in the tool schema', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    const schema = await page.evaluate(() => {
      const tools = (window as unknown as Record<string, Record<string, { inputSchema: unknown }>>)['__mcpTools'];
      return tools['signup_submit'].inputSchema;
    });

    expect(schema).toMatchObject({
      type: 'object',
      properties: {
        username: { type: 'string', title: 'Username' },
        plan: { type: 'string', enum: ['free', 'pro'] },
        newsletter: { type: 'boolean' },
      },
    });
  });

  test('inspect reports applicability from the live form, not the proposal', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    // `plan` defaults to 'free', so `referral` is hidden from the outset.
    const report = await callTool(page, 'signup_inspect', {});
    expect(report).toContain('Not currently applicable (do not send these): referral');

    // Conditional logic resolves through the form's evaluation context, which is
    // bound to the live root registry, so a dry run cannot re-derive visibility
    // for proposed values. The report says so rather than implying otherwise.
    const dryRun = await callTool(page, 'signup_inspect', { values: { plan: 'pro' } });
    expect(dryRun).toContain('Which fields apply reflects the form as it stands now');

    // Submitting for real does move it, which is the supported path.
    await callTool(page, 'signup_submit', { username: 'ada-lovelace', plan: 'pro' });
    const afterSubmit = await callTool(page, 'signup_inspect', {});
    expect(afterSubmit).not.toContain('Not currently applicable (do not send these): referral');
  });

  test('inspect dry run does not modify the rendered form', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    const scenario = helpers.getScenario('agent-fill-submit-test');
    const username = helpers.getInput(scenario, 'username');

    await callTool(page, 'signup_inspect', { values: { username: 'ada-lovelace' } });

    await expect(username).toHaveValue('');
  });

  test('inspect surfaces validation failures without submitting', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    const report = await callTool(page, 'signup_inspect', { values: { username: 'ab' } });

    expect(report).toContain('Validation errors:');
    expect(report).toContain('username');
  });

  test('submit fills the real form and its values land in the DOM', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    const result = await callTool(page, 'signup_submit', {
      username: 'ada-lovelace',
      plan: 'pro',
      newsletter: true,
    });

    expect(result).toContain('Form submitted successfully.');

    const scenario = helpers.getScenario('agent-fill-submit-test');
    await expect(helpers.getInput(scenario, 'username')).toHaveValue('ada-lovelace');
  });

  test('submit refuses invalid values and returns the errors', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    const result = await callTool(page, 'signup_submit', { username: 'ab' });

    expect(result).toContain('Form was not submitted because validation failed');

    const scenario = helpers.getScenario('agent-fill-submit-test');
    await expect(helpers.getInput(scenario, 'username')).toHaveValue('ab');
  });
});
