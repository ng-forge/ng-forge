import { describe, expect, it } from 'vitest';
import { warnDeprecated } from './deprecation-warnings';
import { createDeprecationWarningTracker, DeprecationWarningTracker } from './deprecation-warning-tracker';
import { createMockLogger, MockLogger } from '../../../testing/src/mock-logger';

describe('deprecation-warnings', () => {
  let logger: MockLogger;
  let tracker: DeprecationWarningTracker;

  beforeEach(() => {
    logger = createMockLogger();
    tracker = createDeprecationWarningTracker();
  });

  describe('warnDeprecated', () => {
    // Tests run in dev mode, so isDevMode() returns true

    it('should emit warning via logger in dev mode', () => {
      warnDeprecated(logger, tracker, 'test-key', 'Test message');

      expect(logger.warn).toHaveBeenCalledOnce();
      expect(logger.warn).toHaveBeenCalledWith('[Dynamic Forms] DEPRECATED: Test message');
    });

    it('should fire only once per key (idempotent)', () => {
      warnDeprecated(logger, tracker, 'same-key', 'First call');
      warnDeprecated(logger, tracker, 'same-key', 'Second call');
      warnDeprecated(logger, tracker, 'same-key', 'Third call');

      expect(logger.warn).toHaveBeenCalledOnce();
    });

    it('should emit separate warnings for different keys', () => {
      warnDeprecated(logger, tracker, 'key-a', 'Message A');
      warnDeprecated(logger, tracker, 'key-b', 'Message B');

      expect(logger.warn).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalledWith('[Dynamic Forms] DEPRECATED: Message A');
      expect(logger.warn).toHaveBeenCalledWith('[Dynamic Forms] DEPRECATED: Message B');
    });

    it('should track warned keys in the tracker', () => {
      warnDeprecated(logger, tracker, 'tracked-key', 'Tracked');

      expect(tracker.warnedKeys.has('tracked-key')).toBe(true);
      expect(tracker.warnedKeys.size).toBe(1);
    });
  });
});
