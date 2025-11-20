import { describe, it, expect } from 'vitest';
import { PageNavigationStateChangeEvent } from './page-navigation-state-change.event';
import { PageOrchestratorState } from '../../core';
import { FormEvent } from '../interfaces/form-event';

describe('PageNavigationStateChangeEvent', () => {
  const createMockState = (overrides: Partial<PageOrchestratorState> = {}): PageOrchestratorState => ({
    currentPageIndex: 0,
    totalPages: 1,
    isFirstPage: true,
    isLastPage: true,
    navigationDisabled: false,
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
      const event = new PageNavigationStateChangeEvent(state);

      expect(event.state).toBe(state);
    });

    it('should create event with first page state', () => {
      const state = createMockState({
        currentPageIndex: 0,
        totalPages: 3,
        isFirstPage: true,
        isLastPage: false,
      });
      const event = new PageNavigationStateChangeEvent(state);

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
      const event = new PageNavigationStateChangeEvent(state);

      expect(event.state.isFirstPage).toBe(false);
      expect(event.state.isLastPage).toBe(true);
    });

    it('should create event with navigation disabled state', () => {
      const state = createMockState({
        navigationDisabled: true,
      });
      const event = new PageNavigationStateChangeEvent(state);

      expect(event.state.navigationDisabled).toBe(true);
    });
  });

  describe('Type property', () => {
    it('should have correct type value', () => {
      const state = createMockState();
      const event = new PageNavigationStateChangeEvent(state);

      expect(event.type).toBe('page-navigation-state-change');
    });

    it('should have const type literal', () => {
      const state = createMockState();
      const event = new PageNavigationStateChangeEvent(state);
      const type: 'page-navigation-state-change' = event.type;

      expect(type).toBe('page-navigation-state-change');
    });
  });

  describe('FormEvent interface', () => {
    it('should implement FormEvent interface', () => {
      const state = createMockState();
      const event = new PageNavigationStateChangeEvent(state);

      const formEvent: FormEvent = event;
      expect(formEvent.type).toBe('page-navigation-state-change');
    });

    it('should be assignable to FormEvent array', () => {
      const state1 = createMockState({ currentPageIndex: 0 });
      const state2 = createMockState({ currentPageIndex: 1 });
      const events: FormEvent[] = [new PageNavigationStateChangeEvent(state1), new PageNavigationStateChangeEvent(state2)];

      expect(events).toHaveLength(2);
      expect(events[0].type).toBe('page-navigation-state-change');
    });
  });

  describe('State property mutability', () => {
    it('should allow modification of state', () => {
      const initialState = createMockState({ currentPageIndex: 0 });
      const event = new PageNavigationStateChangeEvent(initialState);

      const newState = createMockState({ currentPageIndex: 1 });
      event.state = newState;

      expect(event.state).toBe(newState);
      expect(event.state.currentPageIndex).toBe(1);
    });

    it('should allow modification of state properties', () => {
      const state = createMockState({ navigationDisabled: false });
      const event = new PageNavigationStateChangeEvent(state);

      event.state.navigationDisabled = true;

      expect(event.state.navigationDisabled).toBe(true);
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
      const event = new PageNavigationStateChangeEvent(state);

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
      const event = new PageNavigationStateChangeEvent(state);

      expect(event.state.currentPageIndex).toBe(2);
      expect(event.state.totalPages).toBe(10);
      expect(event.state.isFirstPage).toBe(false);
      expect(event.state.isLastPage).toBe(false);
    });

    it('should handle navigation disabled scenario', () => {
      const state = createMockState({
        currentPageIndex: 1,
        totalPages: 5,
        navigationDisabled: true,
      });
      const event = new PageNavigationStateChangeEvent(state);

      expect(event.state.navigationDisabled).toBe(true);
    });

    it('should handle navigation enabled scenario', () => {
      const state = createMockState({
        currentPageIndex: 1,
        totalPages: 5,
        navigationDisabled: false,
      });
      const event = new PageNavigationStateChangeEvent(state);

      expect(event.state.navigationDisabled).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle state with zero-based page indexing', () => {
      const state = createMockState({
        currentPageIndex: 0,
        totalPages: 5,
      });
      const event = new PageNavigationStateChangeEvent(state);

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
      const event = new PageNavigationStateChangeEvent(state);

      expect(event.state.currentPageIndex).toBe(500);
      expect(event.state.totalPages).toBe(1000);
    });

    it('should preserve all state properties', () => {
      const state = createMockState({
        currentPageIndex: 3,
        totalPages: 7,
        isFirstPage: false,
        isLastPage: false,
        navigationDisabled: true,
      });
      const event = new PageNavigationStateChangeEvent(state);

      expect(event.state).toEqual(state);
      expect(event.state.currentPageIndex).toBe(3);
      expect(event.state.totalPages).toBe(7);
      expect(event.state.isFirstPage).toBe(false);
      expect(event.state.isLastPage).toBe(false);
      expect(event.state.navigationDisabled).toBe(true);
    });
  });
});
