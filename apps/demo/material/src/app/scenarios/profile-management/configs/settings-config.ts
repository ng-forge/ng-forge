import { FormConfig } from '@ng-forge/dynamic-form';

export const settingsConfig = {
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'Account Settings',
      props: {
        elementType: 'h2',
      },
      col: 12,
    },
    {
      key: 'description',
      type: 'text',
      label: 'Manage your account security and privacy settings.',
      col: 12,
    },
    {
      key: 'security',
      type: 'group',
      label: 'Security Settings',
      fields: [
        {
          key: 'currentPassword',
          type: 'input',
          label: 'Current Password',
          props: {
            type: 'password',
            placeholder: 'Enter current password',
          },
          col: 12,
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
          col: 6,
        },
        {
          key: 'confirmNewPassword',
          type: 'input',
          label: 'Confirm New Password',
          props: {
            type: 'password',
            placeholder: 'Confirm new password',
          },
          minLength: 8,
          col: 6,
        },
        {
          key: 'twoFactorAuth',
          type: 'checkbox',
          label: 'Enable two-factor authentication',
          defaultValue: true,
          col: 12,
        },
        {
          key: 'loginNotifications',
          type: 'checkbox',
          label: 'Send email notifications for new logins',
          defaultValue: true,
          col: 12,
        },
      ],
      col: 12,
    },
    {
      key: 'privacy',
      type: 'group',
      label: 'Privacy Settings',
      fields: [
        {
          key: 'profileVisibility',
          type: 'radio',
          label: 'Profile Visibility',
          options: [
            { value: 'public', label: 'Public - Anyone can see your profile' },
            { value: 'private', label: 'Private - Only you can see your profile' },
            { value: 'friends', label: 'Friends only - Only friends can see your profile' },
          ],
          defaultValue: 'private',
          required: true,
          col: 12,
        },
        {
          key: 'searchable',
          type: 'checkbox',
          label: 'Allow search engines to index my profile',
          defaultValue: false,
          col: 12,
        },
        {
          key: 'dataSharing',
          type: 'multi-checkbox',
          label: 'Data Sharing Permissions',
          options: [
            { value: 'analytics', label: 'Share anonymous usage analytics' },
            { value: 'partners', label: 'Share data with trusted partners' },
            { value: 'research', label: 'Participate in research studies' },
          ],
          defaultValue: ['analytics'],
          col: 12,
        },
      ],
      col: 12,
    },
    {
      key: 'account',
      type: 'group',
      label: 'Account Management',
      fields: [
        {
          key: 'timezone',
          type: 'select',
          label: 'Timezone',
          options: [
            { value: 'utc', label: 'UTC' },
            { value: 'est', label: 'Eastern Time (EST)' },
            { value: 'cst', label: 'Central Time (CST)' },
            { value: 'mst', label: 'Mountain Time (MST)' },
            { value: 'pst', label: 'Pacific Time (PST)' },
          ],
          defaultValue: 'pst',
          required: true,
          col: 6,
        },
        {
          key: 'language',
          type: 'select',
          label: 'Language',
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
          ],
          defaultValue: 'en',
          required: true,
          col: 6,
        },
        {
          key: 'autoSave',
          type: 'checkbox',
          label: 'Automatically save changes',
          defaultValue: true,
          col: 12,
        },
      ],
      col: 12,
    },
    {
      key: 'actions',
      type: 'row',
      fields: [
        {
          key: 'exportData',
          type: 'button',
          label: 'Export My Data',
          props: {
            type: 'button',
            className: 'secondary-button',
          },
          col: 4,
        },
        {
          key: 'deactivateAccount',
          type: 'button',
          label: 'Deactivate Account',
          props: {
            type: 'button',
            className: 'danger-button',
          },
          col: 4,
        },
        {
          key: 'saveSettings',
          type: 'button',
          label: 'Save Settings',
          props: {
            type: 'submit',
          },
          col: 4,
        },
      ],
    },
  ],
} as const satisfies FormConfig;
