import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { createResolvedErrorsSignal, DynamicText, DynamicTextPipe, shouldShowErrors, ValidationMessages } from '@ng-forge/dynamic-forms';
import { BsDatepickerComponent, BsDatepickerProps } from './bs-datepicker.type';
import { AsyncPipe } from '@angular/common';
import { InputConstraintsDirective } from '../../directives/input-constraints.directive';

@Component({
  selector: 'df-bs-datepicker',
  imports: [Field, DynamicTextPipe, AsyncPipe, InputConstraintsDirective],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field(); @let p = props();
    @if (p?.floatingLabel) {
      <!-- Floating label variant -->
      <div class="form-floating mb-3">
        <input
          dfBsInputConstraints
          [field]="f"
          [id]="key()"
          type="date"
          [placeholder]="(placeholder() | dynamicText | async) ?? ''"
          [dfMin]="minAsString()"
          [dfMax]="maxAsString()"
          [attr.tabindex]="tabIndex()"
          class="form-control"
          [class.form-control-sm]="p?.size === 'sm'"
          [class.form-control-lg]="p?.size === 'lg'"
          [class.is-invalid]="f().invalid() && f().touched()"
          [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
        />
        @if (label()) {
          <label [for]="key()">{{ label() | dynamicText | async }}</label>
        }
        @if (p?.validFeedback && f().valid() && f().touched()) {
          <div class="valid-feedback d-block">
            {{ p?.validFeedback | dynamicText | async }}
          </div>
        }
        @for (error of errorsToDisplay(); track error.kind) {
          <div class="invalid-feedback d-block">{{ error.message }}</div>
        }
      </div>
    } @else {
      <!-- Standard variant -->
      <div class="mb-3">
        @if (label()) {
          <label [for]="key()" class="form-label">{{ label() | dynamicText | async }}</label>
        }

        <input
          dfBsInputConstraints
          [field]="f"
          [id]="key()"
          type="date"
          [placeholder]="(placeholder() | dynamicText | async) ?? ''"
          [dfMin]="minAsString()"
          [dfMax]="maxAsString()"
          [attr.tabindex]="tabIndex()"
          class="form-control"
          [class.form-control-sm]="p?.size === 'sm'"
          [class.form-control-lg]="p?.size === 'lg'"
          [class.is-invalid]="f().invalid() && f().touched()"
          [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
        />

        @if (p?.helpText) {
          <div class="form-text">
            {{ p?.helpText | dynamicText | async }}
          </div>
        }
        @if (p?.validFeedback && f().valid() && f().touched()) {
          <div class="valid-feedback d-block">
            {{ p?.validFeedback | dynamicText | async }}
          </div>
        }
        @for (error of errorsToDisplay(); track error.kind) {
          <div class="invalid-feedback d-block">{{ error.message }}</div>
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

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  // Helper methods to convert Date to string for HTML attributes
  readonly minAsString = computed(() => {
    const min = this.minDate();
    return min instanceof Date ? min.toISOString().split('T')[0] : min;
  });

  readonly maxAsString = computed(() => {
    const max = this.maxDate();
    return max instanceof Date ? max.toISOString().split('T')[0] : max;
  });
}
