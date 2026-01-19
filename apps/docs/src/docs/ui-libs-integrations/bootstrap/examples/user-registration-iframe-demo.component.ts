import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../app/components/example-iframe';

@Component({
  selector: 'bootstrap-user-registration-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="bootstrap" example="user-registration" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRegistrationIframeDemoComponent {
  code = `[
  {
    key: 'username',
    type: 'input',
    label: 'Username',
    required: true,
    props: {
      floatingLabel: true,
      size: 'lg',
      hint: 'Choose a unique username',
    },
  },
  {
    key: 'email',
    type: 'input',
    label: 'Email Address',
    required: true,
    email: true,
    props: {
      type: 'email',
      floatingLabel: true,
      hint: 'We will send a confirmation email',
    },
  },
  {
    key: 'password',
    type: 'input',
    label: 'Password',
    required: true,
    minLength: 8,
    props: {
      type: 'password',
      floatingLabel: true,
      hint: 'Minimum 8 characters',
    },
  },
  {
    key: 'plan',
    type: 'radio',
    label: 'Account Type',
    required: true,
    options: [
      { label: 'Free', value: 'free' },
      { label: 'Premium', value: 'premium' },
    ],
    props: {
      inline: true,
    },
  },
  {
    key: 'newsletter',
    type: 'toggle',
    label: 'Subscribe to newsletter',
    value: true,
    props: { switch: true },
  },
]`;
}
