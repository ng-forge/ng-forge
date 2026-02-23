import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from './logger.js';

describe('logger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should log info messages to console.log', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('test message');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][1]).toBe('test message');
  });

  it('should log success messages to console.log', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.success('done');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][1]).toBe('done');
  });

  it('should log warn messages to console.log', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.warn('warning');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][1]).toBe('warning');
  });

  it('should log error messages to console.error', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('failure');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][1]).toBe('failure');
  });
});
