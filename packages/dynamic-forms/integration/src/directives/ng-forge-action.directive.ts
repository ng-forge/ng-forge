import { Directive, inject, input, Signal } from '@angular/core';
import { type ArrayItemContext, EventBus, type FormEvent, type FormEventConstructor, resolveTokens } from '@ng-forge/dynamic-forms';
import { ARRAY_CONTEXT, type DynamicText } from '@ng-forge/dynamic-forms/internal';
import type { EventArgs } from '../definitions/button-field';
import type { AssertTupleLockstep } from './assert-input-lockstep';
import { NgForgeFieldShell } from './ng-forge-field-shell.directive';

/**
 * Action add-on directive — composed alongside `NgForgeFieldShell` via the
 * `NG_FORGE_ACTION` preset. Owns the inputs + dispatch logic every button /
 * action component needs (label, disabled, event, eventArgs, …) plus the
 * `[attr.hidden]` / `[attr.aria-disabled]` host bindings driven by its own
 * inputs (no field tree).
 */
@Directive({
  host: {
    '[attr.hidden]': 'hidden() || null',
    '[attr.aria-disabled]': 'disabled() || null',
  },
})
export class NgForgeAction<TEvent extends FormEvent = FormEvent> {
  // ───────────────────────────────────────────────────────────────────────────
  // Shell-owned identity — re-exported as plain `Signal<T>` so they don't get
  // flagged by the lockstep assertion below.
  // ───────────────────────────────────────────────────────────────────────────

  private readonly shell = inject(NgForgeFieldShell);
  readonly key: Signal<string> = this.shell.key;
  readonly className: Signal<string> = this.shell.className;

  // ───────────────────────────────────────────────────────────────────────────
  // Forwarded inputs — the action-specific subset of mapper output.
  // ───────────────────────────────────────────────────────────────────────────

  readonly label = input.required<DynamicText>();
  readonly disabled = input<boolean>(false);
  readonly hidden = input<boolean>(false);
  readonly tabIndex = input<number>();
  readonly event = input<FormEventConstructor<TEvent>>();
  readonly eventArgs = input<EventArgs>();
  readonly eventContext = input<ArrayItemContext>();
  readonly props = input<unknown>();

  // ───────────────────────────────────────────────────────────────────────────
  // Dispatch
  // ───────────────────────────────────────────────────────────────────────────

  private readonly eventBus = inject(EventBus);
  private readonly arrayContext = inject(ARRAY_CONTEXT, { optional: true });

  /**
   * Dispatch the configured event through the EventBus. Resolves `eventArgs`
   * tokens (`$key`, `$index`, `$arrayKey`, `formValue`, …) against the
   * ambient array context if present, falling back to a static `eventContext`
   * input or the field's own `key` otherwise. No-op when `event` is unset
   * (e.g. submit buttons handled by the native form lifecycle).
   */
  dispatch(): void {
    const event = this.event();
    if (!event) return;
    const args = this.eventArgs();
    if (!args || args.length === 0) {
      this.eventBus.dispatch(event);
      return;
    }
    const context: ArrayItemContext = this.arrayContext
      ? {
          key: this.key(),
          index: this.arrayContext.index(),
          arrayKey: this.arrayContext.arrayKey,
          formValue: this.arrayContext.formValue,
        }
      : (this.eventContext() ?? { key: this.key() });
    this.eventBus.dispatch(event, ...resolveTokens(args, context));
  }
}

/**
 * Inputs forwarded onto `NgForgeAction` via `hostDirectives`. Excludes
 * `key` / `className` (forwarded to `NgForgeFieldShell` separately via
 * `NG_FORGE_FIELD_SHELL_INPUTS`). Most consumers shouldn't reference this
 * directly — use the `NG_FORGE_ACTION` preset.
 */
export const NG_FORGE_ACTION_INPUTS = ['label', 'disabled', 'hidden', 'tabIndex', 'event', 'eventArgs', 'eventContext', 'props'] as const;

// Compile-time lockstep: NG_FORGE_ACTION_INPUTS must equal the declared
// `input()` properties on NgForgeAction. Drift fails the build.
const _NG_FORGE_ACTION_INPUTS_LOCKSTEP: AssertTupleLockstep<NgForgeAction, typeof NG_FORGE_ACTION_INPUTS, 'NG_FORGE_ACTION_INPUTS'> = true;
void _NG_FORGE_ACTION_INPUTS_LOCKSTEP;

/**
 * Typed wrapper around `inject(NgForgeAction)`. The generic narrows the
 * `event` input to a specific FormEvent subclass.
 */
export function injectNgForgeAction<TEvent extends FormEvent = FormEvent>(): NgForgeAction<TEvent> {
  return inject(NgForgeAction) as unknown as NgForgeAction<TEvent>;
}
