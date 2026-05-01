import { ReadonlyFieldTree } from '../../core/field-tree-utils';

/**
 * Context handed to inline addon actions and registered handler functions.
 *
 * `field` carries the host field's identity (key + type discriminant);
 * `form` is the same {@link ReadonlyFieldTree} view wrappers receive (no
 * write surface — use `setValue` to mutate the host field's value);
 * `setValue` is wired by adapter button kinds (e.g., `pi-button` plumbs
 * its value-writer token through). When no writer is reachable (rare —
 * addon rendered outside a field component) `setValue` is `undefined`.
 */
export interface AddonActionContext<TValue = unknown> {
  /** Identity of the host field this addon is attached to. */
  readonly field: { readonly key: string; readonly type: string };
  /** Read-only view of the host field's tree — same view wrappers receive. */
  readonly form: ReadonlyFieldTree<TValue> | null;
  /** Current value of the host field at the time the action fires. */
  readonly value: TValue;
  /**
   * Push a new value into the host field. Wired by the adapter's button
   * kind component (e.g., pi-button passes the field's value-writer
   * token); `undefined` when no writer is reachable.
   */
  readonly setValue?: (next: TValue) => void;
}

/**
 * Built-in preset actions shared across adapters.
 *
 * Adapter kinds that accept a `preset` field render the corresponding
 * behaviour:
 *
 * - `'clear'`: empties the field value.
 * - `'reset'`: restores the field's configured default value (resolved
 *   from the form's `defaultValues` map at click time); falls back to
 *   empty when no default is reachable.
 * - `'paste'`: reads from the system clipboard and writes the result.
 * - `'copy'`: writes the field's current value to the system clipboard.
 * - `'toggle-password-visibility'`: flips a host input's `type` between
 *   `password` and `text` (requires the host field to provide a type
 *   override token, e.g., `PRIME_INPUT_TYPE_OVERRIDE`).
 *
 * Form submission is intentionally NOT exposed as a button-addon preset —
 * use the dedicated `'submit'` field type instead.
 */
export type CommonAddonActionPreset = 'clear' | 'reset' | 'paste' | 'copy' | 'toggle-password-visibility';

/**
 * Module-augmentable registry of adapter-specific preset names.
 *
 * Adapters add their canonical actions (e.g., Material's
 * `'mat-datepicker-open'`) without forking the `AddonActionPreset` union.
 *
 * @example
 * ```typescript
 * declare module '@ng-forge/dynamic-forms' {
 *   interface DynamicFormAddonActionPresetRegistry {
 *     'mat-datepicker-open': true;
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type -- Intentionally empty: module-augmentation seam
export interface DynamicFormAddonActionPresetRegistry {}

/**
 * Union of every preset name an addon may reference — universal presets
 * plus any contributed via {@link DynamicFormAddonActionPresetRegistry}.
 */
export type AddonActionPreset = CommonAddonActionPreset | keyof DynamicFormAddonActionPresetRegistry;

/**
 * Module-augmentable registry of user-defined named action handlers.
 *
 * Users register handlers once at bootstrap with `provideAddonActions({...})`
 * and reference them from JSON-driven configs via `actionRef: 'handlerName'`.
 *
 * @example
 * ```typescript
 * declare module '@ng-forge/dynamic-forms' {
 *   interface DynamicFormActionRegistry {
 *     openProfile: true;
 *     runWorkflow: true;
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type -- Intentionally empty: module-augmentation seam
export interface DynamicFormActionRegistry {}

/**
 * Typed string handle to a registered action handler. The empty registry
 * resolves to `never`; augmenting `DynamicFormActionRegistry` populates the
 * union and unlocks autocomplete.
 */
export type RegisteredActionRef = keyof DynamicFormActionRegistry;
