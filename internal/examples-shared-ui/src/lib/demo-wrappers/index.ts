export { SectionWrapperComponent, type SectionWrapper } from './section-wrapper.component';
export { SECTION_WRAPPER } from './section-wrapper.registration';
import { SECTION_WRAPPER } from './section-wrapper.registration';
import type { WrapperTypeDefinition } from '@ng-forge/dynamic-forms';

/**
 * Convenience bundle of demo wrappers to spread into `provideDynamicForm(...)`
 * from each sandbox adapter's factory:
 *
 * ```ts
 * provideDynamicForm(...withMaterialFields(), ...DEMO_WRAPPERS);
 * ```
 */
export const DEMO_WRAPPERS: WrapperTypeDefinition[] = [SECTION_WRAPPER];
