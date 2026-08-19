import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runValidate, EXIT_OK, EXIT_INVALID_CONFIG, EXIT_USAGE } from './run-validate.js';

/**
 * Strip ANSI so assertions read the words rather than the paint.
 *
 * Whether output is coloured depends on the stream, which the test runner owns;
 * these tests are about what the CLI says, not how it renders.
 */
// eslint-disable-next-line no-control-regex -- stripping ANSI is the whole point
const plain = (text: string) => text.replace(/\[[0-9;]*m/g, '');

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
    expect(plain(logs.join('\n'))).toContain('1 config valid');
  });

  it('exits 1 when a config fails validation', async () => {
    const code = await runValidate([join(dir, 'invalid.form.ts')], options);

    expect(code).toBe(EXIT_INVALID_CONFIG);
    expect(plain(errors.join('\n'))).toMatch(/errors? across 1 of 1 file/);
  });

  it('reports failures even when other files pass', async () => {
    const code = await runValidate([join(dir, '*.form.ts')], options);

    expect(code).toBe(EXIT_INVALID_CONFIG);
    expect(plain(logs.join('\n'))).toContain('brokenForm');
  });

  it('exits 2 when the pattern matches nothing', async () => {
    const code = await runValidate([join(dir, 'does-not-exist-*.ts')], options);

    expect(code).toBe(EXIT_USAGE);
    expect(plain(errors.join('\n'))).toContain('No files matched');
  });

  it('exits 2 on an unknown UI integration', async () => {
    const code = await runValidate([join(dir, 'valid.form.ts')], { ...options, ui: 'tailwind' });

    expect(code).toBe(EXIT_USAGE);
    expect(plain(errors.join('\n'))).toContain('Unknown UI integration');
  });

  it('does not fail a file that simply has no FormConfig', async () => {
    const code = await runValidate([join(dir, 'plain.ts')], options);

    expect(code).toBe(EXIT_OK);
    expect(plain(errors.join('\n'))).toContain('No FormConfig objects found');
  });

  it('emits parseable JSON under --json', async () => {
    const code = await runValidate([join(dir, 'invalid.form.ts')], { ...options, json: true });

    expect(code).toBe(EXIT_INVALID_CONFIG);
    const payload = JSON.parse(plain(logs.join('\n')));
    expect(payload.valid).toBe(false);
    expect(payload.filesChecked).toBe(1);
    expect(payload.files[0].configs[0].name).toBe('brokenForm');
  });

  it('suppresses the success summary under --quiet', async () => {
    const code = await runValidate([join(dir, 'valid.form.ts')], { ...options, quiet: true });

    expect(code).toBe(EXIT_OK);
    expect(plain(logs.join('\n'))).not.toContain('valid across');
  });
});

describe('output stays parseable when nothing will render it', () => {
  it('writes no escape codes to stdout when colour is disabled', async () => {
    // An agent captures this output and the skill tells it to read it. A stray
    // escape code is noise in exactly the place that must stay parseable.
    const previous = process.env['NO_COLOR'];
    process.env['NO_COLOR'] = '1';

    try {
      await runValidate([join(dir, 'valid.form.ts')], options);

      // eslint-disable-next-line no-control-regex -- asserting the absence of ANSI
      expect(logs.join('\n')).not.toMatch(/\[/);
    } finally {
      if (previous === undefined) delete process.env['NO_COLOR'];
      else process.env['NO_COLOR'] = previous;
    }
  });

  it('keeps progress off stdout entirely', async () => {
    // The spinner goes to stderr, so stdout is only ever the report.
    await runValidate([join(dir, 'valid.form.ts')], options);

    expect(plain(logs.join('\n'))).not.toContain('validating');
  });
});
