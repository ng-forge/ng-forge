/**
 * Pure builders for the schema.org JSON-LD payloads emitted by
 * DocPageComponent. Extracted into their own module so they're testable
 * without bootstrapping the full component (Router / Meta / Title /
 * ContentService / Clipboard / etc.).
 */
import type { BreadcrumbEntry } from '../layout/nav.config';
import type { FaqEntry, MigrationStep } from '../components/feature-overview/feature-overview.data';

type SchemaOrgContext = 'https://schema.org';

interface SchemaOrgOrganization {
  readonly '@type': 'Organization';
  readonly name: string;
  readonly url: string;
}

interface SchemaOrgAboutEntity {
  readonly '@type': 'SoftwareSourceCode' | 'Thing';
  readonly name: string;
}

export interface BreadcrumbListLd {
  readonly '@context': SchemaOrgContext;
  readonly '@type': 'BreadcrumbList';
  readonly itemListElement: readonly {
    readonly '@type': 'ListItem';
    readonly position: number;
    readonly name: string;
    readonly item: string;
  }[];
}

export interface FaqPageLd {
  readonly '@context': SchemaOrgContext;
  readonly '@type': 'FAQPage';
  readonly mainEntity: readonly {
    readonly '@type': 'Question';
    readonly name: string;
    readonly acceptedAnswer: {
      readonly '@type': 'Answer';
      readonly text: string;
    };
  }[];
}

export interface HowToLd {
  readonly '@context': SchemaOrgContext;
  readonly '@type': 'HowTo';
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly step: readonly {
    readonly '@type': 'HowToStep';
    readonly position: number;
    readonly name: string;
    readonly text: string;
  }[];
}

export interface TechArticleLd {
  readonly '@context': SchemaOrgContext;
  readonly '@type': 'TechArticle';
  readonly headline: string;
  readonly description: string;
  readonly url: string;
  readonly datePublished: string;
  readonly dateModified: string;
  readonly author: SchemaOrgOrganization;
  readonly publisher: SchemaOrgOrganization;
  readonly proficiencyLevel: string;
  readonly about: readonly SchemaOrgAboutEntity[];
}

export type JsonLdPayload = BreadcrumbListLd | FaqPageLd | HowToLd | TechArticleLd;

/**
 * Drop `[label](url)` link wrappers, ` `code` ` chips, and `**bold**`
 * markers — Google's structured-data validator wants prose, not markdown.
 */
export function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1');
}

export function buildBreadcrumbJsonLd(trail: readonly BreadcrumbEntry[], adapter: string, siteOrigin: string): BreadcrumbListLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: `${siteOrigin}/${adapter}/${c.path}`,
    })),
  };
}

export function buildFaqJsonLd(entries: readonly FaqEntry[]): FaqPageLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripInlineMarkdown(entry.a),
      },
    })),
  };
}

export function buildMigrationHowtoJsonLd(steps: readonly MigrationStep[], pageUrl: string): HowToLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Migrate from ngx-formly to ng-forge',
    description: 'A pragmatic order to port a non-trivial Angular dynamic-forms app from ngx-formly to ng-forge.',
    url: `${pageUrl}#migration-checklist`,
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function buildMigrationArticleJsonLd(
  pageUrl: string,
  meta: { readonly datePublished: string; readonly dateModified: string },
): TechArticleLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Migrating from ngx-formly to ng-forge',
    description:
      'Concept-by-concept migration reference for moving an Angular dynamic-forms app from ngx-formly onto ng-forge and Angular Signal Forms.',
    url: pageUrl,
    datePublished: meta.datePublished,
    dateModified: meta.dateModified,
    author: { '@type': 'Organization', name: 'ng-forge', url: 'https://github.com/ng-forge' },
    publisher: { '@type': 'Organization', name: 'ng-forge', url: 'https://github.com/ng-forge' },
    proficiencyLevel: 'Intermediate',
    about: [
      { '@type': 'SoftwareSourceCode', name: 'ngx-formly' },
      { '@type': 'SoftwareSourceCode', name: 'ng-forge' },
      { '@type': 'Thing', name: 'Angular Signal Forms' },
    ],
  };
}
