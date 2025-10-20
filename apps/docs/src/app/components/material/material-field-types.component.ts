import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FieldConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-material-field-types',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="example-container">
      <h4>Material Field Types</h4>
      <p class="description">
        Comprehensive examples of all available Material Design field components with their type-safe configurations.
      </p>
      <dynamic-form [fields]="fields" [value]="model()" (valueChange)="onValueChange($event)"></dynamic-form>
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
        max-height: 400px;
        overflow-y: auto;
      }
      h4 {
        margin-top: 0;
        color: #1976d2;
      }
    `,
  ],
})
export class MaterialFieldTypesComponent {
  model = signal({
    // Input fields
    basicInput: '',
    emailInput: '',
    passwordInput: '',
    textareaInput: '',

    // Date/time fields
    dateInput: null,

    // Selection fields
    basicSelect: '',
    multiSelect: [],
    radioSelection: '',

    // Boolean fields
    basicCheckbox: false,
    toggleSwitch: false,

    // Multi-checkbox
    multiCheckbox: [],

    // Slider
    sliderValue: 50,
  });

  fields: FieldConfig[] = [
    // === INPUT FIELDS ===
    {
      key: 'basicInput',
      type: 'input',
      props: {
        label: 'Basic Text Input',
        placeholder: 'Enter some text...',
        appearance: 'outline',
        hint: 'Standard text input with outline appearance',
      },
    },
    {
      key: 'emailInput',
      type: 'input',
      props: {
        label: 'Email Input',
        type: 'email',
        placeholder: 'user@example.com',
        appearance: 'fill',
        hint: 'Email input with validation',
        required: true,
      },
      validators: {
        required: true,
        email: true,
      },
    },
    {
      key: 'passwordInput',
      type: 'input',
      props: {
        label: 'Password Input',
        type: 'password',
        placeholder: 'Enter password...',
        appearance: 'outline',
        hint: 'Password field with hidden characters',
        required: true,
      },
      validators: {
        required: true,
        minLength: 6,
      },
    },

    // === TEXTAREA ===
    {
      key: 'textareaInput',
      type: 'textarea',
      props: {
        label: 'Textarea Field',
        placeholder: 'Enter a longer message...',
        appearance: 'outline',
        rows: 4,
        hint: 'Multi-line text input for longer content',
      },
    },

    // === DATE PICKER ===
    {
      key: 'dateInput',
      type: 'datepicker',
      props: {
        label: 'Date Picker',
        placeholder: 'Select a date...',
        appearance: 'outline',
        hint: 'Material datepicker with calendar popup',
      },
    },

    // === SELECT FIELDS ===
    {
      key: 'basicSelect',
      type: 'select',
      props: {
        label: 'Basic Select',
        placeholder: 'Choose an option...',
        appearance: 'outline',
        hint: 'Single selection dropdown',
        options: [
          { value: 'option1', label: 'First Option' },
          { value: 'option2', label: 'Second Option' },
          { value: 'option3', label: 'Third Option' },
          { value: 'option4', label: 'Disabled Option', disabled: true },
        ],
      },
    },
    {
      key: 'multiSelect',
      type: 'select',
      props: {
        label: 'Multi Select',
        placeholder: 'Choose multiple options...',
        appearance: 'outline',
        multiple: true,
        hint: 'Select multiple values from the dropdown',
        options: [
          { value: 'red', label: 'Red' },
          { value: 'green', label: 'Green' },
          { value: 'blue', label: 'Blue' },
          { value: 'yellow', label: 'Yellow' },
          { value: 'purple', label: 'Purple' },
        ],
      },
    },

    // === RADIO GROUP ===
    {
      key: 'radioSelection',
      type: 'radio',
      props: {
        label: 'Radio Group',
        appearance: 'outline',
        hint: 'Single selection from radio buttons',
        options: [
          { value: 'small', label: 'Small Size' },
          { value: 'medium', label: 'Medium Size' },
          { value: 'large', label: 'Large Size' },
        ],
      },
    },

    // === CHECKBOX ===
    {
      key: 'basicCheckbox',
      type: 'checkbox',
      props: {
        label: 'Basic Checkbox',
        hint: 'Single boolean checkbox',
        color: 'primary',
        labelPosition: 'after',
      },
    },

    // === TOGGLE ===
    {
      key: 'toggleSwitch',
      type: 'toggle',
      props: {
        label: 'Toggle Switch',
        appearance: 'outline',
        hint: 'Material slide toggle for boolean values',
        color: 'accent',
        labelPosition: 'before',
      },
    },

    // === MULTI-CHECKBOX ===
    {
      key: 'multiCheckbox',
      type: 'multi-checkbox',
      props: {
        label: 'Multi Checkbox',
        appearance: 'outline',
        hint: 'Multiple selections with checkboxes',
        color: 'primary',
        options: [
          { value: 'feature1', label: 'Feature A' },
          { value: 'feature2', label: 'Feature B' },
          { value: 'feature3', label: 'Feature C' },
          { value: 'feature4', label: 'Feature D (Disabled)', disabled: true },
        ],
      },
    },

    // === SLIDER ===
    {
      key: 'sliderValue',
      type: 'slider',
      props: {
        label: 'Slider Input',
        hint: 'Numeric input with slider control',
        color: 'primary',
        min: 0,
        max: 100,
        step: 5,
        showThumbLabel: true,
      },
    },
  ];

  onValueChange(newValue: any) {
    this.model.set(newValue);
  }
}
