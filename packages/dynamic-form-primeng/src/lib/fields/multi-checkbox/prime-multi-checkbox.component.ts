import { ChangeDetectionStrategy, Component, input, linkedSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import {
  DynamicText,
  DynamicTextPipe,
  FieldOption,
  ValueType,
  ValidationMessages,
  createResolvedErrorsSignal,
  shouldShowErrors,
} from '@ng-forge/dynamic-form';
import { ValueInArrayPipe } from '../../directives/value-in-array.pipe';
import { isEqual } from 'lodash-es';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { PrimeMultiCheckboxComponent, PrimeMultiCheckboxProps } from './prime-multi-checkbox.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-prime-multi-checkbox',
  imports: [Checkbox, DynamicTextPipe, AsyncPipe, FormsModule],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field(); @if (label(); as label) {
    <div class="checkbox-group-label">{{ label | dynamicText | async }}</div>
    }

    <div class="checkbox-group" [class]="props()?.styleClass || ''">
      @for (option of options(); track option.value) {
      <div class="checkbox-option">
        <p-checkbox
          [inputId]="key() + '-' + option.value"
          [binary]="false"
          [value]="option.value"
          [ngModel]="valueViewModel()"
          [disabled]="f().disabled() || option.disabled || false"
          (ngModelChange)="onCheckboxChange($event)"
        />
        <label [for]="key() + '-' + option.value" class="ml-2">{{ option.label | dynamicText | async }}</label>
      </div>
      }
    </div>
    @if (props()?.hint; as hint) {
    <small class="p-hint">{{ hint | dynamicText | async }}</small>
    } @if (showErrors()) { @for (error of resolvedErrors(); track error.kind) {
    <small class="p-error">{{ error.message }}</small>
    } }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .checkbox-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    `,
  ],
  host: {
    '[class]': 'className() || ""',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  providers: [ValueInArrayPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PrimeMultiCheckboxFieldComponent<T extends ValueType> implements PrimeMultiCheckboxComponent<T> {
  readonly field = input.required<FieldTree<T[]>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<PrimeMultiCheckboxProps>();

  valueViewModel = linkedSignal<T[]>(() => this.field()().value(), { equal: isEqual });

  constructor() {
    explicitEffect([this.valueViewModel], ([selectedValues]) => {
      if (!isEqual(selectedValues, this.field()().value())) {
        this.field()().value.set(selectedValues);
      }
    });

    explicitEffect([this.options], ([options]) => {
      const values = options.map((option) => option.value);
      const uniqueValues = new Set(values);

      if (values.length !== uniqueValues.size) {
        const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
        throw new Error(`Duplicate option values detected in prime-multi-checkbox: ${duplicates.join(', ')}`);
      }
    });
  }

  onCheckboxChange(newValues: T[]): void {
    this.valueViewModel.set(newValues);
  }
}
