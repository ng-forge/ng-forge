#!/usr/bin/env node
/**
 * Materialise one isolated workspace per eval trial.
 *
 * Each workspace gets the task's fixture files and a copy of the skill under
 * `.claude/skills/`, which is where an agent with the skill installed would
 * find it. Trials are separate directories so a second trial cannot benefit
 * from the first one's edits.
 *
 * Usage: node skills/eval/setup-workspaces.ts <output-dir> [trials]
 */

import { chmod, cp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EVAL_TASKS, FIXTURES } from './tasks.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SKILL_SOURCE = join(ROOT, 'skills', 'dynamic-forms');
const CLI_DIST = join(ROOT, 'dist', 'packages', 'dynamic-forms-cli');

/** Runtime dependencies the bundled CLI expects to resolve from node_modules. */
const CLI_RUNTIME_DEPS = ['commander', 'ts-morph', 'zod', 'zod-to-json-schema'];

/**
 * Install the built CLI into a workspace so the exact command the skill
 * documents resolves locally, with no network and no coaching.
 *
 * Without this the eval cannot measure whether an agent runs the validator,
 * because `npx @ng-forge/dynamic-forms-cli` would fail for reasons that have
 * nothing to do with the skill.
 */
async function installCli(workspace: string): Promise<void> {
  const modules = join(workspace, 'node_modules');
  await mkdir(join(modules, '@ng-forge'), { recursive: true });
  await mkdir(join(modules, '.bin'), { recursive: true });

  await symlink(CLI_DIST, join(modules, '@ng-forge', 'dynamic-forms-cli'), 'dir');

  for (const dep of CLI_RUNTIME_DEPS) {
    await symlink(join(ROOT, 'node_modules', dep), join(modules, dep), 'dir');
  }

  const bin = join(CLI_DIST, 'bin', 'ng-forge-validate.js');
  await chmod(bin, 0o755).catch(() => undefined);

  // A wrapper rather than a symlink, so every invocation is recorded in the
  // workspace. Grading "did the agent run the validator" from a log the agent
  // never sees is objective; grading it from a self-reported transcript is not.
  const wrapper = join(modules, '.bin', 'ng-forge-validate');
  await writeFile(
    wrapper,
    ['#!/bin/sh', `echo "$@" >> "${join(workspace, INVOCATION_LOG)}"`, `exec node "${bin}" "$@"`, ''].join('\n'),
    'utf-8',
  );
  await chmod(wrapper, 0o755);
}

/** Written by the CLI wrapper on every invocation. */
export const INVOCATION_LOG = '.validator-invocations.log';

/**
 * @param withSkill install the skill into each workspace. Pass false to build
 * the baseline arm: the same tasks, the same validator, no skill. Without that
 * comparison a high pass rate says nothing, because it cannot distinguish a
 * skill that works from a task an agent would have got right anyway.
 */
export async function setupWorkspaces(outputDir: string, trials: number, withSkill = true): Promise<string[]> {
  await rm(outputDir, { recursive: true, force: true });
  const created: string[] = [];

  for (const task of EVAL_TASKS) {
    for (let trial = 1; trial <= trials; trial++) {
      const workspace = join(outputDir, `${task.id}__t${trial}`);
      await mkdir(join(workspace, 'src'), { recursive: true });

      if (withSkill) {
        // The skill lands where a real install would put it.
        await mkdir(join(workspace, '.claude', 'skills'), { recursive: true });
        await cp(SKILL_SOURCE, join(workspace, '.claude', 'skills', 'dynamic-forms'), { recursive: true });
      }

      for (const [relativePath, contents] of Object.entries(FIXTURES[task.id] ?? {})) {
        await mkdir(dirname(join(workspace, relativePath)), { recursive: true });
        await writeFile(join(workspace, relativePath), contents, 'utf-8');
      }

      // A minimal manifest so a version check has something to read.
      await writeFile(
        join(workspace, 'package.json'),
        JSON.stringify(
          {
            name: `trial-${task.id}`,
            dependencies: { '@ng-forge/dynamic-forms': '1.1.0' },
            devDependencies: { '@ng-forge/dynamic-forms-cli': '1.1.0' },
          },
          null,
          2,
        ),
        'utf-8',
      );

      await installCli(workspace);

      created.push(workspace);
    }
  }

  return created;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const outputDir = process.argv[2];
  const trials = Number(process.argv[3] ?? 2);
  const withSkill = !process.argv.includes('--no-skill');

  if (!outputDir) {
    console.error('usage: node skills/eval/setup-workspaces.ts <output-dir> [trials] [--no-skill]');
    process.exitCode = 2;
  } else {
    const created = await setupWorkspaces(outputDir, trials, withSkill);
    console.log(`created ${created.length} workspace(s) under ${outputDir}`);
    for (const path of created) {
      console.log(`  ${path}`);
    }
  }
}
