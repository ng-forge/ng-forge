import { describe, it, expect } from 'vitest';
import { PageChangeEvent } from './page-change.event';
import { FormEvent } from '../interfaces/form-event';

describe('PageChangeEvent', () => {
  describe('Event creation', () => {
    it('should create event with all parameters', () => {
      const event = new PageChangeEvent(2, 5, 1);

      expect(event.currentPageIndex).toBe(2);
      expect(event.totalPages).toBe(5);
      expect(event.previousPageIndex).toBe(1);
    });

    it('should create event without optional previousPageIndex', () => {
      const event = new PageChangeEvent(0, 3);

      expect(event.currentPageIndex).toBe(0);
      expect(event.totalPages).toBe(3);
      expect(event.previousPageIndex).toBeUndefined();
    });

    it('should create event for first page navigation', () => {
      const event = new PageChangeEvent(0, 10);

      expect(event.currentPageIndex).toBe(0);
      expect(event.totalPages).toBe(10);
      expect(event.previousPageIndex).toBeUndefined();
    });

    it('should create event for last page', () => {
      const event = new PageChangeEvent(4, 5, 3);

      expect(event.currentPageIndex).toBe(4);
      expect(event.totalPages).toBe(5);
      expect(event.previousPageIndex).toBe(3);
    });

    it('should handle single page form', () => {
      const event = new PageChangeEvent(0, 1);

      expect(event.currentPageIndex).toBe(0);
      expect(event.totalPages).toBe(1);
    });
  });

  describe('Type property', () => {
    it('should have correct type value', () => {
      const event = new PageChangeEvent(0, 1);

      expect(event.type).toBe('page-change');
    });
  });

  describe('FormEvent interface', () => {
    it('should implement FormEvent interface', () => {
      const event = new PageChangeEvent(1, 3, 0);

      const formEvent: FormEvent = event;
      expect(formEvent.type).toBe('page-change');
    });
  });

  describe('Navigation scenarios', () => {
    it('should handle forward navigation', () => {
      const event = new PageChangeEvent(3, 5, 2);

      expect(event.currentPageIndex).toBeGreaterThan(event.previousPageIndex ?? 0);
    });

    it('should handle backward navigation', () => {
      const event = new PageChangeEvent(1, 5, 2);

      expect(event.currentPageIndex).toBeLessThan(event.previousPageIndex ?? 0);
    });

    it('should handle jump to specific page', () => {
      const event = new PageChangeEvent(4, 10, 0);

      expect(event.currentPageIndex - (event.previousPageIndex ?? 0)).toBe(4);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero-based indexing', () => {
      const event = new PageChangeEvent(0, 5);

      expect(event.currentPageIndex).toBe(0);
      expect(event.currentPageIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle large page counts', () => {
      const event = new PageChangeEvent(999, 1000, 998);

      expect(event.currentPageIndex).toBe(999);
      expect(event.totalPages).toBe(1000);
    });

    it('should preserve undefined previousPageIndex', () => {
      const event = new PageChangeEvent(0, 5);

      expect(event.previousPageIndex).toBeUndefined();
      expect('previousPageIndex' in event).toBe(true);
    });

    it('should handle previousPageIndex as 0', () => {
      const event = new PageChangeEvent(1, 5, 0);

      expect(event.previousPageIndex).toBe(0);
      expect(event.previousPageIndex).not.toBeUndefined();
    });
  });
});
