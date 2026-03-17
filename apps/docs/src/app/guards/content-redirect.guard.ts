import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Category index → first child redirects.
 * Keeps nav consistent: clicking "Validation" goes to "Validation > Basics".
 */
const CATEGORY_REDIRECTS: Record<string, string> = {
  'schema-fields': 'schema-fields/field-types/text-inputs',
  'schema-fields/field-types': 'schema-fields/field-types/text-inputs',
  validation: 'validation/basics',
  'schema-validation': 'schema-validation/overview',
  'dynamic-behavior': 'dynamic-behavior/conditional-logic',
  'dynamic-behavior/derivation': 'dynamic-behavior/derivation/values',
  'dynamic-behavior/value-derivation': 'dynamic-behavior/derivation/values',
  prebuilt: 'prebuilt/form-groups',
  'prebuilt/form-arrays': 'prebuilt/form-arrays/simplified',
  advanced: 'advanced/custom-fields',
};

/** Legacy route renames — old URLs still work after restructure. */
const ROUTE_RENAMES: Record<string, string> = {
  installation: 'getting-started',
  'ui-libs-integrations': 'configuration',
  'custom-integrations': 'building-an-adapter',
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

  return true;
};
