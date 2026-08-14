import { describe, it, expect } from 'vitest';
import { PagerStateEvent } from './pager-state.event';
import { PagerState } from '../../core';
import { FormEvent } from '@ng-forge/dynamic-forms/internal';

describe('PagerStateEvent', () => {
  const createMockState = (overrides: Partial<PagerState> = {}): PagerState => ({
    currentPageIndex: 0,
    totalPages: 1,
    isFirstPage: true,
    isLastPage: true,
    ...overrides,
  });

  describe('Event creation', () => {
    it('should create event with state', () => {
      const state = createMockState({
        currentPageIndex: 2,
        totalPages: 5,
        isFirstPage: false,
        isLastPage: false,
      });
      const event = new PagerStateEvent(state);

      expect(event.state).toBe(state);
    });

    it('should create event with first page state', () => {
      const state = createMockState({
        currentPageIndex: 0,
        totalPages: 3,
        isFirstPage: true,
        isLastPage: false,
      });
      const event = new PagerStateEvent(state);

      expect(event.state.isFirstPage).toBe(true);
      expect(event.state.isLastPage).toBe(false);
    });

    it('should create event with last page state', () => {
      const state = createMockState({
        currentPageIndex: 4,
        totalPages: 5,
        isFirstPage: false,
        isLastPage: true,
      });
      const event = new PagerStateEvent(state);

      expect(event.state.isFirstPage).toBe(false);
      expect(event.state.isLastPage).toBe(true);
    });
  });

  describe('Type property', () => {
    it('should have correct type value', () => {
      const state = createMockState();
      const event = new PagerStateEvent(state);

      expect(event.type).toBe('pager-state');
    });

    it('should have const type literal', () => {
      const state = createMockState();
      const event = new PagerStateEvent(state);
      const type: 'pager-state' = event.type;

      expect(type).toBe('pager-state');
    });
  });

  describe('FormEvent interface', () => {
    it('should implement FormEvent interface', () => {
      const state = createMockState();
      const event = new PagerStateEvent(state);

      const formEvent: FormEvent = event;
      expect(formEvent.type).toBe('pager-state');
    });

    it('should be assignable to FormEvent array', () => {
      const state1 = createMockState({ currentPageIndex: 0 });
      const state2 = createMockState({ currentPageIndex: 1 });
      const events: FormEvent[] = [new PagerStateEvent(state1), new PagerStateEvent(state2)];

      expect(events).toHaveLength(2);
      expect(events[0].type).toBe('pager-state');
    });
  });

  describe('State property mutability', () => {
    it('should allow modification of state', () => {
      const initialState = createMockState({ currentPageIndex: 0 });
      const event = new PagerStateEvent(initialState);

      const newState = createMockState({ currentPageIndex: 1 });
      event.state = newState;

      expect(event.state).toBe(newState);
      expect(event.state.currentPageIndex).toBe(1);
    });

    it('should allow modification of state properties', () => {
      const state = createMockState({ currentPageIndex: 0 });
      const event = new PagerStateEvent(state);

      event.state.currentPageIndex = 1;

      expect(event.state.currentPageIndex).toBe(1);
    });
  });

  describe('State scenarios', () => {
    it('should handle single page form state', () => {
      const state = createMockState({
        currentPageIndex: 0,
        totalPages: 1,
        isFirstPage: true,
        isLastPage: true,
      });
      const event = new PagerStateEvent(state);

      expect(event.state.isFirstPage).toBe(true);
      expect(event.state.isLastPage).toBe(true);
      expect(event.state.totalPages).toBe(1);
    });

    it('should handle multi-page form state', () => {
      const state = createMockState({
        currentPageIndex: 2,
        totalPages: 10,
        isFirstPage: false,
        isLastPage: false,
      });
      const event = new PagerStateEvent(state);

      expect(event.state.currentPageIndex).toBe(2);
      expect(event.state.totalPages).toBe(10);
      expect(event.state.isFirstPage).toBe(false);
      expect(event.state.isLastPage).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle state with zero-based page indexing', () => {
      const state = createMockState({
        currentPageIndex: 0,
        totalPages: 5,
      });
      const event = new PagerStateEvent(state);

      expect(event.state.currentPageIndex).toBe(0);
      expect(event.state.currentPageIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle state with large page counts', () => {
      const state = createMockState({
        currentPageIndex: 500,
        totalPages: 1000,
        isFirstPage: false,
        isLastPage: false,
      });
      const event = new PagerStateEvent(state);

      expect(event.state.currentPageIndex).toBe(500);
      expect(event.state.totalPages).toBe(1000);
    });

    it('should preserve all state properties', () => {
      const state = createMockState({
        currentPageIndex: 3,
        totalPages: 7,
        isFirstPage: false,
        isLastPage: false,
      });
      const event = new PagerStateEvent(state);

      expect(event.state).toEqual(state);
      expect(event.state.currentPageIndex).toBe(3);
      expect(event.state.totalPages).toBe(7);
      expect(event.state.isFirstPage).toBe(false);
      expect(event.state.isLastPage).toBe(false);
    });
  });
});
