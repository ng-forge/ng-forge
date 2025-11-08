import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { RadioButton } from 'primeng/radiobutton';
import {
  DynamicText, DynamicTextPipe, FieldOption,
  ValidationMessages,
  createResolvedErrorsSignal,
  shouldShowErrors,
} from '@ng-forge/dynamic-form';
import { PrimeRadioComponent, PrimeRadioProps } from './prime-radio.type';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'df-prime-radio',
  imports: [RadioButton, DynamicTextPipe, AsyncPipe, FormsModule],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field(); @if (label()) {
    <div class="radio-label">{{ label() | dynamicText | async }}</div>
    }

    <div class="radio-group">
      @for (option of options(); track option.value) {
      <div class="radio-option">
        <p-radioButton
          [(ngModel)]="f().value"
          [value]="option.value"
          [disabled]="option.disabled || f().disabled()"
          [styleClass]="props()?.styleClass"
          [inputId]="key() + '-' + option.value"
        />
        <label [for]="key() + '-' + option.value" class="radio-option-label">
          {{ option.label | dynamicText | async }}
        </label>
      </div>
      }
    </div>

    @if (props()?.hint; as hint) {
    <small class="p-hint" [attr.hidden]="f().hidden() || null">{{ hint | dynamicText | async }}</small>
    }
    @if (showErrors()) {
      @for (error of resolvedErrors(); track error.kind) {
        <small class="p-error">{{ error.message }}</small>
      }
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

      .radio-group {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .radio-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .radio-option-label {
        cursor: pointer;
        user-select: none;
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

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages);
  readonly showErrors = shouldShowErrors(this.field);
}
