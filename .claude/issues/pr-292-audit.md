# PR #292 Exhaustive Audit — `feat/unified-examples-infrastructure`

New code scoped to `apps/examples/sandbox/src/app/` and its sub-directories.
Testing directories under `testing/` are copies of existing per-adapter infra — not audited here.

---

## `host.component.ts`

### BUG-1 — Memory leaks: observers and listener never cleaned up

`setupHeightBroadcasting()` creates a `ResizeObserver` and a `MutationObserver`
that are never disconnected. The `hashchange` listener added in the constructor
is never removed.

**Current:**

```typescript
window.addEventListener('hashchange', () => { ... });
const observer = new ResizeObserver(() => broadcastHeight());
observer.observe(document.body);
const mutationObserver = new MutationObserver(() => broadcastHeight());
mutationObserver.observe(document.body, { childList: true, subtree: true });
// nothing disconnects/removes any of these
```

**Fix — replace all three with RxJS + `takeUntilDestroyed`:**

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, merge, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

function fromResizeObserver(target: Element): Observable<void> {
  return new Observable((subscriber) => {
    const ro = new ResizeObserver(() => subscriber.next());
    ro.observe(target);
    return () => ro.disconnect();
  });
}

function fromMutationObserver(target: Node, init: MutationObserverInit): Observable<void> {
  return new Observable((subscriber) => {
    const mo = new MutationObserver(() => subscriber.next());
    mo.observe(target, init);
    return () => mo.disconnect();
  });
}

// in afterNextRender — replaces setupHeightBroadcasting():
if (window.self !== window.top) {
  merge(fromResizeObserver(document.body), fromMutationObserver(document.body, { childList: true, subtree: true }))
    .pipe(
      map(() => document.documentElement.scrollHeight),
      distinctUntilChanged((a, b) => Math.abs(a - b) <= 2),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe((height) => window.parent.postMessage({ type: 'resize', height }, window.location.origin));
}
```

The `takeUntilDestroyed(destroyRef)` teardown calls `ro.disconnect()` /
`mo.disconnect()` automatically via the Observable's teardown logic — no
`DestroyRef.onDestroy` callback needed.

---

### BUG-2 — Race condition in `switchTo()`: concurrent async calls

Rapid clicks or fast hash changes call `switchTo()` concurrently. The second
call destroys `currentRef` while the first call's `bootstrap()` promise is still
pending — the app lands in an indeterminate state.

**Current:**

```typescript
private async switchTo(adapter: AdapterName): Promise<void> {
  this.loading.set(true);
  this.currentRef?.destroy();  // destroys whatever is current
  this.currentRef = null;
  // ... awaits bootstrap — a second call can now also destroy and await
```

**Fix — feed requests into a `Subject` + `switchMap` (auto-cancels in-flight):**

```typescript
private readonly adapterSwitch$ = new Subject<AdapterName>();

constructor() {
  this.adapterSwitch$
    .pipe(
      switchMap(adapter => this.mountAdapter(adapter)),
      takeUntilDestroyed(),
    )
    .subscribe();
}

private mountAdapter(adapter: AdapterName): Observable<void> {
  return new Observable(subscriber => {
    this.loading.set(true);
    this.activeAdapter.set(adapter);
    this.currentRef?.destroy();
    this.currentRef = null;
    const container = this.containerRef().nativeElement;
    const hashUrl = window.location.hash.replace(/^#/, '') || '/';

    this.harness.bootstrap(adapter, container, { route: hashUrl }).then(ref => {
      this.currentRef = ref;
      this.loading.set(false);
      subscriber.next();
      subscriber.complete();
    });

    // Teardown: called by switchMap when a newer adapter arrives
    return () => {
      this.currentRef?.destroy();
      this.currentRef = null;
      this.loading.set(false);
    };
  });
}

// switchTo becomes a simple push:
navigateTo(adapter: AdapterName): void {
  if (this.activeAdapter() === adapter) return;
  window.location.hash = `#/${adapter}/${DEFAULT_ROUTES[adapter]}`;
}

// hashchange handler pushes into the subject:
fromEvent(window, 'hashchange')
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(() => {
    const newAdapter = getAdapterFromHash();
    if (newAdapter && newAdapter !== this.activeAdapter()) {
      this.adapterSwitch$.next(newAdapter);
    }
  });
```

---

### BUG-3 — `postMessage` uses wildcard origin `'*'`

```typescript
window.parent.postMessage({ type: 'resize', height }, '*');
```

Any page that iframes this sandbox receives resize messages.

**Fix:**

```typescript
window.parent.postMessage({ type: 'resize', height }, window.location.origin);
```

---

### BUG-4 — `getAdapterFromHash()` accesses `window` at module scope without SSR guard

The function is module-level and accesses `window.location.hash` unconditionally.
While currently only called inside `afterNextRender()`, any future import in a
Node/SSR context (unit tests, SSR build) throws `ReferenceError: window is not defined`.

**Fix:**

```typescript
function getAdapterFromHash(): AdapterName | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#\/?/, '');
  const segment = hash.split('/')[0];
  return segment && isAdapterName(segment) ? segment : null;
}
```

---

### READABILITY-1 — `getAdapterFromHash()` called twice in the constructor

```typescript
const adapter = getAdapterFromHash() ?? DEFAULT_ADAPTER;
if (!getAdapterFromHash()) {
  // redundant second call
  window.location.hash = `#/${DEFAULT_ADAPTER}/${DEFAULT_ROUTES[DEFAULT_ADAPTER]}`;
}
```

**Fix:**

```typescript
const detectedAdapter = getAdapterFromHash();
if (!detectedAdapter) {
  window.location.hash = `#/${DEFAULT_ADAPTER}/${DEFAULT_ROUTES[DEFAULT_ADAPTER]}`;
}
this.adapterSwitch$.next(detectedAdapter ?? DEFAULT_ADAPTER);
```

---

### READABILITY-2 — `DEFAULT_ROUTES` duplicates `AdapterRegistration.defaultRoute`

Both `DEFAULT_ROUTES` in `host.component.ts` and `defaultRoute` in
`adapter-registrations.ts` encode the same per-adapter default. Single source
of truth is missing — if they diverge, routing silently breaks.

**Fix:** expose `defaultRoute` from the registration list and derive it where needed,
or move `DEFAULT_ROUTES` into `adapter-registrations.ts` and import it.

---

### READABILITY-3 — `setupHeightBroadcasting()` as a private method hides lifetime coupling

The method is called exactly once, from inside `afterNextRender()`. Splitting it
out obscures that its observers have the same lifetime as the rest of the render
setup. With the RxJS approach (BUG-1), inlining it makes the teardown contract obvious.

---

### READABILITY-4 — `activeAdapter` is `signal<AdapterName | null>` but `null` is immediately replaced

`null` is only the initial value; `switchTo()` sets a real adapter on the first
render. The nullable union forces all consumers to null-check. Initialize to
`DEFAULT_ADAPTER` to remove the union, or use the loading flag as the
"not yet mounted" discriminant.

---

### READABILITY-5 — `container.innerHTML = ''` after `currentRef.destroy()` is redundant and misleading

```typescript
this.currentRef?.destroy();
this.currentRef = null;
const container = this.containerRef().nativeElement;
container.innerHTML = '';
```

`currentRef.destroy()` should fully unmount the Angular application and clean up
its DOM. Clearing `innerHTML` afterward is belt-and-suspenders at best; at worst
it swallows teardown errors that manifest as leftover DOM. Remove it and rely on
the framework's destroy lifecycle.

---

## `adapter-registrations.ts`

### READABILITY-6 — Five copy-paste `loadRoutes` bodies

Every adapter entry repeats:

```typescript
loadRoutes: async () => {
  const lib = await import('@ng-forge/examples-<x>');
  return [
    { path: 'examples', children: lib.EXAMPLES_ROUTES },
    { path: 'test', children: lib.TESTING_ROUTES },
  ];
},
```

Extract a helper:

```typescript
function makeLoadRoutes(
  importFn: () => Promise<{ EXAMPLES_ROUTES: Route[]; TESTING_ROUTES: Route[] }>,
) {
  return async () => {
    const lib = await importFn();
    return [
      { path: 'examples', children: lib.EXAMPLES_ROUTES },
      { path: 'test', children: lib.TESTING_ROUTES },
    ];
  };
}

// each entry becomes:
loadRoutes: makeLoadRoutes(() => import('@ng-forge/examples-material')),
```

---

### READABILITY-7 — `defaultRoute` defined in two places

`AdapterConfig` in `adapter-config.ts` has `defaultRoute: string`. `AdapterRegistration`
(presumably from `@ng-forge/sandbox-harness`) also has `defaultRoute`. They must
be kept in sync manually. Merge or derive one from the other.

---

### READABILITY-8 — Inconsistent async style in `factory`

```typescript
factory: (routes) => import('./adapters/material-adapter').then((m) => m.createMaterialApp(routes)),
```

Mixed with async `loadRoutes`. Make `factory` consistently async:

```typescript
factory: async (routes) => {
  const { createMaterialApp } = await import('./adapters/material-adapter');
  return createMaterialApp(routes);
},
```

---

## `adapter-config.ts`

### READABILITY-9 — `name` property on every `ADAPTERS` entry is redundant with its key

```typescript
const ADAPTERS: Record<AdapterName, AdapterConfig> = {
  material: {
    name: 'material',  // identical to the key — always
```

Either remove `name` from `AdapterConfig` and derive it from `Object.keys(ADAPTERS)`,
or use a typed tuple/array where the key is not duplicated.

---

### READABILITY-10 — `AdapterName` may have two sources of truth

`host.component.ts` imports `AdapterName` from `@ng-forge/sandbox-harness`, while
`adapter-config.ts` defines its own identical union. Confirm there is a single
authoritative definition — if both exist independently, they will diverge silently.

---

## `adapter-routes.ts`

### READABILITY-11 — Stale JSDoc hardcodes `'examples'` when the function accepts any `defaultRoute`

```typescript
/**
 * Produces:
 * - `{ path: '<adapter>', children: [redirect to 'examples', ...routes] }`
```

The comment is wrong for callers that pass `'test'` (as core does). Update to
reference `defaultRoute`.

---

### READABILITY-12 — Unnecessary `as const` on `pathMatch`

```typescript
{ path: '', redirectTo: defaultRoute, pathMatch: 'full' as const },
```

`Route` is the explicit return type, which constrains `pathMatch` to
`'full' | 'prefix'`. TypeScript infers the literal without `as const`. Remove it.

---

## `adapters/material-adapter.ts` … `ionic-adapter.ts` (5 files)

### READABILITY-13 — Five files with near-identical component + factory boilerplate

All 5 adapter files differ only in selector name, class name, adapter providers,
and `APP_ID` value. A shared factory eliminates the duplication:

```typescript
// adapters/create-sandbox-app.ts
export function createSandboxApp(options: {
  selector: string;
  appId: string;
  adapterName: AdapterName;
  routes: Route[];
  providers: Provider[];
  defaultRoute?: string;
}): { config: ApplicationConfig; rootComponent: Type<unknown> } { ... }
```

Each adapter file then becomes ~5 lines of unique configuration.

---

### READABILITY-14 — `provideAnimations()` is deprecated; use `provideAnimationsAsync()`

All 5 adapter files call `provideAnimations()`, which is deprecated since Angular v17.
`provideAnimationsAsync()` defers animation code to a lazy chunk — better for
zoneless apps and bundle size.

---

### READABILITY-15 — Split imports from the same `@angular/router` specifier

In most adapter files:

```typescript
import { provideRouter, RouterOutlet, withHashLocation } from '@angular/router';
import { Route } from '@angular/router';
```

Two declarations from the same specifier. Merge into one line.

---

## `playwright.sandbox-config.ts`

### READABILITY-16 — `SandboxAdapter` duplicates `AdapterName`

```typescript
type SandboxAdapter = 'material' | 'bootstrap' | 'primeng' | 'ionic' | 'core';
```

Same union as `AdapterName` from `adapter-config.ts`. Import and reuse it.

---

### READABILITY-17 — `getReporters()` and `getProjects()` are called exactly once

Both are defined as named functions but invoked only once in the `defineConfig`
call. Either inline them (they are short) or keep them as named functions with
a comment explaining their reuse story. As-is, the indirection adds cognitive
overhead without benefit.

---

### READABILITY-18 — Unnecessary `b: string` annotation in `.map()` callback

```typescript
browserSelection.split(',').map((b: string) => b.trim());
```

TypeScript infers `b: string` from `string[].map`. Remove the annotation.

---

### READABILITY-19 — Screenshot tolerance magic numbers undocumented

```typescript
maxDiffPixelRatio: 0.01,
threshold: 0.2,
```

No comment explains why these specific values were chosen. Add a note:

```typescript
// 1 % pixel diff — covers anti-aliasing; 0.2 colour distance — covers subpixel rendering
```

---

## `demo-form.component.ts`

### READABILITY-20 — Six inline styles in the template

```html
<details style="margin-top: 16px">
  <summary style="cursor: pointer; font-weight: 500; color: #666">
    <pre style="margin-top: 8px; padding: 12px; background: #f5f5f5; ..."></pre>
  </summary>
</details>
```

Move to a `styles` block or stylesheet.

---

### READABILITY-21 — `email: true` on the field config is undocumented / possibly wrong

```typescript
{
  key: 'email',
  type: 'input',
  email: true,   // validator shorthand? non-standard property?
```

If this is a validator shorthand, it should be `validators: { email: true }`.
If it is intentional, add a comment confirming the type-checker accepts it.

---

## Summary

| #              | File                           | Category                                              | Severity |
| -------------- | ------------------------------ | ----------------------------------------------------- | -------- |
| BUG-1          | `host.component.ts`            | Memory leak — 3 observers/listeners never torn down   | High     |
| BUG-2          | `host.component.ts`            | Race condition in `switchTo()`                        | High     |
| BUG-3          | `host.component.ts`            | `postMessage` wildcard origin                         | Medium   |
| BUG-4          | `host.component.ts`            | SSR-unsafe `window` at module scope                   | Medium   |
| READABILITY-1  | `host.component.ts`            | `getAdapterFromHash()` called twice                   | Low      |
| READABILITY-2  | `host.component.ts`            | `DEFAULT_ROUTES` duplicates registration data         | Low      |
| READABILITY-3  | `host.component.ts`            | `setupHeightBroadcasting()` hides lifetime coupling   | Low      |
| READABILITY-4  | `host.component.ts`            | `activeAdapter` nullable union unnecessary            | Low      |
| READABILITY-5  | `host.component.ts`            | `container.innerHTML = ''` after Angular destroy      | Low      |
| READABILITY-6  | `adapter-registrations.ts`     | 5× copy-paste `loadRoutes`                            | Medium   |
| READABILITY-7  | `adapter-registrations.ts`     | `defaultRoute` defined in two places                  | Low      |
| READABILITY-8  | `adapter-registrations.ts`     | Inconsistent async style in `factory`                 | Low      |
| READABILITY-9  | `adapter-config.ts`            | `name` key redundant with map key                     | Low      |
| READABILITY-10 | `adapter-config.ts`            | `AdapterName` may have two sources of truth           | Low      |
| READABILITY-11 | `adapter-routes.ts`            | Stale JSDoc hardcodes `'examples'`                    | Low      |
| READABILITY-12 | `adapter-routes.ts`            | Unnecessary `as const` on `pathMatch`                 | Low      |
| READABILITY-13 | `adapters/*.ts` ×5             | Extreme copy-paste — near-identical component+factory | Medium   |
| READABILITY-14 | `adapters/*.ts` ×5             | Deprecated `provideAnimations()`                      | Medium   |
| READABILITY-15 | `adapters/*.ts` ×5             | Split imports from same `@angular/router` specifier   | Low      |
| READABILITY-16 | `playwright.sandbox-config.ts` | `SandboxAdapter` duplicates `AdapterName`             | Low      |
| READABILITY-17 | `playwright.sandbox-config.ts` | Single-use functions add unnecessary indirection      | Low      |
| READABILITY-18 | `playwright.sandbox-config.ts` | Unnecessary `b: string` annotation                    | Low      |
| READABILITY-19 | `playwright.sandbox-config.ts` | Undocumented screenshot tolerance magic numbers       | Low      |
| READABILITY-20 | `demo-form.component.ts`       | Inline styles in template                             | Low      |
| READABILITY-21 | `demo-form.component.ts`       | `email: true` undocumented/possibly wrong             | Low      |
