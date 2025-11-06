import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withBootstrapFields } from '@ng-forge/dynamic-form-bootstrap/no-augmentation';
import { BootstrapDesignContainer } from '../bootstrap.container';

@Component({
  selector: 'app-bs-radio-demo',
  imports: [DynamicForm, JsonPipe, BootstrapDesignContainer],
  providers: [provideDynamicForm(...withBootstrapFields())],
  template: `
    <app-bootstrap-container>
      <h3>Bootstrap Radio Examples</h3>
      <p>Demonstration of radio button groups with different layouts and styles.</p>
      <dynamic-form [config]="fields" [(value)]="formOutput" />
      <h4>Form Data:</h4>
      <pre>{{ formOutput() | json }}</pre>
    </app-bootstrap-container>
  `,
})
export class BsRadioDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'basicRadio',
        type: 'radio',
        label: 'Basic Radio Group',
        options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
          { value: 'option3', label: 'Option 3' },
        ],
        props: {
          helpText: 'Default radio button group',
        },
      },
      {
        key: 'inlineRadio',
        type: 'radio',
        label: 'Inline Radio Group',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
          { value: 'xlarge', label: 'X-Large' },
        ],
        props: {
          inline: true,
          helpText: 'Radio buttons displayed inline',
        },
      },
      {
        key: 'reverseRadio',
        type: 'radio',
        label: 'Reverse Layout Radio',
        options: [
          { value: 'left', label: 'Left Aligned' },
          { value: 'center', label: 'Center Aligned' },
          { value: 'right', label: 'Right Aligned' },
        ],
        props: {
          reverse: true,
          helpText: 'Radio buttons with labels on the left',
        },
      },
      {
        key: 'buttonGroupRadio',
        type: 'radio',
        label: 'Button Group Radio',
        options: [
          { value: 'angular', label: 'Angular' },
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue' },
          { value: 'svelte', label: 'Svelte' },
        ],
        props: {
          buttonGroup: true,
          helpText: 'Radio buttons styled as button group',
        },
      },
      {
        key: 'smallButtonGroup',
        type: 'radio',
        label: 'Small Button Group',
        options: [
          { value: 'xs', label: 'XS' },
          { value: 's', label: 'S' },
          { value: 'm', label: 'M' },
          { value: 'l', label: 'L' },
          { value: 'xl', label: 'XL' },
        ],
        props: {
          buttonGroup: true,
          buttonSize: 'sm',
          helpText: 'Small button group variant',
        },
      },
      {
        key: 'largeButtonGroup',
        type: 'radio',
        label: 'Large Button Group',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'maybe', label: 'Maybe' },
        ],
        props: {
          buttonGroup: true,
          buttonSize: 'lg',
          helpText: 'Large button group variant',
        },
      },
      {
        key: 'requiredRadio',
        type: 'radio',
        label: 'Required Radio Selection',
        options: [
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
        ],
        props: {
          helpText: 'This field is required',
        },
        required: true,
      },
    ],
  } as const satisfies FormConfig;
}
