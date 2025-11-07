import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, FormEvent } from '@ng-forge/dynamic-form';
import { nextPageButton, previousPageButton, submitButton } from '@ng-forge/dynamic-form-primeng';

@Component({
  selector: 'app-button-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
  template: `
    <h4>Button Examples</h4>
    <p>Showcasing all PrimeNG button types with various severities and styles.</p>
    <dynamic-form [config]="fields" [(value)]="formOutput" (submitted)="onSubmit($event)" />
    <h4>Form Data:</h4>
    <pre>{{ formOutput() | json }}</pre>
    <h4>Event Log:</h4>
    <pre>{{ eventLog() | json }}</pre>
  `,
})
export class ButtonDemoComponent {
  formOutput = signal({});
  eventLog = signal<string[]>([]);

  onSubmit(event: unknown): void {
    console.log('Form submitted!', event);
    this.eventLog.update((log) => [...log, 'Form submitted']);
  }

  onNext(event: FormEvent): void {
    console.log('Next clicked!', event);
    this.eventLog.update((log) => [...log, 'Next page']);
  }

  onPrevious(event: FormEvent): void {
    console.log('Previous clicked!', event);
    this.eventLog.update((log) => [...log, 'Previous page']);
  }

  onCustomAction(event: FormEvent): void {
    console.log('Custom action!', event);
    this.eventLog.update((log) => [...log, 'Custom action triggered']);
  }

  fields: FormConfig = {
    fields: [
      // Input field for demonstration
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        props: {
          type: 'email',
          placeholder: 'user@example.com',
          variant: 'outlined',
        },
        required: true,
        email: true,
      },

      // Submit Button - Primary severity
      submitButton({
        key: 'submitPrimary',
        label: 'Submit (Primary)',
        props: {
          severity: 'primary', // Severity options: primary, secondary, success, info, warning, danger, help, contrast
        },
      }),

      // Submit Button - Success severity
      submitButton({
        key: 'submitSuccess',
        label: 'Submit (Success)',
        props: {
          severity: 'success',
          icon: 'pi pi-check', // PrimeIcons
          iconPos: 'left', // Icon position: left, right, top, bottom
        },
      }),

      // Submit Button - Outlined style
      submitButton({
        key: 'submitOutlined',
        label: 'Submit (Outlined)',
        props: {
          severity: 'secondary',
          outlined: true, // Outlined button style
        },
      }),

      // Submit Button - Text style
      submitButton({
        key: 'submitText',
        label: 'Submit (Text)',
        props: {
          severity: 'info',
          text: true, // Text-only button style
        },
      }),

      // Submit Button - Raised style
      submitButton({
        key: 'submitRaised',
        label: 'Submit (Raised)',
        props: {
          severity: 'warn',
          raised: true, // Raised button style with shadow
        },
      }),

      // Submit Button - Rounded style
      submitButton({
        key: 'submitRounded',
        label: 'Submit (Rounded)',
        props: {
          severity: 'danger',
          rounded: true, // Rounded button style
          icon: 'pi pi-trash',
          iconPos: 'right',
        },
      }),

      // Next Page Button
      nextPageButton({
        key: 'nextPage',
        label: 'Next',
        props: {
          severity: 'primary',
          icon: 'pi pi-arrow-right',
          iconPos: 'right',
        },
      }),

      // Previous Page Button
      previousPageButton({
        key: 'previousPage',
        label: 'Previous',
        props: {
          severity: 'secondary',
          icon: 'pi pi-arrow-left',
          iconPos: 'left',
          outlined: true,
        },
      }),

      // Custom Action Button
      // actionButton({
      //   key: 'customAction',
      //   label: 'Custom Action',
      //   event: this.onCustomAction.bind(this),
      //   props: {
      //     severity: 'help',
      //     icon: 'pi pi-cog',
      //     iconPos: 'left',
      //   },
      // }),

      // Button with all style combinations
      submitButton({
        key: 'submitCombo',
        label: 'Raised + Rounded',
        props: {
          severity: 'contrast',
          raised: true,
          rounded: true,
          icon: 'pi pi-send',
          iconPos: 'right',
        },
      }),
    ],
  };
}
