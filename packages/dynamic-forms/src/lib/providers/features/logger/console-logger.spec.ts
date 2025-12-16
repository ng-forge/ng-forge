import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConsoleLogger } from './console-logger';
import { LogLevel } from './log-level';

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

  describe('LogLevel.Debug', () => {
    it('should log all messages at Debug level', () => {
      const logger = new ConsoleLogger(LogLevel.Debug);

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(debugSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'debug message');
      expect(infoSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'info message');
      expect(warnSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'warn message');
      expect(errorSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'error message');
    });
  });

  describe('LogLevel.Info', () => {
    it('should log info, warn, and error messages', () => {
      const logger = new ConsoleLogger(LogLevel.Info);

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'info message');
      expect(warnSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'warn message');
      expect(errorSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'error message');
    });
  });

  describe('LogLevel.Warn', () => {
    it('should log warn and error messages only', () => {
      const logger = new ConsoleLogger(LogLevel.Warn);

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'warn message');
      expect(errorSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'error message');
    });
  });

  describe('LogLevel.Error', () => {
    it('should log error messages only', () => {
      const logger = new ConsoleLogger(LogLevel.Error);

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'error message');
    });
  });

  describe('LogLevel.Off', () => {
    it('should not log any messages', () => {
      const logger = new ConsoleLogger(LogLevel.Off);

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Additional arguments', () => {
    it('should pass additional arguments to console methods', () => {
      const logger = new ConsoleLogger(LogLevel.Debug);
      const data = { key: 'value' };
      const error = new Error('test error');

      logger.debug('debug message', data);
      logger.error('error message', error);

      expect(debugSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'debug message', data);
      expect(errorSpy).toHaveBeenCalledWith('[Dynamic Forms]', 'error message', error);
    });
  });
});
