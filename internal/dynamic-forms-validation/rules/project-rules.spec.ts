import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadProjectRules, RulesConfigError } from './project-rules';

let root: string;

/** A project directory with a manifest, plus whatever rules file a test needs. */
async function project(name: string, rules?: string) {
  const dir = join(root, name);
  await mkdir(join(dir, '.ng-forge'), { recursive: true });
  await writeFile(join(dir, 'package.json'), '{"name":"consumer"}', 'utf-8');
  if (rules !== undefined) await writeFile(join(dir, '.ng-forge', 'rules.json'), rules, 'utf-8');
  return join(dir, 'package.json');
}

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'ng-forge-rules-'));
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('loadProjectRules', () => {
  it('disables the rules the project names', async () => {
    const manifest = await project('ok', JSON.stringify({ disabled: ['core/nesting'] }));
    const rules = await loadProjectRules(manifest);

    expect(rules.disabled.has('core/nesting')).toBe(true);
    expect(rules.source).toContain('rules.json');
  });

  it('treats a missing file as nothing disabled', async () => {
    const manifest = await project('none');
    const rules = await loadProjectRules(manifest);

    expect(rules.disabled.size).toBe(0);
    expect(rules.source).toBeUndefined();
  });

  it('treats a missing project as nothing disabled', async () => {
    expect((await loadProjectRules(undefined)).disabled.size).toBe(0);
  });

  it('accepts a file with no disabled list', async () => {
    const manifest = await project('empty', '{}');
    expect((await loadProjectRules(manifest)).disabled.size).toBe(0);
  });
});

describe('a rules file that cannot be honoured fails loudly', () => {
  // Silently ignoring it is the worst outcome: the user believes a rule is off,
  // it is not, and nothing ever says so.
  it('rejects an unknown rule id and names it', async () => {
    const manifest = await project('unknown', JSON.stringify({ disabled: ['core/no-such-rule'] }));

    await expect(loadProjectRules(manifest)).rejects.toThrow(RulesConfigError);
    await expect(loadProjectRules(manifest)).rejects.toThrow(/core\/no-such-rule/);
  });

  it('lists the valid ids so the mistake is fixable', async () => {
    const manifest = await project('unknown-help', JSON.stringify({ disabled: ['typo'] }));

    await expect(loadProjectRules(manifest)).rejects.toThrow(/Known ids:/);
  });

  it('rejects malformed JSON with the parser message', async () => {
    const manifest = await project('broken', '{ not json');

    await expect(loadProjectRules(manifest)).rejects.toThrow(/not valid JSON/);
  });

  it('rejects a file it cannot read rather than treating it as absent', async () => {
    // A directory under the file's name, standing in for any read failure that
    // is not "missing". Treating it as absent turns every rule back on while
    // the user believes their file is being honoured.
    const dir = join(root, 'unreadable');
    await mkdir(join(dir, '.ng-forge', 'rules.json'), { recursive: true });
    await writeFile(join(dir, 'package.json'), '{"name":"consumer"}', 'utf-8');

    await expect(loadProjectRules(join(dir, 'package.json'))).rejects.toThrow(RulesConfigError);
    await expect(loadProjectRules(join(dir, 'package.json'))).rejects.toThrow(/cannot be read/);
  });

  it('rejects a disabled list that is not an array of ids', async () => {
    const manifest = await project('wrong-shape', JSON.stringify({ disabled: 'core/nesting' }));

    await expect(loadProjectRules(manifest)).rejects.toThrow(/must be an array of rule ids/);
  });

  it('names the file in every failure', async () => {
    // The message has to say which file, or a monorepo turns this into a hunt.
    const manifest = await project('named', '{ not json');

    await expect(loadProjectRules(manifest)).rejects.toThrow(/rules\.json/);
  });
});
