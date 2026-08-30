import type { Signal } from '@angular/core';

export interface ParkedFieldState {
  readonly disabled?: Signal<boolean>;
  readonly readonly?: Signal<boolean>;
  readonly required?: Signal<boolean>;
  readonly touched?: Signal<boolean>;
  readonly dirty?: Signal<boolean>;
  readonly errors?: Signal<readonly unknown[]>;
}

export type ParkableFieldTree = () => ParkedFieldState;

export interface ParkedDomState {
  readonly disabled: boolean;
  readonly readonly: boolean;
  readonly required: boolean;
  readonly touched: boolean;
  readonly dirty: boolean;
  readonly errors: readonly unknown[];
}

const EMPTY_ERRORS: readonly unknown[] = Object.freeze([]);

export function snapshotParkedDomState(fieldTree: ParkableFieldTree | undefined): ParkedDomState | null {
  const state = fieldTree?.();
  if (!state) return null;
  return {
    disabled: state.disabled?.() ?? false,
    readonly: state.readonly?.() ?? false,
    required: state.required?.() ?? false,
    touched: state.touched?.() ?? false,
    dirty: state.dirty?.() ?? false,
    errors: state.errors?.() ?? EMPTY_ERRORS,
  };
}

export function isSameParkedDomState(a: ParkedDomState | null, b: ParkedDomState | null): boolean {
  return (
    a === b ||
    (a !== null &&
      b !== null &&
      a.disabled === b.disabled &&
      a.readonly === b.readonly &&
      a.required === b.required &&
      a.touched === b.touched &&
      a.dirty === b.dirty &&
      a.errors === b.errors)
  );
}
