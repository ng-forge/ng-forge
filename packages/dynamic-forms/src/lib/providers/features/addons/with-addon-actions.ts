import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { AddonActionHandler, ADDON_ACTION_HANDLERS } from '@ng-forge/dynamic-forms/internal';

/**
 * Typed feature returned by {@link withAddonActions}. Carries the
 * registered handler keys as a phantom type so consumers can derive the
 * `DynamicFormActionRegistry` augmentation in one line instead of hand-typing
 * every key.
 */
export type AddonActionsFeature<K extends string = string> = DynamicFormFeature<'addon-actions'> & {
  /** @internal Phantom field carrying the registered keys; never read at runtime. */
  readonly __handlerKeys?: K;
};

/** Register named action handlers reachable via JSON-driven addon configs. */
export function withAddonActions<const H extends Record<string, AddonActionHandler>>(handlers: H): AddonActionsFeature<keyof H & string> {
  return createFeature('addon-actions', [
    {
      provide: ADDON_ACTION_HANDLERS,
      useValue: handlers,
      multi: true,
    },
  ]) as AddonActionsFeature<keyof H & string>;
}
