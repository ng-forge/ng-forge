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

import { execFileSync } from 'node:child_process';
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EVAL_TASKS, FIXTURES } from './tasks.ts';
import { gradeTrial, summariseTask, formatSummary, type ConfigValidator, type TrialResult } from './grade.ts';
import { INVOCATION_LOG } from './setup-workspaces.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CLI_BIN = join(ROOT, 'dist', 'packages', 'dynamic-forms-cli', 'bin', 'ng-forge-validate.js');

/**
 * Validate by running the built CLI, not by importing the library.
 *
 * Grading against the same artifact a user installs means a packaging bug
 * cannot pass the eval while failing in the wild. It also keeps this runner
 * free of the library's ESM specifiers, which Node's type stripping cannot
 * resolve from source.
 */
function cliValidator(workspace: string): ConfigValidator {
  return (_source, filePath, ui) => {
    const target = join(workspace, filePath);
    let stdout: string;

    try {
      stdout = execFileSync(process.execPath, [CLI_BIN, target, '--ui', ui, '--json'], { encoding: 'utf-8' });
    } catch (error) {
      // Exit code 1 means invalid, which still prints the JSON payload.
      const withOutput = error as { stdout?: string };
      stdout = withOutput.stdout ?? '';
    }

    try {
      const payload = JSON.parse(stdout);
      const file = payload.files?.[0];
      return {
        found: (file?.configsFound ?? 0) > 0,
        valid: Boolean(payload.valid),
        errorCount: payload.errorCount ?? 0,
      };
    } catch {
      return { found: false, valid: false, errorCount: 0 };
    }
  };
}

async function readIfPresent(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, 'utf-8');
  } catch {
    return undefined;
  }
}

/** Epoch seconds the file was last written, for ordering against the invocation log. */
async function mtimeIfPresent(path: string): Promise<number | undefined> {
  try {
    return (await stat(path)).mtimeMs / 1000;
  } catch {
    return undefined;
  }
}

export async function gradeAll(trialsDir: string, reportsDir?: string) {
  const entries = await readdir(trialsDir, { withFileTypes: true });
  const workspaces = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  const byTask = new Map<string, TrialResult[]>();
  const missing: string[] = [];
  /**
   * Workspaces that look untouched.
   *
   * A trial whose agent never ran scores like a bad trial, which quietly
   * poisons the aggregate. Grading a run before its agents finish produced
   * exactly that during development, so it is worth detecting rather than
   * trusting the caller to sequence things correctly.
   */
  const notRun: string[] = [];

  for (const task of EVAL_TASKS) {
    const taskWorkspaces = workspaces.filter((name) => name.startsWith(`${task.id}__`)).sort();
    const results: TrialResult[] = [];

    for (const name of taskWorkspaces) {
      const workspace = join(trialsDir, name);

      const invocations = (await readIfPresent(join(workspace, INVOCATION_LOG))) ?? '';
      const report = reportsDir ? ((await readIfPresent(join(reportsDir, `${name}.txt`))) ?? '') : '';
      const producedPath = task.expectedFile ? join(workspace, task.expectedFile) : undefined;
      const producedFile = producedPath ? await readIfPresent(producedPath) : undefined;
      const producedFileMtime = producedPath ? await mtimeIfPresent(producedPath) : undefined;

      if (reportsDir && report === '') {
        missing.push(name);
      }

      // Only checkable for tasks that expect a file. A negative control has no
      // fixture and is supposed to leave no trace, so it always looks untouched.
      if (task.expectedFile) {
        const fixture = FIXTURES[task.id]?.[task.expectedFile];
        if (invocations === '' && producedFile === fixture) {
          notRun.push(name);
        }
      }

      results.push(
        gradeTrial(task, { taskId: task.id, invocations, transcript: report, producedFile, producedFileMtime }, cliValidator(workspace), {
          canObserveTriggering: Boolean(reportsDir),
        }),
      );
    }

    byTask.set(task.id, results);
  }

  return { byTask, missing, notRun };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop() ?? '')) {
  const trialsDir = process.argv[2];
  const reportsDir = process.argv[3];

  if (!trialsDir) {
    console.error('usage: node skills/eval/run-grading.ts <trials-dir> [reports-dir]');
    process.exitCode = 2;
  } else {
    const { byTask, missing, notRun } = await gradeAll(trialsDir, reportsDir);

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

    if (notRun.length > 0) {
      console.log(`\n> WARNING: ${notRun.length} workspace(s) look untouched, so their rows are not real results:`);
      for (const name of notRun) {
        console.log(`>   ${name}`);
      }
      console.log('> Either the agent never ran, or grading ran before it finished.');
    }

    if (missing.length > 0) {
      console.log(`\nNo agent report found for ${missing.length} workspace(s); their trigger grader reads as a miss.`);
    }
  }
}
