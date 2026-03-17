/** Tab configuration for pages that display multiple markdown files as tabs. */

export interface TabEntry {
  label: string;
  /** Slug relative to the adapter prefix (e.g. 'dynamic-behavior/value-derivation'). */
  slug: string;
}

export interface TabGroup {
  tabs: TabEntry[];
  /** Nav path that this tab group corresponds to (for breadcrumb resolution). */
  navPath: string;
}

/**
 * Map of slug → TabGroup. The key is the parent slug OR one of the tab slugs.
 * All slugs in a group point to the same TabGroup instance so lookup is O(1).
 */
const TAB_GROUPS_MAP = new Map<string, TabGroup>();

function registerTabGroup(navPath: string, tabs: TabEntry[]): void {
  const group: TabGroup = { tabs, navPath };
  for (const tab of tabs) {
    TAB_GROUPS_MAP.set(tab.slug, group);
  }
}

// Value Derivation tabs (was mdFile array in ng-doc)
registerTabGroup('dynamic-behavior/derivation', [
  { label: 'Values', slug: 'dynamic-behavior/derivation/values' },
  { label: 'Properties', slug: 'dynamic-behavior/derivation/property' },
  { label: 'Async', slug: 'dynamic-behavior/derivation/async' },
]);

/** Returns the TabGroup for a slug, or undefined if the page has no tabs. */
export function findTabGroup(slug: string): TabGroup | undefined {
  return TAB_GROUPS_MAP.get(slug);
}

/** Returns the active tab entry for a slug, or undefined. */
export function findTabEntry(slug: string): TabEntry | undefined {
  const group = TAB_GROUPS_MAP.get(slug);
  return group?.tabs.find((t) => t.slug === slug);
}
