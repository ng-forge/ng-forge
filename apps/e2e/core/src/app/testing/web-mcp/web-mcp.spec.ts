import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import type { Page } from '@playwright/test';

setupTestLogging();
setupConsoleCheck();

/**
 * Installs a stand-in for `document.modelContext` before the app boots.
 *
 * It enforces what the real one enforces rather than recording whatever it is
 * handed: registration is asynchronous, a duplicate or malformed name rejects,
 * the descriptor has to serialize, and an aborted signal unregisters the tool.
 * Those are exactly the failures a fire-and-forget `registerTool()` cannot see,
 * so a permissive spy would pass against broken code.
 *
 * Tools are then driven through `getTools()` / `executeTool()`, the agent-facing
 * surface, rather than by reaching for a stored descriptor.
 */
async function installModelContext(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const tools = new Map<string, { name: string; execute: (a: unknown, c: unknown) => unknown }>();
    // Every register/unregister in order, so a config swap can be checked for
    // the thing that matters: the old tools go before the new ones arrive.
    const lifecycle: string[] = [];

    (window as unknown as Record<string, unknown>)['__mcp'] = {
      lifecycle: () => lifecycle.slice(),
      // Descriptors reach an agent without their implementations.
      getTools: () => [...tools.values()].map((tool) => Object.fromEntries(Object.entries(tool).filter(([key]) => key !== 'execute'))),
      executeTool: async (name: string, args: unknown) => {
        const tool = tools.get(name);
        if (!tool) throw new Error(`Tool "${name}" was never registered. Have: ${[...tools.keys()].join(', ')}`);
        return String(await tool.execute(args, {}));
      },
    };

    // `document.modelContext` is the current surface; `navigator.modelContext`
    // is deprecated as of Chrome 150.
    (document as unknown as Record<string, unknown>)['modelContext'] = {
      registerTool: async (tool: { name: string; inputSchema: unknown }, options?: { signal?: AbortSignal }) => {
        if (options?.signal?.aborted) throw new DOMException('Registration aborted', 'AbortError');
        if (!/^[A-Za-z0-9_.-]{1,128}$/.test(tool.name)) throw new TypeError(`Invalid tool name "${tool.name}"`);
        if (tools.has(tool.name)) throw new DOMException(`Tool "${tool.name}" is already registered`, 'InvalidStateError');
        JSON.stringify(tool.inputSchema);

        tools.set(tool.name, tool as never);
        lifecycle.push(`register ${tool.name}`);
        options?.signal?.addEventListener('abort', () => {
          tools.delete(tool.name);
          lifecycle.push(`unregister ${tool.name}`);
        });
      },
    };
  });
}

interface ToolDescriptor {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, unknown>;
}

interface McpHarness {
  getTools(): ToolDescriptor[];
  executeTool(name: string, args: unknown): Promise<string>;
  lifecycle(): string[];
}

/** Calls a registered tool the way an agent would, and returns its text result. */
function callTool(page: Page, name: string, args: unknown): Promise<string> {
  return page.evaluate(
    ({ toolName, toolArgs }) => (window as unknown as Record<string, McpHarness>)['__mcp'].executeTool(toolName, toolArgs),
    { toolName: name, toolArgs: args },
  );
}

const listTools = (page: Page) => page.evaluate(() => (window as unknown as Record<string, McpHarness>)['__mcp'].getTools());
const toolNames = async (page: Page) => (await listTools(page)).map((tool) => tool.name);
const lifecycle = (page: Page) => page.evaluate(() => (window as unknown as Record<string, McpHarness>)['__mcp'].lifecycle());

/**
 * Clicks a config-swap button and waits for the registry to reach `expected`.
 *
 * Waits on the tool set itself rather than a delay: registration is a lazy
 * import followed by an awaited `registerTool`, so how long it takes is not
 * something a fixed timeout should be guessing at.
 */
async function switchConfig(page: Page, key: string, expected: string[]): Promise<void> {
  await page.getByTestId(`switch-to-${key}`).click();
  await page.waitForFunction(
    (want) => {
      const names = (window as unknown as Record<string, McpHarness>)['__mcp']
        .getTools()
        .map((tool) => tool.name)
        .sort();
      return JSON.stringify(names) === JSON.stringify([...want].sort());
    },
    expected,
    { timeout: 5000 },
  );
}

test.beforeEach(async ({ page }) => {
  await installModelContext(page);
});

test.describe('WebMCP Tests', () => {
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

  test('exposes select options with their labels, and no required list', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    const [schema] = (await listTools(page)).filter((tool) => tool.name === 'fill_signup').map((tool) => tool.inputSchema);

    expect(schema).toMatchObject({
      type: 'object',
      properties: {
        username: { type: 'string', title: 'Username', minLength: 3 },
        plan: {
          type: 'string',
          enum: ['free', 'pro'],
          anyOf: [
            { const: 'free', title: 'Free' },
            { const: 'pro', title: 'Pro' },
          ],
        },
        newsletter: { type: 'boolean' },
      },
    });
    expect(schema).not.toHaveProperty('required');
  });

  test('carries option labels for values an agent could not otherwise read', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-only');

    const [schema] = (await listTools(page)).filter((tool) => tool.name === 'fill_payment').map((tool) => tool.inputSchema);

    // 'GB' means nothing on its own. The anyOf branches are what let an agent
    // asked for the United Kingdom pick it.
    expect(schema).toMatchObject({
      properties: {
        country: {
          enum: ['GB', 'DE', 'JP'],
          anyOf: [
            { const: 'GB', title: 'United Kingdom' },
            { const: 'DE', title: 'Germany' },
            { const: 'JP', title: 'Japan' },
          ],
        },
      },
    });
  });

  test('flags returned values as untrusted content', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-only');

    const [tool] = (await listTools(page)).filter((candidate) => candidate.name === 'fill_payment');

    expect(tool.annotations).toEqual({ untrustedContentHint: true });
  });

  test('fill with no arguments reads state without changing it', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    const report = await callTool(page, 'fill_signup', {});

    expect(report).toContain('No changes made.');
    expect(report).toContain('Still empty: username');

    const scenario = helpers.getScenario('agent-fill-submit-test');
    await expect(helpers.getInput(scenario, 'username')).toHaveValue('');
  });

  test('fill writes values into the rendered form', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    const report = await callTool(page, 'fill_signup', { username: 'ada-lovelace' });

    expect(report).toContain('Applied: username.');

    const scenario = helpers.getScenario('agent-fill-submit-test');
    await expect(helpers.getInput(scenario, 'username')).toHaveValue('ada-lovelace');
  });

  test('fill rejects an argument the schema does not describe, leaving the form alone', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    const report = await callTool(page, 'fill_signup', { username: 'ada-lovelace', admin: true });

    expect(report).toContain('Nothing was applied.');
    expect(report).toContain('Unknown field "admin"');

    const scenario = helpers.getScenario('agent-fill-submit-test');
    await expect(helpers.getInput(scenario, 'username')).toHaveValue('');
  });

  test('fill rejects a value outside a select’s options', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-submit');

    expect(await callTool(page, 'fill_signup', { plan: 'enterprise' })).toContain('not one of');
  });

  test('fill merges into a group instead of replacing it', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-only');

    await callTool(page, 'fill_payment', { card: { number: '4111111111111111' } });

    const scenario = helpers.getScenario('agent-fill-only-test');
    await expect(helpers.getInput(scenario, 'expiry')).toHaveValue('12/30');
  });

  test('fill never hands back a field marked unreadable', async ({ page, helpers }) => {
    await helpers.navigateToScenario('/test/web-mcp/agent-fill-only');

    const report = await callTool(page, 'fill_payment', { card: { number: '4111111111111111' } });

    expect(report).not.toContain('4111111111111111');
    expect(report).toContain('not readable by agents');
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

    // No `submission.action` on this scenario, so the page's own `(submitted)`
    // output takes it from here.
    expect(result).toContain('The page handled the submission itself');

    const scenario = helpers.getScenario('agent-fill-submit-test');
    await expect(helpers.getInput(scenario, 'username')).toHaveValue('ada-lovelace');
  });

  test.describe('config swaps', () => {
    const swapUrl = '/test/web-mcp/agent-config-swap';

    test('replaces the tools when the config is renamed', async ({ page, helpers }) => {
      await helpers.navigateToScenario(swapUrl);
      expect(await toolNames(page)).toEqual(['fill_swap', 'submit_swap']);

      await switchConfig(page, 'renamed', ['fill_renamed']);

      expect(await toolNames(page)).toEqual(['fill_renamed']);
    });

    test('unregisters the old tools before registering the new ones', async ({ page, helpers }) => {
      await helpers.navigateToScenario(swapUrl);

      await switchConfig(page, 'renamed', ['fill_renamed']);

      // Ordering is the whole point: registering first would collide on a
      // reused name, and unregistering late would leave a window where an
      // agent can drive the previous config's tools against the new form.
      expect(await lifecycle(page)).toEqual([
        'register fill_swap',
        'register submit_swap',
        'unregister fill_swap',
        'unregister submit_swap',
        'register fill_renamed',
      ]);
    });

    test('rebuilds the schema for the new config', async ({ page, helpers }) => {
      await helpers.navigateToScenario(swapUrl);

      await switchConfig(page, 'renamed', ['fill_renamed']);

      const [schema] = (await listTools(page)).map((tool) => tool.inputSchema);
      expect(Object.keys((schema as { properties: object }).properties)).toEqual(['beta']);
    });

    test('rejects the previous config’s field after a swap', async ({ page, helpers }) => {
      await helpers.navigateToScenario(swapUrl);

      await switchConfig(page, 'renamed', ['fill_renamed']);
      const result = await callTool(page, 'fill_renamed', { alpha: 'from the old config' });

      expect(result).toContain('Nothing was applied.');
      expect(result).toContain('Unknown field "alpha"');
    });

    test('writes into the form the new config actually rendered', async ({ page, helpers }) => {
      await helpers.navigateToScenario(swapUrl);

      await switchConfig(page, 'renamed', ['fill_renamed']);
      await callTool(page, 'fill_renamed', { beta: 'written by an agent' });

      const scenario = helpers.getScenario('agent-config-swap');
      await expect(helpers.getInput(scenario, 'beta')).toHaveValue('written by an agent');
    });

    test('revokes the submit tool when allowSubmit is turned off', async ({ page, helpers }) => {
      await helpers.navigateToScenario(swapUrl);
      expect(await toolNames(page)).toContain('submit_swap');

      // Same tool name, submission turned off. Turning it off has to revoke the
      // agent's authority, not merely stop advertising it.
      await switchConfig(page, 'revoked', ['fill_swap']);

      expect(await toolNames(page)).toEqual(['fill_swap']);
    });

    test('leaves an agent holding a stale submit reference unable to use it', async ({ page, helpers }) => {
      await helpers.navigateToScenario(swapUrl);

      const outcome = await page.evaluate(async () => {
        const mcp = (window as unknown as Record<string, McpHarness>)['__mcp'];
        // An agent that already discovered the tool holds a reference to it.
        const stashed = () => mcp.executeTool('submit_swap', {});
        (window as unknown as Record<string, unknown>)['__stashed'] = stashed;
        return typeof stashed;
      });
      expect(outcome).toBe('function');

      await switchConfig(page, 'revoked', ['fill_swap']);

      const afterRevoke = await page.evaluate(async () => {
        try {
          await (window as unknown as Record<string, () => Promise<string>>)['__stashed']();
          return 'submitted';
        } catch (error) {
          return `refused: ${(error as Error).message}`;
        }
      });
      expect(afterRevoke).toContain('refused');
    });

    test('unregisters everything when the form opts out', async ({ page, helpers }) => {
      await helpers.navigateToScenario(swapUrl);

      await switchConfig(page, 'none', []);

      expect(await toolNames(page)).toEqual([]);
    });
  });
});
