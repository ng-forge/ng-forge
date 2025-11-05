import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-control-field-types-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <dynamic-form [config]="fields" [(value)]="model" />
    <h4>Form Data:</h4>
    <pre>{{ model() | json }}</pre>
  `,
})
export class ControlFieldTypesDemoComponent {
  model = signal({
    // ValueControlFieldType examples
    textInput: '',
    emailInput: '',
    selectValue: '',
    textareaValue: '',
    dateValue: null,
    radioValue: '',
    sliderValue: 30,
    toggleValue: false,

    // CheckboxControlFieldType examples
    singleCheckbox: false,
    multiCheckbox: [],
  });

  fields: FormConfig = {
    fields: [
      // === ValueControlFieldType<MatInputProps, string> ===
      {
        key: 'textInput',
        type: 'input',
        label: 'Text Input (ValueControlFieldType)',
        props: {
          placeholder: 'Implements FormValueControl<string> + MatInputField',
          appearance: 'outline',
          hint: 'Uses ValueControlFieldType<MatInputProps, string>',
        },
      },
      {
        key: 'emailInput',
        type: 'input',
        label: 'Email Input (ValueControlFieldType)',
        props: {
          type: 'email',
          placeholder: 'user@example.com',
          appearance: 'outline',
          hint: 'Type-safe email input with automatic validation',
        },
        required: true,
        email: true,
      },

      // === ValueControlFieldType<MatSelectProps, T> ===
      {
        key: 'selectValue',
        type: 'select',
        label: 'Select Field (ValueControlFieldType)',
        options: [
          { value: 'typescript', label: 'TypeScript' },
          { value: 'angular', label: 'Angular' },
          { value: 'material', label: 'Material Design' },
        ],
        props: {
          placeholder: 'Implements FormValueControl<T> + MatSelectField<T>',
          appearance: 'outline',
          hint: 'Uses ValueControlFieldType<MatSelectProps, T>',
        },
      },

      // === ValueControlFieldType<MatTextareaProps, string> ===
      {
        key: 'textareaValue',
        type: 'textarea',
        label: 'Textarea Field (ValueControlFieldType)',
        props: {
          placeholder: 'Implements FormValueControl<string> + MatTextareaField',
          appearance: 'outline',
          rows: 3,
          hint: 'Uses ValueControlFieldType<MatTextareaProps, string>',
        },
      },

      // === ValueControlFieldType<MatDatepickerProps, Date | null> ===
      {
        key: 'dateValue',
        type: 'datepicker',
        label: 'Date Picker (ValueControlFieldType)',
        props: {
          placeholder: 'Implements FormValueControl<Date | null> + MatDatepickerField',
          appearance: 'outline',
          hint: 'Uses ValueControlFieldType<MatDatepickerProps, Date | null>',
        },
      },

      // === ValueControlFieldType<MatRadioProps<T>, T> ===
      {
        key: 'radioValue',
        type: 'radio',
        label: 'Radio Group (ValueControlFieldType)',
        options: [
          { value: 'beginner', label: 'Beginner Level' },
          { value: 'intermediate', label: 'Intermediate Level' },
          { value: 'advanced', label: 'Advanced Level' },
        ],
        props: {
          hint: 'Uses ValueControlFieldType<MatRadioProps<T>, T>',
        },
      },

      // === ValueControlFieldType<MatSliderProps, number> ===
      {
        key: 'sliderValue',
        type: 'slider',
        label: 'Slider Field (ValueControlFieldType)',
        props: {
          hint: 'Uses ValueControlFieldType with FormValueControl<number>',
          color: 'primary',
          min: 0,
          max: 100,
          step: 10,
          showThumbLabel: true,
        },
      },

      // === ValueControlFieldType<MatToggleProps, boolean> ===
      {
        key: 'toggleValue',
        type: 'toggle',
        label: 'Toggle Field (ValueControlFieldType)',
        props: {
          // appearance: 'outline',
          hint: 'Uses ValueControlFieldType<MatToggleProps, boolean>',
          color: 'accent',
          labelPosition: 'before',
        },
      },

      // === CheckboxControlFieldType<MatCheckboxProps> ===
      {
        key: 'singleCheckbox',
        type: 'checkbox',
        label: 'Checkbox Field (CheckboxControlFieldType)',
        props: {
          hint: 'Implements FormCheckboxControl + CheckboxControlFieldType<MatCheckboxProps>',
          color: 'primary',
          labelPosition: 'after',
        },
      },

      // === ValueControlFieldType<MatMultiCheckboxProps<T>, T[]> ===
      {
        key: 'multiCheckbox',
        type: 'multi-checkbox',
        label: 'Multi-Checkbox (ValueControlFieldType)',
        options: [
          { value: 'signals', label: 'Angular Signals' },
          { value: 'forms', label: 'Signal Forms' },
          { value: 'control', label: 'Form Controls' },
          { value: 'types', label: 'Type Utilities' },
        ],
        props: {
          hint: 'Uses ValueControlFieldType<MatMultiCheckboxProps<T>, T[]>',
          color: 'primary',
        },
      },
    ],
  };
}
