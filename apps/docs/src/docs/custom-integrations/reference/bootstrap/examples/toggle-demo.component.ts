import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withBootstrapFields } from '@ng-forge/dynamic-form-bootstrap/no-augmentation';
import { BootstrapDesignContainer } from '../bootstrap.container';

@Component({
  selector: 'app-bs-toggle-demo',
  imports: [DynamicForm, JsonPipe, BootstrapDesignContainer],
  providers: [provideDynamicForm(...withBootstrapFields())],
  template: `
    <app-bootstrap-container>
      <h3>Bootstrap Toggle Examples</h3>
      <p>Demonstration of toggle switch fields with various sizes and layouts.</p>
      <dynamic-form [config]="fields" [(value)]="formOutput" />
      <h4>Form Data:</h4>
      <pre>{{ formOutput() | json }}</pre>
    </app-bootstrap-container>
  `,
})
export class BsToggleDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'basicToggle',
        type: 'toggle',
        label: 'Basic Toggle Switch',
        props: {
          helpText: 'Default toggle switch styling',
        },
      },
      {
        key: 'smallToggle',
        type: 'toggle',
        label: 'Small Toggle',
        props: {
          size: 'sm',
          helpText: 'Small size toggle switch',
        },
      },
      {
        key: 'largeToggle',
        type: 'toggle',
        label: 'Large Toggle',
        props: {
          size: 'lg',
          helpText: 'Large size toggle switch',
        },
      },
      {
        key: 'inlineToggle',
        type: 'toggle',
        label: 'Inline Toggle',
        props: {
          inline: true,
          helpText: 'Toggle with inline layout',
        },
      },
      {
        key: 'reverseToggle',
        type: 'toggle',
        label: 'Reverse Toggle',
        props: {
          reverse: true,
          helpText: 'Toggle with label on the left side',
        },
      },
      {
        key: 'smallReverseToggle',
        type: 'toggle',
        label: 'Small Reverse Toggle',
        props: {
          size: 'sm',
          reverse: true,
          helpText: 'Small toggle with reverse layout',
        },
      },
      {
        key: 'largeInlineToggle',
        type: 'toggle',
        label: 'Large Inline Toggle',
        props: {
          size: 'lg',
          inline: true,
          helpText: 'Large toggle with inline layout',
        },
      },
      {
        key: 'notificationsToggle',
        type: 'toggle',
        label: 'Enable Email Notifications',
        props: {
          helpText: 'Receive email updates about your account activity',
        },
      },
      {
        key: 'darkModeToggle',
        type: 'toggle',
        label: 'Dark Mode',
        props: {
          reverse: true,
          helpText: 'Toggle between light and dark theme',
        },
      },
    ],
  } as const satisfies FormConfig;
}
