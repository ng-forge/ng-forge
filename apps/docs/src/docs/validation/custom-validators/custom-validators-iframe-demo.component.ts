import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'custom-validators-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="expression-validators-demo" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomValidatorsIframeDemoComponent {
  code = `{
  defaultValidationMessages: {
    required: 'This field is required',
    passwordMismatch: 'Passwords must match',
    endDateBeforeStart: 'End date must be after start date',
    ageOutOfRange: 'Age must be within the specified range',
    noSpaces: 'Spaces are not allowed',
  },
  fields: [
    // Expression-based validators group
    {
      type: 'group',
      key: 'expressionExamples',
      fields: [
        {
          key: 'password',
          type: 'input',
          label: 'Password',
          required: true,
          minLength: 8,
          props: { type: 'password' },
        },
        {
          key: 'confirmPassword',
          type: 'input',
          label: 'Confirm Password',
          required: true,
          validators: [{
            type: 'custom',
            expression: 'fieldValue === formValue.password',
            kind: 'passwordMismatch',
          }],
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
          validators: [{
            type: 'custom',
            expression: '!fieldValue || !formValue.startDate || new Date(fieldValue) > new Date(formValue.startDate)',
            kind: 'endDateBeforeStart',
          }],
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
          required: true,
          props: { type: 'number' },
          validators: [{
            type: 'custom',
            expression: 'fieldValue >= formValue.minAge && fieldValue <= formValue.maxAge',
            kind: 'ageOutOfRange',
          }],
        },
      ],
    },
    // Function-based validator group
    {
      type: 'group',
      key: 'functionExample',
      fields: [
        {
          key: 'nickname',
          type: 'input',
          label: 'Nickname (no spaces allowed)',
          required: true,
          validators: [{ type: 'custom', functionName: 'noSpaces' }],
          validationMessages: { noSpaces: 'Spaces are not allowed in nicknames' },
        },
      ],
    },
    {
      type: 'submit',
      key: 'submit',
      label: 'Submit Form',
      props: { color: 'primary' },
    },
  ],
  customFnConfig: {
    validators: { noSpaces }, // Register function-based validator
  },
}`;
}
