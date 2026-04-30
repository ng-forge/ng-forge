/**
 * Universal addon slot names supported by every adapter.
 *
 * Adapters render `prefix` to the leading edge of a field and `suffix` to
 * the trailing edge (mirrored in RTL). Additional slots may be contributed
 * via {@link DynamicFormAddonSlotRegistry} module augmentation.
 */
export type CommonAddonSlot = 'prefix' | 'suffix';

/**
 * Module-augmentable registry of adapter-specific addon slot names.
 *
 * Adapters that expose slots beyond the universal `prefix` / `suffix` (e.g.,
 * an "error overlay" slot specific to one design system) declare them here.
 *
 * @example
 * ```typescript
 * declare module '@ng-forge/dynamic-forms' {
 *   interface DynamicFormAddonSlotRegistry {
 *     'mat-error-overlay': true;
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type -- Intentionally empty: module-augmentation seam
export interface DynamicFormAddonSlotRegistry {}

/**
 * Union of every valid addon slot — universal slots plus any registered via
 * {@link DynamicFormAddonSlotRegistry} module augmentation.
 */
export type AddonSlot = CommonAddonSlot | keyof DynamicFormAddonSlotRegistry;
