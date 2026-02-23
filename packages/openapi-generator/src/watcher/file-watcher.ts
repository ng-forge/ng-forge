import { watch } from 'chokidar';
import { logger } from '../utils/logger.js';

export interface WatchOptions {
  specPath: string;
  onChange: () => Promise<void>;
  debounceMs?: number;
}

export function startWatcher(options: WatchOptions): { close: () => Promise<void> } {
  const { specPath, onChange, debounceMs = 500 } = options;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  logger.info(`Watching ${specPath} for changes...`);

  const watcher = watch(specPath, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: debounceMs,
    },
  });

  watcher.on('change', () => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(async () => {
      logger.info('Spec file changed, regenerating...');
      try {
        await onChange();
        logger.success('Regeneration complete');
      } catch (error) {
        logger.error(`Regeneration failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, debounceMs);
  });

  return {
    close: () => watcher.close(),
  };
}
