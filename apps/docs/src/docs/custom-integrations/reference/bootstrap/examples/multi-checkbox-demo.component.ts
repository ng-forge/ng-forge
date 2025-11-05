import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withBootstrapFields } from '@ng-forge/dynamic-form-bootstrap';
import { BootstrapDesignContainer } from '../bootstrap.container';

@Component({
  selector: 'app-bs-multi-checkbox-demo',
  imports: [DynamicForm, JsonPipe, BootstrapDesignContainer],
  providers: [provideDynamicForm(...withBootstrapFields())],
  template: `
    <app-bootstrap-container>
      <h3>Bootstrap Multi-Checkbox Examples</h3>
      <p>Demonstration of multiple checkbox selections with various styles.</p>
      <dynamic-form [config]="fields" [(value)]="formOutput" />
      <h4>Form Data:</h4>
      <pre>{{ formOutput() | json }}</pre>
    </app-bootstrap-container>
  `,
})
export class BsMultiCheckboxDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'basicMultiCheckbox',
        type: 'multi-checkbox',
        label: 'Select Technologies',
        options: [
          { value: 'typescript', label: 'TypeScript' },
          { value: 'javascript', label: 'JavaScript' },
          { value: 'html', label: 'HTML' },
          { value: 'css', label: 'CSS' },
        ],
        props: {
          helpText: 'Select all technologies you are familiar with',
        },
      },
      {
        key: 'inlineMultiCheckbox',
        type: 'multi-checkbox',
        label: 'Inline Multi-Checkbox',
        options: [
          { value: 'red', label: 'Red' },
          { value: 'green', label: 'Green' },
          { value: 'blue', label: 'Blue' },
          { value: 'yellow', label: 'Yellow' },
        ],
        props: {
          inline: true,
          helpText: 'Checkboxes displayed inline',
        },
      },
      {
        key: 'switchMultiCheckbox',
        type: 'multi-checkbox',
        label: 'Switch Style Multi-Checkbox',
        options: [
          { value: 'email', label: 'Email Notifications' },
          { value: 'sms', label: 'SMS Notifications' },
          { value: 'push', label: 'Push Notifications' },
          { value: 'desktop', label: 'Desktop Notifications' },
        ],
        props: {
          switch: true,
          helpText: 'Toggle notification preferences',
        },
      },
      {
        key: 'reverseMultiCheckbox',
        type: 'multi-checkbox',
        label: 'Reverse Layout Multi-Checkbox',
        options: [
          { value: 'monday', label: 'Monday' },
          { value: 'wednesday', label: 'Wednesday' },
          { value: 'friday', label: 'Friday' },
        ],
        props: {
          reverse: true,
          helpText: 'Select available days',
        },
      },
      {
        key: 'inlineSwitchMultiCheckbox',
        type: 'multi-checkbox',
        label: 'Inline Switch Multi-Checkbox',
        options: [
          { value: 'feature1', label: 'Feature 1' },
          { value: 'feature2', label: 'Feature 2' },
          { value: 'feature3', label: 'Feature 3' },
        ],
        props: {
          switch: true,
          inline: true,
          helpText: 'Enable or disable features',
        },
      },
      {
        key: 'requiredMultiCheckbox',
        type: 'multi-checkbox',
        label: 'Required Multi-Checkbox',
        options: [
          { value: 'terms', label: 'I agree to the Terms and Conditions' },
          { value: 'privacy', label: 'I agree to the Privacy Policy' },
          { value: 'marketing', label: 'I agree to receive marketing emails' },
        ],
        props: {
          helpText: 'At least one option must be selected',
        },
        required: true,
      },
    ],
  } as const satisfies FormConfig;
}
