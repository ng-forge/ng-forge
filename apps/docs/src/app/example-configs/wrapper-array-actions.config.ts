import { FormConfig } from '@ng-forge/dynamic-forms';

/**
 * `arraySection` is a custom demo wrapper whose header hosts an Add button.
 * It reads the array key from `fieldInputs` and dispatches
 * `arrayEvent(key).append(itemTemplate)` on click — the consumer config just
 * lists wrappers and a template, no separate addArrayItem field needed.
 */
const tagItemTemplate = [
  {
    key: 'value',
    type: 'input',
    label: 'Tag',
    required: true,
    minLength: 2,
    placeholder: 'Enter a tag',
  },
  {
    key: 'removeTag',
    type: 'removeArrayItem',
    label: 'Remove',
    props: { color: 'warn' },
  },
] as const;

export const wrapperArrayActionsConfig: FormConfig = {
  fields: [
    {
      key: 'tags',
      type: 'array',
      wrappers: [
        {
          type: 'arraySection',
          title: 'Tags',
          addLabel: 'Add tag',
          itemTemplate: tagItemTemplate,
        },
      ],
      fields: [
        [
          {
            key: 'value',
            type: 'input',
            label: 'Tag',
            required: true,
            minLength: 2,
            placeholder: 'Enter a tag',
            value: 'angular',
          },
          {
            key: 'removeTag',
            type: 'removeArrayItem',
            label: 'Remove',
            props: { color: 'warn' },
          },
        ],
        [
          {
            key: 'value',
            type: 'input',
            label: 'Tag',
            required: true,
            minLength: 2,
            placeholder: 'Enter a tag',
            value: 'forms',
          },
          {
            key: 'removeTag',
            type: 'removeArrayItem',
            label: 'Remove',
            props: { color: 'warn' },
          },
        ],
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Save',
    },
  ],
};
