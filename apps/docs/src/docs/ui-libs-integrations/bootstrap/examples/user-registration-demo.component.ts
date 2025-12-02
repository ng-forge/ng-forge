import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'bootstrap-user-registration-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="bootstrap" example="user-registration" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRegistrationDemoComponent {
  code = `[
  {
    key: 'username',
    type: 'input',
    label: 'Username',
    required: true,
    props: {
      floatingLabel: true,
      size: 'lg',
      helpText: 'Choose a unique username',
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
      helpText: 'We will send a confirmation email',
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
      helpText: 'Minimum 8 characters',
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
