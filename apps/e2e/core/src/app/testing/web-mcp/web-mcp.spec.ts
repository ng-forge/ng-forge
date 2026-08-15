import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

/**
 * Installs a fake `document.modelContext` before the app boots and records every
 * tool the app registers.
 *
 * A recording fake is deliberate: the browser-side contract is a single
 * `registerTool(tool, { signal })` call, so faking it exercises the real
 * registration path while staying deterministic. Driving a real agent would make
 * these tests non-reproducible for no extra coverage.
 */
async function installModelContext(page: import('@playwright/test').Page): Promise<void> {
  await page.addInitScript(() => {
    const tools: Record<string, unknown> = {};
    (window as unknown as Record<string, unknown>)['__mcpTools'] = tools;

    // `document.modelContext` is the current surface; `navigator.modelContext`
    // is deprecated as of Chrome 150.
    (document as unknown as Record<string, unknown>)['modelContext'] = {
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

const toolNames = (page: import('@playwright/test').Page) =>
  page.evaluate(() => Object.keys((window as unknown as Record<string, object>)['__mcpTools']));

test.describe('WebMCP Tests', () => {
  test.beforeEach(async ({ page }) => {
    await installModelContext(page);
  });

  test('registers a fill tool, and a submit tool only when the form allows it', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    expect(await toolNames(page)).toEqual(expect.arrayContaining(['fill_signup', 'submit_signup']));
  });

  test('registers no submit tool by default', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-only');

    const names = await toolNames(page);

    expect(names).toContain('fill_payment');
    expect(names).not.toContain('submit_payment');
  });

  test('exposes select options as an enum in the tool schema', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    const schema = await page.evaluate(() => {
      const tools = (window as unknown as Record<string, Record<string, { inputSchema: unknown }>>)['__mcpTools'];
      return tools['fill_signup'].inputSchema;
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

  test('flags returned values as untrusted content', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-only');

    const annotations = await page.evaluate(() => {
      const tools = (window as unknown as Record<string, Record<string, { annotations: unknown }>>)['__mcpTools'];
      return tools['fill_payment'].annotations;
    });

    expect(annotations).toEqual({ untrustedContentHint: true });
  });

  test('fill with no arguments reads state without changing it', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    const report = await callTool(page, 'fill_signup', {});

    expect(report).toContain('No changes made.');

    const scenario = helpers.getScenario('agent-fill-submit-test');
    await expect(helpers.getInput(scenario, 'username')).toHaveValue('');
  });

  test('fill writes values into the rendered form', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    const report = await callTool(page, 'fill_signup', { username: 'ada-lovelace' });

    expect(report).toContain('Values applied.');

    const scenario = helpers.getScenario('agent-fill-submit-test');
    await expect(helpers.getInput(scenario, 'username')).toHaveValue('ada-lovelace');
  });

  test('fill re-derives applicability from the values it applied', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    // `plan` defaults to 'free', which hides the referral field.
    const before = await callTool(page, 'fill_signup', {});
    expect(before).toContain('Not currently applicable (do not send these): referral');

    // Applying to the live form means conditional logic re-evaluates for real.
    const after = await callTool(page, 'fill_signup', { plan: 'pro' });
    expect(after).not.toContain('Not currently applicable (do not send these): referral');
  });

  test('fill reports validation errors using the configured messages', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    const report = await callTool(page, 'fill_signup', { username: 'ab' });

    expect(report).toContain('username: Must be at least 3 characters');
  });

  test('submit refuses invalid values and says the values were kept', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    const result = await callTool(page, 'submit_signup', { username: 'ab' });

    expect(result).toContain('Not submitted: validation failed.');
    expect(result).toContain('are still there');

    const scenario = helpers.getScenario('agent-fill-submit-test');
    await expect(helpers.getInput(scenario, 'username')).toHaveValue('ab');
  });

  test('submit commits values staged by an earlier fill', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    await callTool(page, 'fill_signup', { username: 'ada-lovelace', plan: 'pro' });
    const result = await callTool(page, 'submit_signup', {});

    expect(result).toContain('Form submitted successfully.');

    const scenario = helpers.getScenario('agent-fill-submit-test');
    await expect(helpers.getInput(scenario, 'username')).toHaveValue('ada-lovelace');
  });
});
