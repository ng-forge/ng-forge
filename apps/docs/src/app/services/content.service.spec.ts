import '@angular/compiler';
import { Injector, PLATFORM_ID, TransferState, runInInjectionContext } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { of, throwError, firstValueFrom } from 'rxjs';
import { ContentService, RenderedContent } from './content.service';

// Mock the shiki highlighter — returns a plain code block to keep tests fast
vi.mock('../utils/shiki', () => ({
  highlightCode: vi.fn(async (code: string, lang: string) => {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre class="shiki"><code class="language-${lang}">${escaped}</code></pre>`;
  }),
}));

/** Minimal DomSanitizer that just wraps the string as-is. */
const fakeSanitizer: Partial<DomSanitizer> = {
  bypassSecurityTrustHtml: (html: string) => html as unknown as SafeHtml,
};

/** Minimal TransferState mock. */
function createFakeTransferState(): TransferState {
  const store = new Map<string, unknown>();
  return {
    hasKey: (key: unknown) => store.has(String(key)),
    get<T>(key: unknown, defaultValue: T): T {
      return (store.has(String(key)) ? store.get(String(key)) : defaultValue) as T;
    },
    set: (key: unknown, value: unknown) => store.set(String(key), value),
    remove: (key: unknown) => store.delete(String(key)),
    toJson: () => ({}),
  } as unknown as TransferState;
}

function createService(httpMock: Partial<HttpClient>, baseHref = '/'): ContentService {
  const injector = Injector.create({
    providers: [
      { provide: HttpClient, useValue: httpMock },
      { provide: DomSanitizer, useValue: fakeSanitizer },
      { provide: TransferState, useValue: createFakeTransferState() },
      { provide: PLATFORM_ID, useValue: 'server' },
      { provide: APP_BASE_HREF, useValue: baseHref },
    ],
  });
  return runInInjectionContext(injector, () => new (ContentService as unknown as new () => ContentService)());
}

function createServiceWithGet(responseBody: string): { service: ContentService; getMock: ReturnType<typeof vi.fn> } {
  const getMock = vi.fn().mockReturnValue(of(responseBody));
  const service = createService({ get: getMock });
  return { service, getMock };
}

async function loadContent(markdown: string): Promise<RenderedContent> {
  const { service } = createServiceWithGet(markdown);
  return firstValueFrom(service.load('test'));
}

describe('ContentService', () => {
  it('should load and render markdown content', async () => {
    const content = await loadContent('## Hello World\n\nSome paragraph.');
    expect(content.rawHtml).toContain('<h2');
    expect(content.rawHtml).toContain('Hello World');
    expect(content.rawHtml).toContain('Some paragraph.');
  });

  it('should extract title and description from frontmatter', async () => {
    const md = `---
title: My Page Title
description: A brief description of the page
---

## Content here`;
    const content = await loadContent(md);
    expect(content.title).toBe('My Page Title');
    expect(content.description).toBe('A brief description of the page');
  });

  it('should unquote frontmatter values wrapped in quotes', async () => {
    const md = `---
title: "Quoted Title"
description: 'Single Quoted'
---

## Body`;
    const content = await loadContent(md);
    expect(content.title).toBe('Quoted Title');
    expect(content.description).toBe('Single Quoted');
  });

  it('should strip frontmatter before rendering', async () => {
    const md = `---
title: Hidden
---

## Visible`;
    const content = await loadContent(md);
    expect(content.rawHtml).not.toContain('title: Hidden');
    expect(content.rawHtml).toContain('Visible');
  });

  it('should cache results — second call returns same observable', () => {
    const { service } = createServiceWithGet('# cached');
    const first = service.load('cached-slug');
    const second = service.load('cached-slug');
    expect(first).toBe(second);
  });

  it('should return error content for HTTP failures', async () => {
    const getMock = vi.fn().mockReturnValue(throwError(() => new Error('Network error')));
    const service = createService({ get: getMock });
    const content = await firstValueFrom(service.load('missing-page'));
    expect(content.error).toContain('Content not found');
    expect(content.headings).toEqual([]);
  });

  it('should detect SPA fallback HTML responses as 404', async () => {
    const content = await loadContent('<!DOCTYPE html><html><body>App</body></html>');
    expect(content.error).toContain('Content not found: test');
    expect(content.rawHtml).toBe('');
  });

  it('should detect SPA fallback starting with <html', async () => {
    const content = await loadContent('<html><body>App</body></html>');
    expect(content.error).toContain('Content not found: test');
  });

  it('should extract h2 and h3 headings', async () => {
    const md = `## First Section\n\n### Sub Section\n\n## Second Section\n\n#### Ignored`;
    const content = await loadContent(md);
    expect(content.headings.length).toBe(3);
    expect(content.headings[0]).toEqual({ id: 'first-section', text: 'First Section', level: 2 });
    expect(content.headings[1]).toEqual({ id: 'sub-section', text: 'Sub Section', level: 3 });
    expect(content.headings[2]).toEqual({ id: 'second-section', text: 'Second Section', level: 2 });
  });

  it('should render code blocks with wrapper and copy button', async () => {
    const md = '```typescript\nconst x = 1;\n```';
    const content = await loadContent(md);
    expect(content.rawHtml).toContain('code-block-wrapper');
    expect(content.rawHtml).toContain('code-copy-btn');
    expect(content.rawHtml).toContain('data-code=');
  });

  it('should render callouts with CSS classes for [!NOTE]', async () => {
    const md = '> [!NOTE]\n> This is a note.';
    const content = await loadContent(md);
    expect(content.rawHtml).toContain('callout--info');
  });

  it('should render callouts with CSS classes for [!WARNING]', async () => {
    const md = '> [!WARNING]\n> Be careful.';
    const content = await loadContent(md);
    expect(content.rawHtml).toContain('callout--warning');
  });

  it('should render callouts with CSS classes for [!DANGER]', async () => {
    const md = '> [!DANGER]\n> Very dangerous.';
    const content = await loadContent(md);
    expect(content.rawHtml).toContain('callout--danger');
  });

  it('should render callouts with CSS classes for [!TIP]', async () => {
    const md = '> [!TIP]\n> A helpful tip.';
    const content = await loadContent(md);
    expect(content.rawHtml).toContain('callout--tip');
  });

  it('should replace {@link SymbolName} with API links', async () => {
    const md = 'See {@link FormConfig} for details.';
    const content = await loadContent(md);
    expect(content.rawHtml).toContain('api-link');
    expect(content.rawHtml).toContain('data-api-symbol="FormConfig"');
    expect(content.rawHtml).toContain('<code>FormConfig</code>');
  });

  it('should replace emoji characters with SVG icons outside code blocks', async () => {
    const md = 'Feature supported: ✅';
    const content = await loadContent(md);
    expect(content.rawHtml).toContain('icon-indicator--check');
    expect(content.rawHtml).not.toContain('✅');
  });

  it('should NOT replace emojis inside code blocks', async () => {
    const md = '```\n✅ inside code\n```';
    const content = await loadContent(md);
    // The emoji appears inside the code block (in data-code attribute or code content)
    // and should not be replaced with SVG
    expect(content.rawHtml).toContain('✅');
  });

  it('should generate heading anchors for h2 and higher', async () => {
    const md = '## Clickable Heading';
    const content = await loadContent(md);
    expect(content.rawHtml).toContain('heading-anchor');
    expect(content.rawHtml).toContain('data-anchor-id="clickable-heading"');
  });

  it('should not generate heading anchor for h1', async () => {
    const md = '# Top Level';
    const content = await loadContent(md);
    expect(content.rawHtml).not.toContain('heading-anchor');
  });

  it('should slugify headings correctly', async () => {
    const md = '## Hello World! (Test)';
    const content = await loadContent(md);
    expect(content.rawHtml).toContain('id="hello-world-test"');
  });

  it('should use base href in request URL', async () => {
    const getMock = vi.fn().mockReturnValue(of('## Test'));
    const service = createService({ get: getMock }, '/my-app/');
    await firstValueFrom(service.load('some-page'));
    expect(getMock).toHaveBeenCalledWith('/my-app/content/some-page.md', { responseType: 'text' });
  });
});
