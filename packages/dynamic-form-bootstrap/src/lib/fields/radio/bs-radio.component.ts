import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import {
  DynamicText,
  DynamicTextPipe,
  FieldOption,
  ValidationMessages,
  createResolvedErrorsSignal,
  shouldShowErrors,
} from '@ng-forge/dynamic-form';
import { BsRadioComponent, BsRadioProps } from './bs-radio.type';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'df-bs-radio',
  imports: [DynamicTextPipe, AsyncPipe, FormsModule],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="mb-3">
      @if (label(); as label) {
      <div class="form-label">{{ label | dynamicText | async }}</div>
      } @if (props()?.buttonGroup) {
      <div class="btn-group" role="group" [attr.aria-label]="label() | dynamicText | async">
        @for (option of options(); track option.value; let i = $index) {
        <input
          type="radio"
          [(ngModel)]="option.value"
          [disabled]="option.disabled || f().disabled()"
          class="btn-check"
          [id]="key() + '_' + i"
          autocomplete="off"
        />
        <label
          class="btn btn-outline-primary"
          [class.btn-sm]="props()?.buttonSize === 'sm'"
          [class.btn-lg]="props()?.buttonSize === 'lg'"
          [for]="key() + '_' + i"
        >
          {{ option.label | dynamicText | async }}
        </label>
        }
      </div>
      } @else { @for (option of options(); track option.value; let i = $index) {
      <div class="form-check" [class.form-check-inline]="props()?.inline" [class.form-check-reverse]="props()?.reverse">
        <input
          type="radio"
          [(ngModel)]="option.value"
          [disabled]="option.disabled || f().disabled()"
          class="form-check-input"
          [id]="key() + '_' + i"
        />
        <label class="form-check-label" [for]="key() + '_' + i">
          {{ option.label | dynamicText | async }}
        </label>
      </div>
      } } @if (props()?.helpText; as helpText) {
      <div class="form-text">{{ helpText | dynamicText | async }}</div>
      } @if (showErrors()) { @for (error of resolvedErrors(); track error.kind) {
      <div class="invalid-feedback d-block">{{ error.message }}</div>
      } }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
  },
})
export default class BsRadioFieldComponent<T extends string> implements BsRadioComponent<T> {
  readonly field = input.required<FieldTree<T>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<BsRadioProps>();
}
