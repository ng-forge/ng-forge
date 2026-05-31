/** Universal addon slot names supported by every adapter. */
export type CommonAddonSlot = 'prefix' | 'suffix';

/** Module-augmentable registry of adapter-specific addon slot names. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type -- Intentionally empty: module-augmentation seam
export interface DynamicFormAddonSlotRegistry {}

/**
 * Union of every valid addon slot — universal slots plus any registered via
 * {@link DynamicFormAddonSlotRegistry} module augmentation.
 */
export type AddonSlot = CommonAddonSlot | keyof DynamicFormAddonSlotRegistry;
