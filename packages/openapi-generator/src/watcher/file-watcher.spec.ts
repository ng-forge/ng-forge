import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('chokidar', () => ({
  watch: vi.fn(),
}));

vi.mock('../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { watch } from 'chokidar';
import { logger } from '../utils/logger.js';
import { startWatcher } from './file-watcher.js';

describe('startWatcher', () => {
  let mockClose: ReturnType<typeof vi.fn>;
  let mockOn: ReturnType<typeof vi.fn>;
  let capturedChangeHandler: (() => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedChangeHandler = undefined;

    mockClose = vi.fn().mockResolvedValue(undefined);
    mockOn = vi.fn().mockImplementation((event: string, handler: () => void) => {
      if (event === 'change') {
        capturedChangeHandler = handler;
      }
      return mockWatcher;
    });

    const mockWatcher = { on: mockOn, close: mockClose };
    vi.mocked(watch).mockReturnValue(mockWatcher as unknown as ReturnType<typeof watch>);
  });

  it('should call chokidar.watch with the provided specPath', () => {
    startWatcher({ specPath: '/path/to/spec.yaml', onChange: vi.fn() });

    expect(watch).toHaveBeenCalledWith('/path/to/spec.yaml', expect.any(Object));
  });

  it('should configure awaitWriteFinish with the default debounceMs of 500', () => {
    startWatcher({ specPath: '/path/to/spec.yaml', onChange: vi.fn() });

    expect(watch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        awaitWriteFinish: { stabilityThreshold: 500 },
      }),
    );
  });

  it('should configure awaitWriteFinish with the provided debounceMs', () => {
    startWatcher({ specPath: '/path/to/spec.yaml', onChange: vi.fn(), debounceMs: 1200 });

    expect(watch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        awaitWriteFinish: { stabilityThreshold: 1200 },
      }),
    );
  });

  it('should pass ignoreInitial: true to chokidar.watch', () => {
    startWatcher({ specPath: '/path/to/spec.yaml', onChange: vi.fn() });

    expect(watch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ ignoreInitial: true }));
  });

  it('should return an object with a close function', () => {
    const result = startWatcher({ specPath: '/path/to/spec.yaml', onChange: vi.fn() });

    expect(result).toHaveProperty('close');
    expect(typeof result.close).toBe('function');
  });

  it('should call watcher.close() when the returned close function is called', async () => {
    const result = startWatcher({ specPath: '/path/to/spec.yaml', onChange: vi.fn() });

    await result.close();

    expect(mockClose).toHaveBeenCalledOnce();
  });

  it('should register a change event handler on the watcher', () => {
    startWatcher({ specPath: '/path/to/spec.yaml', onChange: vi.fn() });

    expect(mockOn).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should call onChange when the change event fires', async () => {
    const onChange = vi.fn().mockResolvedValue(undefined);
    startWatcher({ specPath: '/path/to/spec.yaml', onChange });

    expect(capturedChangeHandler).toBeDefined();
    capturedChangeHandler!();

    await vi.waitFor(() => expect(onChange).toHaveBeenCalledOnce());
  });

  it('should log success after onChange resolves', async () => {
    const onChange = vi.fn().mockResolvedValue(undefined);
    startWatcher({ specPath: '/path/to/spec.yaml', onChange });

    capturedChangeHandler!();

    await vi.waitFor(() => expect(logger.success).toHaveBeenCalledWith('Regeneration complete'));
  });

  it('should log error with message when onChange rejects with an Error', async () => {
    const onChange = vi.fn().mockRejectedValue(new Error('parse failed'));
    startWatcher({ specPath: '/path/to/spec.yaml', onChange });

    capturedChangeHandler!();

    await vi.waitFor(() => expect(logger.error).toHaveBeenCalledWith('Regeneration failed: parse failed'));
  });

  it('should log error with stringified value when onChange rejects with a non-Error', async () => {
    const onChange = vi.fn().mockRejectedValue('something went wrong');
    startWatcher({ specPath: '/path/to/spec.yaml', onChange });

    capturedChangeHandler!();

    await vi.waitFor(() => expect(logger.error).toHaveBeenCalledWith('Regeneration failed: something went wrong'));
  });

  it('should log an info message with the specPath when starting the watcher', () => {
    startWatcher({ specPath: '/path/to/spec.yaml', onChange: vi.fn() });

    expect(logger.info).toHaveBeenCalledWith('Watching /path/to/spec.yaml for changes...');
  });
});
