import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ActiveAdapterService } from '../../services/active-adapter.service';
import { ApiService, type ApiDeclaration, type DeclarationKind, getKindMeta, groupByKind } from '../../services/api.service';

@Component({
  selector: 'docs-api-index',
  imports: [RouterLink, SlicePipe],
  templateUrl: './api-index.component.html',
  styleUrl: './api-index.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiIndexComponent {
  private readonly apiService = inject(ApiService);
  protected readonly adapter = inject(ActiveAdapterService);

  readonly query = signal('');
  readonly kindFilter = signal<DeclarationKind | null>(null);

  /** Which packages are visible. Both enabled by default. */
  readonly packageFilter = signal<Set<string>>(new Set(['core', 'adapter']));

  private readonly coreResource = rxResource({
    params: () => ({}),
    stream: () => this.apiService.loadPackage('core'),
  });

  readonly core = computed(() => this.coreResource.value());

  private readonly adapterPkgResource = rxResource({
    params: () => {
      const slug = this.apiService.getAdapterPackageSlug(this.adapter.adapter());
      return slug ? { slug } : undefined;
    },
    stream: ({ params }) => this.apiService.loadPackage(params.slug),
  });

  readonly adapterPkg = computed(() => this.adapterPkgResource.value());

  readonly availableKinds = computed(() => {
    const all = [...this.visibleDeclarations()];
    const kinds = new Set<DeclarationKind>(all.map((d) => d.kind));
    return Array.from(kinds).map((k) => ({ kind: k, meta: getKindMeta(k) }));
  });

  /** All declarations from visible packages, before kind/text filter. */
  private readonly visibleDeclarations = computed(() => {
    const filter = this.packageFilter();
    const core = filter.has('core') ? (this.core()?.declarations ?? []) : [];
    const adapter = filter.has('adapter') ? (this.adapterPkg()?.declarations ?? []) : [];
    return [...core, ...adapter];
  });

  readonly showCore = computed(() => this.packageFilter().has('core'));
  readonly showAdapter = computed(() => this.packageFilter().has('adapter'));

  readonly filteredCoreGroups = computed(() => {
    if (!this.showCore()) return [];
    const pkg = this.core();
    return pkg ? groupByKind(this.filterDeclarations(pkg.declarations)) : [];
  });

  readonly filteredAdapterGroups = computed(() => {
    if (!this.showAdapter()) return [];
    const pkg = this.adapterPkg();
    return pkg ? groupByKind(this.filterDeclarations(pkg.declarations)) : [];
  });

  readonly isCustomAdapter = computed(() => this.adapter.adapter() === 'custom');

  readonly adapterLabel = computed(() => {
    const name = this.adapter.adapter();
    return this.adapter.adapters.find((a) => a.name === name)?.label ?? name;
  });

  readonly totalResults = computed(() => {
    return (
      this.filteredCoreGroups().reduce((sum, g) => sum + g.items.length, 0) +
      this.filteredAdapterGroups().reduce((sum, g) => sum + g.items.length, 0)
    );
  });

  readonly coreCount = computed(() => this.core()?.declarations.length ?? 0);
  readonly adapterCount = computed(() => this.adapterPkg()?.declarations.length ?? 0);

  /** True once core data has loaded (adapter may be undefined for custom). */
  readonly dataLoaded = computed(() => !!this.core());

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  toggleKindFilter(kind: DeclarationKind): void {
    this.kindFilter.update((current) => (current === kind ? null : kind));
  }

  togglePackage(pkg: string): void {
    this.packageFilter.update((current) => {
      const next = new Set(current);
      if (next.has(pkg)) {
        next.delete(pkg);
      } else {
        next.add(pkg);
      }
      return next;
    });
  }

  clearKindFilter(): void {
    this.kindFilter.set(null);
  }

  clearFilters(): void {
    this.query.set('');
    this.kindFilter.set(null);
    this.packageFilter.set(new Set(['core', 'adapter']));
  }

  getKindMeta = getKindMeta;

  private filterDeclarations(declarations: ApiDeclaration[]): ApiDeclaration[] {
    let filtered = declarations;

    const kind = this.kindFilter();
    if (kind) {
      filtered = filtered.filter((d) => d.kind === kind);
    }

    const q = this.query().toLowerCase().trim();
    if (q) {
      filtered = filtered.filter((d) => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
    }

    return filtered;
  }
}
