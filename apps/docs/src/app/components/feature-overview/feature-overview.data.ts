/**
 * Plain-data source-of-truth for the feature-overview FAQ and the migration
 * checklist. Lives in its own module so the eagerly-loaded DocPageComponent
 * can read it for JSON-LD emission (FAQPage / HowTo rich results) without
 * forcing the much-larger feature-overview component into the eager bundle.
 */

export interface FaqEntry {
  /** Question text. Plain string, no markdown. */
  readonly q: string;
  /** Answer text. Backtick-code, links, and bold are processed at render time. */
  readonly a: string;
}

export interface MigrationStep {
  readonly name: string;
  readonly text: string;
}

/**
 * General-purpose FAQ rendered on /feature-overview and emitted as
 * schema.org/FAQPage JSON-LD on the same page.
 */
export const FEATURE_OVERVIEW_FAQ: readonly FaqEntry[] = [
  {
    q: 'How do I add a field type ng-forge does not ship?',
    a: "`provideDynamicForm(...)` is variadic — it takes a list of field-type registrations. Spread an adapter's bundle (`...withMaterialFields()` registers all the built-in Material fields), then append your own: `{ name: 'rich-text', loadComponent: () => import('./rich-text'), mapper: valueFieldMapper }`. Your component is a plain standalone Angular component that receives Signal Forms' `FieldTree<T>` via `input.required()`. See [Adding custom fields](/recipes/custom-fields).",
  },
  {
    q: 'How do I lazy-load select options from an API?',
    a: "Use a `targetProperty: 'options'` derivation with `source: 'http'`. Pass the URL (or query params with field-value interpolation), a `responseExpression` that maps the response to `{ value, label }[]`, and `dependsOn` if it should re-fetch when another field changes. See [Async data](/dynamic-behavior/derivation).",
  },
  {
    q: 'Can ng-forge run side by side with ngx-formly during a migration?',
    a: 'Yes. Different package names, different injection tokens, different component selectors. Install ng-forge, port one form at a time, deprecate formly when nothing imports `@ngx-formly/*`.',
  },
  {
    q: 'How do I share a config across multiple forms?',
    a: "`FormConfig` is a plain TypeScript object — extract reusable pieces (a field, a validator entry, a default `props` object) as named consts and import them. For application-wide defaults, use `defaultProps` on the form or adapter-level providers like `withMaterialFields({ appearance: 'fill' })`.",
  },
  {
    q: 'How do I localise labels and validation messages?',
    a: 'Labels, placeholders, and hint text accept `string | Signal<string> | Observable<string>` — wire them to your i18n service. Validation `kind`s map to messages via per-field `validationMessages` or form-level `defaultValidationMessages`. See the [i18n guide](/dynamic-behavior/i18n).',
  },
  {
    q: 'How do I export the submitted form value as plain JSON?',
    a: 'The `(submitted)` event emits the form value directly — `JSON.stringify(value)` is enough. To strip hidden, disabled, or readonly fields, set `excludeValueIfHidden` (and the sibling options) on the form config or via `withValueExclusionDefaults()`. See [Value exclusion](/recipes/value-exclusion).',
  },
  {
    q: 'Are hidden field values still in the submitted form value?',
    a: "Yes by default — ng-forge keeps hidden values live so a hide/show toggle preserves what the user typed. Opt out with `excludeValueIfHidden: true` to strip them at submission output time, or wire a `derivation` that clears the value when the hide condition is true (formly's `resetOnHide` behaviour).",
  },
  {
    q: 'How do I debounce a field, an HTTP derivation, or a custom condition?',
    a: "Debouncing happens on the consumer side: set `trigger: 'debounced'` and `debounceMs` on the derivation, condition, or HTTP validator that reads the value. The Signal Forms substrate commits on every change — there is no `updateOn: 'blur'` equivalent today, so debouncing the consumers is the closest workaround for blur-style commit timing.",
  },
  {
    q: 'Does ng-forge work without one of the four official UI adapters?',
    a: 'Yes — every adapter is built on the same public surface, so you can ship a custom adapter for Kendo, NG-ZORRO, NativeScript, or an in-house design system. See [Building an adapter](/building-an-adapter).',
  },
  {
    q: 'Does ng-forge use Reactive Forms (`FormGroup` / `FormControl`)?',
    a: "No. ng-forge is built on Angular Signal Forms (`@angular/forms/signals`). The primitive is `FieldTree<T>` — a signal-native tree of value, validity, dirty/touched state, and errors. Reactive Forms still works in Angular, but the two systems don't share types or APIs.",
  },
  {
    q: 'Is there a built-in file-upload field?',
    a: "Not today — file inputs are not a built-in field type in any adapter. Implement one as a custom field with `valueFieldMapper`: a standalone component that renders an `<input type='file'>`, captures `File | FileList` into the field's value, and (optionally) uploads to your backend via a custom validator or value-derivation. See [Adding custom fields](/recipes/custom-fields).",
  },
  {
    q: 'Is ng-forge SSR / hydration safe?',
    a: 'Yes. The library is built around Angular signals (no module-scoped mutable state), and the docs site itself is server-rendered with full incremental hydration through the `@defer` blocks that wrap heavy components. If you author a custom field type, follow the same rule the core library follows: keep all per-form state in DI-scoped services, never in module-level singletons.',
  },
  {
    q: 'Is there a codemod or automated migration tool from formly?',
    a: 'No automated migration tool today — port manually. The concept-mapping table in the [migration guide](/migrating-from-ngx-formly) is the closest thing to a porting cheatsheet; the [MCP server](/ai-integration) lets an LLM in your IDE generate large chunks of the new config from a description of the old one. A codemod is on the wishlist but not committed work.',
  },
  {
    q: 'How big is the bundle?',
    a: 'ng-forge is a **batteries-included framework** — the engine itself is intentionally large because it ships the full validation, conditional logic, derivation, schema, and array-management surface needed for API-driven forms (where the form shape is unknown at build time). What you do **not** pay for upfront: every adapter loads its field components via dynamic `import()` per field `type`, so a form that only uses `input` and `select` only fetches those two component bundles. UI adapters (Material, PrimeNG, Bootstrap, Ionic) themselves are independent packages — only the one you install ships.',
  },
  {
    q: 'Which Angular and browser versions are supported?',
    a: 'Angular 21+ (signal-native APIs depend on it). Browser-wise, ng-forge supports the same matrix as Angular 21 — modern evergreen browsers (Chrome / Edge / Firefox / Safari current and previous major). No IE 11.',
  },
];

/**
 * Six-step checklist mirrored from /migrating-from-ngx-formly#migration-checklist.
 * Emitted as schema.org/HowTo JSON-LD on the migration guide page.
 */
export const MIGRATION_CHECKLIST: readonly MigrationStep[] = [
  {
    name: 'Audit blockers',
    text: 'Audit blockers against "What ng-forge does NOT have an equivalent for". Decide upfront whether you will work around or stay on formly.',
  },
  {
    name: 'Install ng-forge',
    text: 'Install ng-forge and the matching UI adapter. Both libraries can coexist during the migration.',
  },
  {
    name: 'Port one read-only form first',
    text: 'Port one read-only form first — typically a settings page or profile form. Fewer moving parts means an easier sanity check.',
  },
  {
    name: 'Translate validators',
    text: 'Centralise custom validators on a single customFnConfig object you can import everywhere.',
  },
  {
    name: 'Translate forms in dependency order',
    text: 'Port forms with no cross-form coupling first; complex multi-step or array-heavy forms last.',
  },
  {
    name: 'Remove formly',
    text: 'Remove formly when nothing imports @ngx-formly/*. Run pnpm uninstall @ngx-formly/core @ngx-formly/<theme> and clean up provideFormlyCore.',
  },
];
