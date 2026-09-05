import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Three configs that must each fully replace the last one's tools.
 *
 * The interesting transitions are `first -> second` (a rename, so the old tool
 * names have to disappear), `first -> revoked` (submission turned off, which
 * has to actually revoke `submit_swap`, not merely stop advertising it), and
 * anything -> `none` (no `webMcp` at all, so nothing stays registered).
 */

const withSubmit = {
  options: {
    webMcp: { name: 'swap', description: 'The first form.', allowSubmit: true },
  },
  fields: [
    { key: 'alpha', type: 'input', label: 'Alpha', col: 12 },
    { key: 'submit', type: 'submit', label: 'Submit', col: 12 },
  ],
} as const satisfies FormConfig;

const renamed = {
  options: {
    webMcp: { name: 'renamed', description: 'The second form, under a new name.' },
  },
  fields: [
    { key: 'beta', type: 'input', label: 'Beta', col: 12 },
    { key: 'submit', type: 'submit', label: 'Submit', col: 12 },
  ],
} as const satisfies FormConfig;

const submitRevoked = {
  options: {
    webMcp: { name: 'swap', description: 'The first form, with submission turned off.' },
  },
  fields: [
    { key: 'alpha', type: 'input', label: 'Alpha', col: 12 },
    { key: 'submit', type: 'submit', label: 'Submit', col: 12 },
  ],
} as const satisfies FormConfig;

const notExposed = {
  fields: [
    { key: 'alpha', type: 'input', label: 'Alpha', col: 12 },
    { key: 'submit', type: 'submit', label: 'Submit', col: 12 },
  ],
} as const satisfies FormConfig;

export const agentConfigSwapVariants = {
  initial: withSubmit,
  renamed,
  revoked: submitRevoked,
  none: notExposed,
};

export const agentConfigSwapScenario: TestScenario = {
  testId: 'agent-config-swap-test',
  title: 'Agent Config Swap',
  description: 'Tools follow the config: renaming, revoking submission, and opting out all take effect',
  config: withSubmit,
};
