import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DynamicForm, type FormConfig, type CustomValidator } from '@ng-forge/dynamic-form';
import { JsonPipe } from '@angular/common';

// Example of a function-based validator for comparison
const noSpaces: CustomValidator<string> = (ctx) => {
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

      <dynamic-form [config]="config" [(value)]="formValue" (submitted)="onSubmit($event)" />

      <div class="example-result">
        <h4>Form Data:</h4>
        <pre>{{ formValue() | json }}</pre>

        @if (submitMessage()) {
          <div class="submit-success">{{ submitMessage() }}</div>
        }
      </div>
    </div>
  `,
  styles: [`
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpressionValidatorsDemoComponent {
  formValue = signal({
    // Expression-based examples
    username: '',
    password: '',
    confirmPassword: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    minAge: 18,
    maxAge: 65,
    age: null as number | null,

    // Function-based example
    nickname: '',
  });

  submitMessage = signal('');

  config: FormConfig = {
    defaultValidationMessages: {
      passwordMismatch: 'Passwords must match',
      endDateBeforeStart: 'End date must be after start date',
      ageOutOfRange: 'Age must be between {{minAge}} and {{maxAge}}',
      noSpaces: 'Spaces are not allowed',
    },
    fields: [
      {
        type: 'group',
        key: 'expressionExamples',
        label: '1. Expression-Based Validators',
        description: 'Simple inline expressions - no function registration needed',
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
            props: { type: 'password' },
            validationMessages: {
              passwordMismatch: 'Passwords must match',
            },
          },
          {
            key: 'startDate',
            type: 'datepicker',
            label: 'Start Date',
            value: null,
            required: true,
          },
          {
            key: 'endDate',
            type: 'datepicker',
            label: 'End Date',
            value: null,
            required: true,
            validators: [
              {
                type: 'custom',
                expression: 'fieldValue && formValue.startDate ? new Date(fieldValue) > new Date(formValue.startDate) : true',
                kind: 'endDateBeforeStart',
              },
            ],
            validationMessages: {
              endDateBeforeStart: 'End date must be after start date',
            },
          },
          {
            type: 'row',
            key: 'ageRange',
            label: 'Age Range',
            fields: [
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
            ],
          },
          {
            key: 'age',
            type: 'input',
            label: 'Your Age',
            value: null,
            required: true,
            props: { type: 'number' },
            validators: [
              {
                type: 'custom',
                expression: 'fieldValue >= formValue.minAge && fieldValue <= formValue.maxAge',
                kind: 'ageOutOfRange',
              },
            ],
            validationMessages: {
              ageOutOfRange: 'Age must be between the min and max range',
            },
          },
        ],
      },
      {
        type: 'group',
        key: 'functionExample',
        label: '2. Function-Based Validator (for comparison)',
        description: 'Registered reusable function - best for complex logic',
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
        type: 'button',
        key: 'submit',
        label: 'Submit Form',
        props: {
          type: 'submit',
          color: 'primary',
        },
      },
    ],
    signalFormsConfig: {
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
