import { ChangeDetectionStrategy, Component, computed, inject, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgDocPageNavigationComponent } from '@ng-doc/app/components/page-navigation';
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
 * This component recomputes prevPage/nextPage after stripping the adapter prefix from the URL.
 */
@Component({
  selector: 'docs-page-navigation',
  template: `<ng-doc-page-navigation [prevPage]="prevNav()!" [nextPage]="nextNav()!" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgDocPageNavigationComponent],
})
export class DocsPageNavigationComponent {
  // ng-doc skeleton interface requires these inputs named 'prevPage' / 'nextPage'.
  // Their values are always wrong (artifact of the adapter-prefix bug), so we ignore them
  // and recompute below.
  @Input() prevPage: NgDocNavigation | undefined;
  @Input() nextPage: NgDocNavigation | undefined;

  private readonly router = inject(Router);
  private readonly context = inject(NG_DOC_CONTEXT);

  /** Current path with adapter prefix and leading slash stripped.
   *  e.g. '/material/validation/basics' → 'validation/basics'
   */
  private readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        const url = this.router.url.split(/[?#]/)[0];
        const segments = url.replace(/^\//, '').split('/');
        return segments.slice(1).join('/');
      }),
    ),
    { requireSync: true },
  );

  private readonly flatPages = computed(() => {
    const flatten = (items: NgDocNavigation[]): NgDocNavigation[] =>
      items.flatMap((item) => (item.children?.length ? flatten(item.children) : [item]));
    return flatten(this.context.navigation);
  });

  readonly prevNav = computed(() => {
    const idx = this.flatPages().findIndex((p) => p.route.replace(/^\//, '') === this.currentPath());
    return idx > 0 ? this.flatPages()[idx - 1] : undefined;
  });

  readonly nextNav = computed(() => {
    const idx = this.flatPages().findIndex((p) => p.route.replace(/^\//, '') === this.currentPath());
    return idx >= 0 && idx < this.flatPages().length - 1 ? this.flatPages()[idx + 1] : undefined;
  });
}
