import { FormConfig, SubmitEvent } from '@ng-forge/dynamic-form';

export const profileEditConfig = {
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'Edit Profile',
      props: {
        elementType: 'h2',
      },
      col: 12,
    },
    {
      key: 'description',
      type: 'text',
      label: 'Update your profile information below. Changes will be saved automatically.',
      col: 12,
    },
    {
      key: 'basicInfo',
      type: 'group',
      label: 'Basic Information',
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          props: {
            placeholder: 'Enter your first name',
            appearance: 'outline',
          },
          required: true,
          col: 6,
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          props: {
            placeholder: 'Enter your last name',
          },
          value: 'Doe',
          required: true,
          col: 6,
        },
        {
          key: 'email',
          type: 'input',
          label: 'Email Address',
          props: {
            type: 'email',
            placeholder: 'Enter your email address',
          },
          value: 'john.doe@example.com',
          email: true,
          required: true,
          col: 12,
        },
        {
          key: 'displayName',
          type: 'input',
          label: 'Display Name',
          props: {
            placeholder: 'How others see your name',
          },
          value: 'John D.',
          col: 6,
        },
        {
          key: 'title',
          type: 'input',
          label: 'Job Title',
          props: {
            placeholder: 'Your professional title',
          },
          value: 'Software Engineer',
          col: 6,
        },
      ],
      col: 12,
    },
    {
      key: 'contactInfo',
      type: 'group',
      label: 'Contact Information',
      fields: [
        {
          key: 'phone',
          type: 'input',
          label: 'Phone Number',
          props: {
            type: 'tel',
            placeholder: '+1 (555) 123-4567',
          },
          value: '+1 (555) 123-4567',
          col: 6,
        },
        {
          key: 'alternatePhone',
          type: 'input',
          label: 'Alternate Phone',
          props: {
            type: 'tel',
            placeholder: 'Optional alternate number',
          },
          col: 6,
        },
        {
          key: 'website',
          type: 'input',
          label: 'Website',
          props: {
            type: 'url',
            placeholder: 'https://yourwebsite.com',
          },
          value: 'https://johndoe.dev',
          col: 6,
        },
        {
          key: 'linkedin',
          type: 'input',
          label: 'LinkedIn Profile',
          props: {
            placeholder: 'LinkedIn profile URL',
          },
          value: 'https://linkedin.com/in/johndoe',
          col: 6,
        },
      ],
      col: 12,
    },
    {
      key: 'bio',
      type: 'group',
      label: 'About You',
      fields: [
        {
          key: 'biography',
          type: 'textarea',
          label: 'Biography',
          props: {
            placeholder: 'Tell us about yourself...',
            rows: 4,
          },
          value: 'Passionate software engineer with 5+ years of experience in web development and cloud technologies.',
          col: 12,
        },
        {
          key: 'skills',
          type: 'input',
          label: 'Skills (comma-separated)',
          props: {
            placeholder: 'JavaScript, TypeScript, Angular, React...',
          },
          value: 'JavaScript, TypeScript, Angular, Node.js, AWS',
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
          key: 'reset',
          type: 'button',
          label: 'Reset Changes',
          props: {
            type: 'button',
          },
          event: class ResetEvent {
            readonly type = 'reset' as const;
          },
          className: 'secondary-button',
          col: 6,
        },
        {
          key: 'saveProfile',
          type: 'submit',
          label: 'Save Profile',
          event: SubmitEvent,
          col: 6,
        },
      ],
    },
  ],
} as const satisfies FormConfig;
