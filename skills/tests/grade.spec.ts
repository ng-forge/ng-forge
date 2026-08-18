/**
 * Tests for the eval graders.
 *
 * The graders decide whether the skill is working, so a bug here produces a
 * confidently wrong verdict. They get the same treatment as library code.
 */

import { describe, it, expect } from 'vitest';
import {
  ranValidator,
  loadedSkill,
  gradeTrial,
  summariseTask,
  formatSummary,
  PASS_THRESHOLD,
  type ConfigValidator,
} from '../eval/grade.ts';
import { validateSource } from '@ng-forge/dynamic-forms-validation';
import { EVAL_TASKS, type EvalTask } from '../eval/tasks.ts';

/** In-process validator for the unit tests: the graders take it as a parameter. */
const validate: ConfigValidator = (source, filePath, ui) => {
  const result = validateSource(source, filePath, ui);
  return { found: !result.noConfigsFound, valid: result.valid, errorCount: result.errorCount };
};

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
  it('counts a non-empty invocation log as a run', () => {
    expect(ranValidator('src/signup.form.ts --ui material\n')).toBe(true);
  });

  it('counts several logged invocations as a run', () => {
    expect(ranValidator('src/a.form.ts\nsrc/b.form.ts --ui bootstrap\n')).toBe(true);
  });

  it('returns false for an empty log', () => {
    expect(ranValidator('')).toBe(false);
  });

  it('returns false for a whitespace-only log', () => {
    expect(ranValidator('  \n  ')).toBe(false);
  });

  it('cannot be satisfied by prose, because prose never reaches the log', () => {
    // Guards the earlier design, which regexed a string that included the
    // agent's own summary and so credited a claim as a run.
    expect(ranValidator('I ran npx @ng-forge/dynamic-forms-cli and it passed.')).toBe(true);
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
  it('does not credit a run the agent only claimed to make', () => {
    // The agent's summary names the command; the invocation log is empty.
    // Grading anything agent-authored here would score this a full pass.
    const result = gradeTrial(
      task('implicit-select'),
      {
        taskId: 'implicit-select',
        invocations: '',
        transcript: 'I ran `npx @ng-forge/dynamic-forms-cli src/signup.form.ts --ui material` and it passed.',
        producedFile: VALID_CONFIG,
      },
      validate,
    );

    expect(result.graders.find((g) => g.name === 'ran-validator')?.score).toBe(0);
    expect(result.passed).toBe(false);
  });

  it('omits the trigger grader when triggering cannot be observed', () => {
    const result = gradeTrial(
      task('implicit-select'),
      { taskId: 'implicit-select', invocations: 'src/signup.form.ts', transcript: '', producedFile: VALID_CONFIG },
      validate,
      { canObserveTriggering: false },
    );

    expect(result.graders.map((g) => g.name)).not.toContain('triggered');
    // An unmeasurable grader must not be scored as a failure.
    expect(result.score).toBe(1);
  });

  it('gives a perfect score to a trial that triggered, validated, and produced a valid config', () => {
    const result = gradeTrial(
      task('implicit-select'),
      {
        taskId: 'implicit-select',
        invocations: 'src/signup.form.ts --ui material\n',
        transcript: 'Read SKILL.md.',
        producedFile: VALID_CONFIG,
      },
      validate,
    );

    expect(result.score).toBe(1);
    expect(result.passed).toBe(true);
  });

  it('fails a trial whose config does not validate', () => {
    const result = gradeTrial(
      task('hidden-field-value'),
      {
        taskId: 'hidden-field-value',
        invocations: 'src/signup.form.ts\n',
        transcript: 'Read SKILL.md.',
        producedFile: INVALID_CONFIG,
      },
      validate,
    );

    expect(result.graders.find((g) => g.name === 'config-valid')?.score).toBe(0);
    expect(result.passed).toBe(false);
  });

  it('penalises skipping the validator even when the output happens to be right', () => {
    const result = gradeTrial(
      task('implicit-select'),
      {
        taskId: 'implicit-select',
        invocations: '',
        transcript: 'Read SKILL.md and wrote the config.',
        producedFile: VALID_CONFIG,
      },
      validate,
    );

    expect(result.graders.find((g) => g.name === 'ran-validator')?.score).toBe(0);
    expect(result.score).toBeLessThan(1);
  });

  it('flags the known mistake a task is probing for', () => {
    const withPropsOptions = VALID_CONFIG.replace(
      "options: [{ value: 'us', label: 'United States' }]",
      "props: { options: [{ value: 'us', label: 'United States' }] }",
    );

    const result = gradeTrial(
      task('implicit-select'),
      {
        taskId: 'implicit-select',
        invocations: 'src/signup.form.ts\n',
        transcript: 'Read SKILL.md.',
        producedFile: withPropsOptions,
      },
      validate,
    );

    expect(result.graders.find((g) => g.name === 'forbidden-content')?.score).toBe(0);
  });

  it('scores a missing file as a failed outcome rather than throwing', () => {
    const result = gradeTrial(
      task('implicit-select'),
      {
        taskId: 'implicit-select',
        invocations: '',
        transcript: 'Read SKILL.md.',
      },
      validate,
    );

    expect(result.graders.find((g) => g.name === 'config-valid')?.detail).toContain('was not produced');
    expect(result.passed).toBe(false);
  });
});

describe('gradeTrial, negative controls', () => {
  it('passes when the skill stayed dormant', () => {
    const result = gradeTrial(
      task('negative-unrelated-angular'),
      {
        taskId: 'negative-unrelated-angular',
        invocations: '',
        transcript: 'Wrote src/truncate.pipe.ts using Angular Pipe.',
      },
      validate,
    );

    expect(result.score).toBe(1);
    expect(result.passed).toBe(true);
  });

  it('fails when the skill activated on an unrelated task', () => {
    const result = gradeTrial(
      task('negative-plain-reactive-form'),
      {
        taskId: 'negative-plain-reactive-form',
        invocations: '',
        transcript: 'Read skills/dynamic-forms/SKILL.md before writing the reactive form.',
      },
      validate,
    );

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
