/**
 * Adapter-agnostic Zod schemas for `@ng-forge/dynamic-forms` configurations.
 *
 * The per-adapter schemas in `material/`, `bootstrap/`, `primeng/` and
 * `ionic/` build on these. Most callers want `validateFormConfig` from
 * `validate/` rather than the raw schemas.
 *
 * @example
 * ```typescript
 * import { BaseFormConfigSchema } from '@ng-forge/dynamic-forms-validation';
 *
 * const result = BaseFormConfigSchema.safeParse(formConfig);
 * if (!result.success) {
 *   console.error('Invalid form configuration:', result.error);
 * }
 * ```
 */

// Export all base schemas
export * from './schemas';
