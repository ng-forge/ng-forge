import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { createResolvedErrorsSignal, DynamicText, DynamicTextPipe, shouldShowErrors, ValidationMessages } from '@ng-forge/dynamic-form';
import { BsSliderComponent, BsSliderProps } from './bs-slider.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-slider',
  imports: [Field, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="mb-3">
      @if (label(); as label) {
      <label [for]="key()" class="form-label">
        {{ label | dynamicText | async }}
        @if (props()?.showValue) {
        <span class="ms-2 badge bg-secondary"> {{ props()?.valuePrefix }}{{ f().value() }}{{ props()?.valueSuffix }} </span>
        }
      </label>
      }

      <input type="range" [field]="f" [id]="key()" [attr.tabindex]="tabIndex()" class="form-range" />

      @if (props()?.helpText; as helpText) {
      <div class="form-text">
        {{ helpText | dynamicText | async }}
      </div>
      } @for (error of errorsToDisplay(); track error.kind) {
      <div class="invalid-feedback d-block">{{ error.message }}</div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
  host: {
    '[class]': 'className()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BsSliderFieldComponent implements BsSliderComponent {
  readonly field = input.required<FieldTree<number>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly props = input<BsSliderProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly formValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.formValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));
}
