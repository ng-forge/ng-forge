import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { AddonActionHandler, ADDON_ACTION_HANDLERS } from './addon-action-registry.token';

/**
 * Typed feature returned by {@link provideAddonActions}. Carries the
 * registered handler keys as a phantom type so consumers can derive the
 * `DynamicFormActionRegistry` augmentation in one line instead of hand-typing
 * every key.
 *
 * Phantom field is `__handlerKeys` (the leading underscores signal "internal,
 * type-only — not for runtime access").
 */
export type AddonActionsFeature<K extends string = string> = DynamicFormFeature<'addon-actions'> & {
  /** @internal Phantom field carrying the registered keys; never read at runtime. */
  readonly __handlerKeys?: K;
};

/**
 * Register named action handlers reachable via JSON-driven addon configs.
 *
 * Once registered, a backend can ship
 * `{ kind: 'prime-button', actionRef: 'openProfile' }` and the FE will invoke
 * the corresponding handler at click time.
 *
 * Define handlers once and augment the registry from the same object:
 *
 * ```typescript
 * export const appActions = provideAddonActions({
 *   openProfile: (ctx) => modalService.open(ProfileModal, { data: ctx.value }),
 *   runWorkflow: (ctx) => workflowService.run(ctx.field.key, ctx.value),
 * });
 *
 * declare module '@ng-forge/dynamic-forms' {
 *   // Pulls the keys straight off `appActions` — no manual list to keep in sync.
 *   interface DynamicFormActionRegistry extends Record<NonNullable<typeof appActions['__handlerKeys']>, true> {}
 * }
 *
 * // Then in your bootstrap:
 * provideDynamicForm(...withPrimeNGFields(), appActions);
 * ```
 *
 * Multiple `provideAddonActions(...)` calls are merged; later names override
 * earlier ones for the same key.
 */
export function provideAddonActions<const H extends Record<string, AddonActionHandler>>(
  handlers: H,
): AddonActionsFeature<keyof H & string> {
  return createFeature('addon-actions', [
    {
      provide: ADDON_ACTION_HANDLERS,
      useValue: handlers,
      multi: true,
    },
  ]) as AddonActionsFeature<keyof H & string>;
}
