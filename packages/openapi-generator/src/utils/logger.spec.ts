import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger, setLogLevel, getLogLevel } from './logger.js';

describe('logger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setLogLevel('normal');
  });

  it('should log info messages with ℹ icon to console.log', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('test message');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain('ℹ');
    expect(spy.mock.calls[0][1]).toBe('test message');
  });

  it('should log success messages with ✓ icon to console.log', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.success('done');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain('✓');
    expect(spy.mock.calls[0][1]).toBe('done');
  });

  it('should log warn messages with ⚠ icon to console.log', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.warn('warning');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain('⚠');
    expect(spy.mock.calls[0][1]).toBe('warning');
  });

  it('should log error messages with ✗ icon to console.error', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('failure');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain('✗');
    expect(spy.mock.calls[0][1]).toBe('failure');
  });

  describe('setLogLevel / getLogLevel', () => {
    it('should default to normal', () => {
      expect(getLogLevel()).toBe('normal');
    });

    it('should update the log level', () => {
      setLogLevel('verbose');
      expect(getLogLevel()).toBe('verbose');
      setLogLevel('quiet');
      expect(getLogLevel()).toBe('quiet');
    });
  });

  describe('quiet mode', () => {
    beforeEach(() => {
      setLogLevel('quiet');
    });

    it('should suppress info()', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.info('suppressed');
      expect(spy).not.toHaveBeenCalled();
    });

    it('should suppress success()', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.success('suppressed');
      expect(spy).not.toHaveBeenCalled();
    });

    it('should still show warn()', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.warn('visible');
      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][1]).toBe('visible');
    });

    it('should still show error()', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      logger.error('visible');
      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][1]).toBe('visible');
    });

    it('should suppress verbose()', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.verbose('suppressed');
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('verbose mode', () => {
    beforeEach(() => {
      setLogLevel('verbose');
    });

    it('should show verbose() with · icon', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.verbose('detail');
      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][1]).toBe('detail');
    });

    it('should still show info()', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.info('visible');
      expect(spy).toHaveBeenCalledOnce();
    });

    it('should still show success()', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.success('visible');
      expect(spy).toHaveBeenCalledOnce();
    });

    it('should still show warn()', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.warn('visible');
      expect(spy).toHaveBeenCalledOnce();
    });

    it('should still show error()', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      logger.error('visible');
      expect(spy).toHaveBeenCalledOnce();
    });
  });

  describe('normal mode', () => {
    it('should suppress verbose()', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.verbose('suppressed');
      expect(spy).not.toHaveBeenCalled();
    });

    it('should show info()', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.info('visible');
      expect(spy).toHaveBeenCalledOnce();
    });

    it('should show success()', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.success('visible');
      expect(spy).toHaveBeenCalledOnce();
    });

    it('should show warn()', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.warn('visible');
      expect(spy).toHaveBeenCalledOnce();
    });

    it('should show error()', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      logger.error('visible');
      expect(spy).toHaveBeenCalledOnce();
    });
  });
});
