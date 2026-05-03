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
