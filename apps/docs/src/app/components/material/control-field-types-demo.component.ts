import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FieldConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-control-field-types-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="example-container">
      <h4>Control Field Types Implementation</h4>
      <p class="description">
        This example demonstrates how Material components implement both FormControl interfaces and field interfaces using the new control
        field type utilities. Each field showcases type-safe implementation with automatic property exclusion and signal compatibility.
      </p>
      <dynamic-form [fields]="fields" [value]="model()" (valueChange)="onValueChange($event)"></dynamic-form>
      <div class="implementation-notes">
        <h5>Implementation Details:</h5>
        <ul>
          <li><strong>ValueControlFieldType:</strong> Used by input, select, textarea, datepicker, radio, slider, and toggle fields</li>
          <li><strong>CheckboxControlFieldType:</strong> Used by checkbox and multi-checkbox fields</li>
          <li>
            <strong>Automatic Exclusion:</strong> Properties like 'value', 'disabled', 'touched' are provided by FormControl interfaces
          </li>
          <li><strong>Signal Compatibility:</strong> All field properties are properly typed as InputSignals</li>
          <li><strong>Type Safety:</strong> TypeScript ensures correct implementation of both interfaces</li>
        </ul>
      </div>
      <div class="output">
        <strong>Form Data:</strong>
        <pre>{{ model() | json }}</pre>
      </div>
    </div>
  `,
  styles: [
    `
      .example-container {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 2rem;
        margin: 1rem 0;
        max-width: 900px;
      }
      .description {
        color: #666;
        margin-bottom: 1.5rem;
        font-style: italic;
        line-height: 1.5;
      }
      .implementation-notes {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        padding: 1rem;
        margin: 1.5rem 0;
      }
      .implementation-notes h5 {
        margin-top: 0;
        margin-bottom: 0.5rem;
        color: #495057;
      }
      .implementation-notes ul {
        margin: 0;
        padding-left: 1.5rem;
      }
      .implementation-notes li {
        margin-bottom: 0.5rem;
        color: #6c757d;
      }
      .implementation-notes strong {
        color: #495057;
      }
      .output {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #e0e0e0;
      }
      pre {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 4px;
        font-size: 0.9rem;
        margin: 0.5rem 0;
        max-height: 300px;
        overflow-y: auto;
      }
      h4 {
        margin-top: 0;
        color: #1976d2;
      }
    `,
  ],
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

  fields: FieldConfig[] = [
    // === ValueControlFieldType<MatInputProps, string> ===
    {
      key: 'textInput',
      type: 'input',
      props: {
        label: 'Text Input (ValueControlFieldType)',
        placeholder: 'Implements FormValueControl<string> + MatInputField',
        appearance: 'outline',
        hint: 'Uses ValueControlFieldType<MatInputProps, string>',
      },
    },
    {
      key: 'emailInput',
      type: 'input',
      props: {
        label: 'Email Input (ValueControlFieldType)',
        type: 'email',
        placeholder: 'user@example.com',
        appearance: 'outline',
        hint: 'Type-safe email input with automatic validation',
        required: true,
      },
      validators: {
        required: true,
        email: true,
      },
    },

    // === ValueControlFieldType<MatSelectProps, T> ===
    {
      key: 'selectValue',
      type: 'select',
      props: {
        label: 'Select Field (ValueControlFieldType)',
        placeholder: 'Implements FormValueControl<T> + MatSelectField<T>',
        appearance: 'outline',
        hint: 'Uses ValueControlFieldType<MatSelectProps, T>',
        options: [
          { value: 'typescript', label: 'TypeScript' },
          { value: 'angular', label: 'Angular' },
          { value: 'material', label: 'Material Design' },
        ],
      },
    },

    // === ValueControlFieldType<MatTextareaProps, string> ===
    {
      key: 'textareaValue',
      type: 'textarea',
      props: {
        label: 'Textarea Field (ValueControlFieldType)',
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
      props: {
        label: 'Date Picker (ValueControlFieldType)',
        placeholder: 'Implements FormValueControl<Date | null> + MatDatepickerField',
        appearance: 'outline',
        hint: 'Uses ValueControlFieldType<MatDatepickerProps, Date | null>',
      },
    },

    // === ValueControlFieldType<MatRadioProps<T>, T> ===
    {
      key: 'radioValue',
      type: 'radio',
      props: {
        label: 'Radio Group (ValueControlFieldType)',
        appearance: 'outline',
        hint: 'Uses ValueControlFieldType<MatRadioProps<T>, T>',
        options: [
          { value: 'beginner', label: 'Beginner Level' },
          { value: 'intermediate', label: 'Intermediate Level' },
          { value: 'advanced', label: 'Advanced Level' },
        ],
      },
    },

    // === ValueControlFieldType<MatSliderProps, number> ===
    {
      key: 'sliderValue',
      type: 'slider',
      props: {
        label: 'Slider Field (ValueControlFieldType)',
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
      props: {
        label: 'Toggle Field (ValueControlFieldType)',
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
      props: {
        label: 'Checkbox Field (CheckboxControlFieldType)',
        hint: 'Implements FormCheckboxControl + CheckboxControlFieldType<MatCheckboxProps>',
        color: 'primary',
        labelPosition: 'after',
      },
    },

    // === ValueControlFieldType<MatMultiCheckboxProps<T>, T[]> ===
    {
      key: 'multiCheckbox',
      type: 'multi-checkbox',
      props: {
        label: 'Multi-Checkbox (ValueControlFieldType)',
        appearance: 'outline',
        hint: 'Uses ValueControlFieldType<MatMultiCheckboxProps<T>, T[]>',
        color: 'primary',
        options: [
          { value: 'signals', label: 'Angular Signals' },
          { value: 'forms', label: 'Signal Forms' },
          { value: 'control', label: 'Form Controls' },
          { value: 'types', label: 'Type Utilities' },
        ],
      },
    },
  ];

  onValueChange(newValue: any) {
    this.model.set(newValue);
  }
}
