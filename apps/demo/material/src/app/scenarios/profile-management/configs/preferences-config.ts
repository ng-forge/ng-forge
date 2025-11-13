import { FormConfig, SubmitEvent } from '@ng-forge/dynamic-form';

export const preferencesConfig = {
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'Preferences & Notifications',
      props: {
        elementType: 'h2',
      },
      col: 12,
    },
    {
      key: 'description',
      type: 'text',
      label: 'Customize your experience and notification preferences.',
      col: 12,
    },
    {
      key: 'notifications',
      type: 'group',
      label: 'Notification Preferences',
      fields: [
        {
          key: 'emailNotifications',
          type: 'multi-checkbox',
          label: 'Email Notifications',
          options: [
            { value: 'newsletter', label: 'Weekly newsletter' },
            { value: 'updates', label: 'Product updates' },
            { value: 'promotions', label: 'Promotions and offers' },
            { value: 'security', label: 'Security alerts' },
            { value: 'social', label: 'Social activity' },
          ],
          value: ['updates', 'security'],
          col: 12,
        },
        {
          key: 'pushNotifications',
          type: 'multi-checkbox',
          label: 'Push Notifications',
          options: [
            { value: 'messages', label: 'New messages' },
            { value: 'mentions', label: 'Mentions and replies' },
            { value: 'follow', label: 'New followers' },
            { value: 'reminders', label: 'Reminders' },
          ],
          value: ['messages', 'mentions'],
          col: 12,
        },
        {
          key: 'smsNotifications',
          type: 'checkbox',
          label: 'Enable SMS notifications for critical alerts',
          value: false,
          col: 12,
        },
        {
          key: 'notificationFrequency',
          type: 'radio',
          label: 'Notification Frequency',
          options: [
            { value: 'immediate', label: 'Immediate' },
            { value: 'hourly', label: 'Hourly digest' },
            { value: 'daily', label: 'Daily digest' },
            { value: 'weekly', label: 'Weekly digest' },
          ],
          value: 'daily',
          required: true,
          col: 12,
        },
      ],
      col: 12,
    },
    {
      key: 'appearance',
      type: 'group',
      label: 'Appearance & Display',
      fields: [
        {
          key: 'theme',
          type: 'radio',
          label: 'Theme',
          options: [
            { value: 'light', label: 'Light mode' },
            { value: 'dark', label: 'Dark mode' },
            { value: 'auto', label: 'Auto (system preference)' },
          ],
          value: 'auto',
          required: true,
          col: 12,
        },
        {
          key: 'fontSize',
          type: 'select',
          label: 'Font Size',
          options: [
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
            { value: 'extra-large', label: 'Extra Large' },
          ],
          value: 'medium',
          col: 6,
        },
        {
          key: 'density',
          type: 'select',
          label: 'Display Density',
          options: [
            { value: 'compact', label: 'Compact' },
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'spacious', label: 'Spacious' },
          ],
          value: 'comfortable',
          col: 6,
        },
        {
          key: 'animations',
          type: 'checkbox',
          label: 'Enable animations and transitions',
          value: true,
          col: 12,
        },
      ],
      col: 12,
    },
    {
      key: 'content',
      type: 'group',
      label: 'Content Preferences',
      fields: [
        {
          key: 'interests',
          type: 'multi-checkbox',
          label: 'Content Interests',
          options: [
            { value: 'technology', label: 'Technology' },
            { value: 'business', label: 'Business' },
            { value: 'science', label: 'Science' },
            { value: 'arts', label: 'Arts & Culture' },
            { value: 'sports', label: 'Sports' },
            { value: 'travel', label: 'Travel' },
            { value: 'food', label: 'Food & Cooking' },
          ],
          value: ['technology', 'business'],
          col: 12,
        },
        {
          key: 'contentFilter',
          type: 'radio',
          label: 'Content Filter',
          options: [
            { value: 'none', label: 'No filtering' },
            { value: 'mild', label: 'Filter explicit content' },
            { value: 'strict', label: 'Strict filtering' },
          ],
          value: 'mild',
          required: true,
          col: 12,
        },
        {
          key: 'autoplay',
          type: 'checkbox',
          label: 'Autoplay videos',
          value: false,
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
          key: 'resetDefaults',
          type: 'button',
          label: 'Reset to Defaults',
          props: {
            type: 'button',
          },
          event: class ResetDefaultsEvent {
            readonly type = 'reset-defaults' as const;
          },
          className: 'secondary-button',
          col: 6,
        },
        {
          key: 'savePreferences',
          type: 'submit',
          label: 'Save Preferences',
          event: SubmitEvent,
          col: 6,
        },
      ],
    },
  ],
} as const satisfies FormConfig;
