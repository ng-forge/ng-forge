/** `ng-forge-validate` command wiring. */

import { Command } from 'commander';
import { UI_INTEGRATIONS } from '@ng-forge/dynamic-forms-validation';
import { runValidate, EXIT_OK, EXIT_USAGE, type ValidateOptions } from './run-validate.js';

/** Build the commander program. Exposed for tests. */
export function createProgram(): Command {
  const program = new Command();

  program
    .name('ng-forge-validate')
    .description('Validate @ng-forge/dynamic-forms FormConfig objects in TypeScript or JavaScript files.')
    .argument('<patterns...>', 'glob pattern(s) of files to check, e.g. "src/**/*.form.ts"')
    .option('-u, --ui <integration>', `UI integration to validate against (${UI_INTEGRATIONS.join(', ')})`, 'material')
    .option('--json', 'emit machine-readable JSON instead of a report', false)
    .option('-q, --quiet', 'only report failures', false)
    .option('--require-config', 'fail when the matched files contain no FormConfig', false)
    .action(async (patterns: string[], options: ValidateOptions) => {
      process.exitCode = await runValidate(patterns, options);
    });

  return program;
}

/** Commander error codes that mean "we printed something and should succeed". */
const BENIGN_EXITS = new Set(['commander.helpDisplayed', 'commander.help', 'commander.version']);

/** Entry point used by the bin script. */
export async function run(argv: string[] = process.argv): Promise<void> {
  // Commander exits 1 on a usage error, which collides with "a config failed
  // validation". Take control so a malformed invocation reports 2, as documented.
  const program = createProgram().exitOverride();

  try {
    await program.parseAsync(argv);
  } catch (error) {
    const code = (error as { code?: string }).code ?? '';
    process.exitCode = BENIGN_EXITS.has(code) ? EXIT_OK : EXIT_USAGE;
  }
}
