import { computed, Directive, inject, input, Signal, signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { DEFAULT_VALIDATION_MESSAGES, DynamicText, FieldMeta, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createAriaDescribedBySignal } from '../utils/create-aria-described-by';
import { createResolvedErrorsSignal, ResolvedError } from '../utils/create-resolved-errors-signal';
import { shouldShowErrors } from '../utils/should-show-errors';

/**
 * `NgForgeField` is the canonical primitive for ng-forge value-field components.
 *
 * Apply via `hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }]`
 * to consume the standard 9 inputs (`field`, `key`, `label`, `placeholder`,
 * `className`, `tabIndex`, `props`, `meta`, `validationMessages`) and the
 * directive's derived signals (errors, showErrors, errorsToDisplay, errorId,
 * hintId, ariaInvalid, ariaRequired, ariaDescribedBy). Read derived state via
 * `inject(NgForgeField)`.
 *
 * Meta-attribute forwarding (data-*, aria-*, autocomplete, etc.) is configured
 * via `provideMetaTarget(selector)` / `provideHostMetaTarget()` /
 * `provideSkipMetaTarget()` in the same `providers` array as the host directive.
 *
 * @example
 * ```ts
 * \@Component({
 *   hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
 *   providers: [provideMetaTarget('mat-select')],
 *   template: `
 *     <label [for]="controlId()">{{ field.label() | dynamicText | async }}</label>
 *     <input [id]="controlId()" [formField]="field.field()"
 *            [attr.aria-describedby]="field.ariaDescribedBy()" />
 *     @if (field.errorsToDisplay()[0]; as e) {
 *       <span [id]="field.errorId()">{{ e.message }}</span>
 *     }
 *   `,
 * })
 * export class MySelectField {
 *   protected readonly field = inject(NgForgeField);
 *   protected readonly controlId = computed(() => `${this.field.key()}-select`);
 * }
 * ```
 *
 * The directive is intentionally selector-less — usage is exclusively via
 * `hostDirectives`, never as a standalone selector match.
 *
 * Note: the `directive: NgForgeField` reference must be inlined at the call
 * site — Angular's AOT compiler can't resolve a class reference fetched via
 * property access on a const imported across package boundaries (NG1010).
 * The `inputs` list, however, can be shared — `as const` preserves the literal
 * tuple in the emitted `.d.ts`, so `[...NG_FORGE_FIELD_INPUTS]` produces an
 * array literal that the compiler can statically resolve (NG2019 satisfied).
 */
@Directive({
  host: {
    '[id]': 'key()',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
    '[attr.hidden]': 'field()().hidden?.() || null',
  },
})
export class NgForgeField {
  // ───────────────────────────────────────────────────────────────────────────
  // Forwarded inputs (the 9 standard inputs that adapter mappers emit).
  // ───────────────────────────────────────────────────────────────────────────

  readonly field = input.required<FieldTree<unknown>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<unknown>();
  readonly meta = input<FieldMeta>();
  readonly validationMessages = input<ValidationMessages>();
  // Forwarded form-level fallback. Mappers emit this from
  // `inject(DEFAULT_VALIDATION_MESSAGES)` for back-compat with third-party
  // components that consumed it as a direct input. The directive prefers this
  // forwarded value, falling back to its own DI lookup so the bridging signals
  // still work in non-mapper contexts (e.g. unit tests).
  readonly defaultValidationMessages = input<ValidationMessages>();

  // ───────────────────────────────────────────────────────────────────────────
  // Wiring
  // ───────────────────────────────────────────────────────────────────────────

  private readonly defaultValidationMessagesFromDi: Signal<ValidationMessages | undefined> =
    inject(DEFAULT_VALIDATION_MESSAGES, { optional: true }) ?? signal(undefined);
  private readonly effectiveDefaultValidationMessages: Signal<ValidationMessages | undefined> = computed(
    () => this.defaultValidationMessages() ?? this.defaultValidationMessagesFromDi(),
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Error display
  // ───────────────────────────────────────────────────────────────────────────

  readonly errors: Signal<ResolvedError[]> = createResolvedErrorsSignal(
    this.field,
    this.validationMessages,
    this.effectiveDefaultValidationMessages,
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
  // Dev-mode assertion: NG_FORGE_FIELD_INPUTS must stay in lockstep with the
  // directive's `input()` declarations. Without this check, adding an input
  // here without updating the tuple silently breaks consumer-side forwarding —
  // the host directive simply doesn't expose the input and parents can't
  // bind to it, with no compile error.
  // ───────────────────────────────────────────────────────────────────────────

  constructor() {
    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      const declared = Object.keys((NgForgeField as unknown as { ɵdir?: { inputs?: Record<string, unknown> } }).ɵdir?.inputs ?? {});
      const tupleSet = new Set<string>(NG_FORGE_FIELD_INPUTS as readonly string[]);
      const missingFromTuple = declared.filter((name) => !tupleSet.has(name));
      const extraInTuple = (NG_FORGE_FIELD_INPUTS as readonly string[]).filter((name) => !declared.includes(name));
      if (missingFromTuple.length || extraInTuple.length) {
        throw new Error(
          `[NgForgeField] NG_FORGE_FIELD_INPUTS is out of sync with declared inputs.\n` +
            (missingFromTuple.length ? `  Declared but missing from tuple: ${missingFromTuple.join(', ')}\n` : '') +
            (extraInTuple.length ? `  In tuple but not declared: ${extraInTuple.join(', ')}\n` : '') +
            `Update NG_FORGE_FIELD_INPUTS so consumers via hostDirectives can forward all declared inputs.`,
        );
      }
    }
  }
}

/**
 * The 10 standard inputs forwarded by `NgForgeField`.
 *
 * `as const` preserves the literal tuple in the emitted `.d.ts`, so consumers
 * can spread it into a `hostDirectives` entry and Angular's AOT compiler can
 * still see every input name at build time (NG2019 satisfied).
 */
export const NG_FORGE_FIELD_INPUTS = [
  'field',
  'key',
  'label',
  'placeholder',
  'className',
  'tabIndex',
  'props',
  'meta',
  'validationMessages',
  'defaultValidationMessages',
] as const;

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
 * forward a `field` whose value type matches the field-type definition. This
 * is a stopgap until `FieldTypeDefinition` registration carries value-type
 * information end-to-end.
 *
 * @example
 * ```ts
 * protected readonly field = injectNgForgeField<string>();
 * // field.field() is Signal<FieldTree<string>>; field.errors() etc. unchanged
 * ```
 */
export function injectNgForgeField<T = unknown>(): TypedNgForgeField<T> {
  return inject(NgForgeField) as unknown as TypedNgForgeField<T>;
}
