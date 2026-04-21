/**
 * Configuration for the built-in 'row' wrapper type.
 *
 * The row wrapper applies grid/flex layout to the wrapped content, providing
 * horizontal field arrangement with 12-column sizing utilities (`df-col-1`
 * through `df-col-12`) available to child fields via their own `col` property.
 *
 * Applied automatically by `rowFieldMapper` when a user writes `{ type: 'row' }` —
 * users do not construct this config directly.
 *
 * @example
 * ```typescript
 * const wrapper: RowWrapper = { type: 'row' };
 * ```
 */
export interface RowWrapper {
  readonly type: 'row';
}
