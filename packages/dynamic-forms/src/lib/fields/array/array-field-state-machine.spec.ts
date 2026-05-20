import { describe, expect, it } from 'vitest';
import { ArrayFieldStateMachine } from './array-field-state-machine';

describe('ArrayFieldStateMachine', () => {
  describe('initial state', () => {
    it('starts idle with runId 0', () => {
      const fsm = new ArrayFieldStateMachine();
      expect(fsm.state()).toBe('idle');
      expect(fsm.runId()).toBe(0);
      expect(fsm.hasEverEmitted).toBe(false);
    });
  });

  describe('dispatch transitions', () => {
    it.each([['initial'], ['recreate'], ['clear']] as const)('%s transitions idle → pending', (kind) => {
      const fsm = new ArrayFieldStateMachine();
      fsm.dispatch({ kind });
      expect(fsm.state()).toBe('pending');
    });

    it('append bumps runId but stays in the current state', () => {
      const fsm = new ArrayFieldStateMachine();
      expect(fsm.state()).toBe('idle');
      const r = fsm.dispatch({ kind: 'append' });
      expect(fsm.state()).toBe('idle');
      expect(fsm.runId()).toBe(r.id);
    });

    it('every dispatch increments runId', () => {
      const fsm = new ArrayFieldStateMachine();
      const a = fsm.dispatch({ kind: 'initial' });
      const b = fsm.dispatch({ kind: 'append' });
      const c = fsm.dispatch({ kind: 'recreate' });
      expect(a.id).toBeLessThan(b.id);
      expect(b.id).toBeLessThan(c.id);
    });
  });

  describe('RunHandle.resolve / isStale', () => {
    it('resolve transitions pending → settled', () => {
      const fsm = new ArrayFieldStateMachine();
      const run = fsm.dispatch({ kind: 'initial' });
      run.resolve();
      expect(fsm.state()).toBe('settled');
    });

    it('stale resolve is a no-op', () => {
      const fsm = new ArrayFieldStateMachine();
      const a = fsm.dispatch({ kind: 'initial' });
      fsm.dispatch({ kind: 'recreate' }); // bumps runId, state remains pending
      a.resolve(); // stale — should not affect anything
      expect(fsm.state()).toBe('pending');
    });

    it('isStale detects newer dispatches', () => {
      const fsm = new ArrayFieldStateMachine();
      const a = fsm.dispatch({ kind: 'initial' });
      expect(a.isStale()).toBe(false);
      fsm.dispatch({ kind: 'append' });
      expect(a.isStale()).toBe(true);
    });

    it('resolve is idempotent within a run', () => {
      const fsm = new ArrayFieldStateMachine();
      const run = fsm.dispatch({ kind: 'initial' });
      run.resolve();
      run.resolve(); // should not flip state back or break anything
      expect(fsm.state()).toBe('settled');
    });
  });

  describe('shouldEmit', () => {
    it('returns false when state is not settled', () => {
      const fsm = new ArrayFieldStateMachine();
      expect(fsm.shouldEmit(true)).toBe(false);
      fsm.dispatch({ kind: 'initial' });
      expect(fsm.shouldEmit(true)).toBe(false); // pending, not settled
    });

    it('returns false when allReady is false', () => {
      const fsm = new ArrayFieldStateMachine();
      const run = fsm.dispatch({ kind: 'initial' });
      run.resolve();
      expect(fsm.shouldEmit(false)).toBe(false);
    });

    it('returns true exactly once per settled run', () => {
      const fsm = new ArrayFieldStateMachine();
      const run = fsm.dispatch({ kind: 'initial' });
      run.resolve();
      expect(fsm.shouldEmit(true)).toBe(true);
      expect(fsm.shouldEmit(true)).toBe(false); // already emitted
    });

    it('transitions back to idle after emitting', () => {
      const fsm = new ArrayFieldStateMachine();
      const run = fsm.dispatch({ kind: 'initial' });
      run.resolve();
      fsm.shouldEmit(true);
      expect(fsm.state()).toBe('idle');
    });

    it('sets hasEverEmitted after the first emit', () => {
      const fsm = new ArrayFieldStateMachine();
      const run = fsm.dispatch({ kind: 'initial' });
      run.resolve();
      expect(fsm.hasEverEmitted).toBe(false);
      fsm.shouldEmit(true);
      expect(fsm.hasEverEmitted).toBe(true);
    });

    it('re-fires on a new settled run', () => {
      const fsm = new ArrayFieldStateMachine();
      const run1 = fsm.dispatch({ kind: 'initial' });
      run1.resolve();
      fsm.shouldEmit(true);
      expect(fsm.state()).toBe('idle');

      const run2 = fsm.dispatch({ kind: 'recreate' });
      run2.resolve();
      expect(fsm.shouldEmit(true)).toBe(true);
    });
  });

  describe('the empty-clear path (form starts with [] and no prior emit)', () => {
    it('clear + resolve fires init once', () => {
      const fsm = new ArrayFieldStateMachine();
      const run = fsm.dispatch({ kind: 'clear' });
      run.resolve();
      expect(fsm.shouldEmit(true)).toBe(true);
    });

    it('a second empty-clear after init does not re-emit (caller checks hasEverEmitted)', () => {
      const fsm = new ArrayFieldStateMachine();
      const run = fsm.dispatch({ kind: 'clear' });
      run.resolve();
      fsm.shouldEmit(true);
      expect(fsm.hasEverEmitted).toBe(true);
      // Caller should NOT call resolve() on the next empty-clear because hasEverEmitted is true.
    });
  });
});
