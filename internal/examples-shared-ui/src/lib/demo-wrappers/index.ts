export { SectionWrapperComponent, type SectionWrapper } from './section-wrapper.component';
export { SECTION_WRAPPER } from './section-wrapper.registration';
export { ArraySectionWrapperComponent, type ArraySectionWrapper } from './array-section-wrapper.component';
export { ARRAY_SECTION_WRAPPER } from './array-section-wrapper.registration';
export { CustomErrorsWrapperComponent, type CustomErrorsWrapper } from './custom-errors-wrapper.component';
export { CUSTOM_ERRORS_WRAPPER } from './custom-errors-wrapper.registration';
import { SECTION_WRAPPER } from './section-wrapper.registration';
import { ARRAY_SECTION_WRAPPER } from './array-section-wrapper.registration';
import { CUSTOM_ERRORS_WRAPPER } from './custom-errors-wrapper.registration';
import type { WrapperTypeDefinition } from '@ng-forge/dynamic-forms';

/**
 * Convenience bundle of demo wrappers to spread into `provideDynamicForm(...)`
 * from each sandbox adapter's factory:
 *
 * ```ts
 * provideDynamicForm(...withMaterialFields(), ...DEMO_WRAPPERS);
 * ```
 */
export const DEMO_WRAPPERS: WrapperTypeDefinition[] = [SECTION_WRAPPER, ARRAY_SECTION_WRAPPER, CUSTOM_ERRORS_WRAPPER];
