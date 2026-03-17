import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, filter, map, startWith, switchMap, combineLatest, of } from 'rxjs';
import { codeToHtml } from 'shiki';
import { ActiveAdapterService } from '../../services/active-adapter.service';
import { ApiService, type ApiPackage, getKindMeta } from '../../services/api.service';

@Component({
  selector: 'docs-api-detail',
  imports: [RouterLink, TitleCasePipe],
  templateUrl: './api-detail.component.html',
  styleUrl: './api-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiDetailComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly apiService = inject(ApiService);
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly adapter = inject(ActiveAdapterService);

  /** Extract packageSlug and symbolName from URL. */
  private readonly routeInfo$ = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    startWith(null),
    map(() => {
      const parts = this.route.snapshot.pathFromRoot.flatMap((r) => r.url.map((s) => s.path));
      return { pkgSlug: parts[2] ?? 'core', symbolName: parts[3] ?? '' };
    }),
    distinctUntilChanged((a, b) => a.pkgSlug === b.pkgSlug && a.symbolName === b.symbolName),
  );

  private readonly data$ = this.routeInfo$.pipe(
    switchMap(({ pkgSlug, symbolName }) =>
      this.apiService.loadPackage(pkgSlug).pipe(
        map((pkg) => {
          const declaration = pkg.declarations.find((d) => d.name === symbolName);
          return { pkg, declaration, symbolName, pkgSlug };
        }),
      ),
    ),
  );

  private readonly data = toSignal(this.data$);

  /** Load core + adapter packages for cross-reference linking. */
  private readonly corePkg = toSignal(this.apiService.loadPackage('core'));
  private readonly adapterPkg = toSignal(
    toObservable(this.adapter.adapter).pipe(
      switchMap((name) => {
        const slug = this.apiService.getAdapterPackageSlug(name);
        return slug ? this.apiService.loadPackage(slug) : of(undefined);
      }),
    ),
  );

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
  readonly pkgSlug = computed(() => this.data()?.pkgSlug ?? 'core');
  readonly symbolName = computed(() => this.data()?.symbolName ?? '');
  readonly pkgName = computed(() => this.data()?.pkg?.name ?? '');

  readonly kindMeta = computed(() => {
    const decl = this.declaration();
    return decl ? getKindMeta(decl.kind) : undefined;
  });

  readonly highlightedSignature = toSignal(
    this.data$.pipe(
      switchMap(({ declaration }) => {
        if (!declaration?.signature) return of('');
        return highlightCode(declaration.signature, 'typescript');
      }),
    ),
  );

  readonly highlightedExamples = toSignal(
    this.data$.pipe(
      switchMap(({ declaration }) => {
        if (!declaration?.examples?.length) return of([]);
        return combineLatest(
          declaration.examples.map((ex) => {
            const codeMatch = ex.match(/```(\w+)?\n([\s\S]*?)```/);
            if (codeMatch) {
              return highlightCode(codeMatch[2].trim(), codeMatch[1] ?? 'typescript');
            }
            return highlightCode(ex.trim(), 'typescript');
          }),
        );
      }),
    ),
  );

  readonly properties = computed(() => this.declaration()?.members.filter((m) => m.kind === 'property' || m.kind === 'accessor') ?? []);

  readonly methods = computed(() => this.declaration()?.members.filter((m) => m.kind === 'method') ?? []);

  getKindMeta = getKindMeta;

  trustHtml(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Convert a type string into HTML with known symbols linked to their API pages.
   * Simplifies verbose generic types and truncates at 300 chars. Returns SafeHtml.
   */
  linkifyType(type: string): SafeHtml {
    // Simplify verbose conditional/mapped types that repeat type parameter constraints
    let simplified = type
      .replace(/\bTFields extends readonly RegisteredFieldTypes\[\] \? TFields : RegisteredFieldTypes\[\]/g, 'TFields')
      .replace(/\bTValue extends Record<string, unknown> \? TValue : Record<string, unknown>/g, 'TValue');

    const truncated = simplified.length > 300 ? simplified.substring(0, 300) + '...' : simplified;
    const escaped = truncated.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const index = this.symbolIndex();
    const currentSymbol = this.symbolName();
    const adapterName = this.adapter.adapter();

    // Match PascalCase identifiers that exist in our symbol index
    const linked = escaped.replace(/\b([A-Z]\w{2,})\b/g, (match, name: string) => {
      // Don't self-link
      if (name === currentSymbol) return match;
      const pkgSlug = index.get(name);
      if (!pkgSlug) return match;
      return `<a class="type-link" href="/${adapterName}/api-reference/${pkgSlug}/${name}">${match}</a>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(linked);
  }
}

async function highlightCode(code: string, lang: string): Promise<string> {
  try {
    return await codeToHtml(code, {
      lang,
      themes: { light: 'material-theme-lighter', dark: 'material-theme-darker' },
      defaultColor: false,
    });
  } catch {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre><code>${escaped}</code></pre>`;
  }
}
