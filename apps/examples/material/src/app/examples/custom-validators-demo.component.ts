import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DynamicForm, type FormConfig, type CustomValidator } from '@ng-forge/dynamic-form';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'example-custom-validators-demo',
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
        <li>
          <strong>Cross-Field Validator:</strong> Password confirmation must match (uses params workaround due to Angular valueOf bug)
        </li>
        <li><strong>Built-in Validator:</strong> Email format validation</li>
      </ul>
      <p style="margin-top: 1rem; padding: 1rem; background-color: #fff3cd; border-left: 4px solid #ffc107;">
        <strong>Note:</strong> Angular Forms v21.0.0-rc.1 has a bug with <code>ctx.valueOf()</code> that causes "Invalid value used as weak
        map key" errors. This demo uses a workaround by passing a getter function in validator params instead of using
        <code>ctx.valueOf()</code>.
      </p>
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
export class CustomValidatorsDemoComponent {
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
        validators: [
          {
            type: 'custom',
            functionName: 'passwordMatch',
            params: { getPassword: () => this.formValue().password },
          },
        ],
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
   *
   * WORKAROUND: Uses params to access password value instead of ctx.valueOf()
   * due to Angular bug with WeakMap caching in valueOf implementation.
   *
   * Angular Forms v21.0.0-rc.1 has a bug in the FieldContext.valueOf() method
   * where it tries to use primitive values (strings) as WeakMap keys, which is
   * not allowed in JavaScript. This causes the error:
   * "TypeError: Invalid value used as weak map key"
   *
   * Location of bug: @angular/forms/fesm2022/signals.mjs lines 1145-1178
   * FieldNodeContext.resolve() uses WeakMap.set(target, resolver) where target
   * can be a string path, but WeakMaps only accept objects as keys.
   *
   * Workaround: Pass a getter function in params that returns the password value:
   * params: { getPassword: () => this.formValue().password }
   */
  private createPasswordMatchValidator(): CustomValidator {
    return (ctx, params) => {
      const confirmPassword = ctx.value() as string;
      // Call the getPassword function from params
      // Type assertion needed because params is untyped
      const password = (params as any)?.getPassword?.() as string;

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
