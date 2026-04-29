import { Type } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { decodeHtmlEntities } from '../utils/decode-html-entities';

export interface HtmlSegment {
  type: 'html';
  /** Pre-trusted SafeHtml — skips Angular's DomSanitizer on binding. */
  html: SafeHtml;
}

export interface ComponentSegment {
  type: 'component';
  selector: string;
  component: Type<unknown> | null;
  loadComponent?: () => Promise<{ default: Type<unknown> }>;
  inputs: Record<string, unknown>;
  defer: boolean;
}

export type ContentSegment = HtmlSegment | ComponentSegment;

export interface ComponentRegistration {
  selector: string;
  component?: Type<unknown>;
  loadComponent?: () => Promise<{ default: Type<unknown> }>;
  defer: boolean;
  extractInputs?: (attrs: Record<string, string>) => Record<string, unknown>;
}

/**
 * Build a regex that matches any registered custom element tag (self-closing or paired).
 * Captures: full match including the tag and any content between open/close tags.
 */
function buildTagPattern(selectors: string[]): RegExp {
  const escaped = selectors.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  // Match self-closing (<tag ... />) or paired (<tag ...>...</tag>) custom elements.
  // Attributes are captured lazily. Content between open/close is non-greedy.
  const pattern = escaped.map((s) => `<${s}(\\s[^>]*)?\\/?>(?:[\\s\\S]*?<\\/${s}>)?`).join('|');
  return new RegExp(`(${pattern})`, 'gi');
}

/**
 * Extract attribute key-value pairs from an HTML tag string.
 */
function parseAttributes(tagHtml: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  // Match attribute="value" or attribute='value' or bare attribute
  const attrPattern = /(\w[\w-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;
  // Skip the tag name itself — start after the first space
  const firstSpace = tagHtml.indexOf(' ');
  if (firstSpace === -1) return attrs;
  const attrString = tagHtml.slice(firstSpace);
  let match: RegExpExecArray | null;
  while ((match = attrPattern.exec(attrString)) !== null) {
    const key = match[1];
    const value = match[2] ?? match[3] ?? '';
    // Decode HTML entities — a real DOM parser would do this when reading
    // attribute values, but our regex extracts the raw text as-is, leaving
    // entities like `&quot;` to flow through to Shiki and render literally.
    attrs[key] = decodeHtmlEntities(value);
  }
  return attrs;
}

/**
 * Parse raw HTML into an ordered array of segments: static HTML interleaved
 * with component placeholders. Pure function — no DOM dependency.
 *
 * The `trustHtml` callback wraps each HTML fragment in `bypassSecurityTrustHtml()`
 * so that `[innerHTML]` doesn't re-sanitize content that already came from our
 * own trusted `ContentService` markdown pipeline.
 */
export function parseContentSegments(
  html: string,
  registry: ComponentRegistration[],
  trustHtml: (raw: string) => SafeHtml,
): ContentSegment[] {
  if (!html || registry.length === 0) return [{ type: 'html', html: trustHtml(html) }];

  const registryMap = new Map(registry.map((r) => [r.selector.toLowerCase(), r]));
  const tagPattern = buildTagPattern(registry.map((r) => r.selector));
  const segments: ContentSegment[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(html)) !== null) {
    // Add preceding HTML segment
    if (match.index > lastIndex) {
      segments.push({ type: 'html', html: trustHtml(html.slice(lastIndex, match.index)) });
    }

    const fullMatch = match[0];
    // Extract the tag name from the match
    const tagNameMatch = fullMatch.match(/^<([\w-]+)/);
    const tagName = tagNameMatch?.[1]?.toLowerCase() ?? '';
    const registration = registryMap.get(tagName);

    if (registration) {
      const attrs = parseAttributes(fullMatch);
      const inputs = registration.extractInputs?.(attrs) ?? {};
      segments.push({
        type: 'component',
        selector: registration.selector,
        component: registration.component ?? null,
        loadComponent: registration.loadComponent,
        inputs,
        defer: registration.defer,
      });
    } else {
      // Shouldn't happen, but treat as HTML if no registration found
      segments.push({ type: 'html', html: trustHtml(fullMatch) });
    }

    lastIndex = match.index + fullMatch.length;
  }

  // Add trailing HTML segment
  if (lastIndex < html.length) {
    segments.push({ type: 'html', html: trustHtml(html.slice(lastIndex)) });
  }

  return segments;
}
