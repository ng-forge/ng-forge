import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { of, switchMap } from 'rxjs';
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

  readonly core = toSignal(this.apiService.loadPackage('core'));

  /** Reactively load the adapter package based on active adapter. */
  readonly adapterPkg = toSignal(
    toObservable(this.adapter.adapter).pipe(
      switchMap((name) => {
        const slug = this.apiService.getAdapterPackageSlug(name);
        return slug ? this.apiService.loadPackage(slug) : of(undefined);
      }),
    ),
  );

  readonly availableKinds = computed(() => {
    const all = [...(this.core()?.declarations ?? []), ...(this.adapterPkg()?.declarations ?? [])];
    const kinds = new Set<DeclarationKind>(all.map((d) => d.kind));
    return Array.from(kinds).map((k) => ({ kind: k, meta: getKindMeta(k) }));
  });

  readonly filteredCoreGroups = computed(() => {
    const pkg = this.core();
    return pkg ? groupByKind(this.filterDeclarations(pkg.declarations)) : [];
  });

  readonly filteredAdapterGroups = computed(() => {
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

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  toggleKindFilter(kind: DeclarationKind): void {
    this.kindFilter.update((current) => (current === kind ? null : kind));
  }

  clearFilters(): void {
    this.query.set('');
    this.kindFilter.set(null);
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
