# Performance work handover

## Branch

`perf/improve-initial-loading`

## Product constraints

- Consumers must not import field types individually.
- Adapter fields and addons remain included in the package and load on demand.
- Loading is automatic, not opt-in.
- Orchestration must be declarative and DI-scoped. Do not add module-scoped mutable state or class-level static state.
- Bootstrap's `sideEffects: true` is intentional because its primary entry point performs module augmentation.
- Page preload is configurable.
- Performance results must use representative forms. Empty input-only forms are not acceptable scored fixtures.

## Commits already on the branch

- `819973e66 perf(dynamic-forms): lazy-load adapter fields and preload pages`
- `83e26b720 perf(dynamic-forms): skip inactive form work`

The first commit adds automatic lazy adapter secondary entry points for Material, Bootstrap, PrimeNG, and Ionic. The second adds inactive-page work suppression and configurable field windowing.

## Current increment

### Lazy schema compilation

`FormStateManager` no longer imports the schema builder and form-level schema merger eagerly. It uses Angular's `injectAsync()` to resolve a stateless `@Service()` from `form-schema.service.ts`. A signal `resource()` creates the schema inside the form injector and gates rendering and public form state until the schema is ready.

There is deliberately no optional-rule capability scan. The first non-empty set of value-bearing fields requests the lazy service, including a single plain field. Only an empty form avoids the request.

The production core build confirmed separate chunks:

- service chunk: 1,339 raw bytes
- schema-builder chunk: 22,224 raw bytes
- primary FESM contains a dynamic import for the service and does not define `FormSchemaService` or `createSchemaFromFields`

### Representative scored fixture

The Bootstrap direct-entry fixture still has 240 controls over six pages, but it now includes:

- required, minimum-length, maximum-length, email, custom cross-field, and group validation
- async HTTP validation through the existing mock interceptor
- conditional hidden and disabled state
- synchronous derivations and a cross-page derivation
- reusable schemas
- text addons
- groups and arrays on every page
- page-level visibility logic

The same route used for Lighthouse is exercised by a browser contract that interacts with these features. Do not compare new Lighthouse results directly with the earlier empty-input fixture.

## Verification ledger

Passed in this session with Node 24.15.0 and `NX_DAEMON=false`:

- `pnpm nx build dynamic-forms --skip-nx-cache`
- `pnpm nx build bootstrap-examples --configuration=performance --skip-nx-cache`
- focused lazy-schema and lifecycle test run: 14 passed, 3,433 skipped
- representative feature browser test: 1 passed, 2 skipped
- corrected field-windowing browser test: 1 passed, 2 skipped
- earlier complete direct-entry browser run before the corrected count: 6 passed, 1 failed, 14 skipped; the only failure was the now-corrected nested-control count

The production performance build reported:

- JavaScript main: 478.89 kB raw, 121.07 kB estimated transfer
- initial total including CSS: 144.04 kB estimated transfer
- schema implementation lazy chunk: 6.95 kB raw, 2.60 kB estimated transfer
- schema service loader stub: 529 bytes raw

Not completed after the last test corrections:

- complete `dynamic-forms` test rerun (3,447 tests)
- complete direct-entry E2E rerun
- core and Bootstrap lint/type-test reruns
- in-app browser visual and console inspection of the production build
- five-run standard and harsh-device Lighthouse medians for the representative fixture
- full-surface Bootstrap stress E2E

The first complete core attempt found 12 synchronous assertions that observed state before the lazy service resolved. Those assertions were updated to await `formSchemaReady()`, and all 14 focused schema/lifecycle tests now pass. The complete suite still needs a fresh run.

## Next commands

Use Node 24:

```sh
export PATH=/Users/antimprisacaru/.nvm/versions/node/v24.15.0/bin:$PATH
export NX_DAEMON=false

pnpm nx test dynamic-forms --skip-nx-cache
pnpm nx run dynamic-forms:type-test --skip-nx-cache
pnpm nx run-many -t lint -p dynamic-forms,bootstrap-examples --skip-nx-cache
pnpm nx run bootstrap-examples:e2e --skip-nx-cache --grep "direct-entry performance benchmark"
pnpm nx run bootstrap-examples:e2e --skip-nx-cache --grep "Bootstrap — full-API perf stress"
pnpm nx build dynamic-forms --skip-nx-cache
pnpm nx build bootstrap-examples --configuration=performance --skip-nx-cache
```

Run Lighthouse only against the representative production build. Record at least five runs per profile and report medians plus individual scores. Use both the default rendering behavior and `eager=12`; label the latter as field windowing rather than treating it as the default.

Suggested profiles:

- standard mobile: CPU 6x, RTT 150 ms, throughput 1,638.4 Kbps
- harsh mobile: CPU 12x, RTT 300 ms, throughput 700 Kbps

## Remaining investigation

After establishing the representative baseline, use the Lighthouse main-thread breakdown and production chunk graph to choose the next target. The derivation engine still has its own config capability scan and dynamic loader. It is a likely candidate for the same DI-scoped lazy-service pattern, but it should be changed only after the representative trace shows material cost.

Run `graphify update .` after any further source changes.
