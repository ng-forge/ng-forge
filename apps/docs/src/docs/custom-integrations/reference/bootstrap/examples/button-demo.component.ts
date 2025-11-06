import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { submitButton, withBootstrapFields } from '@ng-forge/dynamic-form-bootstrap/no-augmentation';
import { BootstrapDesignContainer } from '../bootstrap.container';

@Component({
  selector: 'app-bs-button-demo',
  imports: [DynamicForm, JsonPipe, BootstrapDesignContainer],
  providers: [provideDynamicForm(...withBootstrapFields())],
  template: `
    <app-bootstrap-container>
      <h3>Bootstrap Button Examples</h3>
      <p>Demonstration of button variants, sizes, and styles.</p>
      <dynamic-form [config]="fields" [(value)]="formOutput" (submitted)="handleSubmit($event)" />
      <h4>Form Data:</h4>
      <pre>{{ formOutput() | json }}</pre>
      @if (lastSubmit()) {
        <h4>Last Submission:</h4>
        <pre>{{ lastSubmit() | json }}</pre>
      }
    </app-bootstrap-container>
  `,
})
export class BsButtonDemoComponent {
  formOutput = signal({});
  lastSubmit = signal<any>(null);

  handleSubmit(value: any): void {
    console.log('Form submitted:', value);
    this.lastSubmit.set({ timestamp: new Date().toISOString(), data: value });
  }

  fields = {
    fields: [
      // Standard Variants
      submitButton({
        key: 'primaryButton',
        label: 'Primary Button',
        props: {
          variant: 'primary',
        },
      }),
      submitButton({
        key: 'secondaryButton',
        label: 'Secondary Button',
        props: {
          variant: 'secondary',
        },
      }),
      submitButton({
        key: 'successButton',
        label: 'Success Button',
        props: {
          variant: 'success',
        },
      }),
      submitButton({
        key: 'dangerButton',
        label: 'Danger Button',
        props: {
          variant: 'danger',
        },
      }),
      submitButton({
        key: 'warningButton',
        label: 'Warning Button',
        props: {
          variant: 'warning',
        },
      }),
      submitButton({
        key: 'infoButton',
        label: 'Info Button',
        props: {
          variant: 'info',
        },
      }),
      submitButton({
        key: 'lightButton',
        label: 'Light Button',
        props: {
          variant: 'light',
        },
      }),
      submitButton({
        key: 'darkButton',
        label: 'Dark Button',
        props: {
          variant: 'dark',
        },
      }),
      submitButton({
        key: 'linkButton',
        label: 'Link Button',
        props: {
          variant: 'link',
        },
      }),

      // Outline Variants
      submitButton({
        key: 'outlinePrimary',
        label: 'Outline Primary',
        props: {
          variant: 'primary',
          outline: true,
        },
      }),
      submitButton({
        key: 'outlineSecondary',
        label: 'Outline Secondary',
        props: {
          variant: 'secondary',
          outline: true,
        },
      }),
      submitButton({
        key: 'outlineSuccess',
        label: 'Outline Success',
        props: {
          variant: 'success',
          outline: true,
        },
      }),
      submitButton({
        key: 'outlineDanger',
        label: 'Outline Danger',
        props: {
          variant: 'danger',
          outline: true,
        },
      }),

      // Sizes
      submitButton({
        key: 'smallButton',
        label: 'Small Button',
        props: {
          variant: 'primary',
          size: 'sm',
        },
      }),
      submitButton({
        key: 'normalButton',
        label: 'Normal Button',
        props: {
          variant: 'primary',
        },
      }),
      submitButton({
        key: 'largeButton',
        label: 'Large Button',
        props: {
          variant: 'primary',
          size: 'lg',
        },
      }),

      // Block Button
      submitButton({
        key: 'blockButton',
        label: 'Block Button',
        props: {
          variant: 'primary',
          block: true,
        },
      }),

      // Active State
      submitButton({
        key: 'activeButton',
        label: 'Active State Button',
        props: {
          variant: 'primary',
          active: true,
        },
      }),
    ],
  } as const satisfies FormConfig;
}
