import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import {
  createResolvedErrorsSignal,
  DynamicText,
  DynamicTextPipe,
  FieldOption,
  shouldShowErrors,
  ValidationMessages,
} from '@ng-forge/dynamic-form';
import { PrimeRadioComponent, PrimeRadioProps } from './prime-radio.type';
import { AsyncPipe } from '@angular/common';
import { PrimeRadioGroupComponent } from './prime-radio-group.component';

@Component({
  selector: 'df-prime-radio',
  imports: [PrimeRadioGroupComponent, Field, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field(); @if (label()) {
    <div class="radio-label">{{ label() | dynamicText | async }}</div>
    }

    <df-prime-radio-group [field]="$any(f)" [options]="options()" [properties]="props()" />

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

      .radio-label {
        margin-bottom: 0.5rem;
        font-weight: 500;
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
export default class PrimeRadioFieldComponent<T> implements PrimeRadioComponent<T> {
  readonly field = input.required<FieldTree<T>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<PrimeRadioProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));
}
