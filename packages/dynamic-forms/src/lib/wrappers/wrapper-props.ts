/**
 * Zero-cost type carrier used in wrapper registrations.
 *
 * Returns `undefined` at runtime but is typed as `T`, so TypeScript can
 * thread a wrapper's config type through `createWrappers(...)` into the
 * `InferWrapperRegistry<typeof ...>` utility without requiring users to
 * hand-write the augmentation shape.
 *
 * @example
 * ```typescript
 * const wrappers = createWrappers(
 *   {
 *     wrapperName: 'section',
 *     loadComponent: () => import('./section-wrapper'),
 *     props: wrapperProps<SectionWrapper>(),
 *   },
 * );
 *
 * declare module '@ng-forge/dynamic-forms' {
 *   interface FieldRegistryWrappers extends InferWrapperRegistry<typeof wrappers> {}
 * }
 * ```
 */
export function wrapperProps<T>(): T {
  return undefined as unknown as T;
}
