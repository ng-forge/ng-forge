/**
 * Deterministic graders for the WebMCP eval.
 *
 * Nothing here calls a model. Every grader reads either the recorded tool-call
 * log, which the page writes and the agent never sees, or the form's final
 * value, which the agent cannot edit except through the tools. Keeping both out
 * of the agent's reach is what makes the numbers mean anything: a grader that
 * scored the agent's own account of itself would pass on a confident summary of
 * work it never did.
 */

import type { EvalTask } from './tasks';

/** One recorded tool call, as the page's recorder writes it. */
export interface RecordedCall {
  /** The registered tool name, for example `fill_signup`. */
  tool: string;
  /** Arguments the agent sent. */
  args: unknown;
  /** The text the tool returned. */
  result: string;
  /** Epoch milliseconds, for ordering. */
  at: number;
}

/** What one run of one task produced. */
export interface EvalTranscript {
  taskId: string;
  calls: RecordedCall[];
  /** The form's value when the agent stopped. */
  finalValue: Record<string, unknown>;
}

export interface GraderResult {
  name: string;
  /** 0.0 to 1.0. */
  score: number;
  weight: number;
  detail: string;
}

export interface TaskResult {
  taskId: string;
  graders: GraderResult[];
  /** Weighted mean of the graders. */
  score: number;
  passed: boolean;
}

/** A run passes at or above this weighted score. */
export const PASS_THRESHOLD = 0.8;

/**
 * Marker the `fill` and `submit` tools put at the head of a response that was
 * refused outright. Matching on it is what tells a corrected run apart from one
 * that happened to call twice.
 */
const REJECTION_MARKER = 'Nothing was applied.';

/** Marker for a submit that ran validation and declined. */
const VALIDATION_FAILURE_MARKER = 'Not submitted:';

/** Did the agent reach for the tools the task expects? */
export function gradeToolsUsed(task: EvalTask, transcript: EvalTranscript): GraderResult {
  const used = new Set(transcript.calls.map((call) => call.tool));
  const missing = task.expectTools.filter((name) => !used.has(name));

  return {
    name: 'tools-used',
    weight: 2,
    score: missing.length ? 0 : 1,
    detail: missing.length ? `never called: ${missing.join(', ')}` : `called ${[...used].join(', ') || '(nothing)'}`,
  };
}

/**
 * Did it stay away from the tools it must not use?
 *
 * Scores 1 when the task names none, so a task without a negative control is
 * neither rewarded nor punished for it.
 */
export function gradeToolsAvoided(task: EvalTask, transcript: EvalTranscript): GraderResult {
  const used = new Set(transcript.calls.map((call) => call.tool));
  const violations = (task.forbidTools ?? []).filter((name) => used.has(name));

  return {
    name: 'tools-avoided',
    weight: 2,
    score: violations.length ? 0 : 1,
    detail: violations.length ? `called forbidden: ${violations.join(', ')}` : 'no forbidden tools called',
  };
}

/**
 * Did the form end up holding what the task asked for?
 *
 * The outcome grader, and the heaviest, because it is the only one that cannot
 * be satisfied by calling the right tool with the wrong arguments.
 */
export function gradeFinalValue(task: EvalTask, transcript: EvalTranscript): GraderResult {
  const expected = Object.entries(task.expectValues);
  if (!expected.length) {
    return { name: 'final-value', weight: 3, score: 1, detail: 'no value expectations' };
  }

  const wrong = expected.filter(([key, value]) => !Object.is(transcript.finalValue[key], value));

  return {
    name: 'final-value',
    weight: 3,
    score: (expected.length - wrong.length) / expected.length,
    detail: wrong.length
      ? wrong.map(([key, value]) => `${key}: wanted ${JSON.stringify(value)}, got ${JSON.stringify(transcript.finalValue[key])}`).join('; ')
      : 'all expected values present',
  };
}

/**
 * For a task that sets `expectRecovery`: did a refused call get corrected?
 *
 * Requires a refusal followed by a call that was not refused. Two calls alone
 * do not count, since an agent that sends the same bad value twice has learned
 * nothing from the response.
 */
export function gradeRecovery(task: EvalTask, transcript: EvalTranscript): GraderResult {
  if (!task.expectRecovery) {
    return { name: 'recovery', weight: 1, score: 1, detail: 'not applicable' };
  }

  const refusedAt = transcript.calls.findIndex(isRefusal);
  const recovered = refusedAt !== -1 && transcript.calls.slice(refusedAt + 1).some((call) => !isRefusal(call));

  return {
    name: 'recovery',
    weight: 1,
    score: recovered ? 1 : 0,
    detail: refusedAt === -1 ? 'nothing was ever refused' : recovered ? 'corrected after a refusal' : 'never recovered from the refusal',
  };
}

function isRefusal(call: RecordedCall): boolean {
  return call.result.startsWith(REJECTION_MARKER) || call.result.startsWith(VALIDATION_FAILURE_MARKER);
}

/**
 * Did it get there without thrashing?
 *
 * A budget rather than a target. Going over usually means the agent is guessing
 * at the schema, which is a comprehension failure worth seeing separately from
 * a wrong final value.
 */
export function gradeCallEconomy(task: EvalTask, transcript: EvalTranscript): GraderResult {
  const over = transcript.calls.length > task.maxCalls;

  return {
    name: 'call-economy',
    weight: 1,
    score: over ? 0 : 1,
    detail: `${transcript.calls.length} call(s), budget ${task.maxCalls}`,
  };
}

/** Runs every grader and combines them into one weighted score. */
export function gradeTask(task: EvalTask, transcript: EvalTranscript): TaskResult {
  const graders = [
    gradeToolsUsed(task, transcript),
    gradeToolsAvoided(task, transcript),
    gradeFinalValue(task, transcript),
    gradeRecovery(task, transcript),
    gradeCallEconomy(task, transcript),
  ];

  const totalWeight = graders.reduce((sum, grader) => sum + grader.weight, 0);
  const score = graders.reduce((sum, grader) => sum + grader.score * grader.weight, 0) / totalWeight;

  return { taskId: task.id, graders, score, passed: score >= PASS_THRESHOLD };
}

/** Aggregate over trials of the same task set. */
export interface EvalSummary {
  /** Fraction of all trials that passed. */
  passAtK: number;
  /** Fraction of tasks that passed in *every* trial. */
  passHatK: number;
  perTask: { taskId: string; trials: number; passes: number }[];
}

/**
 * Aggregates results across trials.
 *
 * Reports pass^k as well as pass@k on purpose: a tool surface an agent drives
 * correctly four times in five is not a tool surface that works, and only the
 * every-trial figure shows that.
 */
export function summarise(results: TaskResult[]): EvalSummary {
  const byTask = new Map<string, { trials: number; passes: number }>();

  for (const result of results) {
    const entry = byTask.get(result.taskId) ?? { trials: 0, passes: 0 };
    entry.trials += 1;
    if (result.passed) entry.passes += 1;
    byTask.set(result.taskId, entry);
  }

  const perTask = [...byTask.entries()].map(([taskId, entry]) => ({ taskId, ...entry }));
  const alwaysPassed = perTask.filter((entry) => entry.passes === entry.trials).length;

  return {
    passAtK: results.length ? results.filter((result) => result.passed).length / results.length : 0,
    passHatK: perTask.length ? alwaysPassed / perTask.length : 0,
    perTask,
  };
}
