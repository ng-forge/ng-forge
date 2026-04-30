import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { AddonActionHandler, ADDON_ACTION_HANDLERS } from './addon-action-registry.token';

/**
 * Register named action handlers reachable via JSON-driven addon configs.
 *
 * Once registered, a backend can ship `{ kind: 'pi-button', actionRef: 'openProfile' }`
 * and the FE will invoke the corresponding handler at click time. Type the
 * registry via module augmentation to enable autocomplete on `actionRef`:
 *
 * ```typescript
 * declare module '@ng-forge/dynamic-forms' {
 *   interface DynamicFormActionRegistry {
 *     openProfile: true;
 *     runWorkflow: true;
 *   }
 * }
 *
 * provideDynamicForm(
 *   ...withPrimengFields(),
 *   provideAddonActions({
 *     openProfile: (ctx) => modalService.open(ProfileModal, { data: ctx.value }),
 *     runWorkflow: (ctx) => workflowService.run(ctx.field.key, ctx.value),
 *   }),
 * );
 * ```
 *
 * Multiple `provideAddonActions(...)` calls are merged; later names override
 * earlier ones for the same key.
 */
export function provideAddonActions(handlers: Record<string, AddonActionHandler>): DynamicFormFeature<'addon-actions'> {
  return createFeature('addon-actions', [
    {
      provide: ADDON_ACTION_HANDLERS,
      useValue: handlers,
      multi: true,
    },
  ]);
}
