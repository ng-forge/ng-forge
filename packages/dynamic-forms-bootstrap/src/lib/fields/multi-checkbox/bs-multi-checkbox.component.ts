import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { DynamicTextPipe, FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import {
  injectNgForgeField,
  isEqual,
  NgForgeControl,
  NgForgeField,
  NgForgeFieldShell,
  NG_FORGE_FIELD_SHELL_INPUTS,
  NG_FORGE_VALUE_FIELD_INPUTS,
} from '@ng-forge/dynamic-forms/integration';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { BsMultiCheckboxProps } from './bs-multi-checkbox.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-multi-checkbox',
  imports: [DynamicTextPipe, AsyncPipe, NgForgeControl],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [
    { directive: NgForgeFieldShell, inputs: [...NG_FORGE_FIELD_SHELL_INPUTS] },
    { directive: NgForgeField, inputs: [...NG_FORGE_VALUE_FIELD_INPUTS] },
  ],
  template: `
    @let f = ngf.field();
    @let checked = checkedValuesMap();
    @if (ngf.label(); as label) {
      <div class="form-label">{{ label | dynamicText | async }}</div>
    }

    <div class="checkbox-group">
      @for (option of options(); track option.value; let i = $index) {
        <div
          class="form-check"
          [class.form-switch]="props()?.switch"
          [class.form-check-inline]="props()?.inline"
          [class.form-check-reverse]="props()?.reverse"
        >
          <input
            ngForgeControl
            type="checkbox"
            [id]="ngf.key() + '_' + i"
            [checked]="checked['' + option.value]"
            [disabled]="f().disabled() || option.disabled"
            (change)="onCheckboxChange(option, $event)"
            class="form-check-input"
            [class.is-invalid]="f().invalid() && f().touched()"
            [attr.tabindex]="ngf.tabIndex()"
          />
          <label [for]="ngf.key() + '_' + i" class="form-check-label">
            {{ option.label | dynamicText | async }}
          </label>
        </div>
      }
    </div>

    @if (ngf.errorsToDisplay()[0]; as error) {
      <div class="invalid-feedback d-block" [id]="ngf.errorId()" role="alert">{{ error.message }}</div>
    } @else if (props()?.hint; as hint) {
      <div class="form-text" [id]="ngf.hintId()">{{ hint | dynamicText | async }}</div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .checkbox-group {
        margin-bottom: 0.5rem;
      }

      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BsMultiCheckboxFieldComponent {
  protected readonly ngf = injectNgForgeField<ValueType[]>();

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<BsMultiCheckboxProps>();

  /** Computed map of checked option values for O(1) lookup in template */
  readonly checkedValuesMap = computed(() => {
    const map: Record<string, boolean> = {};
    for (const opt of this.valueViewModel()) {
      map[String(opt.value)] = true;
    }
    return map;
  });

  valueViewModel = linkedSignal<FieldOption<ValueType>[]>(
    () => {
      const currentValues = this.ngf.field()().value();
      return this.options().filter((option) => currentValues.includes(option.value));
    },
    { equal: isEqual },
  );

  constructor() {
    explicitEffect([this.valueViewModel], ([selectedOptions]: [FieldOption<ValueType>[]]) => {
      const selectedValues = selectedOptions.map((option: FieldOption<ValueType>) => option.value);

      if (!isEqual(selectedValues, this.ngf.field()().value())) {
        this.ngf.field()().value.set(selectedValues);
      }
    });

    explicitEffect([this.options], ([options]: [FieldOption<ValueType>[]]) => {
      const values = options.map((option: FieldOption<ValueType>) => option.value);
      const uniqueValues = new Set(values);

      if (values.length !== uniqueValues.size) {
        const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
        throw new Error(`Duplicate option values detected in bs-multi-checkbox: ${duplicates.join(', ')}`);
      }
    });
  }

  onCheckboxChange(option: FieldOption<ValueType>, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
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
}
