import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { rxResource } from '@angular/core/rxjs-interop';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { combineLatest, map } from 'rxjs';
import { ActiveAdapterService } from '../../services/active-adapter.service';
import { ShikiService } from '../../utils/shiki';
import { ApiService, type ApiPackage, getKindMeta } from '../../services/api.service';

@Component({
  selector: 'docs-api-detail',
  imports: [RouterLink, TitleCasePipe],
  templateUrl: './api-detail.component.html',
  styleUrl: './api-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(click)': 'onHostClick($event)',
  },
})
export class ApiDetailComponent {
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly shiki = inject(ShikiService);
  protected readonly adapter = inject(ActiveAdapterService);

  constructor() {
    // Clear formatting caches when the viewed symbol changes to prevent unbounded growth
    explicitEffect([this.symbolName], () => {
      this.descriptionCache.clear();
      this.typeCache.clear();
      this.trustHtmlCache.clear();
    });
  }

  /** Extract symbol name from URL: /:adapter/api-reference/:symbol */
  readonly symbolName = computed(() => {
    const nav = this.router.lastSuccessfulNavigation();
    const url = nav ? this.router.serializeUrl(nav.finalUrl ?? nav.extractedUrl) : this.router.url;
    const parts = url.split('/').filter(Boolean);
    // parts: [adapter, api-reference, symbolName]
    return parts[2] ?? '';
  });

  /** Load core + adapter, then find which package owns the symbol. */
  private readonly dataResource = rxResource({
    params: () => {
      const sym = this.symbolName();
      return sym ? { symbolName: sym, adapter: this.adapter.adapter() } : undefined;
    },
    stream: ({ params }) => {
      const adapterSlug = this.apiService.getAdapterPackageSlug(params.adapter);
      const packages$ = adapterSlug
        ? combineLatest([this.apiService.loadPackage('core'), this.apiService.loadPackage(adapterSlug)])
        : this.apiService.loadPackage('core').pipe(map((core) => [core] as ApiPackage[]));
      return packages$.pipe(
        map((pkgs) => {
          for (const pkg of pkgs) {
            const declaration = pkg.declarations.find((d) => d.name === params.symbolName);
            if (declaration) return { pkg, declaration, symbolName: params.symbolName };
          }
          return { pkg: pkgs[0], declaration: undefined, symbolName: params.symbolName };
        }),
      );
    },
  });

  private readonly data = computed(() => this.dataResource.value());

  /** Load core package for cross-reference linking. */
  private readonly corePkgResource = rxResource({
    params: () => ({}),
    stream: () => this.apiService.loadPackage('core'),
  });
  private readonly corePkg = computed(() => this.corePkgResource.value());

  /** Load adapter package for cross-reference linking. */
  private readonly adapterPkgResource = rxResource({
    params: () => {
      const slug = this.apiService.getAdapterPackageSlug(this.adapter.adapter());
      return slug ? { slug } : undefined;
    },
    stream: ({ params }) => this.apiService.loadPackage(params.slug),
  });
  private readonly adapterPkg = computed(() => this.adapterPkgResource.value());

  /** Map of symbol name → { pkgSlug } for all known declarations. */
  private readonly symbolIndex = computed(() => {
    const index = new Map<string, string>();
    const core = this.corePkg();
    const adapterPkg = this.adapterPkg();
    if (core) {
      for (const d of core.declarations) index.set(d.name, 'core');
    }
    if (adapterPkg) {
      for (const d of adapterPkg.declarations) index.set(d.name, adapterPkg.slug);
    }
    return index;
  });

  readonly declaration = computed(() => this.data()?.declaration);
  readonly pkgName = computed(() => this.data()?.pkg?.name ?? '');
  readonly adapterInfo = computed(() => {
    const name = this.adapter.adapter();
    return this.adapter.adapters.find((a) => a.name === name);
  });

  readonly kindMeta = computed(() => {
    const decl = this.declaration();
    return decl ? getKindMeta(decl.kind) : undefined;
  });

  readonly highlightedSignature = resource({
    params: () => {
      const decl = this.declaration();
      return decl?.signature ? { signature: decl.signature } : undefined;
    },
    loader: ({ params }) => this.shiki.highlightCode(params.signature, 'typescript'),
  });

  readonly highlightedExamples = resource({
    params: () => {
      const decl = this.declaration();
      return decl?.examples?.length ? { examples: decl.examples } : undefined;
    },
    loader: async ({ params }) => {
      return Promise.all(
        params.examples.map((ex) => {
          const codeMatch = ex.match(/```(\w+)?\n([\s\S]*?)```/);
          if (codeMatch) {
            return this.shiki.highlightCode(codeMatch[2].trim(), codeMatch[1] ?? 'typescript');
          }
          return this.shiki.highlightCode(ex.trim(), 'typescript');
        }),
      );
    },
  });

  readonly properties = computed(() => this.declaration()?.members.filter((m) => m.kind === 'property' || m.kind === 'accessor') ?? []);

  readonly methods = computed(() => this.declaration()?.members.filter((m) => m.kind === 'method') ?? []);

  getKindMeta = getKindMeta;

  private readonly descriptionCache = new Map<string, SafeHtml>();
  private readonly typeCache = new Map<string, SafeHtml>();
  private readonly trustHtmlCache = new Map<string, SafeHtml>();

  trustHtml(html: string) {
    const cached = this.trustHtmlCache.get(html);
    if (cached) return cached;
    const result = this.sanitizer.bypassSecurityTrustHtml(html);
    this.trustHtmlCache.set(html, result);
    return result;
  }

  /** Intercept clicks on type-link anchors inside [innerHTML] and route via Angular router. */
  onHostClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const link = target.closest('a.type-link') as HTMLAnchorElement | null;
    if (!link) return;

    event.preventDefault();
    const href = link.getAttribute('href');
    if (href) {
      void this.router.navigateByUrl(href);
    }
  }

  /**
   * Format description text with inline code highlighting and API links.
   * Handles backtick code, camelCase() calls, UPPER_CASE constants, and known symbols.
   */
  formatDescription(text: string): SafeHtml {
    const cacheKey = `${text}:${this.symbolName()}:${this.adapter.adapter()}`;
    const cached = this.descriptionCache.get(cacheKey);
    if (cached) return cached;

    const index = this.symbolIndex();
    const currentSymbol = this.symbolName();
    const adapterName = this.adapter.adapter();

    // Extract fenced code blocks before escaping so their content stays intact.
    const codeBlocks: string[] = [];
    const PLACEHOLDER_PREFIX = '\u200BCODE';
    const PLACEHOLDER_SUFFIX = '\u200B';
    const processed = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang: string, code: string) => {
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const placeholder = `${PLACEHOLDER_PREFIX}${codeBlocks.length}${PLACEHOLDER_SUFFIX}`;
      codeBlocks.push(`<pre class="description-code-block"><code class="language-${lang || 'text'}">${escaped.trimEnd()}</code></pre>`);
      return placeholder;
    });

    let html = processed.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Restore code blocks (they were already escaped)
    html = html.replace(/\u200BCODE(\d+)\u200B/g, (_, i: string) => codeBlocks[Number(i)]);

    // 1. Markdown headers: ## Heading → <h3>, ### Heading → <h4>, etc.
    html = html.replace(/^(#{2,4})\s+(.+)$/gm, (_, hashes: string, heading: string) => {
      const level = Math.min(hashes.length + 1, 6); // ## → h3, ### → h4
      return `<h${level} class="description-heading">${heading.trim()}</h${level}>`;
    });

    // 2. Backtick-quoted inline code: `something` — also link if it's a known symbol
    html = html.replace(/`([^`]+)`/g, (_, content: string) => {
      const bare = content.replace(/\(\)$/, '');
      if (bare !== currentSymbol && index.has(bare)) {
        return `<a class="type-link" href="/${adapterName}/api-reference/${bare}"><code class="inline-code">${content}</code></a>`;
      }
      return `<code class="inline-code">${content}</code>`;
    });

    // 3. UPPER_CASE_CONSTANTS (must have underscore to avoid matching words like "API")
    html = html.replace(/\b([A-Z][A-Z0-9]*_[A-Z0-9_]+)\b/g, (match) => {
      if (index.has(match)) {
        return `<a class="type-link" href="/${adapterName}/api-reference/${match}"><code class="inline-code">${match}</code></a>`;
      }
      return `<code class="inline-code">${match}</code>`;
    });

    // 4. camelCase() function calls — link if known
    html = html.replace(/(?<![<\w])([a-z]\w+)\(\)(?![^<]*>)/g, (match, name: string) => {
      if (index.has(name)) {
        return `<a class="type-link" href="/${adapterName}/api-reference/${name}"><code class="inline-code">${name}()</code></a>`;
      }
      return `<code class="inline-code">${name}()</code>`;
    });

    // 5. Link known PascalCase API symbols (not already inside tags)
    html = html.replace(/(?<![<\w/])([A-Z][a-z]\w{2,})(?![^<]*>)/g, (match, name: string) => {
      if (name === currentSymbol) return match;
      if (!index.has(name)) return match;
      return `<a class="type-link" href="/${adapterName}/api-reference/${name}">${match}</a>`;
    });

    // 6. Markdown bold: **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 7. Convert double newlines to paragraphs, with special handling for callouts and block elements
    const blockTagPattern = /^<(?:pre|h[1-6]|div)\b/;
    const paragraphs = html.split(/\n{2,}/).filter((p) => p.trim());

    html = paragraphs
      .map((p) => {
        const trimmed = p.trim();
        // Don't wrap block-level elements in <p>
        if (blockTagPattern.test(trimmed)) return trimmed;
        // Breaking change → styled callout
        if (trimmed.match(/^<strong>BREAKING CHANGE<\/strong>:\s*/i)) {
          const content = trimmed.replace(/^<strong>BREAKING CHANGE<\/strong>:\s*/i, '');
          return `<div class="callout callout--breaking"><strong>Breaking Change:</strong> ${content}</div>`;
        }
        return `<p>${trimmed}</p>`;
      })
      .join('');

    // Single paragraph without callout — unwrap
    if (paragraphs.length === 1 && !html.includes('callout--breaking') && !blockTagPattern.test(html.trim())) {
      html = html.replace(/^<p>(.*)<\/p>$/, '$1');
    }

    const result = this.sanitizer.bypassSecurityTrustHtml(html);
    this.descriptionCache.set(cacheKey, result);
    return result;
  }

  /**
   * Convert a type string into HTML with known symbols linked to their API pages.
   * Simplifies verbose generic types and truncates at 300 chars. Returns SafeHtml.
   */
  linkifyType(type: string): SafeHtml {
    const cacheKey = `${type}:${this.symbolName()}:${this.adapter.adapter()}`;
    const cached = this.typeCache.get(cacheKey);
    if (cached) return cached;

    // Simplify verbose conditional/mapped types that repeat type parameter constraints
    const simplified = type
      .replace(/\bTFields extends readonly RegisteredFieldTypes\[\] \? TFields : RegisteredFieldTypes\[\]/g, 'TFields')
      .replace(/\bTValue extends Record<string, unknown> \? TValue : Record<string, unknown>/g, 'TValue');

    const truncated = simplified.length > 300 ? simplified.substring(0, 300) + '...' : simplified;
    const escaped = truncated.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const index = this.symbolIndex();
    const currentSymbol = this.symbolName();
    const adapterName = this.adapter.adapter();

    // Match PascalCase identifiers that exist in our symbol index
    const linked = escaped.replace(/\b([A-Z]\w{2,})\b/g, (match, name: string) => {
      if (name === currentSymbol) return match;
      if (!index.has(name)) return match;
      return `<a class="type-link" href="/${adapterName}/api-reference/${name}">${match}</a>`;
    });

    const result = this.sanitizer.bypassSecurityTrustHtml(linked);
    this.typeCache.set(cacheKey, result);
    return result;
  }
}
