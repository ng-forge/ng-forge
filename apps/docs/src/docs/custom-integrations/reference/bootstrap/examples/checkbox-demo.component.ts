import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withBootstrapFields } from '@ng-forge/dynamic-form-bootstrap';
import { BootstrapDesignContainer } from '../bootstrap.container';

@Component({
  selector: 'app-bs-checkbox-demo',
  imports: [DynamicForm, JsonPipe, BootstrapDesignContainer],
  providers: [provideDynamicForm(...withBootstrapFields())],
  template: `
    <app-bootstrap-container>
      <h3>Bootstrap Checkbox Examples</h3>
      <p>Demonstration of checkbox fields with Bootstrap styling and variants.</p>
      <dynamic-form [config]="fields" [(value)]="formOutput" />
      <h4>Form Data:</h4>
      <pre>{{ formOutput() | json }}</pre>
    </app-bootstrap-container>
  `,
})
export class BsCheckboxDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'basicCheckbox',
        type: 'checkbox',
        label: 'Basic Checkbox',
        props: {
          helpText: 'Default checkbox styling',
        },
      },
      {
        key: 'switchCheckbox',
        type: 'checkbox',
        label: 'Switch Style Checkbox',
        props: {
          switch: true,
          helpText: 'Checkbox rendered as a switch toggle',
        },
      },
      {
        key: 'inlineCheckbox',
        type: 'checkbox',
        label: 'Inline Checkbox',
        props: {
          inline: true,
          helpText: 'Checkbox with inline layout',
        },
      },
      {
        key: 'reverseCheckbox',
        type: 'checkbox',
        label: 'Reverse Layout Checkbox',
        props: {
          reverse: true,
          helpText: 'Checkbox with label on the left side',
        },
      },
      {
        key: 'switchInline',
        type: 'checkbox',
        label: 'Inline Switch',
        props: {
          switch: true,
          inline: true,
          helpText: 'Switch with inline layout',
        },
      },
      {
        key: 'switchReverse',
        type: 'checkbox',
        label: 'Reverse Switch',
        props: {
          switch: true,
          reverse: true,
          helpText: 'Switch with reverse layout',
        },
      },
      {
        key: 'requiredCheckbox',
        type: 'checkbox',
        label: 'I agree to the Terms and Conditions',
        props: {
          helpText: 'This checkbox is required',
        },
        required: true,
      },
      {
        key: 'indeterminateCheckbox',
        type: 'checkbox',
        label: 'Indeterminate State Checkbox',
        props: {
          indeterminate: true,
          helpText: 'Checkbox with indeterminate state',
        },
      },
    ],
  } as const satisfies FormConfig;
}
