import { Type } from '@angular/core';
import { DynamicText } from '../types/dynamic-text';
import { DynamicValue } from '../types/dynamic-value';
import { AddonSlot } from './addon-slot';

/**
 * Base shape every addon kind extends.
 *
 * Public contract:
 * - `slot` chooses where the addon renders (prefix / suffix / adapter-specific).
 * - `hidden` / `disabled` are reactive — re-evaluated when their underlying
 *   signals or observables emit.
 * - Multiple addons in the same slot render in array order, left-to-right
 *   within the slot (LTR; mirrored in RTL).
 *
 * Note: `meta` is intentionally absent — adapters declare addon-specific
 * fields via module augmentation rather than an untyped escape hatch.
 */
export interface BaseAddon<TSlot extends AddonSlot = AddonSlot> {
  /** Slot to render this addon in. */
  readonly slot: TSlot;
  /** CSS class applied to the addon host element. */
  readonly className?: string;
  /** Reactive visibility — when `true`, the addon is removed from layout. */
  readonly hidden?: DynamicValue<boolean>;
  /** Reactive disabled state — primarily relevant for interactive kinds. */
  readonly disabled?: DynamicValue<boolean>;
}

/**
 * Module-augmentable registry of addon kinds.
 *
 * Each key is the kind discriminant; each value is the addon's full shape
 * (extending {@link BaseAddon}). Core ships `text`, `template`, and
 * `component`; adapters add their own (e.g., `pi-icon`, `pi-button`).
 *
 * @example
 * ```typescript
 * declare module '@ng-forge/dynamic-forms' {
 *   interface DynamicFormAddonRegistry {
 *     'pi-icon': PiIconAddon;
 *     'pi-button': PiButtonAddon;
 *   }
 * }
 * ```
 */
export interface DynamicFormAddonRegistry {
  text: TextAddon;
  template: TemplateAddon;
  component: ComponentAddon;
}

/**
 * Union of every registered addon shape.
 */
export type AnyAddon = DynamicFormAddonRegistry[keyof DynamicFormAddonRegistry];

/* -- Core-shipped universal kinds -------------------------------------- */

/**
 * Renders text content inline.
 *
 * `text` is `DynamicText`, supporting plain strings, observables, and
 * signals — so values like `'$'`, `'.com'`, or interpolated counters
 * (`'42/100'`) all work uniformly.
 */
export interface TextAddon extends BaseAddon {
  readonly kind: 'text';
  readonly text: DynamicText;
}

/**
 * Renders a named `<ng-template>` projected into the host `<df-dynamic-form>`.
 *
 * JSON-safe — backends ship the key, FE supplies the template definition.
 * Use the `templateAddon(ref)` helper for rename-safe authoring in code.
 */
export interface TemplateAddon extends BaseAddon {
  readonly kind: 'template';
  readonly templateKey: string;
}

/**
 * Renders an arbitrary Angular component as the addon body.
 *
 * The loader returns either a component class directly or a module with a
 * `default` export. For non-default exports, unwrap with `.then(m => m.X)`:
 *
 * ```ts
 * { kind: 'component', component: () => import('./my').then(m => m.MyComponent) }
 * ```
 *
 * @codeOnly The `component` loader is a function and cannot survive
 * `JSON.stringify`/`parse`. The lenient validator drops this kind when the
 * config originated from JSON (set via `validateFormConfig({ source: 'json' })`).
 */
export interface ComponentAddon<TInputs = unknown> extends BaseAddon {
  readonly kind: 'component';
  readonly component: () => Promise<Type<unknown> | { default: Type<unknown> }>;
  readonly inputs?: TInputs;
}
