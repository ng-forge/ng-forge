import type { WrapperTypeDefinition } from '@ng-forge/dynamic-forms';
import SectionWrapperComponent from './section-wrapper.component';

/**
 * Registration for the demo `section` wrapper.
 *
 * Returns the already-imported component via `Promise.resolve` rather than a
 * dynamic `import()`. ng-packagr flattens internal dynamic imports in library
 * bundles (same reason `text-field` / `button` etc. are eager in adapter libs),
 * so the lazy path wouldn't actually be lazy here. The wrapper loader still
 * awaits the Promise; behaviour is identical to an async chunk.
 */
export const SECTION_WRAPPER: WrapperTypeDefinition = {
  wrapperName: 'section',
  loadComponent: () => Promise.resolve({ default: SectionWrapperComponent }),
};
