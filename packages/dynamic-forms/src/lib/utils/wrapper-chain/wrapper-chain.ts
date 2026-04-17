import { ComponentRef, EnvironmentInjector, Injector, reflectComponentType, Type, ViewContainerRef } from '@angular/core';
import { catchError, forkJoin, from, Observable, of, switchMap } from 'rxjs';
import { FieldWrapperContract, WrapperConfig, WrapperTypeDefinition } from '../../models/wrapper-type';
import { Logger } from '../../providers/features/logger/logger.interface';
import { WrapperFieldInputs } from '../../wrappers/wrapper-field-inputs';

/**
 * Set an input on a ComponentRef only when the target component actually declares it.
 *
 * Angular's `ComponentRef.setInput()` throws NG0303 when the input is missing.
 * For config keys driven by user data (e.g. a wrapper config containing a prop
 * the wrapper doesn't care about) that would surface as a noisy runtime error,
 * so we probe the component's metadata via `reflectComponentType` (public API).
 */
export function setInputIfDeclared(ref: ComponentRef<unknown>, inputName: string, value: unknown): void {
  const meta = reflectComponentType(ref.componentType);
  if (meta?.inputs.some((i) => i.propName === inputName)) {
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

  const result = await definition.loadComponent();
  const moduleResult = result as { default?: Type<unknown> } | Type<unknown>;
  const component =
    typeof moduleResult === 'object' && 'default' in moduleResult && moduleResult.default
      ? moduleResult.default
      : (result as Type<unknown>);

  if (component) cache.set(type, component);
  return component;
}

/**
 * Load all wrapper component classes for the given configs.
 *
 * Emits once, as an array aligned with the input order. Wrappers whose
 * component fails to load are logged and silently dropped from the chain.
 *
 * The failure also writes to `console.error` unconditionally — this is an
 * authoring mistake (an unregistered wrapper type) that must surface even
 * when `withLoggerConfig(false)` has suppressed the library logger.
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
        switchMap((component) => {
          if (!component) {
            const message = `Wrapper type '${config.type}' could not be loaded. Ensure it is registered via provideDynamicForm().`;
            logger.error(message);
             
            console.error('[Dynamic Forms]', message);
            return of(null);
          }
          return of({ config, component } satisfies LoadedWrapper);
        }),
      ),
    ),
  ).pipe(switchMap((results) => of(results.filter((r): r is LoadedWrapper => r !== null))));
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
    if (key === 'type') continue;
    setInputIfDeclared(ref, key, value);
  }

  if (options.fieldInputs !== undefined) {
    setInputIfDeclared(ref, 'fieldInputs', options.fieldInputs);
  }

  ref.changeDetectorRef.detectChanges();

  // `viewChild.required('fieldComponent', …)` throws NG0951 when the query
  // resolves to nothing (e.g. wrapper forgot the #fieldComponent ref or put it
  // inside an @if/@defer). Catch it and funnel into the same actionable log.
  let inner: ViewContainerRef | undefined;
  try {
    inner = (ref.instance as FieldWrapperContract).fieldComponent?.();
  } catch {
    inner = undefined;
  }

  if (!inner) {
    options.logger.error(
      `Wrapper component for type '${wrapper.config.type}' does not provide a 'fieldComponent' ViewContainerRef. ` +
        `Ensure the wrapper component has a viewChild('fieldComponent', { read: ViewContainerRef }) query ` +
        `and that #fieldComponent is not inside a conditional (@if, @defer).`,
    );
    return;
  }

  renderStep(inner, rest, options, refs);
}
