import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, InputMeta, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { BsDatepickerComponent, BsDatepickerProps } from './bs-datepicker.type';
import { AsyncPipe } from '@angular/common';
import { InputConstraintsDirective } from '../../directives/input-constraints.directive';
import { createAriaDescribedBySignal } from '../../utils/create-aria-described-by';

@Component({
  selector: 'df-bs-datepicker',
  imports: [FormField, DynamicTextPipe, AsyncPipe, InputConstraintsDirective],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field(); @let p = props(); @let inputId = key() + '-input';
    @if (p?.floatingLabel) {
      <!-- Floating label variant -->
      <div class="form-floating mb-3">
        <input
          dfBsInputConstraints
          [formField]="f"
          [id]="inputId"
          type="date"
          [placeholder]="(placeholder() | dynamicText | async) ?? ''"
          [dfMin]="minAsString()"
          [dfMax]="maxAsString()"
          [attr.tabindex]="tabIndex()"
          [attr.aria-invalid]="ariaInvalid()"
          [attr.aria-required]="ariaRequired()"
          [attr.aria-describedby]="ariaDescribedBy()"
          class="form-control"
          [class.form-control-sm]="p?.size === 'sm'"
          [class.form-control-lg]="p?.size === 'lg'"
          [class.is-invalid]="f().invalid() && f().touched()"
          [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
        />
        @if (label()) {
          <label [for]="inputId">{{ label() | dynamicText | async }}</label>
        }
        @if (p?.validFeedback && f().valid() && f().touched()) {
          <div class="valid-feedback d-block">
            {{ p?.validFeedback | dynamicText | async }}
          </div>
        }
        @if (errorsToDisplay()[0]; as error) {
          <div class="invalid-feedback d-block" [id]="errorId()" role="alert">{{ error.message }}</div>
        }
      </div>
    } @else {
      <!-- Standard variant -->
      <div class="mb-3">
        @if (label()) {
          <label [for]="inputId" class="form-label">{{ label() | dynamicText | async }}</label>
        }

        <input
          dfBsInputConstraints
          [formField]="f"
          [id]="inputId"
          type="date"
          [placeholder]="(placeholder() | dynamicText | async) ?? ''"
          [dfMin]="minAsString()"
          [dfMax]="maxAsString()"
          [attr.tabindex]="tabIndex()"
          [attr.aria-invalid]="ariaInvalid()"
          [attr.aria-required]="ariaRequired()"
          [attr.aria-describedby]="ariaDescribedBy()"
          class="form-control"
          [class.form-control-sm]="p?.size === 'sm'"
          [class.form-control-lg]="p?.size === 'lg'"
          [class.is-invalid]="f().invalid() && f().touched()"
          [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
        />

        @if (p?.validFeedback && f().valid() && f().touched()) {
          <div class="valid-feedback d-block">
            {{ p?.validFeedback | dynamicText | async }}
          </div>
        }
        @if (errorsToDisplay()[0]; as error) {
          <div class="invalid-feedback d-block" [id]="errorId()" role="alert">{{ error.message }}</div>
        } @else if (p?.hint) {
          <div class="form-text" [id]="hintId()">{{ p?.hint | dynamicText | async }}</div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
})
export default class BsDatepickerFieldComponent implements BsDatepickerComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<Date | string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly minDate = input<Date | string | null>(null);
  readonly maxDate = input<Date | string | null>(null);
  readonly startAt = input<Date | null>(null);
  readonly props = input<BsDatepickerProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();
  readonly meta = input<InputMeta>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  constructor() {
    setupMetaTracking(this.elementRef, this.meta, { selector: 'input' });
  }

  // Helper methods to convert Date to string for HTML attributes
  readonly minAsString = computed(() => {
    const min = this.minDate();
    return min instanceof Date ? min.toISOString().split('T')[0] : min;
  });

  readonly maxAsString = computed(() => {
    const max = this.maxDate();
    return max instanceof Date ? max.toISOString().split('T')[0] : max;
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  protected readonly hintId = computed(() => `${this.key()}-hint`);
  protected readonly errorId = computed(() => `${this.key()}-error`);

  protected readonly ariaInvalid = computed(() => {
    const fieldState = this.field()();
    return fieldState.invalid() && fieldState.touched();
  });

  protected readonly ariaRequired = computed(() => {
    return this.field()().required?.() === true ? true : null;
  });

  protected readonly ariaDescribedBy = createAriaDescribedBySignal(
    this.errorsToDisplay,
    this.errorId,
    this.hintId,
    () => !!this.props()?.hint,
  );
}
