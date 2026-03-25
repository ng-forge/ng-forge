import chalk from 'chalk';

export type LogLevel = 'quiet' | 'normal' | 'verbose';

let currentLevel: LogLevel = 'normal';

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

export function getLogLevel(): LogLevel {
  return currentLevel;
}

export const logger = {
  info(message: string): void {
    if (currentLevel === 'quiet') return;
    console.log(chalk.blue('ℹ'), message);
  },
  success(message: string): void {
    // Success always shows, even in quiet mode (it's the only confirmation something happened)
    console.log(chalk.green('✓'), message);
  },
  warn(message: string): void {
    // Warnings always show, even in quiet mode
    console.log(chalk.yellow('⚠'), message);
  },
  error(message: string): void {
    console.error(chalk.red('✗'), message);
  },
  verbose(message: string): void {
    if (currentLevel !== 'verbose') return;
    console.log(chalk.gray('·'), message);
  },
};
