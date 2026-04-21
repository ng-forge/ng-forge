import { findTabEntry, findTabGroup } from './tabs.config';

/** Sidebar navigation structure — defines ordering, labels, and grouping. */

export interface NavItem {
  label: string;
  path: string;
  /** If present, this item is a category with children. */
  children?: NavItem[];
  /** CSS class for special decoration (e.g. 'sidebar-link--ai'). */
  cssClass?: string;
  /** Optional badge text (e.g. 'NEW'). */
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Getting Started', path: 'getting-started' },
  { label: 'Configuration', path: 'configuration' },
  { label: 'API-Driven Forms', path: 'api-driven-forms' },
  {
    label: 'Building an Adapter',
    path: 'building-an-adapter',
    /** Only visible when adapter === 'custom' — placed before Examples so custom users see it early. */
    cssClass: 'sidebar-link--custom-only',
  },
  {
    label: 'Examples',
    path: 'examples',
    /** Hidden when adapter === 'custom' — no example components exist for the custom adapter. */
    cssClass: 'sidebar-link--not-custom',
  },
  {
    label: 'Field Types',
    path: 'field-types',
    children: [
      { label: 'Text Inputs', path: 'field-types/text-inputs' },
      { label: 'Selection Fields', path: 'field-types/selection' },
      { label: 'Buttons & Actions', path: 'field-types/buttons' },
      { label: 'Utility Fields', path: 'field-types/utility' },
      { label: 'Advanced Controls', path: 'field-types/advanced-controls' },
    ],
  },
  {
    label: 'Validation',
    path: 'validation',
    children: [
      { label: 'Basics', path: 'validation/basics' },
      { label: 'Advanced', path: 'validation/advanced' },
      { label: 'Custom Validators', path: 'validation/custom-validators' },
      { label: 'Reference', path: 'validation/reference' },
    ],
  },
  {
    label: 'Schema Validation',
    path: 'schema-validation',
    children: [
      { label: 'Overview', path: 'schema-validation/overview' },
      { label: 'Angular Schema', path: 'schema-validation/angular-schema' },
      { label: 'Zod Validation', path: 'schema-validation/zod' },
    ],
  },
  {
    label: 'Dynamic Behavior',
    path: 'dynamic-behavior',
    children: [
      { label: 'Conditional Logic', path: 'dynamic-behavior/conditional-logic' },
      { label: 'Value Derivation', path: 'dynamic-behavior/derivation' },
      { label: 'Internationalization (i18n)', path: 'dynamic-behavior/i18n' },
      { label: 'Form Submission', path: 'dynamic-behavior/submission' },
    ],
  },
  {
    label: 'Layout Components',
    path: 'prebuilt',
    children: [
      { label: 'Form Groups', path: 'prebuilt/form-groups' },
      { label: 'Form Pages', path: 'prebuilt/form-pages' },
      { label: 'Form Rows', path: 'prebuilt/form-rows' },
      { label: 'Container Fields', path: 'prebuilt/container-field' },
      {
        label: 'Form Arrays',
        path: 'prebuilt/form-arrays',
        children: [
          { label: 'Simplified API', path: 'prebuilt/form-arrays/simplified' },
          { label: 'Complete API', path: 'prebuilt/form-arrays/complete' },
        ],
      },
      { label: 'Hidden Fields', path: 'prebuilt/hidden-fields' },
      { label: 'Text Components', path: 'prebuilt/text-components' },
    ],
  },
  {
    label: 'Wrappers',
    path: 'wrappers',
    badge: 'NEW',
    children: [
      { label: 'Overview', path: 'wrappers/overview' },
      { label: 'Writing a Wrapper', path: 'wrappers/writing-a-wrapper' },
      { label: 'Registering and Applying', path: 'wrappers/registering-and-applying' },
    ],
  },
  {
    label: 'Recipes',
    path: 'recipes',
    children: [
      { label: 'Adding Custom Fields', path: 'recipes/custom-fields' },
      { label: 'Expression Parser Security', path: 'recipes/expression-parser' },
      { label: 'Type Safety', path: 'recipes/type-safety' },
      { label: 'Events', path: 'recipes/events' },
      { label: 'Value Exclusion', path: 'recipes/value-exclusion' },
    ],
  },
  {
    label: 'AI Integration (MCP)',
    path: 'ai-integration',
    cssClass: 'sidebar-link--ai',
  },
  {
    label: 'OpenAPI Generator',
    path: 'openapi-generator',
    cssClass: 'sidebar-link--openapi',
  },
  {
    label: 'API Reference',
    path: 'api-reference',
  },
];

/** Walk NAV_ITEMS recursively and return the label for a given path, or undefined. */
export function findNavLabel(targetPath: string, items: NavItem[] = NAV_ITEMS): string | undefined {
  for (const item of items) {
    if (item.path === targetPath) return item.label;
    if (item.children) {
      const found = findNavLabel(targetPath, item.children);
      if (found) return found;
    }
  }
  return undefined;
}

export interface BreadcrumbEntry {
  label: string;
  path: string;
}

/** Build the breadcrumb trail for a given slug by walking NAV_ITEMS ancestors. */
export function findBreadcrumbTrail(targetPath: string, items: NavItem[] = NAV_ITEMS): BreadcrumbEntry[] {
  // Direct match in nav tree
  const direct = walkNavItems(targetPath, items);
  if (direct.length > 0) return direct;

  // Tab sub-page: resolve via the tab group's navPath
  const tabEntry = findTabEntry(targetPath);
  const tabGroup = findTabGroup(targetPath);
  if (tabEntry && tabGroup) {
    const parentTrail = walkNavItems(tabGroup.navPath, items);
    if (parentTrail.length > 0) {
      return [...parentTrail, { label: tabEntry.label, path: targetPath }];
    }
  }

  return [];
}

function walkNavItems(targetPath: string, items: NavItem[]): BreadcrumbEntry[] {
  for (const item of items) {
    if (item.path === targetPath) {
      return [{ label: item.label, path: item.path }];
    }
    if (item.children) {
      const childTrail = walkNavItems(targetPath, item.children);
      if (childTrail.length > 0) {
        return [{ label: item.label, path: item.path }, ...childTrail];
      }
    }
  }
  return [];
}
