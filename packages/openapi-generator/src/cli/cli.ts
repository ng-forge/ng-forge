import { Command } from 'commander';
import { registerGenerateCommand } from './commands/generate.command.js';

export async function run(): Promise<void> {
  const program = new Command();

  program.name('ng-forge-generator').description('Generate @ng-forge/dynamic-forms configurations from OpenAPI specs').version('0.6.0');

  registerGenerateCommand(program);

  await program.parseAsync(process.argv);
}
