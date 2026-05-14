import { computed, Directive, inject, Injector, input, Signal } from '@angular/core';
import {
  ADDON_ACTION_REGISTRY,
  AddonActionContext,
  AddonActionHandler,
  BaseAddon,
  DynamicFormLogger,
  DynamicValue,
  resolveDynamicValue,
  WrapperFieldInputs,
} from '@ng-forge/dynamic-forms';
import { ADDON_PRESET_HANDLER } from './addon-preset-handler.token';
import type { AssertTupleLockstep } from './assert-input-lockstep';

/**
 * Permissive shape the directive reads from `addon()`. Adapter-specific
 * addon types (e.g., `PiButtonAddon`) narrow this at the inject site via
 * `injectNgForgeAddonAction<T>()`.
 */
interface ActionAddonShape extends BaseAddon {
  readonly preset?: string;
  readonly actionRef?: string;
  readonly action?: AddonActionHandler;
  readonly disabled?: DynamicValue<boolean>;
  readonly loading?: DynamicValue<boolean>;
}

/**
 * Universal click-dispatch plumbing for action-style addons (icon buttons,
 * labelled buttons, etc.): `disabled` / `loading` resolution from
 * `DynamicValue<boolean>`, action context construction, and the
 * `preset / actionRef / action` precedence dispatcher.
 *
 * Adapter button kinds (e.g., `pi-button`) compose `NgForgeAddonAction`
 * and read state via `injectNgForgeAddonAction<TAddon>()`. Preset semantics
 * are adapter-specific — register an `ADDON_PRESET_HANDLER` at the host
 * field scope to receive preset dispatches.
 */
@Directive({})
export class NgForgeAddonActionBase {
  private readonly actionRegistry = inject(ADDON_ACTION_REGISTRY);
  private readonly presetHandler = inject(ADDON_PRESET_HANDLER, { optional: true });
  private readonly logger = inject(DynamicFormLogger);
  private readonly hostInjector = inject(Injector);

  readonly addon = input.required<ActionAddonShape>();
  readonly fieldInputs = input<WrapperFieldInputs | undefined>(undefined);

  readonly disabled: Signal<boolean> = computed(() => resolveDynamicValue(this.addon().disabled, false, this.hostInjector)());
  readonly loading: Signal<boolean> = computed(() => resolveDynamicValue(this.addon().loading, false, this.hostInjector)());

  /**
   * Resolve the click handler from the addon's three-axis click variant and
   * invoke it. Precedence on multi-set: `preset > actionRef > action`. The
   * validator drops multi-set configs at config-init time; this is
   * defence-in-depth + a logged warning so the misconfiguration is loud.
   */
  dispatch(): void {
    const addon = this.addon();
    const ctx = this.buildActionContext();

    const variantsSet = [addon.preset, addon.actionRef, addon.action].filter((v) => v !== undefined).length;
    if (variantsSet > 1) {
      this.logger.warn(
        `Addon button: more than one of preset/actionRef/action configured — dispatching by precedence (preset > actionRef > action). Ship at most one to silence this.`,
      );
    }

    if (addon.preset !== undefined) {
      if (!this.presetHandler) {
        this.logger.warn(
          `Addon button: preset '${addon.preset}' is configured but no ADDON_PRESET_HANDLER is registered in this scope. Did the adapter forget to provide one at the host field?`,
        );
        return;
      }
      void this.presetHandler.run(addon.preset, ctx);
      return;
    }

    if (addon.actionRef !== undefined) {
      const handler = this.actionRegistry.get(addon.actionRef);
      if (handler) {
        handler(ctx);
      } else {
        this.logger.warn(
          `Addon button: actionRef '${addon.actionRef}' is not registered. Did you call provideAddonActions({ ${addon.actionRef}: ... })?`,
        );
      }
      return;
    }

    if (addon.action !== undefined) {
      addon.action(ctx);
      return;
    }

    // Decorative — no handler configured.
  }

  /**
   * Build an `AddonActionContext` for handlers from the wrapper-style
   * `fieldInputs` bag. When the addon is rendered outside a field (rare),
   * handlers receive empty stand-ins so they don't crash.
   */
  buildActionContext(): AddonActionContext {
    const inputs = this.fieldInputs();
    return {
      field: { key: inputs?.key ?? '', type: inputs?.type ?? '' },
      form: inputs?.field ?? null,
      value: inputs?.field?.value() ?? undefined,
      setValue: inputs?.setValue,
    };
  }
}

/** Forwarded onto `NgForgeAddonActionBase` via the `NgForgeAddonAction` wrapper. */
export const NG_FORGE_ADDON_ACTION_INPUTS = ['addon', 'fieldInputs'] as const;

const _NG_FORGE_ADDON_ACTION_INPUTS_LOCKSTEP: AssertTupleLockstep<
  NgForgeAddonActionBase,
  typeof NG_FORGE_ADDON_ACTION_INPUTS,
  'NG_FORGE_ADDON_ACTION_INPUTS'
> = true;
void _NG_FORGE_ADDON_ACTION_INPUTS_LOCKSTEP;

/**
 * Host wrapper for `NgForgeAddonActionBase`. Consumers compose this directly:
 *
 * ```ts
 * \@Component({
 *   hostDirectives: [NgForgeAddonAction],
 *   template: `
 *     <p-button [loading]="action.loading()" [disabled]="action.disabled()"
 *               (onClick)="action.dispatch()" />
 *   `,
 * })
 * export class MyButtonAddon {
 *   protected readonly action = injectNgForgeAddonAction<MyButtonAddon>();
 * }
 * ```
 */
@Directive({
  hostDirectives: [{ directive: NgForgeAddonActionBase, inputs: [...NG_FORGE_ADDON_ACTION_INPUTS] }],
})
export class NgForgeAddonAction {}

/** Narrowed view of `NgForgeAddonActionBase` returned by `injectNgForgeAddonAction<T>()`. */
export type TypedNgForgeAddonAction<TAddon extends ActionAddonShape = ActionAddonShape> = Omit<NgForgeAddonActionBase, 'addon'> & {
  readonly addon: Signal<TAddon>;
};

export function injectNgForgeAddonAction<TAddon extends ActionAddonShape = ActionAddonShape>(): TypedNgForgeAddonAction<TAddon> {
  return inject(NgForgeAddonActionBase) as unknown as TypedNgForgeAddonAction<TAddon>;
}
