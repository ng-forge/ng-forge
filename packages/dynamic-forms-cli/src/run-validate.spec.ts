import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runValidate, EXIT_OK, EXIT_INVALID_CONFIG, EXIT_USAGE } from './run-validate.js';

const VALID_FORM = `
import { FormConfig } from '@ng-forge/dynamic-forms';

const contactForm = {
  fields: [{ key: 'email', type: 'input', label: 'Email', required: true, email: true }],
} as const satisfies FormConfig;
`;

const INVALID_FORM = `
import { FormConfig } from '@ng-forge/dynamic-forms';

const brokenForm = {
  fields: [{ key: 'token', type: 'hidden' }],
} as const satisfies FormConfig;
`;

let dir: string;
let logs: string[];
let errors: string[];

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), 'ng-forge-cli-'));
  await writeFile(join(dir, 'valid.form.ts'), VALID_FORM, 'utf-8');
  await writeFile(join(dir, 'invalid.form.ts'), INVALID_FORM, 'utf-8');
  await writeFile(join(dir, 'plain.ts'), 'export const x = 1;', 'utf-8');
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

beforeEach(() => {
  logs = [];
  errors = [];
  vi.spyOn(console, 'log').mockImplementation((msg?: unknown) => void logs.push(String(msg)));
  vi.spyOn(console, 'error').mockImplementation((msg?: unknown) => void errors.push(String(msg)));
});

afterEach(() => {
  vi.restoreAllMocks();
});

const options = { ui: 'material', json: false, quiet: false };

describe('runValidate', () => {
  it('exits 0 when every config is valid', async () => {
    const code = await runValidate([join(dir, 'valid.form.ts')], options);

    expect(code).toBe(EXIT_OK);
    expect(logs.join('\n')).toContain('1 config(s) valid');
  });

  it('exits 1 when a config fails validation', async () => {
    const code = await runValidate([join(dir, 'invalid.form.ts')], options);

    expect(code).toBe(EXIT_INVALID_CONFIG);
    expect(errors.join('\n')).toMatch(/error\(s\) across 1 of 1 file/);
  });

  it('reports failures even when other files pass', async () => {
    const code = await runValidate([join(dir, '*.form.ts')], options);

    expect(code).toBe(EXIT_INVALID_CONFIG);
    expect(logs.join('\n')).toContain('brokenForm');
  });

  it('exits 2 when the pattern matches nothing', async () => {
    const code = await runValidate([join(dir, 'does-not-exist-*.ts')], options);

    expect(code).toBe(EXIT_USAGE);
    expect(errors.join('\n')).toContain('No files matched');
  });

  it('exits 2 on an unknown UI integration', async () => {
    const code = await runValidate([join(dir, 'valid.form.ts')], { ...options, ui: 'tailwind' });

    expect(code).toBe(EXIT_USAGE);
    expect(errors.join('\n')).toContain('Unknown UI integration');
  });

  it('does not fail a file that simply has no FormConfig', async () => {
    const code = await runValidate([join(dir, 'plain.ts')], options);

    expect(code).toBe(EXIT_OK);
    expect(errors.join('\n')).toContain('No FormConfig objects found');
  });

  it('emits parseable JSON under --json', async () => {
    const code = await runValidate([join(dir, 'invalid.form.ts')], { ...options, json: true });

    expect(code).toBe(EXIT_INVALID_CONFIG);
    const payload = JSON.parse(logs.join('\n'));
    expect(payload.valid).toBe(false);
    expect(payload.filesChecked).toBe(1);
    expect(payload.files[0].configs[0].name).toBe('brokenForm');
  });

  it('suppresses the success summary under --quiet', async () => {
    const code = await runValidate([join(dir, 'valid.form.ts')], { ...options, quiet: true });

    expect(code).toBe(EXIT_OK);
    expect(logs.join('\n')).not.toContain('config(s) valid');
  });
});
