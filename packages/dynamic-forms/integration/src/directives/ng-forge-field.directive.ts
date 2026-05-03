import { computed, Directive, ElementRef, inject, input, Signal, signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { DEFAULT_VALIDATION_MESSAGES, DynamicText, FieldMeta, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createAriaDescribedBySignal } from '../utils/create-aria-described-by';
import { createResolvedErrorsSignal, ResolvedError } from '../utils/create-resolved-errors-signal';
import { setupMetaTracking } from '../utils/setup-meta-tracking';
import { shouldShowErrors } from '../utils/should-show-errors';
import { MetaTargetConfig, NG_FORGE_FIELD_META_TARGET } from './meta-target.token';

/**
 * `NgForgeField` is the canonical primitive for ng-forge value-field components.
 *
 * Apply via `hostDirectives: [{ directive: NgForgeField, inputs: [...] }]` to
 * consume the standard 9 inputs (`field`, `key`, `label`, `placeholder`,
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
 *   hostDirectives: [
 *     {
 *       directive: NgForgeField,
 *       inputs: ['field', 'key', 'label', 'placeholder', 'className',
 *                'tabIndex', 'props', 'meta', 'validationMessages'],
 *     },
 *   ],
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
 * Note: Angular's compiler requires the `hostDirectives` entry — both the
 * directive class reference and the `inputs` array — to be inlined as
 * literal expressions. Const-shared shapes are rejected (NG1010 / NG2019).
 */
@Directive({
  host: {
    // The bindings tolerate `key`/`field` being undefined because host bindings
    // on a hostDirective can evaluate before forwarded inputs propagate during
    // NgComponentOutlet creation. Reading a `.required()` input in that window
    // throws NG0950 and the throw breaks computed dependency tracking, so we
    // declare these inputs as optional below — the host directive's `inputs:`
    // array still enforces that consumers forward them at compile time.
    '[id]': 'key() || null',
    '[attr.data-testid]': 'key() || null',
    '[class]': 'className()',
    '[attr.hidden]': '(field()?.()?.hidden?.() ?? false) || null',
  },
})
export class NgForgeField {
  // ───────────────────────────────────────────────────────────────────────────
  // Forwarded inputs (the 9 standard inputs that adapter mappers emit).
  //
  // `field` and `key` are typed as optional even though every consumer must
  // forward them via the host directive's `inputs:` array. Marking them
  // `.required()` would throw NG0950 in the brief window before forwarded
  // inputs propagate during dynamic component creation; using
  // `try/catch`-guarded computeds doesn't help either because the throw
  // breaks Angular's reactive dependency tracking. Internal use casts
  // through `fieldRef` below; external consumers narrow via their own
  // `formFieldTree` accessors.
  // ───────────────────────────────────────────────────────────────────────────

  readonly field = input<FieldTree<unknown>>();
  readonly key = input<string>('');

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<unknown>();
  readonly meta = input<FieldMeta>();
  readonly validationMessages = input<ValidationMessages>();

  // ───────────────────────────────────────────────────────────────────────────
  // Wiring
  // ───────────────────────────────────────────────────────────────────────────

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly defaultValidationMessages: Signal<ValidationMessages | undefined> =
    inject(DEFAULT_VALIDATION_MESSAGES, { optional: true }) ?? signal(undefined);
  private readonly metaTarget: MetaTargetConfig | null = inject(NG_FORGE_FIELD_META_TARGET, { optional: true });

  // ───────────────────────────────────────────────────────────────────────────
  // Error display
  // ───────────────────────────────────────────────────────────────────────────

  // Internal cast for bridging utilities. The util signatures expect
  // `Signal<FieldTree<T>>`, not the optional-typed input. Reading the cast
  // signal happens only in reactive contexts (computed/effect), which run
  // AFTER inputs have propagated, so the cast is sound at runtime.
  private readonly fieldRef = this.field as Signal<FieldTree<unknown>>;

  readonly errors: Signal<ResolvedError[]> = createResolvedErrorsSignal(
    this.fieldRef,
    this.validationMessages,
    this.defaultValidationMessages,
  );
  readonly showErrors: Signal<boolean> = shouldShowErrors(this.fieldRef);
  readonly errorsToDisplay: Signal<ResolvedError[]> = computed(() => (this.showErrors() ? this.errors() : []));

  // ───────────────────────────────────────────────────────────────────────────
  // Accessibility helpers
  // ───────────────────────────────────────────────────────────────────────────

  readonly errorId: Signal<string> = computed(() => `${this.key()}-error`);
  readonly hintId: Signal<string> = computed(() => `${this.key()}-hint`);

  readonly ariaInvalid: Signal<boolean> = computed(() => {
    const state = this.fieldRef()();
    return state.invalid() && state.touched();
  });

  readonly ariaRequired: Signal<true | null> = computed(() => {
    return this.fieldRef()().required?.() === true ? true : null;
  });

  readonly ariaDescribedBy: Signal<string | null> = createAriaDescribedBySignal(this.errorsToDisplay, this.errorId, this.hintId, () =>
    Boolean((this.props() as { hint?: unknown } | undefined)?.hint),
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Meta-attribute forwarding
  // ───────────────────────────────────────────────────────────────────────────

  constructor() {
    const config = this.metaTarget;
    if (!config || config.kind === 'skip') {
      return;
    }
    if (config.kind === 'host') {
      setupMetaTracking(this.elementRef, this.meta);
      return;
    }
    setupMetaTracking(this.elementRef, this.meta, {
      selector: config.selector,
      dependents: config.dependents,
    });
  }
}
