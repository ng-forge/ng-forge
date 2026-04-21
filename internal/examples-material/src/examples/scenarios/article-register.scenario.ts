import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const articleRegisterScenario: ExampleScenario = {
  id: 'article-register',
  title: 'Register User',
  description: 'Generated from POST /users/register — email, password, bio with validators.',
  config: {
    defaultValidationMessages: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      minLength: 'Must be at least {{requiredLength}} characters',
      maxLength: 'Cannot exceed {{requiredLength}} characters',
    },
    fields: [
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        required: true,
        email: true,
        placeholder: 'user@example.com',
        props: {
          type: 'email',
        },
      },
      {
        key: 'password',
        type: 'input',
        label: 'Password',
        required: true,
        minLength: 8,
        placeholder: 'At least 8 characters',
        props: {
          type: 'password',
        },
      },
      {
        key: 'bio',
        type: 'textarea',
        label: 'Bio',
        maxLength: 500,
        placeholder: 'Tell us about yourself...',
        props: {
          hint: 'Optional — 500 characters max',
        },
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Register',
        props: { color: 'primary' },
      },
    ],
  } as const satisfies FormConfig,
};
