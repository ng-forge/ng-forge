import type { WrapperTypeDefinition } from '@ng-forge/dynamic-forms';
import ArraySectionWrapperComponent from './array-section-wrapper.component';

/**
 * Registration for the demo `arraySection` wrapper — see the sibling
 * section-wrapper.registration for notes on why this resolves the
 * component eagerly via `Promise.resolve` inside the library bundle.
 */
export const ARRAY_SECTION_WRAPPER: WrapperTypeDefinition = {
  wrapperName: 'arraySection',
  loadComponent: () => Promise.resolve({ default: ArraySectionWrapperComponent }),
};
