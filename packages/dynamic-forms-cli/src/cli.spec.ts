import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createProgram, run } from './cli.js';
import { EXIT_OK, EXIT_INVALID_CONFIG, EXIT_USAGE } from './run-validate.js';

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
  dir = await mkdtemp(join(tmpdir(), 'ng-forge-cli-argv-'));
  await writeFile(join(dir, 'valid.form.ts'), VALID_FORM, 'utf-8');
  await writeFile(join(dir, 'invalid.form.ts'), INVALID_FORM, 'utf-8');
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

beforeEach(() => {
  logs = [];
  errors = [];
  vi.spyOn(console, 'log').mockImplementation((msg?: unknown) => void logs.push(String(msg)));
  vi.spyOn(console, 'error').mockImplementation((msg?: unknown) => void errors.push(String(msg)));
  process.exitCode = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

/** Invoke the program the way the bin script does. */
async function invoke(...args: string[]): Promise<number | undefined> {
  await run(['node', 'ng-forge-validate', ...args]);
  return process.exitCode as number | undefined;
}

describe('createProgram', () => {
  it('is named after the binary', () => {
    expect(createProgram().name()).toBe('ng-forge-validate');
  });

  it('declares the documented flags', () => {
    const flags = createProgram()
      .options.map((o) => o.long)
      .sort();

    expect(flags).toEqual(['--json', '--quiet', '--ui']);
  });

  it('defaults the UI integration to material', () => {
    const ui = createProgram().options.find((o) => o.long === '--ui');
    expect(ui?.defaultValue).toBe('material');
  });

  it('defaults the boolean flags to off', () => {
    const program = createProgram();
    for (const long of ['--json', '--quiet']) {
      expect(program.options.find((o) => o.long === long)?.defaultValue, `${long} should default to false`).toBe(false);
    }
  });

  it('lists every UI integration in the --ui help text', () => {
    const ui = createProgram().options.find((o) => o.long === '--ui');
    for (const integration of ['material', 'bootstrap', 'primeng', 'ionic']) {
      expect(ui?.description).toContain(integration);
    }
  });

  it('requires at least one pattern argument', () => {
    const [arg] = createProgram().registeredArguments;
    expect(arg.required).toBe(true);
    expect(arg.variadic).toBe(true);
  });
});

describe('argv handling', () => {
  it('sets a zero exit code for a valid file', async () => {
    expect(await invoke(join(dir, 'valid.form.ts'))).toBe(EXIT_OK);
  });

  it('sets a failure exit code for an invalid file', async () => {
    expect(await invoke(join(dir, 'invalid.form.ts'))).toBe(EXIT_INVALID_CONFIG);
  });

  it('passes --ui through to the run', async () => {
    expect(await invoke(join(dir, 'valid.form.ts'), '--ui', 'tailwind')).toBe(EXIT_USAGE);
    expect(errors.join('\n')).toContain('Unknown UI integration');
  });

  it('passes --json through to the run', async () => {
    await invoke(join(dir, 'valid.form.ts'), '--json');
    expect(() => JSON.parse(logs.join('\n'))).not.toThrow();
  });

  it('accepts the short -u alias', async () => {
    expect(await invoke(join(dir, 'valid.form.ts'), '-u', 'bootstrap')).toBe(EXIT_OK);
  });

  it('accepts the short -q alias', async () => {
    await invoke(join(dir, 'valid.form.ts'), '-q');
    expect(logs.join('\n')).not.toContain('config(s) valid');
  });

  it('accepts several patterns at once', async () => {
    expect(await invoke(join(dir, 'valid.form.ts'), join(dir, 'invalid.form.ts'))).toBe(EXIT_INVALID_CONFIG);
  });
});
