import type { JsonSchemaObject } from './json-schema';

/** A tool descriptor, as the browser's model context expects it. */
export interface ToolDescriptor {
  name: string;
  description: string;
  inputSchema: JsonSchemaObject;
  annotations?: Record<string, unknown>;
  execute: (args: Record<string, unknown>, client?: unknown) => Promise<string>;
}

/** The slice of the browser's model context this library uses. */
interface ModelContextLike {
  registerTool(descriptor: ToolDescriptor, options?: { signal?: AbortSignal }): unknown;
}

/**
 * Tool names the draft accepts: 1–128 characters, ASCII alphanumerics plus
 * `_`, `-` and `.`. Anything else is rejected by `registerTool()`, and a
 * rejection that nobody awaits looks exactly like success.
 *
 * @see https://webmachinelearning.github.io/webmcp/
 */
const NAME_PATTERN = /^[A-Za-z0-9_.-]{1,128}$/;

/**
 * Chrome's guidance is to keep tool names inside a small budget so an agent
 * choosing between many tools can read them. Not a hard limit — a longer name
 * still registers — so this only warns.
 *
 * @see https://developer.chrome.com/docs/ai/webmcp/secure-tools
 */
const NAME_BUDGET = 30;

/**
 * Locates the browser's model context.
 *
 * `document.modelContext` is the current surface; `navigator.modelContext` is
 * deprecated as of Chrome 150 and kept as a fallback for the origin trial's
 * earlier shape. Returns `undefined` where WebMCP is unavailable — an
 * unsupported browser, a document without the `tools` Permissions Policy, or a
 * non-isolated origin — which is a normal outcome, not an error.
 *
 * @internal
 */
export function findModelContext(): ModelContextLike | undefined {
  // `modelContext` is not in the DOM lib yet, so both hosts are read through an
  // index signature rather than a declaration merge that would leak globally.
  const hosts = globalThis as unknown as { document?: Record<string, unknown>; navigator?: Record<string, unknown> };

  const fromDocument = hosts.document?.['modelContext'];
  if (isModelContext(fromDocument)) return fromDocument;

  const fromNavigator = hosts.navigator?.['modelContext'];
  if (isModelContext(fromNavigator)) return fromNavigator;

  return undefined;
}

function isModelContext(candidate: unknown): candidate is ModelContextLike {
  return typeof (candidate as ModelContextLike | undefined)?.registerTool === 'function';
}

/** Why a tool name was refused, or `undefined` when it is usable. */
export function validateToolName(name: string): string | undefined {
  if (!NAME_PATTERN.test(name)) {
    return `Tool name "${name}" is not usable: names must be 1-128 characters of A-Z, a-z, 0-9, "_", "-" or ".".`;
  }
  return undefined;
}

/** Whether a usable name is longer than the budget agents can comfortably scan. */
export function isOverNameBudget(name: string): boolean {
  return name.length > NAME_BUDGET;
}

/**
 * Registers one tool and reports whether it actually landed.
 *
 * The draft's `registerTool()` is asynchronous and rejects on a duplicate name,
 * an invalid name, a permissions failure, or a descriptor it cannot serialize.
 * Angular's `declareExperimentalWebMcpTool()` calls it without returning or
 * awaiting the promise, so every one of those failures currently surfaces as
 * silence — which is why this talks to the platform directly instead.
 *
 * @internal
 */
export async function registerTool(
  context: ModelContextLike,
  descriptor: ToolDescriptor,
  signal: AbortSignal,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const invalid = validateToolName(descriptor.name);
  if (invalid) return { ok: false, reason: invalid };

  if (signal.aborted) return { ok: false, reason: 'Registration was superseded before it started.' };

  try {
    await context.registerTool(descriptor, { signal });
    return { ok: true };
  } catch (error: unknown) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}
