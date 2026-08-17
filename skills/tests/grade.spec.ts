/**
 * Tests for the eval graders.
 *
 * The graders decide whether the skill is working, so a bug here produces a
 * confidently wrong verdict. They get the same treatment as library code.
 */

import { describe, it, expect } from 'vitest';
import { ranValidator, loadedSkill, gradeTrial, summariseTask, formatSummary, PASS_THRESHOLD } from '../eval/grade.ts';
import { EVAL_TASKS, type EvalTask } from '../eval/tasks.ts';

const VALID_CONFIG = `import { FormConfig } from '@ng-forge/dynamic-forms';

export const signupForm = {
  fields: [
    { key: 'email', type: 'input', label: 'Email', required: true, email: true },
    { key: 'country', type: 'select', label: 'Country', options: [{ value: 'us', label: 'United States' }] },
  ],
} as const satisfies FormConfig;
`;

const INVALID_CONFIG = `import { FormConfig } from '@ng-forge/dynamic-forms';

export const signupForm = {
  fields: [{ key: 'token', type: 'hidden' }],
} as const satisfies FormConfig;
`;

const task = (id: string): EvalTask => EVAL_TASKS.find((t) => t.id === id)!;

describe('ranValidator', () => {
  it.each([
    'npx @ng-forge/dynamic-forms-cli "src/**/*.form.ts" --ui material',
    'pnpm dlx @ng-forge/dynamic-forms-cli src/signup.form.ts',
    'bunx @ng-forge/dynamic-forms-cli src/a.ts',
    'ng-forge-validate src/signup.form.ts --ui bootstrap',
  ])('detects %s', (command) => {
    expect(ranValidator(`Running the validator:\n${command}\nDone.`)).toBe(true);
  });

  it('is not fooled by a transcript that merely mentions validating', () => {
    expect(ranValidator('I validated the config by reading it carefully.')).toBe(false);
  });

  it('returns false for an empty transcript', () => {
    expect(ranValidator('')).toBe(false);
  });
});

describe('loadedSkill', () => {
  it('detects a SKILL.md read', () => {
    expect(loadedSkill('Reading skills/dynamic-forms/SKILL.md')).toBe(true);
  });

  it('detects a reference file read', () => {
    expect(loadedSkill('cat references/pitfalls.md')).toBe(true);
  });

  it('returns false when the skill was never touched', () => {
    expect(loadedSkill('Wrote a pipe in src/truncate.pipe.ts')).toBe(false);
  });
});

describe('gradeTrial, positive tasks', () => {
  it('gives a perfect score to a trial that triggered, validated, and produced a valid config', () => {
    const result = gradeTrial(task('implicit-select'), {
      taskId: 'implicit-select',
      transcript: 'Read SKILL.md. Ran npx @ng-forge/dynamic-forms-cli src/signup.form.ts --ui material',
      producedFile: VALID_CONFIG,
    });

    expect(result.score).toBe(1);
    expect(result.passed).toBe(true);
  });

  it('fails a trial whose config does not validate', () => {
    const result = gradeTrial(task('hidden-field-value'), {
      taskId: 'hidden-field-value',
      transcript: 'Read SKILL.md. Ran npx @ng-forge/dynamic-forms-cli src/signup.form.ts',
      producedFile: INVALID_CONFIG,
    });

    expect(result.graders.find((g) => g.name === 'config-valid')?.score).toBe(0);
    expect(result.passed).toBe(false);
  });

  it('penalises skipping the validator even when the output happens to be right', () => {
    const result = gradeTrial(task('implicit-select'), {
      taskId: 'implicit-select',
      transcript: 'Read SKILL.md and wrote the config.',
      producedFile: VALID_CONFIG,
    });

    expect(result.graders.find((g) => g.name === 'ran-validator')?.score).toBe(0);
    expect(result.score).toBeLessThan(1);
  });

  it('flags the known mistake a task is probing for', () => {
    const withPropsOptions = VALID_CONFIG.replace(
      "options: [{ value: 'us', label: 'United States' }]",
      "props: { options: [{ value: 'us', label: 'United States' }] }",
    );

    const result = gradeTrial(task('implicit-select'), {
      taskId: 'implicit-select',
      transcript: 'Read SKILL.md. Ran npx @ng-forge/dynamic-forms-cli src/signup.form.ts',
      producedFile: withPropsOptions,
    });

    expect(result.graders.find((g) => g.name === 'forbidden-content')?.score).toBe(0);
  });

  it('scores a missing file as a failed outcome rather than throwing', () => {
    const result = gradeTrial(task('implicit-select'), {
      taskId: 'implicit-select',
      transcript: 'Read SKILL.md.',
    });

    expect(result.graders.find((g) => g.name === 'config-valid')?.detail).toContain('was not produced');
    expect(result.passed).toBe(false);
  });
});

describe('gradeTrial, negative controls', () => {
  it('passes when the skill stayed dormant', () => {
    const result = gradeTrial(task('negative-unrelated-angular'), {
      taskId: 'negative-unrelated-angular',
      transcript: 'Wrote src/truncate.pipe.ts using Angular Pipe.',
    });

    expect(result.score).toBe(1);
    expect(result.passed).toBe(true);
  });

  it('fails when the skill activated on an unrelated task', () => {
    const result = gradeTrial(task('negative-plain-reactive-form'), {
      taskId: 'negative-plain-reactive-form',
      transcript: 'Read skills/dynamic-forms/SKILL.md before writing the reactive form.',
    });

    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
  });
});

describe('summariseTask', () => {
  const pass = { taskId: 't', graders: [], score: 1, passed: true };
  const fail = { taskId: 't', graders: [], score: 0, passed: false };

  it('separates pass@k from pass^k', () => {
    const flaky = summariseTask('t', [pass, fail, pass]);

    expect(flaky.passAtK).toBe(true);
    expect(flaky.passHatK).toBe(false);
    expect(flaky.passes).toBe(2);
  });

  it('marks a consistently passing task as reliable', () => {
    expect(summariseTask('t', [pass, pass, pass]).passHatK).toBe(true);
  });

  it('marks a consistently failing task as neither', () => {
    const summary = summariseTask('t', [fail, fail]);
    expect(summary.passAtK).toBe(false);
    expect(summary.passHatK).toBe(false);
  });

  it('handles a task with no trials without dividing by zero', () => {
    const summary = summariseTask('t', []);
    expect(summary.meanScore).toBe(0);
    expect(summary.passHatK).toBe(false);
  });
});

describe('formatSummary', () => {
  it('renders a table and a reliability count', () => {
    const output = formatSummary([
      summariseTask('a', [{ taskId: 'a', graders: [], score: 1, passed: true }]),
      summariseTask('b', [{ taskId: 'b', graders: [], score: 0, passed: false }]),
    ]);

    expect(output).toContain('| Task |');
    expect(output).toContain('1 of 2 tasks passed every trial.');
  });
});

describe('task set', () => {
  it('includes negative controls', () => {
    expect(EVAL_TASKS.filter((t) => !t.shouldTrigger).length).toBeGreaterThanOrEqual(2);
  });

  it('gives every task a unique id', () => {
    const ids = EVAL_TASKS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every positive task an expected file to grade', () => {
    for (const t of EVAL_TASKS.filter((t) => t.shouldTrigger)) {
      expect(t.expectedFile, `${t.id} has nothing to grade`).toBeTruthy();
    }
  });

  it('uses a pass threshold that requires more than triggering alone', () => {
    expect(PASS_THRESHOLD).toBeGreaterThan(0.5);
  });
});
