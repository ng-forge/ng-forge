/**
 * Eval task set for the ng-forge dynamic-forms skill.
 *
 * Three layers, following the methodology that Anthropic, OpenAI and the
 * skill-eval work all converge on:
 *
 *   1. Triggering  - does the skill fire on a relevant prompt, and stay quiet
 *                    on an irrelevant one. Negative controls matter as much as
 *                    positive ones, because over-triggering is as costly as
 *                    under-triggering.
 *   2. Execution   - does the agent follow the skill's central instruction and
 *                    actually run the validator.
 *   3. Outcome     - is the config it produced valid.
 *
 * Every grader here is deterministic. Layers 2 and 3 are checkable from the
 * transcript and the CLI's own exit code, so this task set needs no LLM judge.
 */

export type UiIntegration = 'material' | 'bootstrap' | 'primeng' | 'ionic';

export interface EvalTask {
  /** Stable identifier, used as the workspace directory name. */
  id: string;
  /** What the task is probing. */
  intent: string;
  /** The prompt handed to the agent under test, verbatim. */
  prompt: string;
  /** Whether the skill is expected to activate at all. */
  shouldTrigger: boolean;
  /** Adapter the produced config must validate against. */
  ui: UiIntegration;
  /** File the agent is expected to write, relative to its workspace. */
  expectedFile?: string;
  /**
   * Substrings that must appear in the produced config. Used for tasks that
   * probe a specific rule rather than general correctness.
   */
  mustContain?: string[];
  /** Substrings whose presence means the agent made a known mistake. */
  mustNotContain?: string[];
}

export const EVAL_TASKS: EvalTask[] = [
  {
    id: 'implicit-select',
    intent: 'Triggering on an implicit prompt, plus the options-at-field-level rule',
    prompt:
      'Add a country dropdown to the signup form in src/signup.form.ts, with United States and United Kingdom as the choices. Keep the existing fields.',
    shouldTrigger: true,
    ui: 'material',
    expectedFile: 'src/signup.form.ts',
    mustContain: ["type: 'select'", 'options'],
    mustNotContain: ['props: { options', 'props: {options'],
  },
  {
    id: 'hidden-field-value',
    intent: 'The hidden-fields-require-value rule, which the validator flags most often',
    prompt: 'Add a hidden field to src/signup.form.ts that carries the referral source, set to "web".',
    shouldTrigger: true,
    ui: 'material',
    expectedFile: 'src/signup.form.ts',
    mustContain: ["type: 'hidden'", 'value'],
  },
  {
    id: 'container-logic',
    intent: 'The containers-only-support-hidden-logic rule',
    prompt: 'In src/signup.form.ts, wrap the address fields in a group that is only shown when the user has ticked the shipping checkbox.',
    shouldTrigger: true,
    ui: 'material',
    expectedFile: 'src/signup.form.ts',
    mustContain: ["type: 'group'", 'hidden'],
  },
  {
    id: 'multi-page-nav',
    intent: 'Nav buttons belong inside their page, a rule agents commonly get wrong',
    prompt: 'Turn src/signup.form.ts into a two page wizard with next, back and submit buttons.',
    shouldTrigger: true,
    ui: 'material',
    expectedFile: 'src/signup.form.ts',
    mustContain: ["type: 'page'", "type: 'next'", "type: 'submit'"],
  },
  {
    id: 'fix-broken-config',
    intent: 'Execution: given a config the validator rejects, does the agent run it and fix what it reports',
    prompt: 'Something is wrong with the form config in src/broken.form.ts. Find the problems and fix them.',
    shouldTrigger: true,
    ui: 'material',
    expectedFile: 'src/broken.form.ts',
  },
  // Adapter tasks. Note what these can and cannot measure: the four adapter
  // schemas accept the same field types and are passthrough on props, so a
  // config written for one adapter validates under all four. Nothing in the
  // produced file can therefore prove the agent picked the right adapter, and
  // asserting on file content here would be theatre. The `--ui` flag in the
  // invocation log is the only real evidence, which is what the
  // `validated-correctly` grader checks.
  {
    id: 'bootstrap-adapter',
    intent: 'Adapter named in the prompt: the agent should validate with --ui bootstrap',
    prompt: 'Add a required email field to the contact form in src/contact.form.ts. This project uses Bootstrap.',
    shouldTrigger: true,
    ui: 'bootstrap',
    expectedFile: 'src/contact.form.ts',
    mustContain: ["type: 'input'"],
  },
  {
    id: 'primeng-adapter',
    intent: 'Adapter discoverable only from the code: the agent has to look before choosing --ui',
    prompt: 'Add a required phone field to the contact form in src/contact.form.ts.',
    shouldTrigger: true,
    ui: 'primeng',
    expectedFile: 'src/contact.form.ts',
    mustContain: ["type: 'input'"],
  },
  {
    id: 'ionic-adapter',
    intent: 'Adapter named in the prompt, fourth integration',
    prompt: 'Add a required full name field to the profile form in src/profile.form.ts. This is an Ionic app.',
    shouldTrigger: true,
    ui: 'ionic',
    expectedFile: 'src/profile.form.ts',
    mustContain: ["type: 'input'"],
  },
  {
    id: 'negative-unrelated-angular',
    intent: 'Negative control: an Angular task with nothing to do with dynamic forms',
    prompt: 'Write an Angular pipe in src/truncate.pipe.ts that truncates a string to 20 characters.',
    shouldTrigger: false,
    ui: 'material',
  },
  {
    id: 'negative-plain-reactive-form',
    intent: 'Negative control: a hand-written reactive form, which is not what this skill is for',
    prompt: 'In src/login.component.ts, build a login form using Angular reactive forms with FormBuilder.',
    shouldTrigger: false,
    ui: 'material',
  },
];

/** Workspace fixtures, written before the agent starts. */
export const FIXTURES: Record<string, Record<string, string>> = {
  'implicit-select': {
    'src/signup.form.ts': `import { FormConfig } from '@ng-forge/dynamic-forms';

export const signupForm = {
  fields: [
    { key: 'email', type: 'input', label: 'Email', required: true, email: true },
  ],
} as const satisfies FormConfig;
`,
  },
  'hidden-field-value': {
    'src/signup.form.ts': `import { FormConfig } from '@ng-forge/dynamic-forms';

export const signupForm = {
  fields: [
    { key: 'email', type: 'input', label: 'Email', required: true, email: true },
  ],
} as const satisfies FormConfig;
`,
  },
  'container-logic': {
    'src/signup.form.ts': `import { FormConfig } from '@ng-forge/dynamic-forms';

export const signupForm = {
  fields: [
    { key: 'shipping', type: 'checkbox', label: 'Ship to a different address' },
    { key: 'street', type: 'input', label: 'Street' },
    { key: 'city', type: 'input', label: 'City' },
  ],
} as const satisfies FormConfig;
`,
  },
  'multi-page-nav': {
    'src/signup.form.ts': `import { FormConfig } from '@ng-forge/dynamic-forms';

export const signupForm = {
  fields: [
    { key: 'email', type: 'input', label: 'Email', required: true, email: true },
    { key: 'street', type: 'input', label: 'Street' },
  ],
} as const satisfies FormConfig;
`,
  },
  'fix-broken-config': {
    // Two deliberate errors: options inside props, and a hidden field with no value.
    'src/broken.form.ts': `import { FormConfig } from '@ng-forge/dynamic-forms';

export const brokenForm = {
  fields: [
    { key: 'country', type: 'select', label: 'Country', props: { options: [{ value: 'us', label: 'US' }] } },
    { key: 'token', type: 'hidden' },
  ],
} as const satisfies FormConfig;
`,
  },
  'bootstrap-adapter': {
    'src/contact.form.ts': `import { FormConfig } from '@ng-forge/dynamic-forms';

export const contactForm = {
  fields: [
    { key: 'name', type: 'input', label: 'Name', required: true },
  ],
} as const satisfies FormConfig;
`,
  },
  'primeng-adapter': {
    'src/contact.form.ts': `import { FormConfig } from '@ng-forge/dynamic-forms';

export const contactForm = {
  fields: [
    { key: 'name', type: 'input', label: 'Name', required: true },
  ],
} as const satisfies FormConfig;
`,
    // The prompt never says PrimeNG. This file is the only clue, so the trial
    // measures whether the agent goes looking for the adapter at all.
    'src/app.config.ts': `import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withPrimeNGFields } from '@ng-forge/dynamic-forms-primeng';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(withPrimeNGFields())],
};
`,
  },
  'ionic-adapter': {
    'src/profile.form.ts': `import { FormConfig } from '@ng-forge/dynamic-forms';

export const profileForm = {
  fields: [
    { key: 'email', type: 'input', label: 'Email', required: true, email: true },
  ],
} as const satisfies FormConfig;
`,
    'src/app.config.ts': `import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(withIonicFields())],
};
`,
  },
  'negative-unrelated-angular': {},
  'negative-plain-reactive-form': {},
};
