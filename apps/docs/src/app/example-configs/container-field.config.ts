import { FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Demonstrates the `container` field type.
 *
 * Two stacked containers — a Profile section and a Contact section — each
 * carrying a `section` wrapper that renders a titled card. The `notes` input
 * sits outside either container so the reader can see that containers are
 * purely visual: the emitted form value is flat, with `firstName`, `email`,
 * `notes` etc. all at the top level (no `profileSection` / `contactSection`
 * keys).
 *
 * The `section` wrapper comes from the docs sandbox adapters (see
 * `internal/examples-shared-ui/src/lib/demo-wrappers/section-wrapper.component.ts`);
 * the `css` wrapper used in the prebuilt docs would be invisible here and
 * wouldn't communicate what containers do.
 */
export const containerFieldConfig = {
  fields: [
    {
      key: 'profileSection',
      type: 'container',
      wrappers: [{ type: 'section', title: 'Profile' }],
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First name',
          value: '',
          required: true,
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last name',
          value: '',
          required: true,
        },
      ],
    },
    {
      key: 'contactSection',
      type: 'container',
      wrappers: [{ type: 'section', title: 'Contact' }],
      fields: [
        {
          key: 'email',
          type: 'input',
          label: 'Email',
          value: '',
          required: true,
          email: true,
          props: { type: 'email' },
        },
        {
          key: 'phone',
          type: 'input',
          label: 'Phone',
          value: '',
        },
      ],
    },
    {
      key: 'notes',
      type: 'input',
      label: 'Notes (outside any container)',
      value: '',
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Save',
    },
  ],
} as const satisfies FormConfig;
