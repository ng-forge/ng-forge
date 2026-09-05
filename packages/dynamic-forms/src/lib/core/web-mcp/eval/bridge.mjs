/**
 * Serves a page's WebMCP tools over HTTP, and nothing else.
 *
 * An agent driving this sees what a browser agent sees: tool names,
 * descriptions, input schemas, and the text each call returns. It cannot see
 * the form config, the DOM, or this repository. That isolation is the whole
 * point; an agent that can read the config is not being evaluated on the tool
 * surface.
 *
 * Usage:
 *   nx run core-examples:build
 *   nx run core-examples:serve-static --port 4205
 *   node packages/dynamic-forms/src/lib/core/web-mcp/eval/bridge.mjs
 *
 * Then, from the agent under test:
 *   curl -s -X POST localhost:4310/reset -d '{"scenario":"agent-fill-submit"}'
 *   curl -s localhost:4310/tools
 *   curl -s -X POST localhost:4310/call -d '{"name":"fill_signup","args":{}}'
 *
 * And, for grading only, never handed to the agent:
 *   curl -s localhost:4310/transcripts
 */
import playwright from 'playwright';
import { createServer } from 'node:http';

const { chromium } = playwright;

const APP = process.env.APP_URL ?? 'http://localhost:4205';
const PORT = Number(process.env.BRIDGE_PORT ?? 4310);
const EXECUTABLE = process.env.CHROMIUM_PATH;

const browser = await chromium.launch({
  ...(EXECUTABLE ? { executablePath: EXECUTABLE } : {}),
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});

let page;
let current;

/**
 * Every task's transcript, kept across resets.
 *
 * `/reset` clears the page, so without this the log of each task would be gone
 * the moment the next one started, leaving only the agent's own account of what
 * it did. The graders read the recorder precisely so they do not have to trust
 * that account, so the bridge has to be the thing that remembers.
 */
const transcripts = [];

async function reset(scenario, taskId) {
  if (page) await capture();
  if (page) await page.context().close();

  const context = await browser.newContext();
  await context.addInitScript(() => {
    const tools = new Map();
    const calls = [];
    window.__mcp = { tools, calls };
    document.modelContext = {
      async registerTool(tool, options) {
        if (options?.signal?.aborted) throw new DOMException('aborted', 'AbortError');
        if (!/^[A-Za-z0-9_.-]{1,128}$/.test(tool.name)) throw new TypeError(`invalid tool name "${tool.name}"`);
        if (tools.has(tool.name)) throw new DOMException(`duplicate tool "${tool.name}"`, 'InvalidStateError');
        JSON.stringify(tool.inputSchema);
        tools.set(tool.name, tool);
        options?.signal?.addEventListener('abort', () => tools.delete(tool.name));
      },
    };
  });

  page = await context.newPage();
  current = { taskId: taskId ?? scenario, scenario };
  await page.goto(`${APP}/#/test/web-mcp/${scenario}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__mcp && window.__mcp.tools.size > 0, null, { timeout: 15000 });
  return listTools();
}

/** Snapshots the finished task into `transcripts`, in the shape the graders take. */
async function capture() {
  const { formValue, calls } = await state();
  if (calls.length) transcripts.push({ ...current, calls, finalValue: formValue });
}

const listTools = () =>
  page.evaluate(() =>
    [...window.__mcp.tools.values()].map(({ name, description, inputSchema, annotations }) => ({
      name,
      description,
      inputSchema,
      annotations,
    })),
  );

const callTool = (name, args) =>
  page.evaluate(
    async ({ name, args }) => {
      const tool = window.__mcp.tools.get(name);
      if (!tool) return { error: `No tool named "${name}". Available: ${[...window.__mcp.tools.keys()].join(', ')}` };
      const result = String(await tool.execute(args, {}));
      window.__mcp.calls.push({ tool: name, args, result, at: Date.now() });
      return { result };
    },
    { name, args },
  );

const state = () =>
  page.evaluate(() => {
    const pre = document.querySelector('[data-testid^="form-value-"]');
    let formValue;
    try {
      formValue = JSON.parse(pre?.textContent ?? '{}');
    } catch {
      formValue = { unparsed: pre?.textContent };
    }
    return { formValue, calls: window.__mcp.calls };
  });

const body = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
  });

createServer(async (req, res) => {
  const send = (code, payload) => {
    res.writeHead(code, { 'content-type': 'application/json' });
    res.end(JSON.stringify(payload, null, 2));
  };

  try {
    const { pathname } = new URL(req.url, 'http://bridge');

    if (pathname === '/reset') {
      const { scenario = 'agent-fill-submit', taskId } = await body(req);
      return send(200, await reset(scenario, taskId));
    }
    if (pathname === '/tools') return send(200, await listTools());
    if (pathname === '/call') {
      const { name, args } = await body(req);
      return send(200, await callTool(name, args ?? {}));
    }
    // Grading only. Handing this to the agent under test would tell it answers
    // the tools are supposed to convey.
    if (pathname === '/transcripts') {
      await capture();
      return send(200, transcripts);
    }
    send(404, { error: 'use /reset, /tools, /call or /transcripts' });
  } catch (error) {
    // Details go to the operator's console, not into the response: the agent
    // under test reads these bodies and must not learn about the harness.
    console.error('bridge request failed', error);
    send(500, { error: 'bridge request failed, see the bridge console' });
  }
}).listen(PORT, () => console.log(`WebMCP eval bridge on ${PORT}, driving ${APP}`));
