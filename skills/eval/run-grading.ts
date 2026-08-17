#!/usr/bin/env node
/**
 * Grade completed trial workspaces and print a pass@k / pass^k summary.
 *
 * Signal quality differs by grader, and the distinction matters when reading
 * the output:
 *
 *   ran-validator   objective. Read from `.validator-invocations.log`, which a
 *                   wrapper writes on every CLI call and the agent never sees.
 *   config-valid    objective. The produced file is re-validated here.
 *   required/       objective. Substring checks against the produced file.
 *   forbidden
 *   triggered       self-reported. Derived from the agent's own summary, since
 *                   a subagent's full transcript is not available to us. Treat
 *                   it as the weakest number in the table.
 *
 * Usage: node skills/eval/run-grading.ts <trials-dir> [reports-dir]
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { EVAL_TASKS } from './tasks.ts';
import { gradeTrial, summariseTask, formatSummary, type TrialResult } from './grade.ts';
import { INVOCATION_LOG } from './setup-workspaces.ts';

async function readIfPresent(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, 'utf-8');
  } catch {
    return undefined;
  }
}

export async function gradeAll(trialsDir: string, reportsDir?: string) {
  const entries = await readdir(trialsDir, { withFileTypes: true });
  const workspaces = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  const byTask = new Map<string, TrialResult[]>();
  const missing: string[] = [];

  for (const task of EVAL_TASKS) {
    const taskWorkspaces = workspaces.filter((name) => name.startsWith(`${task.id}__`)).sort();
    const results: TrialResult[] = [];

    for (const name of taskWorkspaces) {
      const workspace = join(trialsDir, name);

      const invocations = (await readIfPresent(join(workspace, INVOCATION_LOG))) ?? '';
      const report = reportsDir ? ((await readIfPresent(join(reportsDir, `${name}.txt`))) ?? '') : '';
      const producedFile = task.expectedFile ? await readIfPresent(join(workspace, task.expectedFile)) : undefined;

      if (reportsDir && report === '') {
        missing.push(name);
      }

      // The invocation log is the objective half of the transcript; the
      // agent's summary supplies only the trigger signal.
      const transcript = [invocations ? `ng-forge-validate ${invocations}` : '', report].join('\n');

      results.push(gradeTrial(task, { taskId: task.id, transcript, producedFile }));
    }

    byTask.set(task.id, results);
  }

  return { byTask, missing };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop() ?? '')) {
  const trialsDir = process.argv[2];
  const reportsDir = process.argv[3];

  if (!trialsDir) {
    console.error('usage: node skills/eval/run-grading.ts <trials-dir> [reports-dir]');
    process.exitCode = 2;
  } else {
    const { byTask, missing } = await gradeAll(trialsDir, reportsDir);

    console.log('# Skill eval results\n');

    for (const task of EVAL_TASKS) {
      const results = byTask.get(task.id) ?? [];
      if (results.length === 0) continue;

      console.log(`## ${task.id}`);
      console.log(`_${task.intent}_\n`);

      results.forEach((result, index) => {
        console.log(`Trial ${index + 1}: ${result.passed ? 'PASS' : 'FAIL'} (${result.score.toFixed(2)})`);
        for (const grader of result.graders) {
          console.log(`  - ${grader.name}: ${grader.score} - ${grader.detail}`);
        }
      });
      console.log('');
    }

    const summaries = EVAL_TASKS.map((t) => summariseTask(t.id, byTask.get(t.id) ?? [])).filter((s) => s.trials > 0);

    console.log('## Summary\n');
    console.log(formatSummary(summaries));

    if (missing.length > 0) {
      console.log(`\nNo agent report found for ${missing.length} workspace(s); their trigger grader reads as a miss.`);
    }
  }
}
