/**
 * Deterministic graders for the skill eval.
 *
 * Nothing here calls a model. Whether the agent ran the validator is a fact
 * about its transcript; whether the config it produced is valid is a fact the
 * validator itself decides. Keeping both objective is what makes this eval
 * cheap enough to run repeatedly, which is what pass^k needs.
 */

import { validateSource } from '@ng-forge/dynamic-forms-validation';
import type { EvalTask } from './tasks.ts';

/** What a single trial produced. */
export interface TrialRecord {
  taskId: string;
  /** Everything the agent did, as text: commands, tool calls, narration. */
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
 * Matches the command in any of the forms the skill documents, allowing for a
 * package-manager prefix and arbitrary arguments.
 */
export function ranValidator(transcript: string): boolean {
  return /(?:npx|pnpm dlx|yarn dlx|bunx)?\s*(?:@ng-forge\/dynamic-forms-cli|ng-forge-validate)\b/.test(transcript);
}

/** Did the agent read the skill at all? */
export function loadedSkill(transcript: string): boolean {
  return /SKILL\.md|ng-forge-dynamic-forms|references\/(rules|field-types|patterns|pitfalls)\.md/.test(transcript);
}

/** Grade one trial against its task definition. */
export function gradeTrial(task: EvalTask, record: TrialRecord): TrialResult {
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

  const triggered = loadedSkill(record.transcript);
  graders.push({
    name: 'triggered',
    score: triggered ? 1 : 0,
    weight: 1,
    detail: triggered ? 'skill activated' : 'skill never activated',
  });

  const validated = ranValidator(record.transcript);
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
      const result = validateSource(source, task.expectedFile, task.ui);
      const ok = !result.noConfigsFound && result.valid;
      graders.push({
        name: 'config-valid',
        score: ok ? 1 : 0,
        weight: 3,
        detail: result.noConfigsFound
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
