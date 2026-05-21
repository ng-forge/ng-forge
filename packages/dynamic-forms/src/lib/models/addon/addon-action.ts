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
 *
 * `setValue` is non-optional here; the optional chain (`ctx.setValue?.()`)
 * is unnecessary noise once you've narrowed via {@link isFieldBoundContext}.
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

/**
 * Context handed to inline addon actions and registered handler functions.
 *
 * Discriminated by `form`: field-bound contexts have a non-null `form` and a
 * required `setValue`; orphan contexts have `form: null` and no `setValue`.
 * Use {@link isFieldBoundContext} when the handler needs to write back.
 *
 * @example
 * ```typescript
 * provideAddonActions({
 *   submit: (ctx) => {
 *     if (!isFieldBoundContext(ctx)) return;
 *     // ctx.setValue is now `(next: TValue) => void` — no optional chain.
 *     myService.send(ctx.field.key, ctx.value, ctx.setValue);
 *   },
 * });
 * ```
 */
export type AddonActionContext<TValue = unknown> = FieldBoundAddonActionContext<TValue> | OrphanAddonActionContext<TValue>;

/** Type guard narrowing {@link AddonActionContext} to its field-bound variant. */
export function isFieldBoundContext<TValue>(ctx: AddonActionContext<TValue>): ctx is FieldBoundAddonActionContext<TValue> {
  return ctx.form !== null;
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
 *
 * The `(string & {})` escape hatch keeps autocomplete on the known +
 * augmented presets while accepting arbitrary strings for one-off adapter
 * presets that don't warrant a module-augmentation. The runtime preset
 * runner already handles unknown names gracefully via its `default:` arm
 * (logs a warning, no throw). Mirrors `FieldDef.type`'s
 * `RegisteredFieldTypes['type'] | (string & {})` shape.
 */
export type AddonActionPreset = CommonAddonActionPreset | keyof DynamicFormAddonActionPresetRegistry | (string & {});

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
