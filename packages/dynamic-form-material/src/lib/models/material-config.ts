import { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';

/**
 * Global configuration for Material Design fields.
 *
 * This configuration can be provided at the application, route, or component level
 * to set default values for all Material fields. Field-level props will override
 * these global defaults.
 *
 * @example
 * ```typescript
 * // Application-level setup
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm(...withMaterialFields()),
 *     ...withMaterialConfig({ appearance: 'fill' })
 *   ]
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Component-level setup
 * @Component({
 *   providers: [
 *     provideDynamicForm(...withMaterialFields()),
 *     ...withMaterialConfig({
 *       appearance: 'fill',
 *       subscriptSizing: 'fixed',
 *       disableRipple: true
 *     })
 *   ]
 * })
 * export class MyFormComponent { }
 * ```
 *
 * @public
 */
export interface MaterialConfig {
  /**
   * Default appearance for form fields (input, select, textarea, datepicker, slider, toggle).
   *
   * - `outline`: Fields have an outline border
   * - `fill`: Fields have a filled background
   *
   * @default 'outline'
   */
  appearance?: MatFormFieldAppearance;

  /**
   * Default subscript sizing for form fields (input, select, textarea, datepicker).
   *
   * - `dynamic`: Error messages expand/collapse dynamically
   * - `fixed`: Error messages always reserve space
   *
   * @default 'dynamic'
   */
  subscriptSizing?: SubscriptSizing;

  /**
   * Disable ripple effects globally for all Material fields.
   *
   * Applies to: input, datepicker, radio, checkbox, multi-checkbox, toggle
   *
   * @default false
   */
  disableRipple?: boolean;

  /**
   * Default label position for checkbox-like controls.
   *
   * - `before`: Label appears before the control
   * - `after`: Label appears after the control
   *
   * Applies to: radio, checkbox, multi-checkbox, toggle
   *
   * @default 'after'
   */
  labelPosition?: 'before' | 'after';

  /**
   * Enable touch-optimized UI for datepicker on mobile devices.
   *
   * When enabled, datepicker opens in a dialog optimized for touch interaction.
   *
   * @default false
   */
  datepickerTouchUi?: boolean;

  /**
   * Default view to show when datepicker opens.
   *
   * - `month`: Calendar month view
   * - `year`: Year selection view
   * - `multi-year`: Multi-year selection view
   *
   * @default 'month'
   */
  datepickerStartView?: 'month' | 'year' | 'multi-year';
}
