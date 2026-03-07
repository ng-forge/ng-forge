import { FieldTree, validateTree } from '@angular/forms/signals';
import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

interface PasswordForm {
  password: string;
  confirmPassword: string;
}

/**
 * Form configuration demonstrating Angular schema callback validation
 * for password confirmation. Uses raw Angular schema callback without any wrapper.
 */
const config = {
  schema: (path) => {
    validateTree(path, (ctx) => {
      const value = ctx.value() as PasswordForm;
      if (value.password && value.confirmPassword && value.password !== value.confirmPassword) {
        const fieldTree = ctx.fieldTreeOf(path) as FieldTree<PasswordForm>;
        return [{ kind: 'passwordMismatch', fieldTree: fieldTree.confirmPassword }];
      }
      return null;
    });
  },
  fields: [
    {
      key: 'password',
      type: 'input',
      label: 'Password',
      required: true,
      props: { type: 'password' },
      col: 12,
    },
    {
      key: 'confirmPassword',
      type: 'input',
      label: 'Confirm Password',
      required: true,
      props: { type: 'password' },
      validationMessages: { passwordMismatch: 'Passwords must match' },
      col: 12,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Register',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const angularPasswordConfirmationScenario: TestScenario = {
  testId: 'angular-password-confirmation-test',
  title: 'Password Confirmation (Angular Schema)',
  description: 'Tests Angular schema callback for password confirmation using validateTree',
  config,
};
