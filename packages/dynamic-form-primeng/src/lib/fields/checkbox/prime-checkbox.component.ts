import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { Checkbox } from 'primeng/checkbox';
import { createResolvedErrorsSignal, DynamicText, DynamicTextPipe, shouldShowErrors, ValidationMessages } from '@ng-forge/dynamic-form';
import { PrimeCheckboxComponent, PrimeCheckboxProps } from './prime-checkbox.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-prime-checkbox',
  imports: [Checkbox, DynamicTextPipe, AsyncPipe, Field],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field(); @let checkboxId = key() + '-checkbox';

    <div class="flex items-center">
      <p-checkbox
        [field]="f"
        [inputId]="checkboxId"
        [binary]="props()?.binary ?? true"
        [trueValue]="props()?.trueValue ?? true"
        [falseValue]="props()?.falseValue ?? false"
        [styleClass]="checkboxClasses()"
        [attr.tabindex]="tabIndex()"
      />
      @if (label(); as labelText) {
      <label [for]="checkboxId" class="ml-2">{{ labelText | dynamicText | async }}</label>
      }
    </div>

    @if (props()?.hint; as hint) {
    <small class="p-hint" [attr.hidden]="f().hidden() || null">{{ hint | dynamicText | async }}</small>
    } @for (error of errorsToDisplay(); track error.kind) {
    <small class="p-error">{{ error.message }}</small>
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
    '[attr.hidden]': 'field()().hidden() || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PrimeCheckboxFieldComponent implements PrimeCheckboxComponent {
  readonly field = input.required<FieldTree<boolean>>();
  readonly key = input.required<string>();

  // Properties
  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<PrimeCheckboxProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  readonly checkboxClasses = computed(() => {
    const classes: string[] = [];

    const styleClass = this.props()?.styleClass;
    if (styleClass) {
      classes.push(styleClass);
    }

    // Add p-invalid class when there are errors to display
    if (this.errorsToDisplay().length > 0) {
      classes.push('p-invalid');
    }

    return classes.join(' ');
  });
}
