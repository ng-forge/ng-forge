import { describe, expect, it } from 'vitest';
import { EVAL_TASKS, EvalTask } from './tasks';
import {
  EvalTranscript,
  gradeCallEconomy,
  gradeFinalValue,
  gradeRecovery,
  gradeTask,
  gradeToolsAvoided,
  gradeToolsUsed,
  PASS_THRESHOLD,
  RecordedCall,
  summarise,
} from './grade';

const task = (overrides: Partial<EvalTask> = {}): EvalTask => ({
  id: 'test',
  intent: 'test',
  scenario: 'agent-fill-submit',
  prompt: 'do the thing',
  expectTools: ['fill_signup'],
  expectValues: { username: 'ada' },
  maxCalls: 3,
  ...overrides,
});

const call = (overrides: Partial<RecordedCall> = {}): RecordedCall => ({
  tool: 'fill_signup',
  args: {},
  result: 'Applied: username.',
  at: 0,
  ...overrides,
});

const transcript = (overrides: Partial<EvalTranscript> = {}): EvalTranscript => ({
  taskId: 'test',
  calls: [call()],
  finalValue: { username: 'ada' },
  ...overrides,
});

describe('gradeToolsUsed', () => {
  it('passes when every expected tool was called', () => {
    expect(gradeToolsUsed(task(), transcript()).score).toBe(1);
  });

  it('fails when the agent never reached for the tool', () => {
    const result = gradeToolsUsed(task(), transcript({ calls: [] }));

    expect(result.score).toBe(0);
    expect(result.detail).toContain('fill_signup');
  });

  it('fails when only some of the expected tools were called', () => {
    expect(gradeToolsUsed(task({ expectTools: ['fill_signup', 'submit_signup'] }), transcript()).score).toBe(0);
  });
});

describe('gradeToolsAvoided', () => {
  it('is neutral when the task forbids nothing', () => {
    expect(gradeToolsAvoided(task(), transcript()).score).toBe(1);
  });

  it('fails when a forbidden tool was called', () => {
    const result = gradeToolsAvoided(task({ forbidTools: ['submit_signup'] }), transcript({ calls: [call({ tool: 'submit_signup' })] }));

    expect(result.score).toBe(0);
    expect(result.detail).toContain('submit_signup');
  });
});

describe('gradeFinalValue', () => {
  it('passes when the form holds what was asked for', () => {
    expect(gradeFinalValue(task(), transcript()).score).toBe(1);
  });

  it('scores partially when some values landed', () => {
    const result = gradeFinalValue(
      task({ expectValues: { username: 'ada', plan: 'pro' } }),
      transcript({ finalValue: { username: 'ada', plan: 'free' } }),
    );

    expect(result.score).toBe(0.5);
    expect(result.detail).toContain('plan');
  });

  it('is neutral when the task expects no particular values', () => {
    expect(gradeFinalValue(task({ expectValues: {} }), transcript()).score).toBe(1);
  });

  it('does not accept a coerced match', () => {
    expect(gradeFinalValue(task({ expectValues: { amount: 40 } }), transcript({ finalValue: { amount: '40' } })).score).toBe(0);
  });
});

describe('gradeRecovery', () => {
  const correcting = task({ expectRecovery: true, expectValues: {} });

  it('is neutral for a task that does not probe recovery', () => {
    expect(gradeRecovery(task(), transcript({ calls: [] })).score).toBe(1);
  });

  it('passes when a refusal is followed by a call that lands', () => {
    const calls = [call({ result: 'Nothing was applied. The form is unchanged.' }), call()];

    expect(gradeRecovery(correcting, transcript({ calls })).score).toBe(1);
  });

  it('recognises a declined submit as a refusal', () => {
    const calls = [call({ tool: 'submit_signup', result: 'Not submitted: validation failed.' }), call()];

    expect(gradeRecovery(correcting, transcript({ calls })).score).toBe(1);
  });

  it('fails when the agent repeated the same rejected call', () => {
    const refused = call({ result: 'Nothing was applied. The form is unchanged.' });

    expect(gradeRecovery(correcting, transcript({ calls: [refused, refused] })).score).toBe(0);
  });

  it('fails when nothing was ever refused, since the task probes correction', () => {
    const result = gradeRecovery(correcting, transcript());

    expect(result.score).toBe(0);
    expect(result.detail).toContain('nothing was ever refused');
  });
});

describe('gradeCallEconomy', () => {
  it('passes within budget', () => {
    expect(gradeCallEconomy(task({ maxCalls: 2 }), transcript()).score).toBe(1);
  });

  it('fails over budget', () => {
    expect(gradeCallEconomy(task({ maxCalls: 1 }), transcript({ calls: [call(), call()] })).score).toBe(0);
  });
});

describe('gradeTask', () => {
  it('passes a clean run', () => {
    const result = gradeTask(task(), transcript());

    expect(result.score).toBe(1);
    expect(result.passed).toBe(true);
  });

  it('fails a run that called the right tool with the wrong values', () => {
    const result = gradeTask(task(), transcript({ finalValue: { username: 'grace' } }));

    expect(result.score).toBeLessThan(PASS_THRESHOLD);
    expect(result.passed).toBe(false);
  });

  it('reports one entry per grader', () => {
    expect(gradeTask(task(), transcript()).graders.map((grader) => grader.name)).toEqual([
      'tools-used',
      'tools-avoided',
      'final-value',
      'recovery',
      'call-economy',
    ]);
  });
});

describe('summarise', () => {
  const pass = (taskId: string) => ({ taskId, graders: [], score: 1, passed: true });
  const fail = (taskId: string) => ({ taskId, graders: [], score: 0, passed: false });

  it('reports nothing for no results', () => {
    expect(summarise([])).toEqual({ passAtK: 0, passHatK: 0, perTask: [] });
  });

  it('separates pass@k from pass^k', () => {
    // 'a' passes both trials; 'b' passes one of two. Three of four trials pass,
    // but only one of two tasks passes every time.
    const summary = summarise([pass('a'), pass('a'), pass('b'), fail('b')]);

    expect(summary.passAtK).toBe(0.75);
    expect(summary.passHatK).toBe(0.5);
  });

  it('counts trials per task', () => {
    expect(summarise([pass('a'), fail('a')]).perTask).toEqual([{ taskId: 'a', trials: 2, passes: 1 }]);
  });
});

describe('EVAL_TASKS', () => {
  it('has unique ids', () => {
    const ids = EVAL_TASKS.map((entry) => entry.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers the behaviours the tool surface is meant to support', () => {
    expect(EVAL_TASKS.map((entry) => entry.id)).toEqual([
      'discovery',
      'partial-completion',
      'correction-after-validation',
      'conditional-fields',
      'opaque-select-values',
      'submission-not-offered',
    ]);
  });

  it('includes a negative control, so over-eagerness is measured too', () => {
    expect(EVAL_TASKS.some((entry) => entry.forbidTools?.length)).toBe(true);
  });

  it('gives every task a call budget above its expected tool count', () => {
    for (const entry of EVAL_TASKS) {
      expect(entry.maxCalls).toBeGreaterThanOrEqual(entry.expectTools.length);
    }
  });
});
