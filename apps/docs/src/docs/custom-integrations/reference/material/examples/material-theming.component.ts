import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-material-theming',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="example-container">
      <h4>Material Theming & Appearances</h4>
      <p class="description">Showcase of different Material Design appearances, colors, and theming options for form fields.</p>
      <dynamic-form [config]="config" [(value)]="model"></dynamic-form>
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
        max-width: 800px;
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
export class MaterialThemingComponent {
  model = signal({
    outlineInput: '',
    fillInput: '',
    primaryCheckbox: false,
    accentCheckbox: false,
    warnCheckbox: false,
    primaryToggle: false,
    accentToggle: false,
    primarySelect: '',
    accentRadio: '',
    primarySlider: 25,
    accentSlider: 75,
  });

  config: FormConfig = {
    fields: [
      // === APPEARANCE VARIANTS ===
      {
        key: 'outlineInput',
        type: 'input',
        label: 'Outline Appearance',
        props: {
          placeholder: 'Outline style input...',
          appearance: 'outline',
          hint: 'Outlined form field appearance',
        },
      },
      {
        key: 'fillInput',
        type: 'input',
        label: 'Fill Appearance',
        props: {
          placeholder: 'Fill style input...',
          appearance: 'fill',
          hint: 'Filled form field appearance',
        },
      },

      // === COLOR VARIANTS - CHECKBOX ===
      {
        key: 'primaryCheckbox',
        type: 'checkbox',
        label: 'Primary Color Checkbox',
        props: {
          color: 'primary',
          hint: 'Checkbox with primary theme color',
        },
      },
      {
        key: 'accentCheckbox',
        type: 'checkbox',
        label: 'Accent Color Checkbox',
        props: {
          color: 'accent',
          hint: 'Checkbox with accent theme color',
        },
      },
      {
        key: 'warnCheckbox',
        type: 'checkbox',
        label: 'Warn Color Checkbox',
        props: {
          color: 'warn',
          hint: 'Checkbox with warning theme color',
        },
      },

      // === COLOR VARIANTS - TOGGLE ===
      {
        key: 'primaryToggle',
        type: 'toggle',
        label: 'Primary Toggle',
        props: {
          // appearance: 'outline',
          color: 'primary',
          hint: 'Toggle with primary theme color',
          labelPosition: 'before',
        },
      },
      {
        key: 'accentToggle',
        type: 'toggle',
        label: 'Accent Toggle',
        props: {
          // appearance: 'outline',
          color: 'accent',
          hint: 'Toggle with accent theme color',
          labelPosition: 'after',
        },
      },

      // === COLOR VARIANTS - SELECT ===
      {
        key: 'primarySelect',
        type: 'select',
        label: 'Primary Select',
        props: {
          placeholder: 'Choose an option...',
          appearance: 'outline',
          hint: 'Select with primary theme styling',
        },
        options: [
          { value: 'opt1', label: 'Option 1' },
          { value: 'opt2', label: 'Option 2' },
          { value: 'opt3', label: 'Option 3' },
        ],
      },

      // === COLOR VARIANTS - RADIO ===
      {
        key: 'accentRadio',
        type: 'radio',
        label: 'Accent Radio Group',
        props: {
          color: 'accent',
          hint: 'Radio buttons with accent theme color',
        },
        options: [
          { value: 'choice1', label: 'First Choice' },
          { value: 'choice2', label: 'Second Choice' },
          { value: 'choice3', label: 'Third Choice' },
        ],
      },

      // === COLOR VARIANTS - SLIDERS ===
      {
        key: 'primarySlider',
        type: 'slider',
        label: 'Primary Slider',
        props: {
          color: 'primary',
          hint: 'Slider with primary theme color',
          min: 0,
          max: 50,
          step: 5,
          showThumbLabel: true,
        },
      },
      {
        key: 'accentSlider',
        type: 'slider',
        label: 'Accent Slider',
        props: {
          color: 'accent',
          hint: 'Slider with accent theme color',
          min: 50,
          max: 100,
          step: 5,
          showThumbLabel: true,
        },
      },
    ],
  };
}
