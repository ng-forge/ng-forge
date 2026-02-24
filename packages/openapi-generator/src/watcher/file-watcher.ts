import { watch } from 'chokidar';
import { logger } from '../utils/logger.js';

export interface WatchOptions {
  specPath: string;
  onChange: () => Promise<void>;
  debounceMs?: number;
}

export function startWatcher(options: WatchOptions): { close: () => Promise<void> } {
  const { specPath, onChange, debounceMs = 500 } = options;

  logger.info(`Watching ${specPath} for changes...`);

  const watcher = watch(specPath, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: debounceMs,
    },
  });

  watcher.on('change', () => {
    logger.info('Spec file changed, regenerating...');
    onChange()
      .then(() => logger.success('Regeneration complete'))
      .catch((error) => logger.error(`Regeneration failed: ${error instanceof Error ? error.message : String(error)}`));
  });

  return {
    close: () => watcher.close(),
  };
}
