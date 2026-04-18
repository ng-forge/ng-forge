import { ComponentRef, EnvironmentInjector, Injector, reflectComponentType, Type, ViewContainerRef } from '@angular/core';
import { catchError, forkJoin, from, map, Observable, of } from 'rxjs';
import { FieldWrapperContract, WrapperConfig, WrapperTypeDefinition } from '../../models/wrapper-type';
import { Logger } from '../../providers/features/logger/logger.interface';
import { WrapperFieldInputs } from '../../wrappers/wrapper-field-inputs';

/**
 * Module-level cache keyed by component class. `reflectComponentType` returns
 * immutable metadata per class, so we probe it once and reuse the resulting
 * `Set<templateName>` for every `setInputIfDeclared` call afterwards.
 *
 * We cache `templateName` (the public input name, aka alias) rather than
 * `propName` (the class field name) because `ComponentRef.setInput()` keys by
 * the public name — that's also the name wrapper configs use. An aliased
 * input declared as `input(..., { alias: 'header' })` with class field
 * `headerText` must be addressed as `'header'`; caching `propName` would
 * leave the alias out of the declared set and silently drop config values.
 *
 * SSR-safe: the WeakMap is keyed by the component class object — classes are
 * created per Angular application bootstrap and GC'd with it, so this does not
 * leak state between server renders.
 */
const inputNamesCache = new WeakMap<Type<unknown>, Set<string>>();

function getDeclaredInputs(componentType: Type<unknown>): Set<string> {
  let inputs = inputNamesCache.get(componentType);
  if (!inputs) {
    const meta = reflectComponentType(componentType);
    inputs = new Set(meta?.inputs.map((i) => i.templateName) ?? []);
    inputNamesCache.set(componentType, inputs);
  }
  return inputs;
}

/**
 * Set an input on a ComponentRef only when the target component actually declares it.
 *
 * Angular's `ComponentRef.setInput()` throws NG0303 when the input is missing.
 * For config keys driven by user data (e.g. a wrapper config containing a prop
 * the wrapper doesn't care about) that would surface as a noisy runtime error.
 * We probe the component's metadata via `reflectComponentType` (public API),
 * cached per component class — called once per input key per emission, so
 * avoiding the reflection scan on each call is meaningful under heavy typing.
 */
export function setInputIfDeclared(ref: ComponentRef<unknown>, inputName: string, value: unknown): void {
  const declared = getDeclaredInputs(ref.componentType);
  if (declared.has(inputName)) {
    ref.setInput(inputName, value);
  }
}

/**
 * A wrapper whose component has been resolved and loaded.
 */
export interface LoadedWrapper {
  readonly config: WrapperConfig;
  readonly component: Type<unknown>;
}

/**
 * Narrows an ES-module-with-default-export from a bare component class.
 * Lazy component loaders may return either shape depending on how the user
 * wrote the import expression (`import('./x')` vs `import('./x').then(m => m.Foo)`).
 */
export function hasDefaultExport<T>(value: unknown): value is { default: T } {
  return typeof value === 'object' && value !== null && 'default' in value && !!(value as { default: unknown }).default;
}

/**
 * Pick the component class out of whatever a lazy loader returned.
 */
export function resolveDefaultExport<T>(result: Type<T> | { default: Type<T> }): Type<T> {
  return hasDefaultExport<Type<T>>(result) ? result.default : result;
}

/**
 * Resolve a wrapper type name to its component class, with DI-scoped caching.
 */
export async function loadWrapperComponent(
  type: string,
  registry: ReadonlyMap<string, WrapperTypeDefinition>,
  cache: Map<string, Type<unknown>>,
): Promise<Type<unknown> | undefined> {
  const cached = cache.get(type);
  if (cached) return cached;

  const definition = registry.get(type);
  if (!definition) return undefined;

  const component = resolveDefaultExport(await definition.loadComponent());
  if (component) cache.set(type, component);
  return component;
}

/**
 * Load every wrapper for a chain, all-or-nothing. A single failed load
 * aborts the whole chain (emits `[]`) so the field renders bare rather
 * than in a partially-wrapped, visually-misleading state. Each failure
 * is logged; field-type resolution still throws — this isn't silent.
 */
export function loadWrapperComponents(
  configs: readonly WrapperConfig[],
  registry: ReadonlyMap<string, WrapperTypeDefinition>,
  cache: Map<string, Type<unknown>>,
  logger: Logger,
): Observable<LoadedWrapper[]> {
  if (configs.length === 0) return of([]);

  return forkJoin(
    configs.map((config) =>
      from(loadWrapperComponent(config.type, registry, cache)).pipe(
        catchError(() => of(undefined)),
        map((component) => {
          if (!component) {
            logger.error(`Wrapper type '${config.type}' could not be loaded. Ensure it is registered via provideDynamicForm().`);
            return null;
          }
          return { config, component } satisfies LoadedWrapper;
        }),
      ),
    ),
  ).pipe(map((results) => (results.some((r) => r === null) ? [] : (results as LoadedWrapper[]))));
}

/**
 * Options for building a wrapper chain.
 */
export interface RenderWrapperChainOptions {
  readonly outerContainer: ViewContainerRef;
  readonly loadedWrappers: readonly LoadedWrapper[];
  readonly environmentInjector: EnvironmentInjector;
  readonly parentInjector: Injector;
  readonly logger: Logger;
  /**
   * Optional mapper outputs to set as `fieldInputs` on each wrapper in the chain.
   * Container usages omit this (the children template is the innermost content,
   * not a single field).
   */
  readonly fieldInputs?: WrapperFieldInputs;
  /** Renders whatever belongs at the innermost slot (a field component, a children template, …). */
  readonly renderInnermost: (slot: ViewContainerRef) => void;
}

/**
 * Recursively create each wrapper component, threading the next one (or the
 * innermost content) into its `#fieldComponent` slot.
 *
 * Each wrapper receives:
 * - Each of its config properties (minus `type`) as an individual Angular input
 * - `fieldInputs` as a single input, if provided
 *
 * Returns the list of wrapper `ComponentRef`s — callers retain them for later
 * cleanup and for re-setting `fieldInputs` when the mapper signal emits.
 */
export function renderWrapperChain(options: RenderWrapperChainOptions): ComponentRef<unknown>[] {
  const refs: ComponentRef<unknown>[] = [];
  renderStep(options.outerContainer, options.loadedWrappers, options, refs);
  return refs;
}

function renderStep(
  slot: ViewContainerRef,
  remaining: readonly LoadedWrapper[],
  options: RenderWrapperChainOptions,
  refs: ComponentRef<unknown>[],
): void {
  if (remaining.length === 0) {
    options.renderInnermost(slot);
    return;
  }

  const [wrapper, ...rest] = remaining;

  const ref = slot.createComponent(wrapper.component, {
    environmentInjector: options.environmentInjector,
    injector: options.parentInjector,
  });
  refs.push(ref);

  for (const [key, value] of Object.entries(wrapper.config)) {
    // `type` is the registry discriminant; `fieldInputs` is set explicitly
    // below. Don't let a stray config key override either.
    if (key === 'type' || key === 'fieldInputs') continue;
    setInputIfDeclared(ref, key, value);
  }

  if (options.fieldInputs !== undefined) {
    setInputIfDeclared(ref, 'fieldInputs', options.fieldInputs);
  }

  ref.changeDetectorRef.detectChanges();

  const inner = resolveInnerSlot(ref);
  if (!inner) {
    options.logger.error(
      `Wrapper component for type '${wrapper.config.type}' does not provide a 'fieldComponent' ViewContainerRef. ` +
        `Ensure the wrapper component has a viewChild('fieldComponent', { read: ViewContainerRef }) query ` +
        `and that #fieldComponent is not inside a conditional (@if, @defer).`,
    );
    // Unwind: destroy every wrapper built so far, including this one, so the
    // caller doesn't end up with a partial chain left in the DOM.
    while (refs.length) refs.pop()!.destroy();
    return;
  }

  renderStep(inner, rest, options, refs);
}

/**
 * Read a wrapper's `#fieldComponent` ViewContainerRef, tolerating the NG0951
 * thrown by `viewChild.required` when the query is absent or inside a
 * conditional. Any other error (e.g. an unrelated throw from the wrapper's
 * signals) propagates up so the subscribe can log it with a full stack.
 */
function resolveInnerSlot(ref: ComponentRef<unknown>): ViewContainerRef | undefined {
  const contract = ref.instance as FieldWrapperContract;
  try {
    return contract.fieldComponent?.();
  } catch (err) {
    // NG0951 (REQUIRED_QUERY_NO_VALUE) — signal viewChild.required throws when
    // the query couldn't resolve. Angular uses a negative code here.
    if ((err as { code?: number }).code === -951) return undefined;
    throw err;
  }
}
