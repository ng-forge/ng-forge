// Error display utilities for field components - re-exported from /internal.
// They live there so core container components (which cannot import from
// /integration) can resolve container-level validation messages too.
export { createResolvedErrorsSignal, shouldShowErrors } from '@ng-forge/dynamic-forms/internal';
export type { ResolvedError } from '@ng-forge/dynamic-forms/internal';

// Value comparison utilities - re-exported from /internal
export { isEqual } from '@ng-forge/dynamic-forms/internal';

// Meta tracking utilities
export { setupMetaTracking } from './setup-meta-tracking';
export type { MetaTrackingOptions } from './setup-meta-tracking';

// Accessibility utilities
export { createAriaDescribedBySignal } from './create-aria-described-by';
