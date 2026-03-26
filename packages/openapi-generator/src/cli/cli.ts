import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { registerGenerateOptions, runGenerateAction } from './commands/generate.command.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { version } = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')) as { version: string };

export async function run(): Promise<void> {
  const program = new Command();

  program.name('ng-forge-generator').description('Generate @ng-forge/dynamic-forms configurations from OpenAPI specs').version(version);

  registerGenerateOptions(program);
  program.action(runGenerateAction);

  await program.parseAsync(process.argv);
}
