import { LazyComponentLoader, WrapperTypeDefinition } from '../models/wrapper-type';

/** User-facing wrapper registration shape used with `createWrappers(...)`. */
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

/** Branded bundle returned by `createWrappers(...)`. */
export interface WrappersBundle<T extends readonly WrapperRegistration[] = readonly WrapperRegistration[]> {
  readonly ɵkind: 'wrappers';
  readonly ɵregistrations: T;
  readonly ɵdefinitions: readonly WrapperTypeDefinition[];
}

/**
 * Bundle wrapper registrations into a single object that can be passed to
 * `provideDynamicForm(...)`.
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

/** Derive the `FieldRegistryWrappers` augmentation shape from a wrapper bundle. */
export type InferWrapperRegistry<T> =
  T extends WrappersBundle<infer R>
    ? {
        [Reg in R[number] as Reg['wrapperName']]: Reg extends { props: infer P }
          ? Exclude<P, undefined>
          : { readonly type: Reg['wrapperName'] };
      }
    : never;
