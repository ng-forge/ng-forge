// Build-time constants injected via Angular's define option
// These are replaced at build time with actual values
declare const MATERIAL_EXAMPLES_URL: string;
declare const PRIMENG_EXAMPLES_URL: string;
declare const IONIC_EXAMPLES_URL: string;
declare const BOOTSTRAP_EXAMPLES_URL: string;

// Virtual module supplied by apps/docs/plugins/vite-plugin-docs-meta.ts.
// Carries the git-derived dateModified (YYYY-MM-DD) of the migration guide
// markdown so we don't hand-maintain the constant.
declare module 'virtual:docs-meta/migration-modified' {
  export const MIGRATION_GUIDE_DATE_MODIFIED: string;
}
