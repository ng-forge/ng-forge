import { FormConfig } from '@ng-forge/dynamic-form';
import { FormResetEvent, FormClearEvent, SubmitEvent } from '@ng-forge/dynamic-form';

/**
 * Form configuration demonstrating reset and clear functionality.
 *
 * This configuration shows how to:
 * - Define fields with default values
 * - Add reset button that restores default values
 * - Add clear button that empties all fields
 */
export const formResetClearConfig = {
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'Form Reset & Clear Demo',
      props: {
        elementType: 'h2',
      },
      col: 12,
    },
    {
      key: 'description',
      type: 'text',
      label: 'This form demonstrates the reset and clear functionality. Fill in the fields, then try the Reset and Clear buttons.',
      col: 12,
    },
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      value: 'John',
      required: true,
      col: 6,
      props: {
        appearance: 'outline',
      },
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      value: 'Doe',
      required: true,
      col: 6,
      props: {
        appearance: 'outline',
      },
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      value: 'john.doe@example.com',
      required: true,
      col: 6,
      props: {
        appearance: 'outline',
        type: 'email',
      },
    },
    {
      key: 'phone',
      type: 'input',
      label: 'Phone',
      value: '+1-555-0123',
      col: 6,
      props: {
        appearance: 'outline',
      },
    },
    {
      key: 'country',
      type: 'select',
      label: 'Country',
      value: 'us',
      options: [
        { label: 'United States', value: 'us' },
        { label: 'Canada', value: 'ca' },
        { label: 'United Kingdom', value: 'uk' },
        { label: 'Germany', value: 'de' },
      ],
      col: 6,
      props: {
        appearance: 'outline',
      },
    },
    {
      key: 'subscribe',
      type: 'checkbox',
      label: 'Subscribe to newsletter',
      value: true,
      col: 6,
    },
    {
      key: 'reset-button',
      type: 'button',
      label: 'Reset to Defaults',
      event: FormResetEvent,
      col: 4,
      props: {
        type: 'button',
        color: 'accent',
      },
    },
    {
      key: 'clear-button',
      type: 'button',
      label: 'Clear All Fields',
      event: FormClearEvent,
      col: 4,
      props: {
        type: 'button',
        color: 'warn',
      },
    },
    {
      key: 'submit-button',
      type: 'button',
      label: 'Submit',
      event: SubmitEvent,
      col: 4,
      props: {
        type: 'submit',
        color: 'primary',
      },
    },
  ],
} satisfies FormConfig;
