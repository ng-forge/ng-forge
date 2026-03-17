import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, filter, map, startWith, switchMap, combineLatest, of } from 'rxjs';
import { codeToHtml } from 'shiki';
import { ActiveAdapterService } from '../../services/active-adapter.service';
import { ApiService, getKindMeta } from '../../services/api.service';

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
      // URL: /:adapter/api-reference/:pkg/:symbol
      // parts: [adapter, api-reference, pkg, symbol]
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

  readonly declaration = computed(() => this.data()?.declaration);
  readonly pkgSlug = computed(() => this.data()?.pkgSlug ?? 'core');
  readonly symbolName = computed(() => this.data()?.symbolName ?? '');
  readonly pkgName = computed(() => this.data()?.pkg?.name ?? '');

  readonly kindMeta = computed(() => {
    const decl = this.declaration();
    return decl ? getKindMeta(decl.kind) : undefined;
  });

  /** Syntax-highlighted signature. */
  readonly highlightedSignature = toSignal(
    this.data$.pipe(
      switchMap(({ declaration }) => {
        if (!declaration?.signature) return of('');
        return highlightCode(declaration.signature, 'typescript');
      }),
    ),
  );

  /** Syntax-highlighted examples. */
  readonly highlightedExamples = toSignal(
    this.data$.pipe(
      switchMap(({ declaration }) => {
        if (!declaration?.examples?.length) return of([]);
        return combineLatest(
          declaration.examples.map((ex) => {
            // Extract code block from markdown-style example
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

  formatType(type: string): string {
    // Truncate very long types
    return type.length > 200 ? type.substring(0, 200) + '...' : type;
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
