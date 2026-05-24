import { describe, expect, it } from 'vitest';
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildMigrationArticleJsonLd,
  buildMigrationHowtoJsonLd,
  stripInlineMarkdown,
} from './jsonld-builders';
import type { BreadcrumbEntry } from '../layout/nav.config';
import type { FaqEntry, MigrationStep } from '../components/feature-overview/feature-overview.data';

describe('stripInlineMarkdown', () => {
  it('drops link wrappers but keeps the label', () => {
    expect(stripInlineMarkdown('See [Migration](/migrating-from-ngx-formly).')).toBe('See Migration.');
  });

  it('drops inline code backticks', () => {
    expect(stripInlineMarkdown('Use `FieldTree<T>` directly.')).toBe('Use FieldTree<T> directly.');
  });

  it('drops bold markers', () => {
    expect(stripInlineMarkdown('This is **important** context.')).toBe('This is important context.');
  });

  it('composes across all three transforms in one call', () => {
    expect(stripInlineMarkdown('See [the **`config`** docs](/configuration).')).toBe('See the config docs.');
  });

  it('handles nested code-in-link without leaving stray punctuation', () => {
    expect(stripInlineMarkdown('Call [`provideDynamicForm`](/getting-started) once.')).toBe('Call provideDynamicForm once.');
  });

  it('is a no-op on plain prose (no markdown to strip)', () => {
    expect(stripInlineMarkdown('Plain sentence with no markup at all.')).toBe('Plain sentence with no markup at all.');
  });

  it('is a no-op on the empty string', () => {
    expect(stripInlineMarkdown('')).toBe('');
  });

  it('leaves orphan markdown characters untouched (no greedy matching)', () => {
    // A lone `**` or backtick without its closing pair must not produce a partial replacement.
    expect(stripInlineMarkdown('Use ** for bold and ` for code.')).toBe('Use ** for bold and ` for code.');
  });
});

describe('buildFaqJsonLd with an empty entries array', () => {
  it('still emits a valid FAQPage with an empty mainEntity', () => {
    const payload = buildFaqJsonLd([]);
    expect(payload['@type']).toBe('FAQPage');
    expect(payload.mainEntity).toEqual([]);
  });
});

describe('buildBreadcrumbJsonLd', () => {
  const trail: readonly BreadcrumbEntry[] = [
    { label: 'Validation', path: 'validation' },
    { label: 'Basics', path: 'validation/basics' },
  ];

  it('produces a BreadcrumbList with 1-indexed positions', () => {
    const payload = buildBreadcrumbJsonLd(trail, 'material', 'https://ng-forge.com/dynamic-forms');
    expect(payload['@type']).toBe('BreadcrumbList');
    expect(payload.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Validation',
        item: 'https://ng-forge.com/dynamic-forms/material/validation',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Basics',
        item: 'https://ng-forge.com/dynamic-forms/material/validation/basics',
      },
    ]);
  });

  it('routes URLs through the active adapter parameter, not a hardcoded one', () => {
    const payload = buildBreadcrumbJsonLd(trail, 'bootstrap', 'https://ng-forge.com/dynamic-forms');
    expect(payload.itemListElement.every((i) => i.item.includes('/bootstrap/'))).toBe(true);
  });
});

describe('buildFaqJsonLd', () => {
  const entries: readonly FaqEntry[] = [
    { q: 'Plain question?', a: 'Plain answer.' },
    { q: 'With code?', a: 'Use `FieldTree<T>` — see [docs](/recipes/type-safety).' },
  ];

  it('wraps each entry as Question + acceptedAnswer with markdown stripped', () => {
    const payload = buildFaqJsonLd(entries);
    expect(payload['@type']).toBe('FAQPage');
    expect(payload.mainEntity).toEqual([
      { '@type': 'Question', name: 'Plain question?', acceptedAnswer: { '@type': 'Answer', text: 'Plain answer.' } },
      {
        '@type': 'Question',
        name: 'With code?',
        acceptedAnswer: { '@type': 'Answer', text: 'Use FieldTree<T> — see docs.' },
      },
    ]);
  });
});

describe('buildMigrationHowtoJsonLd', () => {
  const steps: readonly MigrationStep[] = [
    { name: 'Audit blockers', text: 'Check what does not have an equivalent.' },
    { name: 'Install ng-forge', text: 'Side-by-side with formly works.' },
  ];

  it('emits HowTo with #migration-checklist anchor on the URL', () => {
    const payload = buildMigrationHowtoJsonLd(steps, 'https://ng-forge.com/dynamic-forms/material/migrating-from-ngx-formly');
    expect(payload['@type']).toBe('HowTo');
    expect(payload.url).toBe('https://ng-forge.com/dynamic-forms/material/migrating-from-ngx-formly#migration-checklist');
    expect(payload.step).toEqual([
      { '@type': 'HowToStep', position: 1, name: 'Audit blockers', text: 'Check what does not have an equivalent.' },
      { '@type': 'HowToStep', position: 2, name: 'Install ng-forge', text: 'Side-by-side with formly works.' },
    ]);
  });
});

describe('buildMigrationArticleJsonLd', () => {
  const pageUrl = 'https://ng-forge.com/dynamic-forms/material/migrating-from-ngx-formly';
  const meta = { datePublished: '2026-05-01', dateModified: '2026-05-24' } as const;

  it('passes through datePublished and dateModified verbatim', () => {
    const payload = buildMigrationArticleJsonLd(pageUrl, meta);
    expect(payload.datePublished).toBe('2026-05-01');
    expect(payload.dateModified).toBe('2026-05-24');
  });

  it('declares the about[] entities so the page links to ngx-formly, ng-forge, and Signal Forms', () => {
    const payload = buildMigrationArticleJsonLd(pageUrl, meta);
    expect(payload.about.map((a) => a.name)).toEqual(['ngx-formly', 'ng-forge', 'Angular Signal Forms']);
  });

  it('sets TechArticle as the @type (HowTo + FAQPage stack alongside, not under, this)', () => {
    expect(buildMigrationArticleJsonLd(pageUrl, meta)['@type']).toBe('TechArticle');
  });
});
