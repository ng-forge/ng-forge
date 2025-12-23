import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConsoleLogger } from './console-logger';

describe('ConsoleLogger', () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    debugSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should log all message types', () => {
    const logger = new ConsoleLogger();

    logger.debug('debug message');
    logger.info('info message');
    logger.warn('warn message');
    logger.error('error message');

    expect(debugSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'debug message');
    expect(infoSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'info message');
    expect(warnSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'warn message');
    expect(errorSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'error message');
  });

  it('should pass additional arguments to console methods', () => {
    const logger = new ConsoleLogger();
    const data = { key: 'value' };
    const error = new Error('test error');

    logger.debug('debug message', data);
    logger.error('error message', error);

    expect(debugSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'debug message', data);
    expect(errorSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'error message', error);
  });
});
