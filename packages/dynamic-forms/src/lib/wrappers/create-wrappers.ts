import { LazyComponentLoader, WrapperTypeDefinition } from '../models/wrapper-type';

/**
 * User-facing wrapper registration shape used with `createWrappers(...)`.
 *
 * Extends `WrapperTypeDefinition` with an optional `props` field that
 * carries the wrapper's config type (via `wrapperProps`) for later
 * inference by `InferWrapperRegistry`.
 */
export interface WrapperRegistration<TName extends string = string, TConfig = unknown> {
  /** Unique identifier for the wrapper type */
  readonly wrapperName: TName;
  /** Lazy-loader for the wrapper component */
  readonly loadComponent: LazyComponentLoader;
  /** Field types this wrapper auto-applies to (merged lowest-priority during wrapper resolution) */
  readonly types?: readonly string[];
  /**
   * Type carrier only — runtime value is always `undefined`.
   * Use `wrapperProps<YourConfig>()` to thread the config type.
   */
  readonly props?: TConfig;
}

/**
 * Branded bundle returned by `createWrappers(...)`.
 *
 * Carries:
 * - `ɵkind: 'wrappers'` — discriminant recognised by `provideDynamicForm(...)`
 * - `ɵregistrations` — the original registrations (type-level use for `InferWrapperRegistry`)
 * - `ɵdefinitions` — the `WrapperTypeDefinition[]` extracted for `WRAPPER_REGISTRY`
 */
export interface WrappersBundle<T extends readonly WrapperRegistration[] = readonly WrapperRegistration[]> {
  readonly ɵkind: 'wrappers';
  readonly ɵregistrations: T;
  readonly ɵdefinitions: readonly WrapperTypeDefinition[];
}

/**
 * Bundle wrapper registrations into a single object that can be passed to
 * `provideDynamicForm(...)`.
 *
 * @example
 * ```typescript
 * const appWrappers = createWrappers(
 *   {
 *     wrapperName: 'section',
 *     loadComponent: () => import('./section-wrapper'),
 *     props: wrapperProps<SectionWrapper>(),
 *   },
 *   {
 *     wrapperName: 'highlight',
 *     loadComponent: () => import('./highlight-wrapper'),
 *     types: ['input', 'select'],
 *     props: wrapperProps<HighlightWrapper>(),
 *   },
 * );
 *
 * declare module '@ng-forge/dynamic-forms' {
 *   interface FieldRegistryWrappers extends InferWrapperRegistry<typeof appWrappers> {}
 * }
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [provideDynamicForm(appWrappers)],
 * });
 * ```
 */
export function createWrappers<const T extends readonly WrapperRegistration[]>(...registrations: T): WrappersBundle<T> {
  return {
    ɵkind: 'wrappers',
    ɵregistrations: registrations,
    ɵdefinitions: registrations.map(({ wrapperName, loadComponent, types }) => ({
      wrapperName,
      loadComponent,
      types,
    })),
  };
}

/** Type guard for a `WrappersBundle`. */
export function isWrappersBundle(value: unknown): value is WrappersBundle {
  return (
    typeof value === 'object' &&
    value !== null &&
    'ɵkind' in value &&
    (value as { ɵkind: unknown }).ɵkind === 'wrappers' &&
    'ɵdefinitions' in value &&
    Array.isArray((value as { ɵdefinitions: unknown }).ɵdefinitions)
  );
}

/**
 * Derive the `FieldRegistryWrappers` augmentation shape from a wrapper bundle.
 *
 * Maps each registration's `wrapperName` to its `props` type (the config carried
 * by `wrapperProps<T>()`). If a registration has no `props`, falls back to the
 * minimal discriminant shape `{ readonly type: wrapperName }`.
 *
 * @example
 * ```typescript
 * declare module '@ng-forge/dynamic-forms' {
 *   interface FieldRegistryWrappers extends InferWrapperRegistry<typeof appWrappers> {}
 * }
 * ```
 */
export type InferWrapperRegistry<T> =
  T extends WrappersBundle<infer R>
    ? {
        [Reg in R[number] as Reg['wrapperName']]: Reg extends { props: infer P }
          ? Exclude<P, undefined>
          : { readonly type: Reg['wrapperName'] };
      }
    : never;
