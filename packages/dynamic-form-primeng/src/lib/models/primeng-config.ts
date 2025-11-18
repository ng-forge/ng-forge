/**
 * Global configuration for PrimeNG fields.
 *
 * This configuration can be provided at the application, route, or component level
 * to set default values for all PrimeNG fields. Field-level props will override
 * these global defaults.
 *
 * @example
 * ```typescript
 * // Application-level setup
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm(...withPrimeNGFields()),
 *     ...withPrimeNGConfig({ variant: 'filled', size: 'large' })
 *   ]
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Component-level setup
 * @Component({
 *   providers: [
 *     provideDynamicForm(...withPrimeNGFields()),
 *     ...withPrimeNGConfig({
 *       variant: 'filled',
 *       size: 'small',
 *       styleClass: 'my-custom-fields'
 *     })
 *   ]
 * })
 * export class MyFormComponent { }
 * ```
 *
 * @public
 */
export interface PrimeNGConfig {
  /**
   * Default visual variant for input fields (input, select, textarea).
   *
   * - `outlined`: Fields have an outline border
   * - `filled`: Fields have a filled background
   *
   * @default 'outlined'
   */
  variant?: 'outlined' | 'filled';

  /**
   * Default size for input fields (input, select, textarea).
   *
   * - `small`: Compact size
   * - `large`: Larger size for better touch targets
   *
   * @default undefined (uses PrimeNG default)
   */
  size?: 'small' | 'large';

  /**
   * Default CSS class to apply to all PrimeNG fields.
   *
   * Useful for applying custom styles or themes consistently across all fields.
   *
   * @default undefined
   */
  styleClass?: string;

  /**
   * Default button severity/variant.
   *
   * - `primary`: Primary brand color
   * - `secondary`: Secondary color
   * - `success`: Success/positive action color
   * - `info`: Informational color
   * - `warn`: Warning color
   * - `danger`: Danger/destructive action color
   * - `help`: Help/assistance color
   * - `contrast`: High contrast color
   *
   * @default 'primary'
   */
  buttonSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';

  /**
   * Default text-only button style.
   *
   * When enabled, buttons have no background or border.
   *
   * @default false
   */
  buttonText?: boolean;

  /**
   * Default outlined button style.
   *
   * When enabled, buttons have an outline border.
   *
   * @default false
   */
  buttonOutlined?: boolean;

  /**
   * Default raised button style.
   *
   * When enabled, buttons have a shadow/elevation effect.
   *
   * @default false
   */
  buttonRaised?: boolean;

  /**
   * Default rounded button style.
   *
   * When enabled, buttons have rounded corners.
   *
   * @default false
   */
  buttonRounded?: boolean;

  /**
   * Show calendar icon button in datepicker by default.
   *
   * @default true
   */
  datepickerShowIcon?: boolean;

  /**
   * Enable touch-optimized UI for datepicker on mobile devices.
   *
   * @default false
   */
  datepickerTouchUI?: boolean;

  /**
   * Default initial view for datepicker.
   *
   * - `date`: Calendar date view
   * - `month`: Month selection view
   * - `year`: Year selection view
   *
   * @default 'date'
   */
  datepickerView?: 'date' | 'month' | 'year';
}
