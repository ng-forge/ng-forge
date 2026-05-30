// Error display utilities for field components
export { createResolvedErrorsSignal } from './create-resolved-errors-signal';
export type { ResolvedError } from './create-resolved-errors-signal';
export { shouldShowErrors } from './should-show-errors';

// Value comparison utilities - re-exported from /internal
export { isEqual } from '@ng-forge/dynamic-forms/internal';

// Meta tracking utilities
export { setupMetaTracking } from './setup-meta-tracking';
export type { MetaTrackingOptions } from './setup-meta-tracking';

// Accessibility utilities
export { createAriaDescribedBySignal } from './create-aria-described-by';
