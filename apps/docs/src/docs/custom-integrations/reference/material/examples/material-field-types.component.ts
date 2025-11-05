import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-material-field-types',
  imports: [DynamicForm, JsonPipe],
  template: `
    <h4>All Material Field Types</h4>
    <dynamic-form [config]="fields" [(value)]="model" />
    <h4>Form Data:</h4>
    <pre>{{ model() | json }}</pre>
  `,
})
export class MaterialFieldTypesComponent {
  model = signal({
    // Input definitions
    basicInput: '',
    emailInput: '',
    passwordInput: '',
    textareaInput: '',

    // Date/time definitions
    dateInput: null,

    // Selection definitions
    basicSelect: '',
    multiSelect: [],
    radioSelection: '',

    // Boolean definitions
    basicCheckbox: false,
    toggleSwitch: false,

    // Multi-checkbox
    multiCheckbox: [],

    // Slider
    sliderValue: 50,
  });

  fields: FormConfig = {
    fields: [
      // === INPUT FIELDS ===
      {
        key: 'basicInput',
        type: 'input',
        label: 'Basic Text Input',
        props: {
          placeholder: 'Enter some text...',
          appearance: 'outline',
          hint: 'Standard text input with outline appearance',
        },
      },
      {
        key: 'emailInput',
        type: 'input',
        label: 'Email Input',
        props: {
          type: 'email',
          placeholder: 'user@example.com',
          appearance: 'fill',
          hint: 'Email input with validation',
          required: true,
        },
        // validation: {
        //   required: true,
        //   email: true,
        // },
      },
      {
        key: 'passwordInput',
        type: 'input',
        label: 'Password Input',
        props: {
          type: 'password',
          placeholder: 'Enter password...',
          appearance: 'outline',
          hint: 'Password field with hidden characters',
          required: true,
        },
        // validation: {
        //   required: true,
        //   minLength: 6,
        // },
      },

      // === TEXTAREA ===
      {
        key: 'textareaInput',
        type: 'textarea',
        label: 'Textarea Field',
        props: {
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
        label: 'Date Picker',
        props: {
          placeholder: 'Select a date...',
          appearance: 'outline',
          hint: 'Material datepicker with calendar popup',
        },
      },

      // === SELECT FIELDS ===
      {
        key: 'basicSelect',
        type: 'select',
        label: 'Basic Select',
        props: {
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
        label: 'Multi Select',
        props: {
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
        label: 'Radio Group',
        props: {
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
        label: 'Basic Checkbox',
        props: {
          hint: 'Single boolean checkbox',
          color: 'primary',
          labelPosition: 'after',
        },
      },

      // === TOGGLE ===
      {
        key: 'toggleSwitch',
        type: 'toggle',
        label: 'Toggle Switch',
        props: {
          // appearance: 'outline',
          hint: 'Material slide toggle for boolean values',
          color: 'accent',
          labelPosition: 'before',
        },
      },

      // === MULTI-CHECKBOX ===
      {
        key: 'multiCheckbox',
        type: 'multi-checkbox',
        label: 'Multi Checkbox',
        props: {
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
        label: 'Slider Input',
        props: {
          hint: 'Numeric input with slider control',
          color: 'primary',
          min: 0,
          max: 100,
          step: 5,
          showThumbLabel: true,
        },
      },
    ],
  };
}
