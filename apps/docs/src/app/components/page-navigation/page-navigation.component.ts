import { ChangeDetectionStrategy, Component, computed, inject, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NG_DOC_CONTEXT } from '@ng-doc/app/tokens';
import type { NgDocNavigation } from '@ng-doc/app/interfaces';

/**
 * Custom page navigation that fixes prev/next links for adapter-prefixed routing.
 *
 * The default NgDocPageNavigationComponent compares the full URL (e.g.
 * `material/validation/basics`) against ng-doc navigation routes (e.g. `/validation/basics`).
 * Because the `:adapter` prefix is in the URL but not in the nav routes, findIndex always
 * returns -1 and nextPage always resolves to the very first page ("Getting Started").
 *
 * This component recomputes prevPage/nextPage after stripping the adapter prefix from the URL,
 * then renders the navigation links with the adapter prefix prepended.
 *
 * NOTE: We intentionally do NOT import NgDocPageNavigationComponent here. Importing it from
 * @ng-doc/app/components/page-navigation triggers a TypeScript 5.9 infinite recursion in
 * getHostSignatureFromJSDoc during Angular compilation. We replicate its HTML/CSS instead.
 */
@Component({
  selector: 'docs-page-navigation',
  templateUrl: './page-navigation.component.html',
  styleUrl: './page-navigation.component.scss',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsPageNavigationComponent {
  // ng-doc skeleton interface requires these inputs named 'prevPage' / 'nextPage'.
  // Their values are always wrong (artifact of the adapter-prefix bug), so we ignore them
  // and recompute below. Typed as unknown to avoid importing NgDocNavigation in value space.
  @Input() prevPage: unknown;
  @Input() nextPage: unknown;

  private readonly router = inject(Router);
  private readonly context = inject(NG_DOC_CONTEXT);

  private readonly routerState = computed(() => {
    const nav = this.router.lastSuccessfulNavigation();
    const rawUrl = nav ? this.router.serializeUrl(nav.finalUrl ?? nav.extractedUrl) : this.router.url;
    const url = rawUrl.split(/[?#]/)[0];
    const segments = url.replace(/^\//, '').split('/');
    return {
      adapter: segments[0] ?? 'material',
      path: segments.slice(1).join('/'),
    };
  });

  private readonly flatPages = computed(() => {
    const flatten = (items: NgDocNavigation[]): NgDocNavigation[] =>
      items.flatMap((item) => (item.children?.length ? flatten(item.children) : [item]));
    return flatten(this.context.navigation);
  });

  private readonly currentIdx = computed(() => {
    const { path } = this.routerState();
    return this.flatPages().findIndex((p) => p.route.replace(/^\//, '') === path);
  });

  readonly prevNav = computed(() => {
    const idx = this.currentIdx();
    return idx > 0 ? this.flatPages()[idx - 1] : undefined;
  });

  readonly nextNav = computed(() => {
    const idx = this.currentIdx();
    return idx >= 0 && idx < this.flatPages().length - 1 ? this.flatPages()[idx + 1] : undefined;
  });

  readonly prevLink = computed(() => {
    const prev = this.prevNav();
    if (!prev) return null;
    const { adapter } = this.routerState();
    return `/${adapter}${prev.route}`;
  });

  readonly nextLink = computed(() => {
    const next = this.nextNav();
    if (!next) return null;
    const { adapter } = this.routerState();
    return `/${adapter}${next.route}`;
  });
}
