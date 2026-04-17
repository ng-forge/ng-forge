import { FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Wraps an array of tags with the demo `section` wrapper so the header and
 * add-button sit inside a framed card. Because wrappers have access to the
 * field they decorate, they're a natural home for chrome around arrays —
 * titles, counts, toolbar buttons — without forcing the array config to
 * carry presentational concerns.
 *
 * The add/remove buttons themselves are regular `addArrayItem` /
 * `removeArrayItem` fields — the wrapper just supplies the framing.
 */
const tagItemTemplate = {
  key: 'tag',
  type: 'row',
  fields: [
    {
      key: 'value',
      type: 'input',
      label: 'Tag',
      required: true,
      minLength: 2,
      props: { placeholder: 'Enter a tag' },
    },
    {
      key: 'removeTag',
      type: 'removeArrayItem',
      label: 'Remove',
      props: { color: 'warn' },
    },
  ],
} as const;

export const wrapperArrayActionsConfig: FormConfig = {
  fields: [
    {
      key: 'tags',
      type: 'array',
      wrappers: [{ type: 'section', title: 'Tags' }],
      fields: [
        [
          {
            key: 'tag',
            type: 'row',
            fields: [
              {
                key: 'value',
                type: 'input',
                label: 'Tag',
                required: true,
                minLength: 2,
                props: { placeholder: 'Enter a tag' },
                value: 'angular',
              },
              {
                key: 'removeTag',
                type: 'removeArrayItem',
                label: 'Remove',
                props: { color: 'warn' },
              },
            ],
          },
        ],
        [
          {
            key: 'tag',
            type: 'row',
            fields: [
              {
                key: 'value',
                type: 'input',
                label: 'Tag',
                required: true,
                minLength: 2,
                props: { placeholder: 'Enter a tag' },
                value: 'forms',
              },
              {
                key: 'removeTag',
                type: 'removeArrayItem',
                label: 'Remove',
                props: { color: 'warn' },
              },
            ],
          },
        ],
      ],
    },
    {
      key: 'addTagButton',
      type: 'addArrayItem',
      label: 'Add tag',
      arrayKey: 'tags',
      template: [tagItemTemplate],
      wrappers: [{ type: 'section', title: 'Actions' }],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Save',
    },
  ],
};
