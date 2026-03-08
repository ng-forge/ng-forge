import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type CustomValidator, DynamicForm, type FormConfig } from '@ng-forge/dynamic-forms';
import { JsonPipe } from '@angular/common';

// Example of a function-based validator for comparison
const noSpaces: CustomValidator = (ctx) => {
  const value = ctx.value();
  if (typeof value === 'string' && value.includes(' ')) {
    return { kind: 'noSpaces' };
  }
  return null;
};

@Component({
  selector: 'example-expression-validators-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
  template: `
    <div class="demo-section">
      <h3>Expression-Based Custom Validators</h3>
      <p>Compare expression-based (inline) vs function-based (registered) validators:</p>

      <form [dynamic-form]="config" [(value)]="formValue" (submitted)="onSubmit($event)"></form>

      <div class="example-result">
        <h4>Form Data:</h4>
        <pre>{{ formValue() | json }}</pre>

        @if (submitMessage()) {
          <div class="submit-success">{{ submitMessage() }}</div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .demo-section {
        padding: 20px;
      }

      .example-result {
        margin-top: 20px;
        padding: 16px;
        background: #f5f5f5;
        border-radius: 4px;
      }

      .example-result h4 {
        margin-top: 0;
        margin-bottom: 12px;
      }

      .example-result pre {
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      .submit-success {
        margin-top: 16px;
        padding: 12px;
        background: #4caf50;
        color: white;
        border-radius: 4px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExpressionValidatorsDemoComponent {
  formValue = signal({
    // Expression-based examples
    username: '',
    password: '',
    confirmPassword: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    minAge: '18',
    maxAge: '65',
    age: '',

    // Function-based example
    nickname: '',
  });

  submitMessage = signal('');

  config: FormConfig = {
    defaultValidationMessages: {
      required: 'This field is required',
      passwordMismatch: 'Passwords must match',
      endDateBeforeStart: 'End date must be after start date',
      ageOutOfRange: 'Age must be within the specified range',
      noSpaces: 'Spaces are not allowed',
    },
    fields: [
      {
        type: 'group',
        key: 'expressionExamples',
        fields: [
          {
            key: 'password',
            type: 'input',
            label: 'Password',
            value: '',
            required: true,
            minLength: 8,
            props: { type: 'password' },
          },
          {
            key: 'confirmPassword',
            type: 'input',
            label: 'Confirm Password',
            value: '',
            required: true,
            validators: [
              {
                type: 'custom',
                expression: 'fieldValue === formValue.password',
                kind: 'passwordMismatch',
              },
            ],
            // Falls back to defaultValidationMessages.passwordMismatch
            props: { type: 'password' },
          },
          {
            key: 'startDate',
            type: 'datepicker',
            label: 'Start Date',
            required: true,
          },
          {
            key: 'endDate',
            type: 'datepicker',
            label: 'End Date',
            required: true,
            validators: [
              {
                type: 'custom',
                expression: '!fieldValue || !formValue.startDate || new Date(fieldValue) > new Date(formValue.startDate)',
                kind: 'endDateBeforeStart',
              },
            ],
            validationMessages: {
              endDateBeforeStart: 'End date must be after start date',
            },
          },
          {
            key: 'minAge',
            type: 'input',
            label: 'Minimum Age',
            value: 18,
            required: true,
            props: { type: 'number' },
          },
          {
            key: 'maxAge',
            type: 'input',
            label: 'Maximum Age',
            value: 65,
            required: true,
            props: { type: 'number' },
          },
          {
            key: 'age',
            type: 'input',
            label: 'Your Age',
            value: undefined,
            required: true,
            props: { type: 'number' },
            validators: [
              {
                type: 'custom',
                expression: 'fieldValue >= formValue.minAge && fieldValue <= formValue.maxAge',
                kind: 'ageOutOfRange',
              },
            ],
            // Falls back to defaultValidationMessages.ageOutOfRange
          },
        ],
      },
      {
        type: 'group',
        key: 'functionExample',
        fields: [
          {
            key: 'nickname',
            type: 'input',
            label: 'Nickname (no spaces allowed)',
            value: '',
            required: true,
            validators: [
              {
                type: 'custom',
                functionName: 'noSpaces',
              },
            ],
            validationMessages: {
              noSpaces: 'Spaces are not allowed in nicknames',
            },
          },
        ],
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Submit Form',
        props: {
          color: 'primary',
        },
      },
    ],
    customFnConfig: {
      validators: {
        noSpaces, // Register function-based validator
      },
    },
  };

  onSubmit(value: unknown) {
    console.log('Form submitted:', value);
    this.submitMessage.set('✓ Form submitted successfully! Check console for details.');
    setTimeout(() => this.submitMessage.set(''), 3000);
  }
}
