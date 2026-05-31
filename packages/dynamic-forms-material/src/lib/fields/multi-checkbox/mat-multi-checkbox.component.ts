import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import { injectNgForgeField, NgForgeFieldHost, isEqual, NgForgeControl } from '@ng-forge/dynamic-forms/integration';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { MatMultiCheckboxProps } from './mat-multi-checkbox.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-multi-checkbox',
  imports: [MatCheckbox, MatError, DynamicTextPipe, AsyncPipe, NgForgeControl],
  hostDirectives: [NgForgeFieldHost],
  template: `
    @let f = ngf.field();
    @let checkboxGroupId = ngf.key() + '-checkbox-group';
    @let checked = checkedValuesMap();

    @if (ngf.label(); as label) {
      <div class="checkbox-group-label">{{ label | dynamicText | async }}</div>
    }

    <div
      [id]="checkboxGroupId"
      class="checkbox-group"
      role="group"
      [attr.aria-invalid]="ngf.ariaInvalid()"
      [attr.aria-required]="ngf.ariaRequired()"
      [attr.aria-describedby]="ngf.ariaDescribedBy()"
    >
      @for (option of options(); track option.value) {
        <mat-checkbox
          ngForgeControl="input[type='checkbox']"
          [checked]="checked['' + option.value]"
          [disabled]="f().disabled() || option.disabled"
          [color]="props()?.color || 'primary'"
          [labelPosition]="props()?.labelPosition || 'after'"
          (change)="onCheckboxChange(option, $event.checked)"
        >
          {{ option.label | dynamicText | async }}
        </mat-checkbox>
      }
    </div>

    @if (ngf.errorsToDisplay()[0]; as error) {
      <mat-error [id]="ngf.errorId()">{{ error.message }}</mat-error>
    } @else if (props()?.hint; as hint) {
      <div class="mat-hint" [id]="ngf.hintId()">{{ hint | dynamicText | async }}</div>
    }
  `,
  styleUrl: '../../styles/_form-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatMultiCheckboxFieldComponent {
  protected readonly ngf = injectNgForgeField<ValueType[]>();

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<MatMultiCheckboxProps>();

  valueViewModel = linkedSignal<FieldOption<ValueType>[]>(
    () => {
      const currentValues = this.ngf.field()().value();
      return this.options().filter((option) => currentValues.includes(option.value));
    },
    { equal: isEqual },
  );

  /** Computed map of checked option values for O(1) lookup in template */
  readonly checkedValuesMap = computed(() => {
    const map: Record<string, boolean> = {};
    for (const opt of this.valueViewModel()) {
      map[String(opt.value)] = true;
    }
    return map;
  });

  constructor() {
    explicitEffect([this.valueViewModel], ([selectedOptions]) => {
      const selectedValues = selectedOptions.map((option) => option.value);

      if (!isEqual(selectedValues, this.ngf.field()().value())) {
        this.ngf.field()().value.set(selectedValues);
      }
    });

    explicitEffect([this.options], ([options]) => {
      const values = options.map((option) => option.value);
      const uniqueValues = new Set(values);

      if (values.length !== uniqueValues.size) {
        const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
        throw new Error(`Duplicate option values detected in mat-multi-checkbox: ${duplicates.join(', ')}`);
      }
    });
  }

  onCheckboxChange(option: FieldOption<ValueType>, checked: boolean): void {
    this.valueViewModel.update((currentOptions) => {
      if (checked) {
        return currentOptions.some((opt) => opt.value === option.value) ? currentOptions : [...currentOptions, option];
      } else {
        return currentOptions.filter((opt) => opt.value !== option.value);
      }
    });
  }
}
