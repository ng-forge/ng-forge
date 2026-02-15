import { describe, expect, it, beforeEach } from 'vitest';
import { UserInteractionTracker } from './user-interaction-tracker';

describe('UserInteractionTracker', () => {
  let tracker: UserInteractionTracker;

  beforeEach(() => {
    tracker = new UserInteractionTracker();
  });

  describe('markUserModified / isUserModified', () => {
    it('should return false for unmodified fields', () => {
      expect(tracker.isUserModified('name')).toBe(false);
    });

    it('should return true after marking a field as modified', () => {
      tracker.markUserModified('name');
      expect(tracker.isUserModified('name')).toBe(true);
    });

    it('should track multiple fields independently', () => {
      tracker.markUserModified('name');
      tracker.markUserModified('email');

      expect(tracker.isUserModified('name')).toBe(true);
      expect(tracker.isUserModified('email')).toBe(true);
      expect(tracker.isUserModified('phone')).toBe(false);
    });

    it('should be idempotent when marking the same field twice', () => {
      tracker.markUserModified('name');
      tracker.markUserModified('name');
      expect(tracker.isUserModified('name')).toBe(true);
    });
  });

  describe('clearUserModified', () => {
    it('should clear a specific field without affecting others', () => {
      tracker.markUserModified('name');
      tracker.markUserModified('email');

      tracker.clearUserModified('name');

      expect(tracker.isUserModified('name')).toBe(false);
      expect(tracker.isUserModified('email')).toBe(true);
    });

    it('should be a no-op for unmodified fields', () => {
      tracker.clearUserModified('name');
      expect(tracker.isUserModified('name')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should clear all tracked modifications', () => {
      tracker.markUserModified('name');
      tracker.markUserModified('email');
      tracker.markUserModified('phone');

      tracker.reset();

      expect(tracker.isUserModified('name')).toBe(false);
      expect(tracker.isUserModified('email')).toBe(false);
      expect(tracker.isUserModified('phone')).toBe(false);
    });

    it('should allow re-marking after reset', () => {
      tracker.markUserModified('name');
      tracker.reset();
      tracker.markUserModified('name');
      expect(tracker.isUserModified('name')).toBe(true);
    });
  });
});
