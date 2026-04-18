import { FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Demonstrates the `container` field type — a layout container that chains
 * wrapper components around its children without adding form nesting. Values
 * flatten to the parent form, just like rows and pages.
 *
 * Uses the built-in `css` wrapper (registered automatically by
 * `provideDynamicForm`) so the scenario works without custom wrapper
 * registration. Replace the wrapper with a custom `section` wrapper for
 * richer chrome.
 */
export const containerFieldConfig = {
  fields: [
    {
      key: 'contactSection',
      type: 'container',
      wrappers: [{ type: 'css', cssClasses: 'demo-field' }],
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          value: '',
          required: true,
        },
        {
          key: 'email',
          type: 'input',
          label: 'Email',
          value: '',
          required: true,
          email: true,
          props: { type: 'email' },
        },
      ],
    },
    {
      key: 'notes',
      type: 'input',
      label: 'Notes',
      value: '',
      props: { placeholder: 'Sits outside the container' },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;
