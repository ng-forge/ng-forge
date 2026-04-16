export { SECTION_WRAPPER, SectionWrapperComponent, type SectionWrapper } from './section-wrapper.component';
import { SECTION_WRAPPER } from './section-wrapper.component';
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
