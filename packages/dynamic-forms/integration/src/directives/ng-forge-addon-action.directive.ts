import { computed, Directive, inject, Injector, input, Signal, signal } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import {
  ADDON_ACTION_REGISTRY,
  AddonActionHandler,
  BaseAddon,
  DynamicFormLogger,
  DynamicValue,
  WrapperFieldInputs,
} from '@ng-forge/dynamic-forms';
import { AddonActionContext, resolveDynamicValue, writeToFieldValue } from '@ng-forge/dynamic-forms/internal';
import { ADDON_PRESET_HANDLER } from './addon-preset-handler.token';
import type { AssertTupleLockstep } from './assert-input-lockstep';

/**
 * Permissive shape the directive reads from `addon()`. Adapter-specific
 * addon types (e.g., `PrimeButtonAddon`) narrow this at the inject site via
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
 */
@Directive({})
export class NgForgeAddonActionBase {
  // The action registry is form-scoped. `optional: true` matches the
  // preset handler so addons rendered outside a form that called
  // `provideAddonActions(...)` degrade gracefully instead of throwing —
  // `actionRef` dispatches then log an actionable warning and no-op.
  private readonly actionRegistry = inject(ADDON_ACTION_REGISTRY, { optional: true });
  private readonly presetHandler = inject(ADDON_PRESET_HANDLER, { optional: true });
  private readonly logger = inject(DynamicFormLogger);
  private readonly hostInjector = inject(Injector);

  readonly addon = input.required<ActionAddonShape>();
  readonly fieldInputs = input<WrapperFieldInputs | undefined>(undefined);

  /**
   * Per-value caches for `disabled` / `loading` signal resolution. Keyed by
   * the `DynamicValue` identity so a single `toSignal` subscription is
   * shared across addon-reference swaps that pass the same Observable.
   * Mirrors `NgForgeAddonsBase._hiddenByValue` — `resolveDynamicValue`
   * cannot run inside `computed`/`linkedSignal.computation` because
   * `toSignal` throws in reactive contexts (NG0602), and re-running it on
   * every recomputation would leak subscriptions on each cycle.
   */
  private readonly _disabledByValue = new WeakMap<object, Signal<boolean>>();
  private readonly _loadingByValue = new WeakMap<object, Signal<boolean>>();
  private readonly _resolvedDisabled = signal<Signal<boolean> | undefined>(undefined);
  private readonly _resolvedLoading = signal<Signal<boolean> | undefined>(undefined);

  readonly disabled: Signal<boolean> = computed(() => this._resolvedDisabled()?.() ?? false);
  readonly loading: Signal<boolean> = computed(() => this._resolvedLoading()?.() ?? false);

  constructor() {
    explicitEffect([this.addon], ([addon]) => {
      this._resolvedDisabled.set(this._resolveAxis(addon.disabled, this._disabledByValue));
      this._resolvedLoading.set(this._resolveAxis(addon.loading, this._loadingByValue));
    });
  }

  private _resolveAxis(value: DynamicValue<boolean> | undefined, cache: WeakMap<object, Signal<boolean>>): Signal<boolean> {
    const valueKey = typeof value === 'object' && value !== null ? value : null;
    let resolved = valueKey ? cache.get(valueKey) : undefined;
    if (!resolved) {
      resolved = resolveDynamicValue(value, false, this.hostInjector);
      if (valueKey) cache.set(valueKey, resolved);
    }
    return resolved;
  }

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
      const handler = this.actionRegistry?.get(addon.actionRef);
      if (handler) {
        handler(ctx);
      } else {
        this.logger.warn(
          `Addon button: actionRef '${addon.actionRef}' is not registered. ` +
            (this.actionRegistry
              ? `Did you call provideAddonActions({ ${addon.actionRef}: ... })?`
              : `No provideAddonActions(...) registry is reachable in this scope — was the addon rendered outside a form?`),
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
   * `fieldInputs` bag. Returns the field-bound variant when a host field
   * is reachable, or the orphan variant otherwise.
   */
  buildActionContext(): AddonActionContext {
    const inputs = this.fieldInputs();
    const key = inputs?.key ?? '';
    const type = inputs?.type ?? '';
    const tree = inputs?.field;
    if (tree) {
      // `writeToFieldValue` centralises the `Signal → WritableSignal` cast and
      // warns at runtime if Signal Forms ever stops storing a writable signal
      // here (the alternative — a silent no-op preset — is much worse).
      const setValue = inputs?.setValue ?? ((next: unknown) => writeToFieldValue(tree.value, next, this.logger));
      return {
        field: { key, type },
        form: tree,
        value: tree.value() ?? undefined,
        setValue,
      };
    }
    return {
      field: { key, type },
      form: null,
      value: undefined,
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

/** Host wrapper for `NgForgeAddonActionBase`. Consumers compose this directly: */
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
