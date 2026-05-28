import { Type } from '@angular/core';
import { DynamicText } from '../types/dynamic-text';
import { DynamicValue } from '../types/dynamic-value';
import { AddonSlot } from './addon-slot';

/** Base shape every addon kind extends. */
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

/** Module-augmentable registry of addon kinds. */
export interface DynamicFormAddonRegistry {
  text: TextAddon;
  template: TemplateAddon;
  component: ComponentAddon;
}

/** Union of every registered addon shape. */
export type AnyAddon = DynamicFormAddonRegistry[keyof DynamicFormAddonRegistry];

/* -- Core-shipped universal kinds -------------------------------------- */

/** Renders text content inline. */
export interface TextAddon extends BaseAddon {
  readonly kind: 'text';
  readonly text: DynamicText;
}

/** Renders a named `<ng-template>` projected into the host `<df-dynamic-form>`. */
export interface TemplateAddon extends BaseAddon {
  readonly kind: 'template';
  readonly templateKey: string;
}

/**
 * Renders an arbitrary Angular component as the addon body.
 *
 * @codeOnly The `component` loader is a function and cannot survive
 * `JSON.stringify`/`parse`. The lenient validator drops this kind when the
 * config originated from JSON (set via `sanitizeFormConfig({ source: 'json' })`).
 */
export interface ComponentAddon extends BaseAddon {
  readonly kind: 'component';
  readonly component: () => Promise<Type<unknown> | { default: Type<unknown> }>;
  readonly inputs?: Record<string, unknown>;
}
