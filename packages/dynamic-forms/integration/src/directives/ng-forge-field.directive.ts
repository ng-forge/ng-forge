import {
  afterRenderEffect,
  computed,
  Directive,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  isDevMode,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { DEFAULT_VALIDATION_MESSAGES, DynamicText, DynamicFormLogger, FieldMeta, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createAriaDescribedBySignal } from '../utils/create-aria-described-by';
import { createResolvedErrorsSignal, ResolvedError } from '../utils/create-resolved-errors-signal';
import { shouldShowErrors } from '../utils/should-show-errors';

/**
 * Canonical primitive for ng-forge value-field components. Applied via
 * `hostDirectives` to provide the 10 standard inputs + derived error / aria
 * signals + universal host bindings. Meta + aria are forwarded to a target
 * element by the companion marker directives (`NgForgeControl` in templates,
 * `NgForgeHostControl` in `hostDirectives`).
 *
 * @example
 * ```ts
 * \@Component({
 *   hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
 *   imports: [NgForgeControl, FormField],
 *   template: `
 *     <!-- NgForgeField sets [id]="key()" on the host; the inner control needs
 *          a distinct id so adapter components suffix it (-input / -select / …). -->
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
 * Selectorless — usage is exclusively via `hostDirectives`. The
 * `directive: NgForgeField` reference must be inlined at the call site (NG1010);
 * `inputs: [...NG_FORGE_FIELD_INPUTS]` works because the `as const` tuple
 * resolves statically.
 */
@Directive({
  host: {
    '[id]': 'key()',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
    '[attr.hidden]': 'field()().hidden() || null',
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
  /**
   * @deprecated Use the `DEFAULT_VALIDATION_MESSAGES` DI token; removal targeted for v1.
   * Removal must trim NG_FORGE_FIELD_INPUTS and update the lockstep assertion in tandem.
   */
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

// ─────────────────────────────────────────────────────────────────────────────
// Compile-time lockstep assertion: NG_FORGE_FIELD_INPUTS must equal the set of
// `input()` properties declared on NgForgeField. Drift in either direction
// (declared input missing from tuple, or tuple containing a name that isn't a
// declared input) fails the build.
//
// Why this matters at compile time, not runtime:
// - Adding an input here without updating the tuple silently breaks consumer
//   forwarding — the host directive doesn't expose the input, parents can't
//   bind to it, and there's no compile error from Angular itself.
// - Removing/renaming an input without trimming the tuple leaves stale entries
//   that mappers may still emit, hitting NG0303 at runtime instead of build.
//
// Pure type-level: no runtime cost, no internal Angular APIs (Angular doesn't
// expose a public directive-reflection helper).
// ─────────────────────────────────────────────────────────────────────────────

type _InputSignalProps<T> = {
  [K in keyof T]: T[K] extends InputSignal<any> | InputSignalWithTransform<any, any> ? K : never;
}[keyof T];

type _MissingFromTuple = Exclude<_InputSignalProps<NgForgeField>, (typeof NG_FORGE_FIELD_INPUTS)[number]>;
type _ExtraInTuple = Exclude<(typeof NG_FORGE_FIELD_INPUTS)[number], _InputSignalProps<NgForgeField>>;

// If either side is non-empty, the build fails on this constant. The branded
// message types make the mismatch visible in the TS error: e.g.
//   'NG_FORGE_FIELD_INPUTS is MISSING declared NgForgeField inputs: <names>'
type _AssertTupleLockstep = [_MissingFromTuple] extends [never]
  ? [_ExtraInTuple] extends [never]
    ? true
    : { 'NG_FORGE_FIELD_INPUTS contains entries that are not declared inputs on NgForgeField': _ExtraInTuple }
  : { 'NG_FORGE_FIELD_INPUTS is MISSING declared NgForgeField inputs': _MissingFromTuple };

const _NG_FORGE_FIELD_INPUTS_LOCKSTEP: _AssertTupleLockstep = true;
void _NG_FORGE_FIELD_INPUTS_LOCKSTEP;

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
