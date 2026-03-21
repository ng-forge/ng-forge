import chalk from 'chalk';

export const logger = {
  info(message: string): void {
    console.log(chalk.blue('i'), message);
  },
  success(message: string): void {
    console.log(chalk.green('v'), message);
  },
  warn(message: string): void {
    console.log(chalk.yellow('!'), message);
  },
  error(message: string): void {
    console.error(chalk.red('x'), message);
  },
};
