import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'login-form-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="login" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormIframeDemoComponent {
  code = `{
  defaultValidationMessages: {
    required: 'This field is required',
    minLength: 'Must be at least {{requiredLength}} characters',
  },
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'Sign In',
      props: { elementType: 'h2' },
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email Address',
      required: true,
      email: true,
      validationMessages: { email: 'Please enter a valid email address' },
      props: {
        type: 'email',
        placeholder: 'your@email.com',
        hint: 'Enter the email associated with your account',
      },
    },
    {
      key: 'password',
      type: 'input',
      label: 'Password',
      required: true,
      minLength: 8,
      validationMessages: { required: 'Password is required' },
      props: { type: 'password', placeholder: 'Enter your password' },
    },
    {
      key: 'remember',
      type: 'checkbox',
      label: 'Remember me for 30 days',
    },
    {
      type: 'submit',
      key: 'submit',
      label: 'Sign In',
      props: { color: 'primary' },
    },
  ],
}`;
}
