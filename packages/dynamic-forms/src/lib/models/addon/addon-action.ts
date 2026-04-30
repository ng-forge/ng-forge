import { FieldDef } from '../../definitions/base/field-def';

/**
 * Context handed to inline addon actions and registered handler functions.
 *
 * Lazily-typed today (`form` and `value` left `unknown`) so this lives in
 * the core model without coupling to `@angular/forms/signals` shape. The
 * dispatcher tightens these at construction time when the addon's host
 * field component is known.
 */
export interface AddonActionContext<TValue = unknown> {
  /** The field this addon is attached to. */
  readonly field: FieldDef<unknown>;
  /** Form-level handle (FieldTree from `@angular/forms/signals` at runtime). */
  readonly form: unknown;
  /** Current value of the host field at the time the action fires. */
  readonly value: TValue;
}

/**
 * Built-in preset actions shared across adapters.
 *
 * Adapter kinds that accept a `preset` field render the corresponding
 * behaviour:
 *
 * - `'clear'`: empties the field value.
 * - `'reset'`: empties the field today; restoring the field's configured
 *   default value requires `FormStateManager` integration that lands in a
 *   follow-up. Treat as a no-default-restore alias for `'clear'` until
 *   then.
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
