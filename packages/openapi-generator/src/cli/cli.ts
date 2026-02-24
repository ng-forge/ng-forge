import { createRequire } from 'node:module';
import { Command } from 'commander';
import { registerGenerateCommand } from './commands/generate.command.js';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json') as { version: string };

export async function run(): Promise<void> {
  const program = new Command();

  program.name('ng-forge-generator').description('Generate @ng-forge/dynamic-forms configurations from OpenAPI specs').version(version);

  registerGenerateCommand(program);

  await program.parseAsync(process.argv);
}
