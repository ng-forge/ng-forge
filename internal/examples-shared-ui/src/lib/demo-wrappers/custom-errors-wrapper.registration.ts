import type { WrapperTypeDefinition } from '@ng-forge/dynamic-forms';
import CustomErrorsWrapperComponent from './custom-errors-wrapper.component';

/**
 * Registration for the demo `custom-errors` wrapper. `rendersFieldErrors` keeps the
 * built-in from being appended next to it. See `section-wrapper.registration` for why
 * `loadComponent` resolves an already-imported component.
 */
export const CUSTOM_ERRORS_WRAPPER: WrapperTypeDefinition = {
  wrapperName: 'custom-errors',
  loadComponent: () => Promise.resolve({ default: CustomErrorsWrapperComponent }),
  rendersFieldErrors: true,
};
