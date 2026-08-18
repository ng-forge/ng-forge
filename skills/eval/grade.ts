/**
 * Deterministic graders for the skill eval.
 *
 * Nothing here calls a model. Whether the agent ran the validator is read from
 * a log it never sees, not from its own account of itself; whether the config
 * it produced is valid is decided by re-validating it. Keeping both out of the
 * agent's reach is what makes the numbers mean anything.
 */

import type { EvalTask, UiIntegration } from './tasks.ts';

/**
 * How a caller validates a produced config.
 *
 * Injected rather than imported so this module has no runtime dependency on
 * the validation library. Tests pass the in-process `validateSource`; the
 * grading runner shells out to the built CLI, which is what a user would run.
 */
export type ConfigValidator = (
  source: string,
  filePath: string,
  ui: UiIntegration,
) => { found: boolean; valid: boolean; errorCount: number };

/** What a single trial produced. */
export interface TrialRecord {
  taskId: string;
  /**
   * Contents of the workspace's validator invocation log, written by a wrapper
   * the agent never sees. Kept separate from `transcript` on purpose: grading
   * "did it run the validator" against anything the agent authored lets a
   * trial pass by merely claiming to have run it.
   */
  invocations: string;
  /** The agent's own account of what it did. Self-reported, so trigger signal only. */
  transcript: string;
  /** Final contents of the file the task expected, if it exists. */
  producedFile?: string;
}

export interface GraderResult {
  name: string;
  /** 0.0 to 1.0. */
  score: number;
  weight: number;
  detail: string;
}

export interface TrialResult {
  taskId: string;
  graders: GraderResult[];
  /** Weighted mean of the graders. */
  score: number;
  /** Whether this trial counts as a pass. */
  passed: boolean;
}

/** A trial passes at or above this weighted score. */
export const PASS_THRESHOLD = 0.8;

/**
 * Did the agent invoke the validator?
 *
 * The workspace wrapper appends one line per invocation and nothing else ever
 * writes to that file, so a non-empty log is the run. This deliberately does
 * not pattern-match a command line: an earlier version did, which meant the
 * check passed on any text merely naming the command, and the agent's own
 * summary was being fed in alongside the log.
 */
export function ranValidator(invocations: string): boolean {
  return invocations.trim().length > 0;
}

/** Did the agent read the skill at all? */
export function loadedSkill(transcript: string): boolean {
  return /SKILL\.md|ng-forge-dynamic-forms|references\/(rules|field-types|patterns|pitfalls)\.md/.test(transcript);
}

export interface GradeOptions {
  /**
   * Whether the trigger grader can be evaluated at all.
   *
   * It needs the agent's transcript. When the harness cannot supply one, the
   * grader is omitted rather than scored zero: a missing measurement is not a
   * failed one, and silently counting it as failure understates the skill.
   */
  canObserveTriggering?: boolean;
}

/** Grade one trial against its task definition. */
export function gradeTrial(task: EvalTask, record: TrialRecord, validate: ConfigValidator, options: GradeOptions = {}): TrialResult {
  const { canObserveTriggering = true } = options;
  const graders: GraderResult[] = [];

  if (!task.shouldTrigger) {
    // Negative control: the only thing that matters is that the skill stayed
    // out of the way. Loading it for an unrelated task wastes context and is a
    // real failure mode, not a harmless extra.
    const quiet = !loadedSkill(record.transcript);
    graders.push({
      name: 'did-not-trigger',
      score: quiet ? 1 : 0,
      weight: 1,
      detail: quiet ? 'skill stayed dormant' : 'skill activated on an unrelated task',
    });

    const total = graders.reduce((sum, g) => sum + g.score * g.weight, 0) / graders.reduce((sum, g) => sum + g.weight, 0);
    return { taskId: task.id, graders, score: total, passed: total >= PASS_THRESHOLD };
  }

  if (canObserveTriggering) {
    const triggered = loadedSkill(record.transcript);
    graders.push({
      name: 'triggered',
      score: triggered ? 1 : 0,
      weight: 1,
      detail: triggered ? 'skill activated' : 'skill never activated',
    });
  }

  // Invocation log only. See TrialRecord.invocations.
  const validated = ranValidator(record.invocations);
  graders.push({
    name: 'ran-validator',
    score: validated ? 1 : 0,
    weight: 2,
    detail: validated ? 'validator invoked' : 'validator never invoked',
  });

  if (task.expectedFile) {
    const source = record.producedFile;

    if (source === undefined) {
      graders.push({ name: 'config-valid', score: 0, weight: 3, detail: `${task.expectedFile} was not produced` });
    } else {
      const result = validate(source, task.expectedFile, task.ui);
      const ok = result.found && result.valid;
      graders.push({
        name: 'config-valid',
        score: ok ? 1 : 0,
        weight: 3,
        detail: !result.found
          ? 'no FormConfig found in the produced file'
          : ok
            ? 'config validates'
            : `${result.errorCount} validation error(s)`,
      });
    }

    if (task.mustContain?.length) {
      const missing = task.mustContain.filter((needle) => !(source ?? '').includes(needle));
      graders.push({
        name: 'required-content',
        score: missing.length === 0 ? 1 : 0,
        weight: 1,
        detail: missing.length === 0 ? 'all required content present' : `missing: ${missing.join(', ')}`,
      });
    }

    if (task.mustNotContain?.length) {
      const present = task.mustNotContain.filter((needle) => (source ?? '').includes(needle));
      graders.push({
        name: 'forbidden-content',
        score: present.length === 0 ? 1 : 0,
        weight: 1,
        detail: present.length === 0 ? 'no known mistakes present' : `found: ${present.join(', ')}`,
      });
    }
  }

  const weight = graders.reduce((sum, g) => sum + g.weight, 0);
  const total = graders.reduce((sum, g) => sum + g.score * g.weight, 0) / weight;

  return { taskId: task.id, graders, score: total, passed: total >= PASS_THRESHOLD };
}

export interface TaskSummary {
  taskId: string;
  trials: number;
  passes: number;
  /** Solved at least once. */
  passAtK: boolean;
  /** Solved every time. This is the number that matters for reliability. */
  passHatK: boolean;
  meanScore: number;
}

/** Aggregate repeated trials of one task into pass@k and pass^k. */
export function summariseTask(taskId: string, results: TrialResult[]): TaskSummary {
  const passes = results.filter((r) => r.passed).length;
  return {
    taskId,
    trials: results.length,
    passes,
    passAtK: passes > 0,
    passHatK: results.length > 0 && passes === results.length,
    meanScore: results.length === 0 ? 0 : results.reduce((sum, r) => sum + r.score, 0) / results.length,
  };
}

/** Render a summary table for the whole run. */
export function formatSummary(summaries: TaskSummary[]): string {
  const lines = ['| Task | Trials | Passes | pass@k | pass^k | Mean |', '| ---- | ------ | ------ | ------ | ------ | ---- |'];

  for (const s of summaries) {
    lines.push(
      `| ${s.taskId} | ${s.trials} | ${s.passes} | ${s.passAtK ? 'yes' : 'no'} | ${s.passHatK ? 'yes' : 'no'} | ${s.meanScore.toFixed(2)} |`,
    );
  }

  const reliable = summaries.filter((s) => s.passHatK).length;
  lines.push('');
  lines.push(`${reliable} of ${summaries.length} tasks passed every trial.`);

  return lines.join('\n');
}
