## [1.1.0](https://github.com/ng-forge/ng-forge/compare/v1.0.0...v1.1.0) (2026-07-22)

### 🚀 Features

- **dynamic-forms:** support error-aware validation message functions ([#528](https://github.com/ng-forge/ng-forge/pull/528))
- **dynamic-forms:** apply conditional built-in validators natively with reactive constraints ([#529](https://github.com/ng-forge/ng-forge/pull/529))
- **dynamic-forms:** add public testing entrypoint for field fixtures ([#530](https://github.com/ng-forge/ng-forge/pull/530))

### 🐛 Bug Fixes

- **bootstrap:** drop stray size attribute on select when htmlSize is unset ([#522](https://github.com/ng-forge/ng-forge/pull/522))
- **dynamic-forms:** evaluate container/button logic with externalData and custom functions ([#508](https://github.com/ng-forge/ng-forge/pull/508))
- **dynamic-forms:** fix conditional validator cache collisions and error params ([#525](https://github.com/ng-forge/ng-forge/pull/525))
- **dynamic-forms:** resolve signal dynamic text without NG0602 in reactive contexts ([#524](https://github.com/ng-forge/ng-forge/pull/524))
- **dynamic-forms:** clear interaction state on form reset and clear events ([45ab62237](https://github.com/ng-forge/ng-forge/commit/45ab62237))
- **dynamic-forms:** add actionable error for uninitialized TestBed in fixtures ([#526](https://github.com/ng-forge/ng-forge/pull/526))
- **dynamic-forms:** apply grid column class to outermost wrapper host ([#527](https://github.com/ng-forge/ng-forge/pull/527))
- **dynamic-forms:** ignore symbol-keyed metadata when comparing form values ([#535](https://github.com/ng-forge/ng-forge/pull/535))
- **dynamic-forms:** make externalData reactive in dynamic values and validators ([#537](https://github.com/ng-forge/ng-forge/pull/537))
- **dynamic-forms:** support formSubmitting logic on value fields ([#514](https://github.com/ng-forge/ng-forge/pull/514))

### 📚 Documentation

- **mcp:** document error-aware validation message functions in lookup topic ([#536](https://github.com/ng-forge/ng-forge/pull/536))

### ✅ Tests

- **dynamic-forms:** cover nested field interaction state on reset and clear ([c29c5e722](https://github.com/ng-forge/ng-forge/commit/c29c5e722))

### ❤️ Thank You

- Antim Prisacaru @antimprisacaru

# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and uses [Conventional Commits](https://www.conventionalcommits.org/).

## [1.0.0](https://github.com/ng-forge/ng-forge/compare/v0.9.0...v1.0.0) (2026-06-17)

First stable release of `@ng-forge/dynamic-forms` and its UI adapters. The public API now follows Semantic Versioning, with the `@ng-forge/dynamic-forms/internal` entrypoint explicitly excluded. This release re-tiers the public API surface for 1.0, so anyone upgrading from 0.9.0 should read the migration guide at the end of this entry.

### 🚀 Features

- **docs:** seo foundation — sitemap CI, schema enrichment, migration page polish ([#423](https://github.com/ng-forge/ng-forge/pull/423))
- **docs:** redesign landing page with live form demos and ember motion ([#453](https://github.com/ng-forge/ng-forge/pull/453))
- **dynamic-forms:** support HTTP/async property derivations and extend expression parser ([#431](https://github.com/ng-forge/ng-forge/pull/431))
- **dynamic-forms:** add ng add schematic + Nx generator for adapter setup ([#443](https://github.com/ng-forge/ng-forge/pull/443))
- **dynamic-forms:** export HiddenField type and isHiddenField guard ([#475](https://github.com/ng-forge/ng-forge/pull/475))
- **dynamic-forms:** graduate core and ui adapters to stable ([#488](https://github.com/ng-forge/ng-forge/pull/488))

### 🐛 Bug Fixes

- **config:** tighten push-to-main hook to avoid false positives ([e6ac45328](https://github.com/ng-forge/ng-forge/commit/e6ac45328))
- **config:** address PR #434 review feedback ([#434](https://github.com/ng-forge/ng-forge/issues/434))
- **config:** remove inverted ignoreCommand that skipped production builds ([#468](https://github.com/ng-forge/ng-forge/pull/468))
- **deps:** remediate dependabot security advisories ([#497](https://github.com/ng-forge/ng-forge/pull/497))
- **docs:** SSR-render landing defers and add SEO redirects ([#440](https://github.com/ng-forge/ng-forge/pull/440))
- **docs:** self-host adapter icon fonts instead of loading from CDN ([#460](https://github.com/ng-forge/ng-forge/pull/460))
- **dynamic-forms:** scope DOM ids per form to prevent collisions ([#444](https://github.com/ng-forge/ng-forge/pull/444))
- **dynamic-forms:** allow array fields as children of group fields ([#448](https://github.com/ng-forge/ng-forge/pull/448))
- **dynamic-forms:** value/validation/derivation coverage-gap fixes and footgun guards ([#449](https://github.com/ng-forge/ng-forge/pull/449))
- **dynamic-forms:** align primeng to @primeuix/themes + wire test-schematics into CI ([#451](https://github.com/ng-forge/ng-forge/pull/451))
- **dynamic-forms:** preserve required-ness and typo-safety in inferred form model ([#480](https://github.com/ng-forge/ng-forge/pull/480))
- **dynamic-forms:** resolve 1.0 graduation blockers across peers, api surface, and mcp ([#496](https://github.com/ng-forge/ng-forge/pull/496))
- **openapi-generator:** drop description hint on container field types ([#426](https://github.com/ng-forge/ng-forge/pull/426))
- **openapi-generator:** map numeric enums to select instead of number input ([#447](https://github.com/ng-forge/ng-forge/pull/447))
- **openapi-generator:** extract multipart and urlencoded request body schemas ([9366c2825](https://github.com/ng-forge/ng-forge/commit/9366c2825))
- **openapi-generator:** omit skipped binary properties from generated types ([b901856a2](https://github.com/ng-forge/ng-forge/commit/b901856a2))
- **openapi-generator:** extract multipart and urlencoded request body schemas ([#486](https://github.com/ng-forge/ng-forge/pull/486))

### ⚡ Performance Improvements

- strip comments from FESM bundles to cut gzip size by ~49% ([#437](https://github.com/ng-forge/ng-forge/pull/437))
- **docs:** client-render API reference and add legacy URL redirects ([#470](https://github.com/ng-forge/ng-forge/pull/470))
- **dynamic-forms:** unmount hidden pages + cross-adapter perf bench infra ([#435](https://github.com/ng-forge/ng-forge/pull/435))
- **dynamic-forms:** lazy-load the derivation engine ([#464](https://github.com/ng-forge/ng-forge/pull/464))

### ♻️ Code Refactoring

- remove unused internal barrels and dead files ([#458](https://github.com/ng-forge/ng-forge/pull/458))
- ⚠️ **dynamic-forms:** unify derivation orchestrators (single class, one DI instance) ([#436](https://github.com/ng-forge/ng-forge/pull/436))
- **dynamic-forms:** extract shared debounced-rxResource LogicFn scaffolding ([#439](https://github.com/ng-forge/ng-forge/pull/439))
- **dynamic-forms:** single-traversal derivation collector ([#438](https://github.com/ng-forge/ng-forge/pull/438), [#436](https://github.com/ng-forge/ng-forge/issues/436))
- ⚠️ **dynamic-forms:** split public / internal / integration entrypoints ([#450](https://github.com/ng-forge/ng-forge/pull/450))
- ⚠️ **dynamic-forms:** trim and re-tier public API surface for 1.0 ([#469](https://github.com/ng-forge/ng-forge/pull/469))
- ⚠️ **dynamic-forms:** addon API consistency (kind to type, withAddonActions, /integration) ([#473](https://github.com/ng-forge/ng-forge/pull/473))
- ⚠️ **dynamic-forms:** remove createField and formConfig helpers ([#474](https://github.com/ng-forge/ng-forge/pull/474))
- **dynamic-forms:** drop deprecated InputTypeToValueType and tidy adapter testing exports ([#477](https://github.com/ng-forge/ng-forge/pull/477))
- ⚠️ **forms:** remove deprecated value-field aliases, deprecate button aliases ([#465](https://github.com/ng-forge/ng-forge/pull/465))

### 📚 Documentation

- add default behavioral rules to CLAUDE.md ([5c970d6fd](https://github.com/ng-forge/ng-forge/commit/5c970d6fd))
- trim verbose JSDoc and @example blocks from shipped libraries ([#442](https://github.com/ng-forge/ng-forge/pull/442))
- fix API inaccuracies and tighten prose across the docs site ([#490](https://github.com/ng-forge/ng-forge/pull/490))
- **docs:** add /integration to the API-reference generator ([#481](https://github.com/ng-forge/ng-forge/pull/481))
- **dynamic-forms:** document /internal as unsupported (no semver guarantee) ([#471](https://github.com/ng-forge/ng-forge/pull/471))
- **dynamic-forms:** add JSDoc to public event classes and DynamicForm ([#476](https://github.com/ng-forge/ng-forge/pull/476))
- **dynamic-forms:** surface /schema as a first-class public entrypoint ([#478](https://github.com/ng-forge/ng-forge/pull/478))

### 📦 Build System

- **docs:** export NODE_OPTIONS via wrapper script for Vercel build ([#432](https://github.com/ng-forge/ng-forge/pull/432))

### ✅ Tests

- **dynamic-forms:** enforce internal and integration definition type-tests in CI ([#487](https://github.com/ng-forge/ng-forge/pull/487))
- **ionic:** refresh grid-layout snapshots after Playwright 1.60 bump ([4aa9ba277](https://github.com/ng-forge/ng-forge/commit/4aa9ba277))

### Migration guide: 0.9.0 to 1.0.0

1.0.0 is the first stable release of `@ng-forge/dynamic-forms` and its adapters. From this release the public API follows SemVer: the main `@ng-forge/dynamic-forms` entrypoint, the adapter packages, and the `/schema` and `/integration` entrypoints are covered. The `@ng-forge/dynamic-forms/internal` entrypoint is explicitly unsupported and carries no semver guarantee, so do not import from it.

#### Version requirements

1.0.0 drops Angular 21 and Node 20/21. Bump these before upgrading:

- Angular: `@angular/common`, `@angular/core`, `@angular/forms` move to `^22.0.0`.
- Node: `^22.22.3 || ^24.15.0 || >=26.0.0` (core and all adapters). `@ng-forge/dynamic-form-mcp` requires Node `>=24.0.0`.
- Material adapter: `@angular/material` `^22.0.0`.
- PrimeNG adapter: `primeng` `>=21.0.0` (was `>=17.0.0`).
- Ionic adapter: `@ionic/angular` `>=8.0.0` (was `>=7.0.0`).
- Bootstrap adapter: no UI peer beyond Angular.
- Unchanged: `rxjs` `>=7.0.0`, `@standard-schema/spec` `^1.0.0`, and the `ngxtension` `>=4.0.0` dependency.

Bump all `@ng-forge/dynamic-forms*` packages to 1.0.0 together; they are fixed-versioned and must match. Angular's `ng update` flow handles the framework and Material bumps; pnpm/npm will surface the remaining peer mismatches at install time.

#### Adapter-author symbols moved to the `/integration` entrypoint

Symbols used to build custom field types, custom field components, or custom UI adapters were removed from the main `@ng-forge/dynamic-forms` entrypoint and are now exported only from `@ng-forge/dynamic-forms/integration`. This includes field mappers (`baseFieldMapper`, `buildBaseInputs`, `arrayFieldMapper`, `groupFieldMapper`, `pageFieldMapper`, `rowFieldMapper`, `textFieldMapper`, `containerFieldMapper`), field-type registration (`FieldTypeDefinition`, `FieldScope`, `ValueHandlingMode`, `FIELD_REGISTRY`), DI context tokens (`ARRAY_CONTEXT`, `GROUP_CONTEXT`, `FIELD_SIGNAL_CONTEXT`, `FORM_OPTIONS`, `DEFAULT_PROPS`, `injectFieldSignalContext`), FieldTree utilities (`getArrayLength`, `toReadonlyFieldTree`, `writeToFieldValue`), `RootFormRegistryService`, `EventBus`, `resolveTokens`, `applyValidator`, `applyValidators`, `DynamicTextPipe`, `dynamicTextToObservable`, `interpolateParams`, `applyMetaToElement`, and the FieldState types.

The consumer API (`DynamicForm`, `provideDynamicForm`, `FormConfig`, `FieldDef`, validators, logic, events, helpers) is unchanged and stays on `@ng-forge/dynamic-forms`. Pure consumer apps need no changes.

**Before**

```ts
import { FieldTypeDefinition, FIELD_REGISTRY, FIELD_SIGNAL_CONTEXT, baseFieldMapper, DynamicTextPipe } from '@ng-forge/dynamic-forms';
```

**After**

```ts
import {
  FieldTypeDefinition,
  FIELD_REGISTRY,
  FIELD_SIGNAL_CONTEXT,
  baseFieldMapper,
  DynamicTextPipe,
} from '@ng-forge/dynamic-forms/integration';
```

- If a single import statement mixes consumer-API and adapter-tier symbols, split it into two statements so the consumer symbols stay on `@ng-forge/dynamic-forms`.
- `resolveDynamicValue`, `ValueFieldComponent`, and `CheckedFieldComponent` remain available from both `@ng-forge/dynamic-forms` and `@ng-forge/dynamic-forms/integration`, so imports of those three can be left as-is.
- Users on the official adapter packages (`-material`, `-bootstrap`, `-primeng`, `-ionic`) are not affected; those packages were updated in the same change.
- Not auto-migratable: a blind find/replace would also rewrite the unchanged consumer-API imports.

#### `createField` and `formConfig` helpers removed

`createField(type, config)` and `formConfig(config)` are deleted from `@ng-forge/dynamic-forms`. `formConfig` was an identity function for type narrowing; `createField` returned `{ type, ...config }`. Author fields as plain object literals inside a `FormConfig` and type the config with `as const satisfies FormConfig`. The `FormConfig` type is still exported.

**Before**

```ts
import { formConfig, createField, DynamicForm } from '@ng-forge/dynamic-forms';

const config = formConfig({
  fields: [
    createField('input', { key: 'email', label: 'Email', required: true }),
    createField('submit', { key: 'submit', label: 'Submit' }),
  ],
});
```

**After**

```ts
import { FormConfig, DynamicForm } from '@ng-forge/dynamic-forms';

const config = {
  fields: [
    { type: 'input', key: 'email', label: 'Email', required: true },
    { type: 'submit', key: 'submit', label: 'Submit' },
  ],
} as const satisfies FormConfig;
```

- `createField`'s eager dev-time validation messages are gone. `FormStateManager` still validates the config at runtime, so verify your config still builds and runs.

#### `SubmitEvent` renamed to `FormSubmitEvent`; `field` shorthand removed

The event class `SubmitEvent` is renamed to `FormSubmitEvent`. The runtime discriminator stays `type: 'submit'`, so string subscriptions like `eventBus.on('submit')` still work; only the imported class name and any `eventBus.on<SubmitEvent>(...)` type parameter must change. Separately, the `field` shorthand was removed alongside `createField` and `formConfig` (the entire `./helpers` module is gone). There is no drop-in function replacement; author fields as object literals (see the section above).

Several adapter-author symbols were also removed from `@ng-forge/dynamic-forms` and must now be imported from `@ng-forge/dynamic-forms/integration`: `WRAPPER_REGISTRY`, the addon registry tokens, the type guards `isCheckedField`, `isValueField`, `isContainerTypedField`, and the non-field/button logic resolvers (`resolveSubmitButtonDisabled`, `resolveNextButtonDisabled`, `resolveNonFieldHidden`, `resolveNonFieldDisabled`) with their context types. A few internals (`formatAddonWarning`, `logAddonWarnings`, `sanitizeFormConfigPure`, `validateFieldAddons`, `walkAndValidateAddons`, `Prettify`) have no integration export; `sanitizeFormConfig` remains.

**Before**

```ts
import { SubmitEvent } from '@ng-forge/dynamic-forms';
import { EventBus } from '@ng-forge/dynamic-forms/integration';

// ...
this.eventBus.dispatch(SubmitEvent);
```

**After**

```ts
import { FormSubmitEvent } from '@ng-forge/dynamic-forms';
import { EventBus } from '@ng-forge/dynamic-forms/integration';

// ...
this.eventBus.dispatch(FormSubmitEvent);
```

- The `SubmitEvent` rename is a pure find/replace and is auto-migratable. The helper removal and the import-path move for adapter-author symbols are not.

#### Addon `kind` renamed to `type`; `provideAddonActions` renamed to `withAddonActions`

Three changes to addons:

1. In every field's `addons: [...]` array, the discriminant key `kind` is renamed to `type` (for example `{ slot: 'prefix', kind: 'text' }` becomes `{ slot: 'prefix', type: 'text' }`). The unrelated Angular Signal Forms validator-error `kind` (`{ kind: 'errorName' }`) is unchanged.
2. The provider `provideAddonActions(...)` is renamed to `withAddonActions(...)`; the call shape and placement inside `provideDynamicForm(...)` are identical.
3. The adapter-author addon surface moved to `@ng-forge/dynamic-forms/integration`: `DfAddonSlot`, `ADDON_TYPE_DEFINITIONS` (was `ADDON_KIND_DEFINITIONS`), `injectAddonTypeRegistry` (was `injectAddonKindRegistry`), `injectFieldsSupportingAddons`, `runPresetAction`, and the types `FieldAddonSupport`, `FieldAddonSupportEntry`, `AddonTypeSchema` (was `AddonKindSchema`), `AddonShapeValidator`. Registry renames in `/internal`: `AddonKindDefinition` to `AddonTypeDefinition`, `ADDON_KIND_REGISTRY` to `ADDON_TYPE_REGISTRY`, `getKind`/`hasKind` to `getType`/`hasType`.

`AddonTypeDefinition`, `withCustomAddon`, `withAddonActions`, `DfTemplate`, and the built-in renderer components (`TextAddonComponent`, `TemplateAddonComponent`, `ComponentAddonComponent`) stay on the main `@ng-forge/dynamic-forms` barrel.

**Before**

```ts
import { provideDynamicForm, provideAddonActions, type AddonActionContext } from '@ng-forge/dynamic-forms';

const field = {
  type: 'text',
  key: 'amount',
  addons: [
    { slot: 'prefix', kind: 'text', text: '$' },
    { slot: 'suffix', kind: 'mat-button', icon: 'close', preset: 'clear' },
  ],
};

provideDynamicForm(
  ...withMaterialFields(),
  provideAddonActions({
    logClick: (ctx: AddonActionContext) => console.log(ctx),
  }),
);
```

**After**

```ts
import { provideDynamicForm, withAddonActions, type AddonActionContext } from '@ng-forge/dynamic-forms';

const field = {
  type: 'text',
  key: 'amount',
  addons: [
    { slot: 'prefix', type: 'text', text: '$' },
    { slot: 'suffix', type: 'mat-button', icon: 'close', preset: 'clear' },
  ],
};

provideDynamicForm(
  ...withMaterialFields(),
  withAddonActions({
    logClick: (ctx: AddonActionContext) => console.log(ctx),
  }),
);
```

- Scope the `kind` to `type` rename to addon objects inside `addons: [...]` only; do not touch validator-error `kind`.
- The provider rename and import-path move are mechanical, but the scoped `kind` rename is not, so this change is not auto-migratable as a whole.

#### Per-field value directive-access type aliases removed from adapter packages

36 type aliases are removed from the four adapter packages: the cross product of prefixes `{Mat, Bs, Prime, Ionic}` and field types `{Input, Textarea, Select, Checkbox, Radio, MultiCheckbox, Datepicker, Slider, Toggle}`, each named `<Prefix><FieldType>Component` (for example `MatInputComponent`, `BsSelectComponent`, `PrimeToggleComponent`, `IonicCheckboxComponent`). Each was a type alias for `ValueFieldComponent<XxxField>` used for typed directive access. The replacement is the runtime helper `injectNgForgeField<T>()` from `@ng-forge/dynamic-forms/integration`. The `<Prefix>ButtonComponent` aliases are only deprecated in this release and still compile.

**Before**

```ts
import type { MatInputComponent } from '@ng-forge/dynamic-forms-material';

// typed handle to the input field's directive instance
let fieldRef: MatInputComponent;
```

**After**

```ts
import { injectNgForgeField } from '@ng-forge/dynamic-forms/integration';

// inside a component constructor / field initializer
const fieldRef = injectNgForgeField<string>();
// fieldRef.field is Signal<FieldTree<string>>
```

- `injectNgForgeField<T>()` must run in an Angular injection context (constructor or field initializer); `T` is the field's value type.
- Plan to migrate `<Prefix>ButtonComponent` usages to `injectNgForgeAction<TEvent>()` before their later removal.
- Not auto-migratable: the call and its generic value type cannot be reconstructed from the removed type alias.

#### `InputTypeToValueType` type alias removed

The deprecated type `InputTypeToValueType<T>` is removed from `@ng-forge/dynamic-forms/integration`. Use `InferInputValue<T>` from the same entrypoint; it produces the identical result for any `InputType` argument. This is type-only with no runtime symbol.

**Before**

```ts
import type { InputTypeToValueType } from '@ng-forge/dynamic-forms/integration';

type EmailValue = InputTypeToValueType<'email'>; // string
type AmountValue = InputTypeToValueType<'number'>; // number
```

**After**

```ts
import type { InferInputValue } from '@ng-forge/dynamic-forms/integration';

type EmailValue = InferInputValue<'email'>; // string
type AmountValue = InferInputValue<'number'>; // number
```

- Pure rename with the same type argument. Auto-migratable.

## [0.9.0](https://github.com/ng-forge/ng-forge/compare/v0.8.0...v0.9.0) (2026-05-23)

### 🚀 Features

- ⚠️ added validateWhenHidden ([#392](https://github.com/ng-forge/ng-forge/pull/392))
- ⚠️ **dynamic-forms:** add NgForgeField/NgForgeAction directives + migrate all 4 adapters ([#381](https://github.com/ng-forge/ng-forge/pull/381))
- **dynamic-forms:** inline function alternatives for conditions, derivations, validators ([#400](https://github.com/ng-forge/ng-forge/pull/400))
- ⚠️ **dynamic-forms:** allow overlapping leaf keys in different groups ([#401](https://github.com/ng-forge/ng-forge/pull/401), [#403](https://github.com/ng-forge/ng-forge/pull/403))
- **dynamic-forms:** narrow FieldDef.type against RegisteredFieldTypes ([b8d5e93f3](https://github.com/ng-forge/ng-forge/commit/b8d5e93f3))
- **dynamic-forms:** make renderReadyWhen explicit at registration sites ([ba77b21ff](https://github.com/ng-forge/ng-forge/commit/ba77b21ff))
- **dynamic-forms:** add typed addon system across all 4 UI adapters ([8513e1683](https://github.com/ng-forge/ng-forge/commit/8513e1683))

### 🐛 Bug Fixes

- emit array minLength/maxLength as direct properties in openapi-generator ([#416](https://github.com/ng-forge/ng-forge/pull/416), [#417](https://github.com/ng-forge/ng-forge/pull/417))
- handle circular schema references in openapi-generator ([#419](https://github.com/ng-forge/ng-forge/pull/419), [#420](https://github.com/ng-forge/ng-forge/pull/420))
- **docs:** serve prerendered html on clean urls and prerender api reference ([#375](https://github.com/ng-forge/ng-forge/pull/375))
- **docs:** prevent double adapter prefix on routerLink-resolved hrefs ([#395](https://github.com/ng-forge/ng-forge/pull/395))
- **docs:** use vite-root-relative entry script in index.html ([98b126d34](https://github.com/ng-forge/ng-forge/commit/98b126d34))
- **dynamic-forms:** preserve nested group defaults on partial value ([#387](https://github.com/ng-forge/ng-forge/pull/387))
- **dynamic-forms:** preserve nested array-item defaults on partial value ([#389](https://github.com/ng-forge/ng-forge/pull/389))
- **dynamic-forms:** refresh field props on same-key config changes ([#393](https://github.com/ng-forge/ng-forge/pull/393))
- **dynamic-forms:** stop excludeValueIfHidden from leaking defaults into bound value ([#398](https://github.com/ng-forge/ng-forge/pull/398))
- **dynamic-forms:** drop stale readonly DOM sync workaround ([#65897](https://github.com/ng-forge/ng-forge/issues/65897))
- **dynamic-forms:** support nullable on checkbox/toggle fields ([#418](https://github.com/ng-forge/ng-forge/pull/418), [#415](https://github.com/ng-forge/ng-forge/issues/415))
- **primeng:** clean up radio-group and multi-checkbox ([#399](https://github.com/ng-forge/ng-forge/pull/399))

### ♻️ Code Refactoring

- remove obsolete readonly + indeterminate dom workarounds ([#380](https://github.com/ng-forge/ng-forge/pull/380))
- ⚠️ **dynamic-forms:** remove hidden fields from DOM + array state machine + registry ([#410](https://github.com/ng-forge/ng-forge/pull/410), [#413](https://github.com/ng-forge/ng-forge/pull/413))
- ⚠️ **dynamic-forms:** per-adapter style defaults + opt-in signal forms compat classes ([#412](https://github.com/ng-forge/ng-forge/pull/412))

### 📚 Documentation

- add contributors section to README ([e0416c56c](https://github.com/ng-forge/ng-forge/commit/e0416c56c))
- **docs:** migration guide + feature overview rework ([#378](https://github.com/ng-forge/ng-forge/pull/378))

### ✅ Tests

- **docs:** unbreak vite-plugin-search-index spec ([#388](https://github.com/ng-forge/ng-forge/pull/388))

### ⚠️ Breaking Changes

- **dynamic-forms:** per-adapter style defaults + opt-in signal forms compat classes ([#412](https://github.com/ng-forge/ng-forge/pull/412))
- **dynamic-forms:** remove hidden fields from DOM + array state machine + registry ([#410](https://github.com/ng-forge/ng-forge/pull/410), [#413](https://github.com/ng-forge/ng-forge/pull/413))
- **dynamic-forms:** allow overlapping leaf keys in different groups ([#401](https://github.com/ng-forge/ng-forge/pull/401), [#403](https://github.com/ng-forge/ng-forge/pull/403))
- **dynamic-forms:** add NgForgeField/NgForgeAction directives + migrate all 4 adapters ([#381](https://github.com/ng-forge/ng-forge/pull/381))
- added validateWhenHidden ([#392](https://github.com/ng-forge/ng-forge/pull/392))

### ❤️ Thank You

- Antim Prisacaru @antimprisacaru
- antimprisacaru @antimprisacaru
- Derek Burgman
- Francesco Raso @0xfraso

## [0.8.0](https://github.com/ng-forge/ng-forge/compare/v0.7.0...v0.8.0) (2026-04-29)

### 🚀 Features

- omit .js extensions in openapi-generator barrel exports by default ([#356](https://github.com/ng-forge/ng-forge/pull/356))
- **dynamic-forms:** auto-wait for field input when mapper is present ([#314](https://github.com/ng-forge/ng-forge/pull/314))
- **dynamic-forms:** field wrappers (custom chrome around fields) ([#339](https://github.com/ng-forge/ng-forge/pull/339))
- **dynamic-forms:** added move array item event ([#343](https://github.com/ng-forge/ng-forge/pull/343))
- **forms:** wrappers ([#335](https://github.com/ng-forge/ng-forge/pull/335))
- **forms:** add nullable flag for first-class null support ([#344](https://github.com/ng-forge/ng-forge/pull/344))
- **material:** add floatLabel and hideRequiredMarker support to form fields ([#340](https://github.com/ng-forge/ng-forge/pull/340))

### 🐛 Bug Fixes

- omit label on container fields in openapi-generator (group/array/page/row) ([#368](https://github.com/ng-forge/ng-forge/pull/368))
- **config:** prevent docs SSR build OOM in CI ([#338](https://github.com/ng-forge/ng-forge/pull/338))
- **docs:** prevent adapter props table from being clipped on wide screens ([#315](https://github.com/ng-forge/ng-forge/pull/315))
- **docs:** normalize llms-full.txt section paths + cleanup stale integration refs ([#364](https://github.com/ng-forge/ng-forge/pull/364))
- **dynamic-forms:** drop placeholder from props interfaces ([#345](https://github.com/ng-forge/ng-forge/pull/345))
- **dynamic-forms:** wire slider range consistently across adapters ([#349](https://github.com/ng-forge/ng-forge/pull/349))
- **dynamic-forms:** apply property derivation overrides on warm-cache resolution ([#365](https://github.com/ng-forge/ng-forge/pull/365))
- **dynamic-forms:** prefix group keys on derivation paths ([#362](https://github.com/ng-forge/ng-forge/pull/362))
- **dynamic-forms:** resolve leaf fieldValue and groupValue for array-item property derivations ([#366](https://github.com/ng-forge/ng-forge/pull/366))
- **dynamic-forms:** wire textarea/input length attrs and prune redundant adapter props ([#367](https://github.com/ng-forge/ng-forge/pull/367))
- **forms:** preserve adapter config when spreading fields ([#342](https://github.com/ng-forge/ng-forge/pull/342))
- ⚠️ **forms:** rewrite row to container, drop 'row' from ComponentInitializedEvent ([#360](https://github.com/ng-forge/ng-forge/pull/360))
- **release:** upgrade npm to 11.5.1 before publish for TP support ([993a0dc6d](https://github.com/ng-forge/ng-forge/commit/993a0dc6d))

### ⚡ Performance Improvements

- **docs:** improve landing page performance and add per-route OG images ([#317](https://github.com/ng-forge/ng-forge/pull/317))
- **dynamic-forms:** phase 1 invisible bundle trim (~1.4 KB gz-min) ([#359](https://github.com/ng-forge/ng-forge/pull/359))
- ⚠️ **dynamic-forms:** lazy-split container fields + provider scaffolding ([#361](https://github.com/ng-forge/ng-forge/pull/361))

### ♻️ Code Refactoring

- **dynamic-forms:** add simple array template restoration ([#346](https://github.com/ng-forge/ng-forge/pull/346))

### 📚 Documentation

- add options and datepicker field mappers ([#358](https://github.com/ng-forge/ng-forge/pull/358))
- **docs:** add API-Driven Forms documentation page ([#320](https://github.com/ng-forge/ng-forge/pull/320))
- **docs:** add Discord community link to README and docs site ([#337](https://github.com/ng-forge/ng-forge/pull/337))

### 📦 Build System

- **deps:** upgrade Node.js to 24 ([#354](https://github.com/ng-forge/ng-forge/pull/354))

### ⚠️ Breaking Changes

- **forms:** rewrite row to container, drop 'row' from ComponentInitializedEvent ([#360](https://github.com/ng-forge/ng-forge/pull/360))
- **dynamic-forms:** lazy-split container fields + provider scaffolding ([#361](https://github.com/ng-forge/ng-forge/pull/361))

### ❤️ Thank You

- Antim Prisacaru @antimprisacaru
- Derek Burgman
- Francesco Raso @0xfraso
- Mário Nunes

## [0.7.0](https://github.com/ng-forge/ng-forge/compare/v0.6.1...v0.7.0) (2026-03-27)

### 🚀 Features

- **docs:** migrate from ng-doc to Analog with Forge design language ([#295](https://github.com/ng-forge/ng-forge/pull/295))
- **docs:** add StackBlitz button to live examples ([#310](https://github.com/ng-forge/ng-forge/pull/310))
- **dynamic-forms:** add exhaustive switch guards for compile-time safety ([#301](https://github.com/ng-forge/ng-forge/pull/301))
- **dynamic-forms:** adopt resource snapshot composition for async conditions ([#303](https://github.com/ng-forge/ng-forge/pull/303))
- **dynamic-forms:** add openapi-generator package and field scope metadata ([#284](https://github.com/ng-forge/ng-forge/pull/284))
- **examples:** unify example apps into sandbox with shared testing infrastructure ([#292](https://github.com/ng-forge/ng-forge/pull/292))

### 🐛 Bug Fixes

- **config:** suppress baseUrl deprecation error in TypeScript 5.9.3 ([#306](https://github.com/ng-forge/ng-forge/pull/306))
- **config:** decouple type-test tsconfigs from deprecated baseUrl ([#308](https://github.com/ng-forge/ng-forge/pull/308))
- **docs:** post-migration improvements and PrimeNG style cache fix ([#297](https://github.com/ng-forge/ng-forge/pull/297))
- **docs:** pre-render landing page content for LLM crawlers ([#299](https://github.com/ng-forge/ng-forge/pull/299))
- **dynamic-forms:** preserve row containers in side groups ([#296](https://github.com/ng-forge/ng-forge/pull/296))
- **dynamic-forms:** remove eval/Function literals from comments to avoid false positives ([#298](https://github.com/ng-forge/ng-forge/pull/298))
- **dynamic-forms:** restore mobile row wrapping ([#305](https://github.com/ng-forge/ng-forge/pull/305))

### ♻️ Code Refactoring

- **examples:** move e2e apps from apps/examples to apps/e2e ([#294](https://github.com/ng-forge/ng-forge/pull/294))

### 📚 Documentation

- **config:** add verification guidelines and /verify skill from usage insights ([ca67f1801](https://github.com/ng-forge/ng-forge/commit/ca67f1801))

### ❤️ Thank You

- Antim Prisacaru @antimprisacaru
- Francesco Raso @0xfraso

## [0.6.1](https://github.com/ng-forge/ng-forge/compare/v0.6.0...v0.6.1) (2026-02-28)

### 🚀 Features

- **dynamic-forms:** add EventDispatcher injectable for external event dispatch ([#267](https://github.com/ng-forge/ng-forge/pull/267))

### 🐛 Bug Fixes

- **bootstrap:** add readonly DOM sync and floating label hint to textarea ([#270](https://github.com/ng-forge/ng-forge/pull/270))
- **config:** skip playwright browser install on vercel ([3c2dff785](https://github.com/ng-forge/ng-forge/commit/3c2dff785))
- **config:** optimize vercel build to prevent oom and reduce cold build time ([#289](https://github.com/ng-forge/ng-forge/pull/289))
- **dynamic-forms:** expression parser correctness and HTTP injection fixes ([#268](https://github.com/ng-forge/ng-forge/pull/268))
- **dynamic-forms:** fix page navigation validation and hidden page handling ([#271](https://github.com/ng-forge/ng-forge/pull/271))
- **dynamic-forms:** align HTTP condition boolean semantics with validWhen strict check ([#274](https://github.com/ng-forge/ng-forge/pull/274))
- **dynamic-forms:** isolate event bus subscriber exceptions from pipeline ([#272](https://github.com/ng-forge/ng-forge/pull/272))
- **dynamic-forms:** fix submission safety — pending guard, config hot-swap, double-submit ([#278](https://github.com/ng-forge/ng-forge/pull/278))
- **dynamic-forms:** fix HTTP lifecycle safety bugs ([#281](https://github.com/ng-forge/ng-forge/pull/281))
- **dynamic-forms:** fix initialization timing, hang, and nested count ([#280](https://github.com/ng-forge/ng-forge/pull/280))
- **dynamic-forms:** validate config at bootstrap for common misconfigurations ([#283](https://github.com/ng-forge/ng-forge/pull/283))
- **dynamic-forms:** fix array field event API, maxLength, bounds, cleanup ([#282](https://github.com/ng-forge/ng-forge/pull/282))
- **ionic,primeng:** improve a11y and correctness across adapters ([#279](https://github.com/ng-forge/ng-forge/pull/279))
- **mcp:** correct operator names, document HTTP conditions and async custom functions ([#269](https://github.com/ng-forge/ng-forge/pull/269))

### ♻️ Code Refactoring

- **dynamic-forms:** replace \_connectStateDeps IIFE with connectDeps() method ([#291](https://github.com/ng-forge/ng-forge/pull/291))
- **mcp:** remove offline docs generation and CI registry checks ([#290](https://github.com/ng-forge/ng-forge/pull/290))

### 📦 Build System

- **deps:** update angular framework packages to 21.2.0 ([#288](https://github.com/ng-forge/ng-forge/pull/288))

### ✅ Tests

- **dynamic-forms:** add type tests for public exported types ([#285](https://github.com/ng-forge/ng-forge/pull/285))

## [0.6.0](https://github.com/ng-forge/ng-forge/compare/v0.5.2...v0.6.0) (2026-02-19)

### 🚀 Features

- ⚠️ **dynamic-forms:** add 3-tier value exclusion for form submissions ([#240](https://github.com/ng-forge/ng-forge/pull/240))
- **dynamic-forms:** add hidden logic support to container fields ([#242](https://github.com/ng-forge/ng-forge/pull/242))
- **dynamic-forms:** add per-item wrapper div to array fields ([#243](https://github.com/ng-forge/ng-forge/pull/243))
- **dynamic-forms:** add simplified array API with template property ([#245](https://github.com/ng-forge/ng-forge/pull/245))
- **dynamic-forms:** add minLength/maxLength validation for array fields ([#211](https://github.com/ng-forge/ng-forge/pull/211))
- **dynamic-forms:** add declarative HTTP validator type ([#249](https://github.com/ng-forge/ng-forge/pull/249))
- **dynamic-forms:** add field state in evaluation context and stopOnUserOverride ([#248](https://github.com/ng-forge/ng-forge/pull/248))
- **dynamic-forms:** add HTTP resolver for derivations ([#255](https://github.com/ng-forge/ng-forge/pull/255), [#246](https://github.com/ng-forge/ng-forge/issues/246))
- **dynamic-forms:** add HTTP condition type for server-driven field state ([#256](https://github.com/ng-forge/ng-forge/pull/256))
- **dynamic-forms:** add async custom functions for derivations and conditions ([#257](https://github.com/ng-forge/ng-forge/pull/257))
- **dynamic-forms:** add URL path parameter interpolation to HttpRequestConfig ([#263](https://github.com/ng-forge/ng-forge/pull/263))

### 🐛 Bug Fixes

- **dynamic-forms:** fix cross-field validators silently failing on fields inside groups ([#260](https://github.com/ng-forge/ng-forge/pull/260))
- **dynamic-forms:** fix cross-field validators not routing errors for fields inside groups ([#262](https://github.com/ng-forge/ng-forge/pull/262))

### ♻️ Code Refactoring

- ⚠️ **dynamic-forms:** simplify logic APIs with deprecation warnings ([#254](https://github.com/ng-forge/ng-forge/pull/254))
- **dynamic-forms:** improve async/HTTP API ergonomics with source discriminant ([#258](https://github.com/ng-forge/ng-forge/pull/258))
- **examples:** split E2E tests into core functional and UI visual apps ([#239](https://github.com/ng-forge/ng-forge/pull/239))

### 📚 Documentation

- fix broken documentation links, update sitemap and llms.txt ([#241](https://github.com/ng-forge/ng-forge/pull/241))
- add backers section to readme ([21740ab7a](https://github.com/ng-forge/ng-forge/commit/21740ab7a))
- **docs:** document async features, HTTP validators, and container logic ([#259](https://github.com/ng-forge/ng-forge/pull/259))
- **dynamic-forms:** add CLAUDE.md project documentation and gitignore .claude/plans ([48954c2ff](https://github.com/ng-forge/ng-forge/commit/48954c2ff))

### ✅ Tests

- **dynamic-forms:** add value two-way binding e2e tests ([#244](https://github.com/ng-forge/ng-forge/pull/244))

### ⚠️ Breaking Changes

- **dynamic-forms:** simplify logic APIs with deprecation warnings ([#254](https://github.com/ng-forge/ng-forge/pull/254))
  `ConditionalExpression` is now a discriminated union. Code that sets invalid property combos (e.g., `fieldPath` on a javascript condition) will fail to compile.
- **dynamic-forms:** add 3-tier value exclusion for form submissions ([#240](https://github.com/ng-forge/ng-forge/pull/240))
  Field values are now excluded from submitted output when the field is hidden, disabled, or readonly. To restore previous behavior, use `withValueExclusionDefaults({ excludeValueIfHidden: false, excludeValueIfDisabled: false, excludeValueIfReadonly: false })`.

## 0.5.2 (2026-02-09)

### 🚀 Features

- **dynamic-forms:** add generalized non-field logic resolvers ([#224](https://github.com/ng-forge/ng-forge/pull/224))
- **dynamic-forms:** add property derivation system for reactive field properties ([#232](https://github.com/ng-forge/ng-forge/pull/232), [#220](https://github.com/ng-forge/ng-forge/issues/220))

### 🐛 Bug Fixes

- **config:** use production domain URL for deployment smoke test ([#233](https://github.com/ng-forge/ng-forge/pull/233))
- **docs:** correct broken iframe routes and array example configuration ([#213](https://github.com/ng-forge/ng-forge/pull/213))
- **dynamic-forms:** make logic condition evaluation array-aware via pathKeys ([#231](https://github.com/ng-forge/ng-forge/pull/231))

### ⚡ Performance Improvements

- **dynamic-forms:** prevent redundant recalculations with deep equality checks ([#177](https://github.com/ng-forge/ng-forge/pull/177))

### ♻️ Code Refactoring

- **dynamic-forms:** replace array events with semantic event classes and builder API ([#218](https://github.com/ng-forge/ng-forge/pull/218))
- ⚠️ **dynamic-forms:** implement direct root form binding with UUID keys for array items ([#219](https://github.com/ng-forge/ng-forge/pull/219), [#218](https://github.com/ng-forge/ng-forge/issues/218))
- **dynamic-forms:** extract and optimize form state management ([#223](https://github.com/ng-forge/ng-forge/pull/223))

### ✅ Tests

- **examples:** add comprehensive E2E test suites and edge case coverage ([#225](https://github.com/ng-forge/ng-forge/pull/225))

### ⚠️ Breaking Changes

- **dynamic-forms:** implement direct root form binding with UUID keys for array items ([#219](https://github.com/ng-forge/ng-forge/pull/219), [#218](https://github.com/ng-forge/ng-forge/issues/218))
  ArrayField.fields is now `FieldDef[][]` instead of `FieldDef[]`

## [0.5.1](https://github.com/ng-forge/ng-forge/compare/v0.5.0...v0.5.1) (2026-02-01)

### 🚀 Features

- ⚠️ **dynamic-forms:** remove targetField from derivation API ([#202](https://github.com/ng-forge/ng-forge/pull/202))
- **dynamic-forms:** add externalData support for conditional logic ([#204](https://github.com/ng-forge/ng-forge/pull/204))
- **dynamic-forms:** add comprehensive test coverage for stability benchmarks ([#203](https://github.com/ng-forge/ng-forge/pull/203))
- **dynamic-forms:** add withEventFormValue() feature for attaching form values to events ([#209](https://github.com/ng-forge/ng-forge/pull/209))
- ⚠️ **mcp:** add dynamic-form-mcp package ([#126](https://github.com/ng-forge/ng-forge/pull/126))

### 🐛 Bug Fixes

- **config:** allow production deploys from any branch and skip smoke test on preview ([#198](https://github.com/ng-forge/ng-forge/pull/198))
- **dynamic-forms:** comprehensive API fixes for type inference and silent failures ([#206](https://github.com/ng-forge/ng-forge/pull/206))

### ♻️ Code Refactoring

- **mcp:** consolidate to 4 focused tools with improved documentation ([#210](https://github.com/ng-forge/ng-forge/pull/210))

### 📚 Documentation

- add Quick Start examples hub and improve documentation UX ([#188](https://github.com/ng-forge/ng-forge/pull/188))

### ⏪ Reverts

- **dynamic-forms:** feat(dynamic-forms): add internal zod schema validation package (#187) ([#187](https://github.com/ng-forge/ng-forge/pull/187), [#185](https://github.com/ng-forge/ng-forge/issues/185), [#186](https://github.com/ng-forge/ng-forge/issues/186))

### ⚠️ Breaking Changes

- **dynamic-forms:** remove targetField from derivation API ([#202](https://github.com/ng-forge/ng-forge/pull/202))
- **mcp:** add dynamic-form-mcp package ([#126](https://github.com/ng-forge/ng-forge/pull/126))

## [0.5.0](https://github.com/ng-forge/ng-forge/compare/v0.4.0...v0.5.0) (2026-01-25)

### 🚀 Features

- **docs:** add vercel speed insights integration ([#189](https://github.com/ng-forge/ng-forge/pull/189))
- **dynamic-forms:** add value derivation logic system ([#123](https://github.com/ng-forge/ng-forge/pull/123))
- **dynamic-forms:** add zod integration ([#179](https://github.com/ng-forge/ng-forge/pull/179), [#180](https://github.com/ng-forge/ng-forge/issues/180), [#181](https://github.com/ng-forge/ng-forge/issues/181), [#182](https://github.com/ng-forge/ng-forge/issues/182))

### 🐛 Bug Fixes

- cache playwright browsers for unit tests in CI ([#192](https://github.com/ng-forge/ng-forge/pull/192), [#190](https://github.com/ng-forge/ng-forge/issues/190))
- **dynamic-forms:** show only first validation error instead of all errors ([#183](https://github.com/ng-forge/ng-forge/pull/183), [#179](https://github.com/ng-forge/ng-forge/issues/179))

### ♻️ Code Refactoring

- **dynamic-forms:** extract testing utilities and reduce package size ([#176](https://github.com/ng-forge/ng-forge/pull/176))

### 📚 Documentation

- add social media preview and optimize seo keywords ([#178](https://github.com/ng-forge/ng-forge/pull/178))
- sync compatibility matrix across all READMEs

## [0.4.0](https://github.com/ng-forge/ng-forge/compare/v0.3.1...v0.4.0) (2026-01-18)

### 🚀 Features

- add errors-cover-hint behavior with e2e tests ([#170](https://github.com/ng-forge/ng-forge/pull/170))
- **dynamic-forms:** add form-level default props support ([#172](https://github.com/ng-forge/ng-forge/pull/172), [#134](https://github.com/ng-forge/ng-forge/issues/134))
- **dynamic-forms:** add comprehensive html input type support ([#163](https://github.com/ng-forge/ng-forge/pull/163), [#140](https://github.com/ng-forge/ng-forge/issues/140))
- **ionic:** add helper text support to all form field components ([#169](https://github.com/ng-forge/ng-forge/pull/169))

### 🐛 Bug Fixes

- **dynamic-forms:** use root form validity for submit buttons in nested contexts ([#162](https://github.com/ng-forge/ng-forge/pull/162), [#157](https://github.com/ng-forge/ng-forge/issues/157))
- **material,bootstrap,primeng,ionic:** set side-effects to true for module augmentation ([#161](https://github.com/ng-forge/ng-forge/pull/161))

### ⚡ Performance Improvements

- **dynamic-forms:** use dedicated injection tokens for form-level config ([#173](https://github.com/ng-forge/ng-forge/pull/173))

### ♻️ Code Refactoring

- **bootstrap:** clean up component templates and effects ([#168](https://github.com/ng-forge/ng-forge/pull/168))
- **bootstrap:** rename helper text prop from helptext to hint ([#171](https://github.com/ng-forge/ng-forge/pull/171))
- **ionic:** standardize accessibility signal naming and add aria-describedby ([#165](https://github.com/ng-forge/ng-forge/pull/165))
- **material:** clean up component templates and effects ([#164](https://github.com/ng-forge/ng-forge/pull/164))
- **material,bootstrap,primeng,ionic:** remove generics from field components ([#158](https://github.com/ng-forge/ng-forge/pull/158))
- **primeng:** clean up signal forms integration ([#167](https://github.com/ng-forge/ng-forge/pull/167))

## [0.3.1](https://github.com/ng-forge/ng-forge/compare/v0.3.0...v0.3.1) (2026-01-14)

### 🚀 Features

- **docs:** add interactive demo and syntax highlighting to landing page ([#132](https://github.com/ng-forge/ng-forge/pull/132))
- **docs:** add link title attributes and improve example input theming ([#138](https://github.com/ng-forge/ng-forge/pull/138))
- **docs:** add new landing page with improved design ([#127](https://github.com/ng-forge/ng-forge/pull/127))

### 🐛 Bug Fixes

- **core:** add unique ids to form field inner elements ([#136](https://github.com/ng-forge/ng-forge/pull/136))
- **dynamic-forms:** bind classname to container field components ([#137](https://github.com/ng-forge/ng-forge/pull/137))

## [0.3.0](https://github.com/ng-forge/ng-forge/compare/v0.2.0...v0.3.0) (2026-01-12)

### 🚀 Features

- **dynamic-forms:** add hidden field type for storing non-rendered values ([#122](https://github.com/ng-forge/ng-forge/pull/122))
- **dynamic-forms:** add meta attribute support for wrapped components ([#115](https://github.com/ng-forge/ng-forge/pull/115))

### ✅ Tests

- **examples:** add visual regression screenshots and e2e infrastructure ([#125](https://github.com/ng-forge/ng-forge/pull/125))
- **forms:** add exhaustive type tests for all ui libraries and core types ([#121](https://github.com/ng-forge/ng-forge/pull/121))

### 📦 Build System

- **deps:** update angular to 21.0.8 with formfield directive migration ([#124](https://github.com/ng-forge/ng-forge/pull/124))

### ⚠️ Breaking Changes

- **deps:** Angular 21.0.7+ renamed the Signal Forms directive from `Field` to `FormField`. This requires `@angular/*` >= 21.0.7.

## [0.2.0](https://github.com/ng-forge/ng-forge/compare/v0.1.3...v0.2.0) (2025-12-23)

### ♻️ Code Refactoring

- **dynamic-forms:** replace any types with unknown for improved type safety ([#106](https://github.com/ng-forge/ng-forge/pull/106))
- **dynamic-forms:** centralize error prefix in base error class ([#113](https://github.com/ng-forge/ng-forge/pull/113))
- **dynamic-forms:** extract shared utilities and simplify input templates ([#116](https://github.com/ng-forge/ng-forge/pull/116))
- **dynamic-forms:** simplify logger configuration ([#118](https://github.com/ng-forge/ng-forge/pull/118))

## [0.1.3](https://github.com/ng-forge/ng-forge/compare/v0.1.2...v0.1.3) (2025-12-20)

### 🚀 Features

- **dynamic-forms:** add configurable logger service ([#105](https://github.com/ng-forge/ng-forge/pull/105))
- **dynamic-forms:** add secondary entrypoints for integration and testing ([#108](https://github.com/ng-forge/ng-forge/pull/108))

### 🐛 Bug Fixes

- **docs:** improve mobile responsiveness for navbar and sidebar ([#109](https://github.com/ng-forge/ng-forge/pull/109))
- **dynamic-forms:** infer number type for input fields with props.type: 'number' ([#104](https://github.com/ng-forge/ng-forge/pull/104))

### ♻️ Code Refactoring

- **dynamic-forms:** simplify field tree access using bracket notation ([#107](https://github.com/ng-forge/ng-forge/pull/107))

## [0.1.2](https://github.com/ng-forge/ng-forge/compare/v0.1.1...v0.1.2) (2025-12-14)

### 🚀 Features

- **dynamic-forms:** improve form value type inference and add field type utilities ([#99](https://github.com/ng-forge/ng-forge/pull/99))

### 🐛 Bug Fixes

- **dynamic-forms:** resolve build warnings ([#102](https://github.com/ng-forge/ng-forge/pull/102))

### 📚 Documentation

- improve package readmes and metadata ([#100](https://github.com/ng-forge/ng-forge/pull/100))

### ♻️ Code Refactoring

- **dynamic-forms:** encapsulate effects and subscriptions in constructor-called methods ([#101](https://github.com/ng-forge/ng-forge/pull/101))

## [0.1.1](https://github.com/ng-forge/ng-forge/compare/v0.1.0...v0.1.1) (2025-12-12)

### 🐛 Bug Fixes

- **dynamic-forms:** update form-internals for angular 21.0.5 signal forms api ([#95](https://github.com/ng-forge/ng-forge/pull/95))

## [0.1.0](https://github.com/ng-forge/ng-forge/releases/tag/v0.1.0) (2025-12-11)

Initial release of ng-forge dynamic forms library.

### 🚀 Features

- Type-safe, signal-powered dynamic forms for Angular 21+
- Full TypeScript inference for form values
- Support for multiple UI frameworks: Material, Bootstrap, PrimeNG, Ionic
- Built-in validation with shorthand validators
- Conditional field visibility and requirements
- Multi-step form and wizard support
- i18n ready with Observable/Signal support for labels
- Comprehensive ARIA accessibility support ([#83](https://github.com/ng-forge/ng-forge/pull/83))
- Vercel Analytics integration ([#77](https://github.com/ng-forge/ng-forge/pull/77))

### 🐛 Bug Fixes

- Group array value propagation ([#74](https://github.com/ng-forge/ng-forge/pull/74))
- **docs:** resolve infinite redirect loop on GitHub Pages deployment ([#70](https://github.com/ng-forge/ng-forge/pull/70))
- **docs:** Vercel preview white screen issue ([#79](https://github.com/ng-forge/ng-forge/pull/79))
