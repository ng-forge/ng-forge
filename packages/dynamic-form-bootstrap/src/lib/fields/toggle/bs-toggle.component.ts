import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { createResolvedErrorsSignal, DynamicText, DynamicTextPipe, shouldShowErrors, ValidationMessages } from '@ng-forge/dynamic-form';
import { BsToggleComponent, BsToggleProps } from './bs-toggle.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-toggle',
  imports: [Field, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div
      class="form-check form-switch"
      [class.form-check-inline]="props()?.inline"
      [class.form-check-reverse]="props()?.reverse"
      [class.form-switch-sm]="props()?.size === 'sm'"
      [class.form-switch-lg]="props()?.size === 'lg'"
      [attr.hidden]="f().hidden() || null"
    >
      <input
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

      /* Custom size variants for switches */
      .form-switch-sm .form-check-input {
        width: 1.75rem;
        height: 1rem;
        font-size: 0.875rem;
      }

      .form-switch-lg .form-check-input {
        width: 3rem;
        height: 1.75rem;
        font-size: 1.125rem;
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
export default class BsToggleFieldComponent implements BsToggleComponent {
  readonly field = input.required<FieldTree<boolean>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<BsToggleProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly formValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.formValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));
}
