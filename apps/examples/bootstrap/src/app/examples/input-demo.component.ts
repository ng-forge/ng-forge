import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'bs-example-input-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
  template: `
    <dynamic-form [config]="config" (submit)="onSubmit($event)" />
    @if (submittedData) {
    <div class="example-result">
      <h4>Submitted Data:</h4>
      <pre>{{ submittedData | json }}</pre>
    </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDemoComponent {
  submittedData: unknown = null;

  config: FormConfig = {
    fields: [
      {
        key: 'email',
        type: 'input',
        value: '',
        label: 'Email Address',
        required: true,
        email: true,
        props: {
          type: 'email',
          placeholder: 'Enter your email',
          helpText: 'We will never share your email with anyone',
        },
      },
      {
        key: 'username',
        type: 'input',
        value: '',
        label: 'Username',
        required: true,
        minLength: 3,
        props: {
          placeholder: 'Choose a username',
          floatingLabel: true,
          helpText: 'At least 3 characters',
        },
      },
      {
        key: 'password',
        type: 'input',
        value: '',
        label: 'Password',
        required: true,
        minLength: 8,
        props: {
          type: 'password',
          placeholder: 'Enter password',
          size: 'lg',
          helpText: 'Must be at least 8 characters',
        },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Submit',
        props: {
          variant: 'primary',
        },
      },
    ],
  } as const satisfies FormConfig;

  onSubmit(data: unknown) {
    this.submittedData = data;
  }
}
