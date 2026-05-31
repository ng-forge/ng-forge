import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Checkbox, CheckboxChangeEvent } from 'primeng/checkbox';
import { FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import { injectNgForgeField, NgForgeFieldHost, isEqual, NgForgeControl } from '@ng-forge/dynamic-forms/integration';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { PrimeMultiCheckboxProps } from './prime-multi-checkbox.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-prime-multi-checkbox',
  imports: [Checkbox, FormsModule, DynamicTextPipe, AsyncPipe, NgForgeControl],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [NgForgeFieldHost],
  template: `
    @let f = ngf.field();
    @let checked = checkedValuesMap();
    @let isInvalid = ngf.errorsToDisplay().length > 0;
    @if (ngf.label(); as label) {
      <div class="checkbox-group-label">{{ label | dynamicText | async }}</div>
    }

    <div class="checkbox-group" [class]="props()?.styleClass" [attr.aria-describedby]="ngf.ariaDescribedBy()">
      @for (option of options(); track option.value) {
        <div class="checkbox-option">
          <p-checkbox
            ngForgeControl="input[type='checkbox']"
            [inputId]="ngf.key() + '-' + option.value"
            [binary]="true"
            [ngModel]="checked['' + option.value] || false"
            (onChange)="onCheckboxChange(option, $event)"
            [disabled]="f().disabled() || option.disabled || false"
            [invalid]="isInvalid"
          />
          <label [for]="ngf.key() + '-' + option.value" class="ml-2">{{ option.label | dynamicText | async }}</label>
        </div>
      }
    </div>
    @if (ngf.errorsToDisplay()[0]; as error) {
      <small class="p-error" [id]="ngf.errorId()" role="alert">{{ error.message }}</small>
    } @else if (props()?.hint; as hint) {
      <small class="p-hint" [id]="ngf.hintId()">{{ hint | dynamicText | async }}</small>
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

      .checkbox-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PrimeMultiCheckboxFieldComponent {
  protected readonly ngf = injectNgForgeField<ValueType[]>();

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<PrimeMultiCheckboxProps>();

  protected valueViewModel = linkedSignal<FieldOption<ValueType>[]>(
    () => {
      const currentValues = this.ngf.field()().value();
      return this.options().filter((option) => currentValues.includes(option.value));
    },
    { equal: isEqual },
  );

  /** Computed map of checked option values for O(1) lookup in template */
  protected readonly checkedValuesMap = computed(() => {
    const map: Record<string, boolean> = {};
    for (const opt of this.valueViewModel()) {
      map[String(opt.value)] = true;
    }
    return map;
  });

  protected onCheckboxChange(option: FieldOption<ValueType>, event: CheckboxChangeEvent): void {
    const checked = event.checked;
    this.valueViewModel.update((currentOptions: FieldOption<ValueType>[]) => {
      if (checked) {
        return currentOptions.some((opt: FieldOption<ValueType>) => opt.value === option.value)
          ? currentOptions
          : [...currentOptions, option];
      } else {
        return currentOptions.filter((opt: FieldOption<ValueType>) => opt.value !== option.value);
      }
    });
  }

  constructor() {
    explicitEffect([this.valueViewModel], ([selectedOptions]: [FieldOption<ValueType>[]]) => {
      const selectedValues = selectedOptions.map((option: FieldOption<ValueType>) => option.value);
      if (!isEqual(selectedValues, this.ngf.field()().value())) {
        this.ngf.field()().value.set(selectedValues);
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
}
