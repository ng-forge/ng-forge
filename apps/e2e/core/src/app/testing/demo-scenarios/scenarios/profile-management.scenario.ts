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
      placeholder: 'Enter username',
    },
    {
      key: 'bio',
      type: 'textarea',
      label: 'Bio',
      placeholder: 'Tell us about yourself',
      props: {
        rows: 4,
      },
    },
    {
      key: 'currentPassword',
      type: 'input',
      label: 'Current Password',
      placeholder: 'Enter current password',
      props: {
        type: 'password',
      },
    },
    {
      key: 'newPassword',
      type: 'input',
      label: 'New Password',
      placeholder: 'Enter new password',
      props: {
        type: 'password',
      },
      minLength: 8,
    },
    {
      key: 'confirmNewPassword',
      type: 'input',
      label: 'Confirm New Password',
      placeholder: 'Confirm new password',
      props: {
        type: 'password',
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
