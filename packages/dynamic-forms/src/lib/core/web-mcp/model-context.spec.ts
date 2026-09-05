import { afterEach, describe, expect, it, vi } from 'vitest';
import { findModelContext, isOverNameBudget, registerTool, validateToolName } from './model-context';
import type { JsonSchemaObject } from './json-schema';

const descriptor = (name: string) => ({
  name,
  description: 'A tool.',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false } as JsonSchemaObject,
  execute: async () => 'ok',
});

describe('validateToolName', () => {
  it.each(['fill_signup', 'a', 'a-b.c_d', 'A1'])('accepts %s', (name) => {
    expect(validateToolName(name)).toBeUndefined();
  });

  it.each([
    ['', 'empty'],
    ['has space', 'a space'],
    ['emoji🙂', 'an emoji'],
    ['a/b', 'a slash'],
  ])('rejects %s (%s)', (name) => {
    expect(validateToolName(name)).toContain('not usable');
  });

  it('rejects a name over 128 characters', () => {
    expect(validateToolName('a'.repeat(129))).toContain('not usable');
  });
});

describe('isOverNameBudget', () => {
  it('is quiet for a short name', () => {
    expect(isOverNameBudget('fill_signup')).toBe(false);
  });

  it('flags a name agents would struggle to scan', () => {
    expect(isOverNameBudget('fill_a_very_long_form_name_indeed_here')).toBe(true);
  });
});

describe('registerTool', () => {
  const context = (registerToolImpl: (...args: never[]) => unknown) => ({ registerTool: registerToolImpl }) as never;

  it('reports success once the browser resolves', async () => {
    const spy = vi.fn().mockResolvedValue(undefined);

    const result = await registerTool(context(spy), descriptor('fill_a'), new AbortController().signal);

    expect(result).toEqual({ ok: true });
    expect(spy).toHaveBeenCalledOnce();
  });

  it('passes the epoch signal through so the tool can be revoked', async () => {
    const spy = vi.fn().mockResolvedValue(undefined);
    const controller = new AbortController();

    await registerTool(context(spy), descriptor('fill_a'), controller.signal);

    expect(spy.mock.calls[0][1]).toEqual({ signal: controller.signal });
  });

  it('reports a rejection instead of swallowing it', async () => {
    const spy = vi.fn().mockRejectedValue(new DOMException('Tool "fill_a" is already registered', 'InvalidStateError'));

    const result = await registerTool(context(spy), descriptor('fill_a'), new AbortController().signal);

    expect(result).toEqual({ ok: false, reason: 'Tool "fill_a" is already registered' });
  });

  it('refuses an invalid name before it reaches the browser', async () => {
    const spy = vi.fn();

    const result = await registerTool(context(spy), descriptor('fill signup'), new AbortController().signal);

    expect(result).toMatchObject({ ok: false });
    expect(spy).not.toHaveBeenCalled();
  });

  it('does not register into an epoch that has already been superseded', async () => {
    const spy = vi.fn();
    const controller = new AbortController();
    controller.abort();

    const result = await registerTool(context(spy), descriptor('fill_a'), controller.signal);

    expect(result).toMatchObject({ ok: false });
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('findModelContext', () => {
  const hosts = globalThis as unknown as { document: Record<string, unknown>; navigator: Record<string, unknown> };
  const originalDocument = hosts.document['modelContext'];
  const originalNavigator = hosts.navigator['modelContext'];

  afterEach(() => {
    hosts.document['modelContext'] = originalDocument;
    hosts.navigator['modelContext'] = originalNavigator;
  });

  it('finds nothing on a page without WebMCP', () => {
    hosts.document['modelContext'] = undefined;
    hosts.navigator['modelContext'] = undefined;

    expect(findModelContext()).toBeUndefined();
  });

  it('prefers document.modelContext, the current surface', () => {
    const fromDocument = { registerTool: vi.fn() };
    hosts.document['modelContext'] = fromDocument;
    hosts.navigator['modelContext'] = { registerTool: vi.fn() };

    expect(findModelContext()).toBe(fromDocument);
  });

  it('falls back to navigator.modelContext, the deprecated one', () => {
    const fromNavigator = { registerTool: vi.fn() };
    hosts.document['modelContext'] = undefined;
    hosts.navigator['modelContext'] = fromNavigator;

    expect(findModelContext()).toBe(fromNavigator);
  });

  it('ignores a host property that is not a model context', () => {
    hosts.document['modelContext'] = { somethingElse: true };
    hosts.navigator['modelContext'] = undefined;

    expect(findModelContext()).toBeUndefined();
  });
});
