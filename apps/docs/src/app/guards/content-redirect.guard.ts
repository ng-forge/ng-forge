import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Category index → first child redirects.
 * Keeps nav consistent: clicking "Validation" goes to "Validation > Basics".
 */
const CATEGORY_REDIRECTS: Record<string, string> = {
  'field-types': 'field-types/text-inputs',
  validation: 'validation/basics',
  'schema-validation': 'schema-validation/overview',
  'dynamic-behavior': 'dynamic-behavior/conditional-logic',
  'dynamic-behavior/derivation': 'dynamic-behavior/derivation/values',
  'dynamic-behavior/value-derivation': 'dynamic-behavior/derivation/values',
  prebuilt: 'prebuilt/form-groups',
  'prebuilt/form-arrays': 'prebuilt/form-arrays/simplified',
  recipes: 'recipes/custom-fields',
  examples: 'examples/contact-form',
};

/** Legacy route renames — old URLs still work after restructure. */
const ROUTE_RENAMES: Record<string, string> = {
  // Top-level renames
  installation: 'getting-started',
  'ui-libs-integrations': 'configuration',
  'custom-integrations': 'building-an-adapter',
  api: 'api-reference',
  // Old sub-paths → new locations
  'ui-libs-integrations/material': 'configuration',
  'ui-libs-integrations/bootstrap': 'configuration',
  'ui-libs-integrations/primeng': 'configuration',
  'ui-libs-integrations/ionic': 'configuration',
  'schema-fields': 'field-types/text-inputs',
  'schema-fields/field-types': 'field-types/text-inputs',
  'schema-fields/field-types/text-inputs': 'field-types/text-inputs',
  'schema-fields/field-types/selection': 'field-types/selection',
  'schema-fields/field-types/buttons': 'field-types/buttons',
  'schema-fields/field-types/utility': 'field-types/utility',
  'schema-fields/field-types/advanced-controls': 'field-types/advanced-controls',
  'dynamic-behavior/overview': 'dynamic-behavior/conditional-logic',
  'advanced/basics': 'recipes/type-safety',
  'advanced/custom-integrations': 'building-an-adapter',
  advanced: 'recipes/custom-fields',
  'advanced/custom-fields': 'recipes/custom-fields',
  'advanced/expression-parser': 'recipes/expression-parser',
  'advanced/type-safety': 'recipes/type-safety',
  'advanced/events': 'recipes/events',
  'advanced/value-exclusion': 'recipes/value-exclusion',
};

/**
 * Extract the content slug from the route snapshot.
 * With file-based routing's [...slug] catch-all, route.url is empty —
 * segments live in pathFromRoot. Strip the adapter prefix (first segment).
 */
function extractSlug(route: Parameters<CanActivateFn>[0]): string {
  const parts = route.pathFromRoot.flatMap((r) => r.url.map((s) => s.path));
  // Strip adapter prefix: ['material', 'validation'] → 'validation'
  return parts.slice(1).join('/');
}

/** Routes that are only meaningful under the "custom" adapter. */
const CUSTOM_ONLY_ROUTES = new Set(['building-an-adapter']);

export const contentRedirectGuard: CanActivateFn = (route) => {
  const slug = extractSlug(route);
  const adapter = route.pathFromRoot[1]?.paramMap.get('adapter') ?? 'material';

  const categoryTarget = CATEGORY_REDIRECTS[slug];
  if (categoryTarget) {
    return inject(Router).parseUrl(`/${adapter}/${categoryTarget}`);
  }

  const renameTarget = ROUTE_RENAMES[slug];
  if (renameTarget) {
    return inject(Router).parseUrl(`/${adapter}/${renameTarget}`);
  }

  if (adapter !== 'custom' && CUSTOM_ONLY_ROUTES.has(slug)) {
    return inject(Router).parseUrl(`/custom/${slug}`);
  }

  return true;
};
