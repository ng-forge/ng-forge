import { ReadonlyFieldTree } from '../../core/field-tree-utils';

/**
 * Fields every addon-action context carries, regardless of whether the
 * addon is bound to a host field or rendered orphaned.
 */
interface AddonActionContextBase<TValue> {
  /**
   * Identity of the host field this addon is attached to. Empty strings
   * indicate the addon is rendered outside an active field context (rare).
   * Use {@link isFieldBoundContext} or the `form !== null` check to
   * narrow before relying on field identity.
   */
  readonly field: { readonly key: string; readonly type: string };
  /**
   * Current value of the host field at the time the action fires.
   * `undefined` when the host field has no value yet (initial render before
   * defaultValue resolution) or when the addon is rendered outside a field.
   */
  readonly value: TValue | undefined;
}

/**
 * Field-bound variant — the addon is attached to a real field and has a
 * working value-writer. The common case for `pi-button` / `mat-button` /
 * `bs-button` / `ion-button` inside an adapter input field.
 */
export interface FieldBoundAddonActionContext<TValue = unknown> extends AddonActionContextBase<TValue> {
  /** Read-only view of the host field's tree — same view wrappers receive. */
  readonly form: ReadonlyFieldTree<TValue>;
  /** Push a new value into the host field. */
  readonly setValue: (next: TValue) => void;
}

/**
 * Orphan variant — the addon is rendered outside any field component (rare;
 * happens when consumers compose `<df-addon-slot>` directly without a host
 * field). No writer is reachable; reading `value` may also yield `undefined`.
 */
export interface OrphanAddonActionContext<TValue = unknown> extends AddonActionContextBase<TValue> {
  readonly form: null;
  /** Always absent in the orphan variant — distinguishes the union members. */
  readonly setValue?: undefined;
}

/** Context handed to inline addon actions and registered handler functions. */
export type AddonActionContext<TValue = unknown> = FieldBoundAddonActionContext<TValue> | OrphanAddonActionContext<TValue>;

/** Type guard narrowing {@link AddonActionContext} to its field-bound variant. */
export function isFieldBoundContext<TValue>(ctx: AddonActionContext<TValue>): ctx is FieldBoundAddonActionContext<TValue> {
  return ctx.form !== null;
}

/** Built-in preset actions shared across adapters. */
export type CommonAddonActionPreset = 'clear' | 'reset' | 'paste' | 'copy' | 'toggle-password-visibility';

/** Module-augmentable registry of adapter-specific preset names. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type -- Intentionally empty: module-augmentation seam
export interface DynamicFormAddonActionPresetRegistry {}

/**
 * Union of every preset name an addon may reference — universal presets
 * plus any contributed via {@link DynamicFormAddonActionPresetRegistry}.
 */
export type AddonActionPreset = CommonAddonActionPreset | keyof DynamicFormAddonActionPresetRegistry | (string & {});

/** Module-augmentable registry of user-defined named action handlers. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type -- Intentionally empty: module-augmentation seam
export interface DynamicFormActionRegistry {}

/**
 * Typed string handle to a registered action handler. The empty registry
 * resolves to `never`; augmenting `DynamicFormActionRegistry` populates the
 * union and unlocks autocomplete.
 */
export type RegisteredActionRef = keyof DynamicFormActionRegistry;
