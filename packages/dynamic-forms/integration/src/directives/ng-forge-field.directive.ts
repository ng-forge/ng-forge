import { afterRenderEffect, computed, Directive, inject, input, isDevMode, Signal, signal, untracked } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { DEFAULT_VALIDATION_MESSAGES, DynamicText, DynamicFormLogger, FieldMeta, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createAriaDescribedBySignal } from '../utils/create-aria-described-by';
import { createResolvedErrorsSignal, ResolvedError } from '../utils/create-resolved-errors-signal';
import { shouldShowErrors } from '../utils/should-show-errors';
import type { AssertTupleLockstep } from './assert-input-lockstep';
import { NgForgeFieldShell } from './ng-forge-field-shell.directive';

/**
 * Value-bearing add-on directive — composed alongside `NgForgeFieldShell` via
 * the `NG_FORGE_FIELD` preset. Owns the value/validation/aria plumbing every
 * value-bearing field needs.
 *
 * The Shell owns universal identity (`key`, `className`, `[id]`,
 * `[attr.data-testid]`, `[class]`); this directive injects Shell and adds
 * field-driven bindings (`[attr.hidden]`, `[attr.aria-disabled]`), the
 * standard value-field inputs (`field`, `label`, `placeholder`, `tabIndex`,
 * `props`, `meta`, `validationMessages`), the derived error/aria signals,
 * and the meta-tracking claim contract.
 *
 * @example
 * ```ts
 * \@Component({
 *   hostDirectives: NG_FORGE_FIELD,
 *   imports: [NgForgeControl, FormField],
 *   template: `
 *     <label [for]="ngf.key() + '-input'">{{ ngf.label() | dynamicText | async }}</label>
 *     <input ngForgeControl [id]="ngf.key() + '-input'" [formField]="ngf.field()" />
 *     @if (ngf.errorsToDisplay()[0]; as e) {
 *       <span [id]="ngf.errorId()">{{ e.message }}</span>
 *     }
 *   `,
 * })
 * export class MyInputField {
 *   protected readonly ngf = injectNgForgeField<string>();
 * }
 * ```
 *
 * Selectorless — usage is exclusively via `hostDirectives`. Prefer the
 * `NG_FORGE_FIELD` preset over composing this directive manually.
 */
@Directive({
  host: {
    '[attr.hidden]': 'field()().hidden() || null',
    '[attr.aria-disabled]': 'field()().disabled() || null',
  },
})
export class NgForgeField {
  // ───────────────────────────────────────────────────────────────────────────
  // Shell-owned identity — re-exported so component templates keep using
  // `ngf.key()` / `ngf.className()` without reaching for the Shell directly.
  // ───────────────────────────────────────────────────────────────────────────

  private readonly shell = inject(NgForgeFieldShell);
  /** Shell-owned key, re-exported as plain `Signal<string>` so it doesn't get flagged by the host-directive input-lockstep assertion. */
  readonly key: Signal<string> = this.shell.key;
  /** Shell-owned className, re-exported as plain `Signal<string>` for the same reason. */
  readonly className: Signal<string> = this.shell.className;

  // ───────────────────────────────────────────────────────────────────────────
  // Forwarded inputs — the value-field-specific subset of mapper output.
  // ───────────────────────────────────────────────────────────────────────────

  readonly field = input.required<FieldTree<unknown>>();
  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly tabIndex = input<number>();
  readonly props = input<unknown>();
  readonly meta = input<FieldMeta>();
  readonly validationMessages = input<ValidationMessages>();

  // ───────────────────────────────────────────────────────────────────────────
  // Wiring
  // ───────────────────────────────────────────────────────────────────────────

  private readonly defaultValidationMessages: Signal<ValidationMessages | undefined> =
    inject(DEFAULT_VALIDATION_MESSAGES, { optional: true }) ?? signal(undefined);

  // ───────────────────────────────────────────────────────────────────────────
  // Error display
  // ───────────────────────────────────────────────────────────────────────────

  readonly errors: Signal<ResolvedError[]> = createResolvedErrorsSignal(
    this.field,
    this.validationMessages,
    this.defaultValidationMessages,
  );
  readonly showErrors: Signal<boolean> = shouldShowErrors(this.field);
  readonly errorsToDisplay: Signal<ResolvedError[]> = computed(() => (this.showErrors() ? this.errors() : []));

  // ───────────────────────────────────────────────────────────────────────────
  // Accessibility helpers
  // ───────────────────────────────────────────────────────────────────────────

  readonly errorId: Signal<string> = computed(() => `${this.key()}-error`);
  readonly hintId: Signal<string> = computed(() => `${this.key()}-hint`);

  readonly ariaInvalid: Signal<boolean> = computed(() => {
    const state = this.field()();
    return state.invalid() && state.touched();
  });

  readonly ariaRequired: Signal<true | null> = computed(() => {
    return this.field()().required?.() === true ? true : null;
  });

  readonly ariaDescribedBy: Signal<string | null> = createAriaDescribedBySignal(this.errorsToDisplay, this.errorId, this.hintId, () =>
    Boolean((this.props() as { hint?: unknown } | undefined)?.hint),
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Claim tracking — markers and ambient sub-components flip this to true so
  // dev-mode can warn when meta() is non-empty but nothing consumed it.
  // ───────────────────────────────────────────────────────────────────────────

  private readonly _claimed = signal(false);

  /** @internal Marker directives + ambient sub-components call this on construction. */
  markClaimed(): void {
    this._claimed.set(true);
  }

  private readonly logger = inject(DynamicFormLogger, { optional: true });

  constructor() {
    // Dev-mode safety net: a mapper or template-author binds meta() but no
    // NgForgeControl / NgForgeHostControl / ambient sub-component is in
    // place to consume it. Fires at most once per directive instance.
    if (isDevMode()) {
      let warned = false;
      afterRenderEffect({
        write: () => {
          if (warned) return;
          const meta = this.meta();
          if (!meta || Object.keys(meta).length === 0) return;
          if (untracked(this._claimed)) return;
          warned = true;
          // `untracked` safe — afterRenderEffect.write runs after first CD, so Shell's required `key` is bound (no NG0950).
          const key = untracked(this.key);
          const message =
            `NgForgeField - meta() provided for field "${key}" but no NgForgeControl / NgForgeHostControl / ` +
            `ambient sub-component claimed it. Meta will not be applied. ` +
            `See https://ng-forge.dev/building-an-adapter#meta-forwarding`;
          if (this.logger) {
            this.logger.warn(message);
          } else {
            console.warn(message);
          }
        },
      });
    }
  }
}

/**
 * Inputs forwarded onto `NgForgeField` via `hostDirectives`. Excludes
 * `key` / `className` (forwarded to `NgForgeFieldShell` separately via
 * `NG_FORGE_FIELD_SHELL_INPUTS`). Most consumers shouldn't reference this
 * directly — use the `NG_FORGE_FIELD` preset.
 */
export const NG_FORGE_VALUE_FIELD_INPUTS = ['field', 'label', 'placeholder', 'tabIndex', 'props', 'meta', 'validationMessages'] as const;

// Compile-time lockstep: NG_FORGE_VALUE_FIELD_INPUTS must equal the declared
// `input()` properties on NgForgeField. Drift in either direction fails the build.
const _NG_FORGE_VALUE_FIELD_INPUTS_LOCKSTEP: AssertTupleLockstep<
  NgForgeField,
  typeof NG_FORGE_VALUE_FIELD_INPUTS,
  'NG_FORGE_VALUE_FIELD_INPUTS'
> = true;
void _NG_FORGE_VALUE_FIELD_INPUTS_LOCKSTEP;

/**
 * `NgForgeField` typed for a specific value type. The directive itself stores
 * `field` as `Signal<FieldTree<unknown>>` because Angular's `hostDirectives`
 * doesn't propagate generics — `injectNgForgeField<T>()` narrows it at the
 * inject site so consumers don't have to declare a separate cast computed.
 */
export type TypedNgForgeField<T> = Omit<NgForgeField, 'field'> & {
  readonly field: Signal<FieldTree<T>>;
};

/**
 * Typed wrapper around `inject(NgForgeField)`. The generic narrows the
 * `field` signal to `Signal<FieldTree<T>>` for the calling component's value
 * type. The cast is unchecked — the runtime contract is that mappers only
 * forward a `field` whose value type matches the field-type definition.
 *
 * @example
 * ```ts
 * protected readonly ngf = injectNgForgeField<string>();
 * // ngf.field() is Signal<FieldTree<string>>; ngf.errors() etc. unchanged
 * ```
 */
export function injectNgForgeField<T = unknown>(): TypedNgForgeField<T> {
  return inject(NgForgeField) as unknown as TypedNgForgeField<T>;
}
