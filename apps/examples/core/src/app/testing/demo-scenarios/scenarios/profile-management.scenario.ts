import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    minLength: 'Must be at least {{requiredLength}} characters',
  },
  fields: [
    {
      key: 'username',
      type: 'input',
      label: 'Username',
      required: true,
      props: {
        placeholder: 'Enter username',
      },
    },
    {
      key: 'bio',
      type: 'textarea',
      label: 'Bio',
      props: {
        placeholder: 'Tell us about yourself',
        rows: 4,
      },
    },
    {
      key: 'currentPassword',
      type: 'input',
      label: 'Current Password',
      props: {
        type: 'password',
        placeholder: 'Enter current password',
      },
    },
    {
      key: 'newPassword',
      type: 'input',
      label: 'New Password',
      props: {
        type: 'password',
        placeholder: 'Enter new password',
      },
      minLength: 8,
    },
    {
      key: 'confirmNewPassword',
      type: 'input',
      label: 'Confirm New Password',
      props: {
        type: 'password',
        placeholder: 'Confirm new password',
      },
    },
    {
      key: 'newsletter',
      type: 'checkbox',
      label: 'Subscribe to newsletter',
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Update Profile',
    },
  ],
} as const satisfies FormConfig;

export const profileManagementScenario: TestScenario = {
  testId: 'profile-management',
  title: 'Profile Management',
  description: 'Tests a profile management form with password change and optional fields',
  config,
};
