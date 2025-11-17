import { InjectionToken } from '@angular/core';
import type { FieldSignalContext } from '../mappers/types';

/**
 * Injection token for providing field signal context to mappers and components.
 *
 * The field signal context is the "nervous system" of the dynamic form library,
 * providing access to:
 * - The form instance and structure
 * - Current form values (as signals)
 * - Default values
 * - Validation messages
 * - The injector for creating components
 *
 * This token is provided by the DynamicForm component and can be scoped
 * for nested forms (Groups, Arrays) via child injectors.
 *
 * @example
 * ```typescript
 * // In a mapper function
 * export function mapValueField(fieldDef: BaseValueField<any, any>): Binding[] {
 *   const context = inject(FIELD_SIGNAL_CONTEXT);
 *   const form = context.form();
 *   // ... use context
 * }
 *
 * // In a component
 * export class MyFieldComponent {
 *   private context = inject(FIELD_SIGNAL_CONTEXT);
 * }
 * ```
 */
export const FIELD_SIGNAL_CONTEXT = new InjectionToken<FieldSignalContext>(
  'FIELD_SIGNAL_CONTEXT',
  {
    providedIn: null, // Not provided at root - must be provided by DynamicForm
    factory: () => {
      throw new Error(
        'FIELD_SIGNAL_CONTEXT was not provided. ' +
          'This token must be provided by DynamicFormComponent or a container field component. ' +
          'If you are calling a mapper function directly, ensure it runs within runInInjectionContext() ' +
          'with an injector that provides FIELD_SIGNAL_CONTEXT.'
      );
    },
  }
);
