import { describe, it, expect } from 'vitest';
import {
  LifecycleState,
  Phase,
  Action,
  Effect,
  isReadyState,
  isTransitioningState,
  createUninitializedState,
  createInitializingState,
  createReadyState,
  createTransitioningState,
  createDestroyedState,
  FormSetup,
  FormLifecycleState,
} from './state-types';
import { FormConfig } from '../models/form-config';
import { RegisteredFieldTypes } from '../models/registry/field-registry';

// ---------------------------------------------------------------------------
// Minimal mock data
// ---------------------------------------------------------------------------

const mockConfig = { fields: [] } as FormConfig<RegisteredFieldTypes[]>;
const mockPendingConfig = { fields: [] } as FormConfig<RegisteredFieldTypes[]>;

const mockFormSetup: FormSetup = {
  fields: [],
  schemaFields: [],
  defaultValues: {},
  mode: 'non-paged',
  registry: new Map(),
};

const mockPendingFormSetup: FormSetup = {
  fields: [],
  schemaFields: [],
  defaultValues: { name: 'pending' },
  mode: 'paged',
  registry: new Map(),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('state-types', () => {
  // ── Discriminant constants ──────────────────────────────────────────────

  describe('LifecycleState', () => {
    it('should have expected discriminant values', () => {
      expect(LifecycleState.Uninitialized).toBe('uninitialized');
      expect(LifecycleState.Initializing).toBe('initializing');
      expect(LifecycleState.Ready).toBe('ready');
      expect(LifecycleState.Transitioning).toBe('transitioning');
      expect(LifecycleState.Destroyed).toBe('destroyed');
    });

    it('should contain exactly five members', () => {
      expect(Object.keys(LifecycleState)).toHaveLength(5);
    });
  });

  describe('Phase', () => {
    it('should have expected discriminant values', () => {
      expect(Phase.Teardown).toBe('teardown');
      expect(Phase.Applying).toBe('applying');
      expect(Phase.Restoring).toBe('restoring');
    });

    it('should contain exactly three members', () => {
      expect(Object.keys(Phase)).toHaveLength(3);
    });
  });

  describe('Action', () => {
    it('should have expected discriminant values', () => {
      expect(Action.Initialize).toBe('initialize');
      expect(Action.ConfigChange).toBe('config-change');
      expect(Action.SetupComplete).toBe('setup-complete');
      expect(Action.ValueCaptured).toBe('value-captured');
      expect(Action.TeardownComplete).toBe('teardown-complete');
      expect(Action.ApplyComplete).toBe('apply-complete');
      expect(Action.RestoreComplete).toBe('restore-complete');
      expect(Action.Destroy).toBe('destroy');
    });

    it('should contain exactly eight members', () => {
      expect(Object.keys(Action)).toHaveLength(8);
    });
  });

  describe('Effect', () => {
    it('should have expected discriminant values', () => {
      expect(Effect.CaptureValue).toBe('capture-value');
      expect(Effect.WaitFrameBoundary).toBe('wait-frame-boundary');
      expect(Effect.CreateForm).toBe('create-form');
      expect(Effect.RestoreValues).toBe('restore-values');
    });

    it('should contain exactly four members', () => {
      expect(Object.keys(Effect)).toHaveLength(4);
    });
  });

  // ── Factory functions ───────────────────────────────────────────────────

  describe('createUninitializedState', () => {
    it('should create a state with type "uninitialized"', () => {
      const state = createUninitializedState();

      expect(state.type).toBe(LifecycleState.Uninitialized);
    });

    it('should only contain the type property', () => {
      const state = createUninitializedState();

      expect(Object.keys(state)).toEqual(['type']);
    });
  });

  describe('createInitializingState', () => {
    it('should create a state with type "initializing" and the given config', () => {
      const state = createInitializingState(mockConfig);

      expect(state.type).toBe(LifecycleState.Initializing);
      expect(state.config).toBe(mockConfig);
    });

    it('should preserve config reference identity', () => {
      const config = { fields: [] } as FormConfig<RegisteredFieldTypes[]>;
      const state = createInitializingState(config);

      expect(state.config).toBe(config);
    });
  });

  describe('createReadyState', () => {
    it('should create a state with type "ready", config, and formSetup', () => {
      const state = createReadyState(mockConfig, mockFormSetup);

      expect(state.type).toBe(LifecycleState.Ready);
      expect(state.config).toBe(mockConfig);
      expect(state.formSetup).toBe(mockFormSetup);
    });
  });

  describe('createTransitioningState', () => {
    it('should create a state with required fields only (no preservedValue, no pendingFormSetup)', () => {
      const state = createTransitioningState(Phase.Teardown, mockConfig, mockPendingConfig, mockFormSetup);

      expect(state.type).toBe(LifecycleState.Transitioning);
      expect(state.phase).toBe(Phase.Teardown);
      expect(state.currentConfig).toBe(mockConfig);
      expect(state.pendingConfig).toBe(mockPendingConfig);
      expect(state.currentFormSetup).toBe(mockFormSetup);
      expect(state.preservedValue).toBeUndefined();
      expect(state.pendingFormSetup).toBeUndefined();
    });

    it('should include preservedValue when provided', () => {
      const preserved = { name: 'John', age: 30 };

      const state = createTransitioningState(Phase.Applying, mockConfig, mockPendingConfig, mockFormSetup, preserved);

      expect(state.type).toBe(LifecycleState.Transitioning);
      expect(state.phase).toBe(Phase.Applying);
      expect(state.preservedValue).toBe(preserved);
      expect(state.pendingFormSetup).toBeUndefined();
    });

    it('should include both preservedValue and pendingFormSetup when provided', () => {
      const preserved = { email: 'test@example.com' };

      const state = createTransitioningState(
        Phase.Restoring,
        mockConfig,
        mockPendingConfig,
        mockFormSetup,
        preserved,
        mockPendingFormSetup,
      );

      expect(state.type).toBe(LifecycleState.Transitioning);
      expect(state.phase).toBe(Phase.Restoring);
      expect(state.preservedValue).toBe(preserved);
      expect(state.pendingFormSetup).toBe(mockPendingFormSetup);
    });

    it('should include pendingFormSetup without preservedValue when preservedValue is undefined', () => {
      const state = createTransitioningState(Phase.Applying, mockConfig, mockPendingConfig, mockFormSetup, undefined, mockPendingFormSetup);

      expect(state.preservedValue).toBeUndefined();
      expect(state.pendingFormSetup).toBe(mockPendingFormSetup);
    });

    it('should accept all Phase values', () => {
      const phases = [Phase.Teardown, Phase.Applying, Phase.Restoring] as const;

      for (const phase of phases) {
        const state = createTransitioningState(phase, mockConfig, mockPendingConfig, mockFormSetup);
        expect(state.phase).toBe(phase);
      }
    });
  });

  describe('createDestroyedState', () => {
    it('should create a state with type "destroyed"', () => {
      const state = createDestroyedState();

      expect(state.type).toBe(LifecycleState.Destroyed);
    });

    it('should only contain the type property', () => {
      const state = createDestroyedState();

      expect(Object.keys(state)).toEqual(['type']);
    });
  });

  // ── Type guards ─────────────────────────────────────────────────────────

  describe('isReadyState', () => {
    it('should return true for a ready state', () => {
      const state = createReadyState(mockConfig, mockFormSetup);

      expect(isReadyState(state)).toBe(true);
    });

    it('should return false for an uninitialized state', () => {
      const state: FormLifecycleState = createUninitializedState();

      expect(isReadyState(state)).toBe(false);
    });

    it('should return false for an initializing state', () => {
      const state: FormLifecycleState = createInitializingState(mockConfig);

      expect(isReadyState(state)).toBe(false);
    });

    it('should return false for a transitioning state', () => {
      const state: FormLifecycleState = createTransitioningState(Phase.Teardown, mockConfig, mockPendingConfig, mockFormSetup);

      expect(isReadyState(state)).toBe(false);
    });

    it('should return false for a destroyed state', () => {
      const state: FormLifecycleState = createDestroyedState();

      expect(isReadyState(state)).toBe(false);
    });
  });

  describe('isTransitioningState', () => {
    it('should return true for a transitioning state', () => {
      const state = createTransitioningState(Phase.Teardown, mockConfig, mockPendingConfig, mockFormSetup);

      expect(isTransitioningState(state)).toBe(true);
    });

    it('should return true for all transition phases', () => {
      const phases = [Phase.Teardown, Phase.Applying, Phase.Restoring] as const;

      for (const phase of phases) {
        const state: FormLifecycleState = createTransitioningState(phase, mockConfig, mockPendingConfig, mockFormSetup);

        expect(isTransitioningState(state)).toBe(true);
      }
    });

    it('should return false for an uninitialized state', () => {
      const state: FormLifecycleState = createUninitializedState();

      expect(isTransitioningState(state)).toBe(false);
    });

    it('should return false for an initializing state', () => {
      const state: FormLifecycleState = createInitializingState(mockConfig);

      expect(isTransitioningState(state)).toBe(false);
    });

    it('should return false for a ready state', () => {
      const state: FormLifecycleState = createReadyState(mockConfig, mockFormSetup);

      expect(isTransitioningState(state)).toBe(false);
    });

    it('should return false for a destroyed state', () => {
      const state: FormLifecycleState = createDestroyedState();

      expect(isTransitioningState(state)).toBe(false);
    });
  });
});
