import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import {
  ADDON_ACTION_REGISTRY,
  AddonActionContext,
  DynamicFormLogger,
  DynamicTextPipe,
  FIELD_SIGNAL_CONTEXT,
  resolveDynamicValue,
} from '@ng-forge/dynamic-forms';
import { ButtonModule } from 'primeng/button';
import { PRIME_INPUT_TYPE_OVERRIDE } from '../tokens/input-type-override.token';
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
  selector: 'df-pi-button-addon',
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
  private readonly logger = inject(DynamicFormLogger);
  // Optional — a button rendered outside an active field context (rare) just
  // gets a no-op AddonActionContext.
  private readonly fieldContext = inject(FIELD_SIGNAL_CONTEXT, { optional: true });

  readonly addon = input.required<PiButtonAddon>();

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

    if (addon.preset !== undefined) {
      void runPiPresetAction(addon.preset, ctx, {
        typeOverride: this.typeOverride ?? undefined,
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
          `[Dynamic Forms] pi-button: actionRef '${String(addon.actionRef)}' is not registered. ` +
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
   * Build an AddonActionContext for handlers. Field reference and form tree
   * come from FIELD_SIGNAL_CONTEXT when available; otherwise the addon was
   * rendered outside a field component (rare) and handlers receive empty
   * stand-ins.
   */
  private buildActionContext(): AddonActionContext {
    const ctx = this.fieldContext as { value?: () => unknown; form?: unknown } | null;
    return {
      // The dispatcher does not currently pass the host FieldDef; handlers
      // that need it can read FIELD_SIGNAL_CONTEXT directly via inject().
      field: { key: '', type: '' } as AddonActionContext['field'],
      form: ctx?.form ?? null,
      value: ctx?.value?.(),
    };
  }
}
