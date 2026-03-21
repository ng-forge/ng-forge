import { inject, Injectable } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, of, catchError } from 'rxjs';

// ─── API Data Models ─────────────────────────────────────────────────────────

export type DeclarationKind =
  | 'class'
  | 'interface'
  | 'type'
  | 'function'
  | 'const'
  | 'enum'
  | 'component'
  | 'directive'
  | 'injectable'
  | 'pipe';

export interface ApiMember {
  name: string;
  kind: 'property' | 'method' | 'accessor';
  type: string;
  description: string;
  params?: ApiParam[];
  returnType?: string;
  isOptional?: boolean;
  isReadonly?: boolean;
  isStatic?: boolean;
  defaultValue?: string;
  deprecated?: string;
}

export interface ApiParam {
  name: string;
  type: string;
  description: string;
  isOptional?: boolean;
  defaultValue?: string;
}

export interface ApiTypeParam {
  name: string;
  constraint?: string;
  default?: string;
  description: string;
}

export interface ApiDeclaration {
  name: string;
  kind: DeclarationKind;
  description: string;
  signature: string;
  members: ApiMember[];
  params?: ApiParam[];
  returnType?: string;
  typeParams?: ApiTypeParam[];
  deprecated?: string;
  see?: string[];
  examples?: string[];
  remarks?: string;
  sourceFile: string;
  sourceLine: number;
}

export interface ApiPackage {
  name: string;
  slug: string;
  declarations: ApiDeclaration[];
}

export interface ApiManifestEntry {
  name: string;
  slug: string;
  count: number;
}

// ─── Kind metadata ───────────────────────────────────────────────────────────

export interface KindMeta {
  label: string;
  pluralLabel: string;
  cssClass: string;
}

const KIND_META: Record<DeclarationKind, KindMeta> = {
  component: { label: 'Component', pluralLabel: 'Components', cssClass: 'kind--component' },
  directive: { label: 'Directive', pluralLabel: 'Directives', cssClass: 'kind--directive' },
  injectable: { label: 'Injectable', pluralLabel: 'Injectables', cssClass: 'kind--injectable' },
  pipe: { label: 'Pipe', pluralLabel: 'Pipes', cssClass: 'kind--pipe' },
  class: { label: 'Class', pluralLabel: 'Classes', cssClass: 'kind--class' },
  interface: { label: 'Interface', pluralLabel: 'Interfaces', cssClass: 'kind--interface' },
  type: { label: 'Type', pluralLabel: 'Types', cssClass: 'kind--type' },
  function: { label: 'Function', pluralLabel: 'Functions', cssClass: 'kind--function' },
  const: { label: 'Const', pluralLabel: 'Constants', cssClass: 'kind--const' },
  enum: { label: 'Enum', pluralLabel: 'Enums', cssClass: 'kind--enum' },
};

export function getKindMeta(kind: DeclarationKind): KindMeta {
  return KIND_META[kind];
}

/** Group declarations by kind, in display order. */
export function groupByKind(declarations: ApiDeclaration[]): { kind: DeclarationKind; meta: KindMeta; items: ApiDeclaration[] }[] {
  const kindOrder: DeclarationKind[] = [
    'component',
    'directive',
    'injectable',
    'pipe',
    'class',
    'interface',
    'type',
    'function',
    'const',
    'enum',
  ];

  const groups: { kind: DeclarationKind; meta: KindMeta; items: ApiDeclaration[] }[] = [];

  for (const kind of kindOrder) {
    const items = declarations.filter((d) => d.kind === kind);
    if (items.length > 0) {
      groups.push({ kind, meta: KIND_META[kind], items });
    }
  }

  return groups;
}

// ─── Service ─────────────────────────────────────────────────────────────────

/** Adapter slug → package slug mapping. */
const ADAPTER_PACKAGE_MAP: Record<string, string> = {
  material: 'material',
  bootstrap: 'bootstrap',
  primeng: 'primeng',
  ionic: 'ionic',
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseHref = inject(APP_BASE_HREF, { optional: true }) ?? '/';
  private readonly cache = new Map<string, Observable<ApiPackage>>();

  /** Load API data for a given package slug (core, material, bootstrap, primeng, ionic). */
  loadPackage(slug: string): Observable<ApiPackage> {
    const cached = this.cache.get(slug);
    if (cached) return cached;

    const base = this.baseHref.endsWith('/') ? this.baseHref : this.baseHref + '/';
    const result$ = this.http.get<ApiPackage>(`${base}content/api/${slug}.json`).pipe(
      catchError(() => of({ name: slug, slug, declarations: [] })),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.cache.set(slug, result$);
    return result$;
  }

  /** Load the manifest listing all available packages. */
  loadManifest(): Observable<ApiManifestEntry[]> {
    const base = this.baseHref.endsWith('/') ? this.baseHref : this.baseHref + '/';
    return this.http.get<ApiManifestEntry[]>(`${base}content/api/manifest.json`).pipe(
      catchError(() => of([])),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  /** Get the package slug for a given adapter name. Returns undefined for 'custom'. */
  getAdapterPackageSlug(adapter: string): string | undefined {
    return ADAPTER_PACKAGE_MAP[adapter];
  }

  /**
   * Find which package a symbol belongs to.
   * Searches core first, then the adapter package.
   */
  findSymbol(name: string, core: ApiPackage, adapterPkg?: ApiPackage): { pkg: ApiPackage; declaration: ApiDeclaration } | undefined {
    const coreDecl = core.declarations.find((d) => d.name === name);
    if (coreDecl) return { pkg: core, declaration: coreDecl };

    if (adapterPkg) {
      const adapterDecl = adapterPkg.declarations.find((d) => d.name === name);
      if (adapterDecl) return { pkg: adapterPkg, declaration: adapterDecl };
    }

    return undefined;
  }
}
