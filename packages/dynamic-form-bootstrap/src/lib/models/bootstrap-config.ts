/**
 * Global configuration for Bootstrap fields.
 *
 * This configuration can be provided at the application, route, or component level
 * to set default values for all Bootstrap fields. Field-level props will override
 * these global defaults.
 *
 * @example
 * ```typescript
 * // Application-level setup
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm(...withBootstrapFields()),
 *     ...withBootstrapConfig({ size: 'lg', floatingLabel: true })
 *   ]
 * });
 * ```
 *
 * @public
 */
export interface BootstrapConfig {
  /**
   * Default size for form controls (input, select, button).
   *
   * - `sm`: Small/compact size
   * - `lg`: Large size for better touch targets
   *
   * @default undefined (uses Bootstrap default)
   */
  size?: 'sm' | 'lg';

  /**
   * Enable floating labels for input and select fields.
   *
   * When enabled, labels float above the field when focused or filled.
   *
   * @default false
   */
  floatingLabel?: boolean;

  /**
   * Default button variant/color.
   *
   * - `primary`: Primary brand color
   * - `secondary`: Secondary color
   * - `success`: Success/positive action color
   * - `danger`: Danger/destructive action color
   * - `warning`: Warning color
   * - `info`: Informational color
   * - `light`: Light color
   * - `dark`: Dark color
   * - `link`: Link-style button (no background/border)
   *
   * @default 'primary'
   */
  buttonVariant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';

  /**
   * Default outlined button style.
   *
   * When enabled, buttons have an outline border instead of filled background.
   *
   * @default false
   */
  buttonOutline?: boolean;

  /**
   * Default block-level button.
   *
   * When enabled, buttons span the full width of their container.
   *
   * @default false
   */
  buttonBlock?: boolean;
}
