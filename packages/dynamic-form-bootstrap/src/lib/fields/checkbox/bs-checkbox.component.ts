import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, input, viewChild } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { createResolvedErrorsSignal, DynamicText, DynamicTextPipe, shouldShowErrors, ValidationMessages } from '@ng-forge/dynamic-form';
import { BsCheckboxComponent, BsCheckboxProps } from './bs-checkbox.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-checkbox',
  imports: [Field, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div
      class="form-check"
      [class.form-switch]="props()?.switch"
      [class.form-check-inline]="props()?.inline"
      [class.form-check-reverse]="props()?.reverse"
      [attr.hidden]="f().hidden() || null"
    >
      <input
        #checkboxInput
        type="checkbox"
        [field]="f"
        [id]="key()"
        class="form-check-input"
        [class.is-invalid]="f().invalid() && f().touched()"
        [attr.tabindex]="tabIndex()"
        [attr.hidden]="f().hidden() || null"
      />
      <label [for]="key()" class="form-check-label">
        {{ label() | dynamicText | async }}
      </label>
    </div>

    @if (props()?.helpText; as helpText) {
    <div class="form-text" [attr.hidden]="f().hidden() || null">
      {{ helpText | dynamicText | async }}
    </div>
    } @for (error of errorsToDisplay(); track error.kind) {
    <div class="invalid-feedback d-block">{{ error.message }}</div>
    }
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
export default class BsCheckboxFieldComponent implements BsCheckboxComponent {
  readonly field = input.required<FieldTree<boolean>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<BsCheckboxProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  readonly checkboxInput = viewChild<ElementRef<HTMLInputElement>>('checkboxInput');

  constructor() {
    // Handle indeterminate state
    effect(() => {
      const indeterminate = this.props()?.indeterminate;
      const inputEl = this.checkboxInput()?.nativeElement;

      if (inputEl && indeterminate !== undefined) {
        inputEl.indeterminate = indeterminate;
      }
    });
  }
}
