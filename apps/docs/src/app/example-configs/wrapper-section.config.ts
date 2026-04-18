import { FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Demonstrates the wrappers system.
 *
 * - `contact` field wears a custom `section` wrapper (see DEMO_WRAPPERS in
 *   @ng-forge/examples-shared-ui) with a title — shows a single field being
 *   decorated without touching the field's own component.
 * - `defaultWrappers` at the form level applies the `css` wrapper (a built-in
 *   wrapper registered by `provideDynamicForm`) to every other field, adding a
 *   shared style class.
 * - `notes` opts out of the form defaults by setting `wrappers: null`.
 */
export const wrapperSectionConfig: FormConfig = {
  defaultWrappers: [{ type: 'css', cssClasses: 'demo-field' }],
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'Wrappers in action',
      props: { elementType: 'h3' },
      wrappers: null,
    },
    {
      key: 'contact',
      type: 'input',
      label: 'Contact name',
      value: '',
      required: true,
      props: { placeholder: 'Ada Lovelace' },
      wrappers: [{ type: 'section', title: 'Primary contact' }],
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      value: '',
      required: true,
      email: true,
      props: { type: 'email', placeholder: 'ada@example.com' },
    },
    {
      key: 'notes',
      type: 'input',
      label: 'Internal notes (defaults opted out)',
      value: '',
      wrappers: null,
      props: { placeholder: 'wrappers: null skips the form-level defaults' },
    },
  ],
};
