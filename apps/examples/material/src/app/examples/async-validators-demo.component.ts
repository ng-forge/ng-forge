import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DynamicForm, type FormConfig, type CustomValidator } from '@ng-forge/dynamic-form';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'example-async-validators-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
  template: `
    <div style="margin-bottom: 2rem;">
      <h2>Custom Validation Demo</h2>
      <p>This example demonstrates custom validators with Angular Signal Forms:</p>
      <ul>
        <li><strong>Sync Validator:</strong> Username format validation (no spaces, min 3 chars)</li>
        <li><strong>Cross-Field Validator:</strong> Password confirmation must match</li>
        <li><strong>Email Validation:</strong> Built-in email format validation</li>
      </ul>
      <p><em>Note: Async and HTTP validator examples are coming soon!</em></p>
    </div>

    <dynamic-form [config]="config" [(value)]="formValue" (submitted)="onSubmit($event)" />

    @if (submitMessage()) {
    <div
      class="success-message"
      style="margin-top: 2rem; padding: 1.5rem; background-color: #4caf50; color: white; border-radius: 4px; text-align: center;"
    >
      {{ submitMessage() }}
    </div>
    }

    <div class="example-result" style="margin-top: 2rem;">
      <h4>Form Data:</h4>
      <pre style="max-height: 400px; overflow-y: auto;">{{ formValue() | json }}</pre>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsyncValidatorsDemoComponent {
  formValue = signal({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  submitMessage = signal<string>('');

  config: FormConfig = {
    defaultValidationMessages: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      usernameFormat: 'Username must be at least 3 characters and contain no spaces',
      usernameTaken: 'This username is already taken',
      invalidEmailDomain: 'This email domain is not allowed',
      passwordMismatch: 'Passwords do not match',
    },
    signalFormsConfig: {
      // SYNC VALIDATORS
      validators: {
        usernameFormat: this.createUsernameFormatValidator(),
        passwordMatch: this.createPasswordMatchValidator(),
      },
    },
    fields: [
      {
        key: 'username',
        type: 'input',
        label: 'Username',
        required: true,
        props: {
          appearance: 'outline',
          hint: 'Must be at least 3 characters with no spaces',
        },
        validators: [{ type: 'custom', functionName: 'usernameFormat' }],
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        required: true,
        email: true,
        props: {
          type: 'email',
          appearance: 'outline',
        },
      },
      {
        key: 'password',
        type: 'input',
        label: 'Password',
        required: true,
        props: {
          type: 'password',
          appearance: 'outline',
        },
      },
      {
        key: 'confirmPassword',
        type: 'input',
        label: 'Confirm Password',
        required: true,
        props: {
          type: 'password',
          appearance: 'outline',
        },
        validators: [{ type: 'custom', functionName: 'passwordMatch' }],
      },
      {
        type: 'button',
        key: 'submit',
        label: 'Register',
        props: {
          color: 'primary',
          type: 'submit',
        },
      },
    ],
  };

  /**
   * SYNC VALIDATOR: Username format validation
   * Uses FieldContext API to access current value
   */
  private createUsernameFormatValidator(): CustomValidator {
    return (ctx) => {
      const username = ctx.value() as string;

      if (!username) {
        return null; // Let required validator handle empty case
      }

      // Check for spaces
      if (username.includes(' ')) {
        return { kind: 'usernameFormat' };
      }

      // Check minimum length
      if (username.length < 3) {
        return { kind: 'usernameFormat' };
      }

      return null;
    };
  }

  /**
   * SYNC VALIDATOR: Cross-field password match validation
   * Uses ctx.valueOf() to access other field values (public API)
   */
  private createPasswordMatchValidator(): CustomValidator {
    return (ctx) => {
      const confirmPassword = ctx.value() as string;
      const password = ctx.valueOf('password' as any) as string;

      if (!confirmPassword || !password) {
        return null; // Let required validator handle empty case
      }

      if (password !== confirmPassword) {
        return { kind: 'passwordMismatch' };
      }

      return null;
    };
  }

  onSubmit(value: unknown) {
    console.log('Form submitted:', value);
    this.submitMessage.set('✓ Registration successful! All validators passed.');

    // Clear message after 5 seconds
    setTimeout(() => {
      this.submitMessage.set('');
    }, 5000);
  }
}
