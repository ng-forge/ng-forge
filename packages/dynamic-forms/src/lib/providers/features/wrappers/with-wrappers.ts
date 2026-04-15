import { inject } from '@angular/core';
import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { WRAPPER_REGISTRY, WrapperTypeDefinition } from '../../../models/wrapper-type';
import { DynamicFormLogger } from '../logger/logger.token';

/**
 * Register wrapper types for use with the `wrapper` container field.
 *
 * Wrapper components provide visual decoration (sections, headers, expand/collapse,
 * styling) around field content. Each wrapper type defines a component that provides
 * a `#fieldComponent` ViewContainerRef slot where inner content is rendered.
 *
 * @example
 * ```typescript
 * // Register wrappers alongside field types
 * provideDynamicForm(
 *   ...withMaterialFields(),
 *   withWrappers([
 *     {
 *       name: 'section',
 *       loadComponent: () => import('./wrappers/section-wrapper.component')
 *                              .then(m => m.SectionWrapperComponent),
 *     },
 *     {
 *       name: 'style',
 *       loadComponent: () => import('./wrappers/style-wrapper.component')
 *                              .then(m => m.StyleWrapperComponent),
 *     },
 *   ])
 * )
 * ```
 *
 * @example
 * ```typescript
 * // Use in field configuration
 * const config: FormConfig = {
 *   fields: [
 *     {
 *       type: 'wrapper',
 *       key: 'contactSection',
 *       fields: [
 *         { key: 'email', type: 'input', value: '' },
 *         { key: 'phone', type: 'input', value: '' },
 *       ],
 *       wrappers: [
 *         { type: 'section', header: 'Contact Info' },
 *       ]
 *     }
 *   ]
 * };
 * ```
 *
 * @param wrapperTypes - Array of wrapper type definitions to register
 * @returns A DynamicFormFeature that provides the wrapper registry
 */
export function withWrappers(wrapperTypes: WrapperTypeDefinition[]): DynamicFormFeature<'wrappers'> {
  return createFeature('wrappers', [
    {
      provide: WRAPPER_REGISTRY,
      useFactory: () => {
        const logger = inject(DynamicFormLogger);
        const registry = new Map<string, WrapperTypeDefinition>();

        for (const wrapperType of wrapperTypes) {
          if (registry.has(wrapperType.name)) {
            logger.warn(`Wrapper type "${wrapperType.name}" is already registered. Overwriting.`);
          }
          registry.set(wrapperType.name, wrapperType);
        }

        return registry;
      },
    },
  ]);
}
