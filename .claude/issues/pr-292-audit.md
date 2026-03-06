# PR #292 Audit — Issues to File

Audit of `feat/unified-examples-infrastructure` vs `main`.

The sandbox testing directories under `apps/examples/sandbox/src/app/testing/`
are byte-for-byte copies of existing per-adapter testing infrastructure already
on main — no new issues introduced there.

The new code specific to this PR is in `apps/examples/sandbox/src/app/`:
`host.component.ts`, `adapter-registrations.ts`, `adapters/`, etc.

---

## Issue 1 — Memory leaks in `host.component.ts`

**Type:** `fix` | **Scope:** `sandbox`

### Problem

`apps/examples/sandbox/src/app/host.component.ts` creates three listeners
inside `afterNextRender()` that are never cleaned up:

**`hashchange` event listener** (never removed):

```typescript
window.addEventListener('hashchange', () => { ... });
// No corresponding removeEventListener anywhere
```

**`ResizeObserver`** (never disconnected):

```typescript
const observer = new ResizeObserver(() => broadcastHeight());
observer.observe(document.body);
// observer.disconnect() never called
```

**`MutationObserver`** (never disconnected):

```typescript
const mutationObserver = new MutationObserver(() => broadcastHeight());
mutationObserver.observe(document.body, { childList: true, subtree: true });
// mutationObserver.disconnect() never called
```

These accumulate on every page load and are never released.

### Fix

Use `DestroyRef` to clean up on component destroy:

```typescript
const destroyRef = inject(DestroyRef);

const observer = new ResizeObserver(() => broadcastHeight());
observer.observe(document.body);

const mutationObserver = new MutationObserver(() => broadcastHeight());
mutationObserver.observe(document.body, { childList: true, subtree: true });

const onHashChange = () => { ... };
window.addEventListener('hashchange', onHashChange);

destroyRef.onDestroy(() => {
  observer.disconnect();
  mutationObserver.disconnect();
  window.removeEventListener('hashchange', onHashChange);
});
```

---

## Issue 2 — Race condition in `switchTo()`

**Type:** `fix` | **Scope:** `sandbox`

### Problem

`switchTo()` in `host.component.ts` is async with no in-flight guard:

```typescript
private async switchTo(adapter: AdapterName): Promise<void> {
  this.loading.set(true);
  this.currentRef?.destroy();
  this.currentRef = null;
  // ...
  this.currentRef = await this.harness.bootstrap(adapter, container, { route: hashUrl });
```

Rapid adapter clicks or hash changes can trigger concurrent calls. The second
call destroys `currentRef` while the first call's `bootstrap()` is still
awaiting, leaving the app in an indeterminate state.

### Fix

```typescript
private switching = false;

private async switchTo(adapter: AdapterName): Promise<void> {
  if (this.switching) return;
  this.switching = true;
  try {
    // ...
  } finally {
    this.switching = false;
  }
}
```

Or use a `Subject` + `switchMap` to automatically cancel in-flight switches.

---

## Issue 3 — `postMessage` uses wildcard origin `'*'`

**Type:** `fix` | **Scope:** `sandbox`

### Problem

```typescript
window.parent.postMessage({ type: 'resize', height }, '*');
```

Wildcard origin means any page that embeds this sandbox in an iframe can
receive the message. While `resize` events are low-risk, this is contrary
to CLAUDE.md security expectations and sets a bad precedent.

### Fix

```typescript
window.parent.postMessage({ type: 'resize', height }, window.location.origin);
```

---

## Issue 4 — `window` access in module scope without platform guard

**Type:** `fix` | **Scope:** `sandbox`

### Problem

`getAdapterFromHash()` is a module-level function that accesses
`window.location.hash` directly:

```typescript
function getAdapterFromHash(): AdapterName | null {
  const hash = window.location.hash.replace(/^#\/?/, '');
  // ...
}
```

It is called inside `afterNextRender()` (browser-safe), but because it is
defined at module scope, any future call or test that imports this module in
an SSR or non-browser context will throw.

### Fix

Move the implementation inline into the `afterNextRender` callback, or add
an explicit guard:

```typescript
function getAdapterFromHash(): AdapterName | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#\/?/, '');
  // ...
}
```
