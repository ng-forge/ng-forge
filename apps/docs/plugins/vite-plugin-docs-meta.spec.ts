/**
 * Unit tests for the docs-meta plugin's hooks. These call the hooks
 * directly (the typical pattern for testing Vite plugins) rather than
 * spinning up a full Vite server / build pipeline.
 */
import { describe, expect, it, vi } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin, PluginContext, ViteDevServer } from 'vite';
import { docsMetaPlugin } from './vite-plugin-docs-meta';

// The sitemap middleware generates the sitemap on demand, which shells out to
// `git log` once per content file. Give this file headroom over the 5s default
// so the git-backed paths do not flake under parallel test load.
vi.setConfig({ testTimeout: 30_000, hookTimeout: 30_000 });

type Hook<K extends keyof Plugin> = Plugin[K];

// vite types `hook` as `T | ObjectHook<T>`; resolveId/load are the function form here.
function getHook<K extends 'resolveId' | 'load'>(plugin: Plugin, name: K): Extract<Hook<K>, (...args: never[]) => unknown> {
  const hook = plugin[name];
  if (typeof hook !== 'function') throw new Error(`Plugin hook ${name} is not a function`);
  return hook as Extract<Hook<K>, (...args: never[]) => unknown>;
}

describe('docsMetaPlugin — virtual module', () => {
  const plugin = docsMetaPlugin();
  const resolveId = getHook(plugin, 'resolveId');
  const load = getHook(plugin, 'load');

  // resolveId/load can take a PluginContext; we don't use `this` so a stub is fine.
  const ctx = {} as PluginContext;

  it('resolveId returns the NUL-prefixed resolved id for the virtual module', () => {
    const resolved = (resolveId as (this: PluginContext, id: string) => unknown).call(ctx, 'virtual:docs-meta/migration-modified');
    expect(resolved).toBe('\0virtual:docs-meta/migration-modified');
  });

  it('resolveId returns undefined for unrelated ids (falls through to the next plugin)', () => {
    const resolved = (resolveId as (this: PluginContext, id: string) => unknown).call(ctx, './some-other-module');
    expect(resolved).toBeUndefined();
  });

  it('load returns a TS module exporting MIGRATION_GUIDE_DATE_MODIFIED for the resolved id', () => {
    const source = (load as (this: PluginContext, id: string) => unknown).call(ctx, '\0virtual:docs-meta/migration-modified');
    expect(typeof source).toBe('string');
    expect(source as string).toMatch(/^export const MIGRATION_GUIDE_DATE_MODIFIED = "\d{4}-\d{2}-\d{2}";\n$/);
  });

  it("load returns undefined for ids it doesn't own", () => {
    const source = (load as (this: PluginContext, id: string) => unknown).call(ctx, '/some/real/file.ts');
    expect(source).toBeUndefined();
  });
});

describe('docsMetaPlugin — dev middleware', () => {
  const plugin = docsMetaPlugin();
  type Middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => void;

  function captureMiddleware(): Middleware {
    let captured: Middleware | undefined;
    const fakeServer = {
      middlewares: {
        use: (mw: Middleware) => {
          captured = mw;
        },
      },
    } as unknown as ViteDevServer;
    plugin.configureServer!.call({} as never, fakeServer);
    if (!captured) throw new Error('Middleware was not registered');
    return captured;
  }

  function fakeReq(url: string): IncomingMessage {
    return { url } as IncomingMessage;
  }

  function fakeRes(): ServerResponse & { _body: string; _headers: Record<string, string> } {
    const headers: Record<string, string> = {};
    const res = {
      _body: '',
      _headers: headers,
      statusCode: 200,
      setHeader: (key: string, value: string) => {
        headers[key] = value;
      },
      end: function (body: string) {
        this._body = body;
      },
    };
    return res as unknown as ServerResponse & { _body: string; _headers: Record<string, string> };
  }

  it('serves /sitemap.xml with application/xml content-type', () => {
    const mw = captureMiddleware();
    const req = fakeReq('/sitemap.xml');
    const res = fakeRes();
    const next = vi.fn();
    mw(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res._headers['Content-Type']).toBe('application/xml');
    expect(res._body).toContain('<urlset xmlns=');
  });

  it('serves /llms-full.txt with text/plain content-type', () => {
    const mw = captureMiddleware();
    const req = fakeReq('/llms-full.txt');
    const res = fakeRes();
    const next = vi.fn();
    mw(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res._headers['Content-Type']).toBe('text/plain; charset=utf-8');
    expect(res._body).toContain('# ng-forge Dynamic Forms');
  });

  it('matches paths with a query string (e.g. /sitemap.xml?nocache=1)', () => {
    const mw = captureMiddleware();
    const res = fakeRes();
    const next = vi.fn();
    mw(fakeReq('/sitemap.xml?nocache=1'), res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res._body).toContain('<urlset xmlns=');
  });

  it('calls next() for unrelated URLs (does not intercept the request)', () => {
    const mw = captureMiddleware();
    const res = fakeRes();
    const next = vi.fn();
    mw(fakeReq('/some-other-page'), res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res._body).toBe('');
  });
});

describe('docsMetaPlugin — generateBundle', () => {
  it('emits both sitemap.xml and llms-full.txt as assets', () => {
    const plugin = docsMetaPlugin();
    const emitted: { fileName: string; source: string }[] = [];
    const fakeContext = {
      emitFile: ({ fileName, source }: { type: 'asset'; fileName: string; source: string }) => {
        emitted.push({ fileName, source });
        return '';
      },
      error: (msg: string) => {
        throw new Error(msg);
      },
    } as unknown as PluginContext;

    const generateBundle = plugin.generateBundle;
    if (typeof generateBundle !== 'function') throw new Error('generateBundle is not a function');
    // generateBundle's full signature is (opts, bundle, isWrite) — we pass empties because the
    // implementation only uses `this`.
    (generateBundle as (this: PluginContext, ...args: never[]) => void).call(fakeContext, {} as never, {} as never, true as never);

    expect(emitted.map((e) => e.fileName).sort()).toEqual(['llms-full.txt', 'sitemap.xml']);
    const sitemap = emitted.find((e) => e.fileName === 'sitemap.xml')!;
    expect(sitemap.source).toContain('<urlset xmlns=');
    const llms = emitted.find((e) => e.fileName === 'llms-full.txt')!;
    expect(llms.source).toContain('# ng-forge Dynamic Forms');
  });
});
