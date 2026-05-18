import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Issue #401: same leaf key (`name`) inside two different group containers,
 * plus identical button keys (`previous`, `submit`) repeated on each page.
 *
 * Two independent things must hold for this scenario to render at all:
 *   - The validator scopes keys by group ancestor — `createADto.name` and
 *     `createBDto.name` are distinct paths, so no duplicate-key error.
 *   - Buttons (`valueHandling: 'exclude'`) are skipped from the duplicate
 *     check, so the same `previous`/`submit` keys can appear on every page.
 *
 * The submitted value should keep the two `name`s in their respective groups.
 */
const config = {
  fields: [
    {
      key: 'aPage',
      type: 'page',
      fields: [
        {
          key: 'createADto',
          type: 'group',
          fields: [
            {
              key: 'name',
              type: 'input',
              label: 'Name',
              props: { hint: 'The name of a.', type: 'text' },
              required: true,
              col: 12,
            },
          ],
        },
        {
          key: 'aButtons',
          type: 'row',
          fields: [{ key: 'submit', type: 'next', label: 'Next', col: 12 }],
        },
      ],
    },
    {
      key: 'bPage',
      type: 'page',
      fields: [
        {
          key: 'createBDto',
          type: 'group',
          fields: [
            {
              key: 'name',
              type: 'input',
              label: 'Name',
              props: { hint: 'The name of b.', type: 'text' },
              required: true,
              col: 12,
            },
          ],
        },
        {
          key: 'bButtons',
          type: 'row',
          fields: [
            { key: 'previous', type: 'previous', label: 'Back', col: 6 },
            { key: 'submit', type: 'submit', label: 'Submit', col: 6 },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const overlappingGroupKeysScenario: TestScenario = {
  testId: 'overlapping-group-keys',
  title: 'Overlapping Group Keys (issue #401)',
  description: 'Same leaf key inside different groups + repeated button keys across pages',
  config,
};
