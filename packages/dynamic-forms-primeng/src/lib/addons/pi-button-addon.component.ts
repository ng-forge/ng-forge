import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import {
  ADDON_ACTION_REGISTRY,
  AddonActionContext,
  DynamicFormLogger,
  DynamicTextPipe,
  FIELD_SIGNAL_CONTEXT,
  resolveDynamicValue,
  WrapperFieldInputs,
} from '@ng-forge/dynamic-forms';
import { ButtonModule } from 'primeng/button';
import { PRIME_INPUT_TYPE_OVERRIDE } from '../tokens/input-type-override.token';
import { PRIME_INPUT_VALUE_WRITER } from '../tokens/input-value-writer.token';
import type { PiButtonAddon } from '../types/addons';
import { runPiPresetAction } from './preset-actions';

/**
 * Renderer for the `pi-button` addon kind.
 *
 * Wraps PrimeNG's `<p-button>` and resolves the click handler from the
 * three mutually exclusive shape variants on the addon:
 *
 * - `action`: inline function — invoked directly with `AddonActionContext`.
 * - `actionRef`: typed string handle — resolved against `ADDON_ACTION_REGISTRY`
 *   (populated by `provideAddonActions(...)`).
 * - `preset`: built-in action name — dispatched to `runPiPresetAction()`.
 *
 * If multiple variants are accidentally set, precedence is `preset > actionRef
 * > action` (validator should have rejected the combination earlier; this
 * tie-break keeps runtime behaviour deterministic).
 *
 * The `loading` reactive flag is forwarded to `[loading]` on `<p-button>`,
 * which renders the native PrimeNG spinner.
 */
@Component({
  selector: 'df-prime-button-addon',
  imports: [ButtonModule, DynamicTextPipe, AsyncPipe],
  template: `
    <p-button
      [icon]="iconClass()"
      [label]="(label() | dynamicText | async) ?? ''"
      [severity]="addon().severity ?? 'secondary'"
      [loading]="isLoading()"
      [disabled]="isDisabled()"
      [attr.aria-label]="(ariaLabel() | dynamicText | async) || null"
      (onClick)="onClick($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PiButtonAddonComponent {
  private readonly actionRegistry = inject(ADDON_ACTION_REGISTRY);
  private readonly typeOverride = inject(PRIME_INPUT_TYPE_OVERRIDE, { optional: true });
  private readonly valueWriter = inject(PRIME_INPUT_VALUE_WRITER, { optional: true });
  private readonly fieldSignalContext = inject(FIELD_SIGNAL_CONTEXT, { optional: true });
  private readonly logger = inject(DynamicFormLogger);

  readonly addon = input.required<PiButtonAddon>();
  /**
   * Host field bag pushed by `<df-addon-slot>`. Carries a read-only view of
   * the field tree, the resolved props, and the field key — everything a
   * preset / actionRef / inline action needs to read state and locate the
   * write target without re-deriving context.
   */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();

  protected readonly label = computed(() => this.addon().label);
  protected readonly ariaLabel = computed(() => this.addon().ariaLabel);
  protected readonly iconClass = computed(() => {
    const icon = this.addon().icon;
    return icon ? `pi pi-${icon}` : '';
  });

  // Reactive loading / disabled — DynamicValue<boolean> normalised through resolveDynamicValue.
  private readonly loadingSignal = linkedSignal(() => resolveDynamicValue(this.addon().loading, false));
  protected readonly isLoading = computed(() => this.loadingSignal()());
  private readonly disabledSignal = linkedSignal(() => resolveDynamicValue(this.addon().disabled, false));
  protected readonly isDisabled = computed(() => this.disabledSignal()());

  protected onClick(event: unknown): void {
    const addon = this.addon();
    const ctx = this.buildActionContext();

    // Defence-in-depth: the validator drops the addon entirely on multi-set,
    // so reaching this branch with multiple variants configured means the
    // validator was bypassed (or a kind was registered with no validator).
    // Surface the precedence we apply (preset > actionRef > action) so the
    // misconfigured config doesn't silently dispatch the wrong handler.
    const variantsSet = [addon.preset, addon.actionRef, addon.action].filter((v) => v !== undefined).length;
    if (variantsSet > 1) {
      this.logger.warn(
        `pi-button: more than one of preset/actionRef/action configured — ` +
          `dispatching by precedence (preset > actionRef > action). Ship at most one to silence this.`,
      );
    }

    if (addon.preset !== undefined) {
      const writer = this.valueWriter;
      const context = this.fieldSignalContext;
      const fieldKey = this.fieldInputs()?.key;
      void runPiPresetAction(addon.preset, ctx, {
        typeOverride: this.typeOverride ?? undefined,
        fieldValueSetter: writer ? (v) => writer.write(v) : undefined,
        // Resolve the field's configured default from the form's defaultValues
        // bag — used by the 'reset' preset. Only available when both the
        // form context and the field key are reachable.
        fieldDefaultValueGetter:
          context && fieldKey !== undefined
            ? () => (context.defaultValues() as Record<string, unknown> | undefined)?.[fieldKey]
            : undefined,
        logger: this.logger,
      });
      return;
    }

    if (addon.actionRef !== undefined) {
      const handler = this.actionRegistry.get(addon.actionRef as string);
      if (handler) {
        handler(ctx);
      } else {
        this.logger.warn(
          `pi-button: actionRef '${String(addon.actionRef)}' is not registered. ` +
            `Did you call provideAddonActions({ ${String(addon.actionRef)}: ... })?`,
        );
      }
      return;
    }

    if (addon.action !== undefined) {
      addon.action(ctx);
      return;
    }

    // Decorative button — no handler configured; ignore the click.
    void event;
  }

  /**
   * Build an AddonActionContext for handlers from the wrapper-style
   * `fieldInputs` bag. When the addon is rendered outside a field (rare),
   * handlers receive empty stand-ins so they don't crash.
   */
  private buildActionContext(): AddonActionContext {
    const inputs = this.fieldInputs();
    const writer = this.valueWriter;
    return {
      // Identity carried through from `fieldInputs` — both `key` and `type`
      // are populated by the base mapper (see buildBaseInputs). Empty
      // strings are a fallback for the rare case of an addon rendered
      // outside an active field context.
      field: {
        key: inputs?.key ?? '',
        type: inputs?.type ?? '',
      },
      // ReadonlyFieldTree view — same one wrappers receive. Read-only by
      // contract; mutation goes through `setValue` below.
      form: inputs?.field ?? null,
      value: inputs?.field?.value() ?? undefined,
      // Adapter-supplied value writer, when reachable.
      setValue: writer ? (v: unknown) => writer.write(v) : undefined,
    };
  }
}
