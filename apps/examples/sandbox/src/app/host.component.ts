import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  runInInjectionContext,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, EMPTY, fromEvent, map, merge, Observable, Subject, switchMap } from 'rxjs';
import { AdapterName, isAdapterName, SandboxHarness, SandboxSlot } from '@ng-forge/sandbox-harness';
import { SANDBOX_ADAPTERS } from './adapter-registrations';

const DEFAULT_ADAPTER: AdapterName = 'material';

/** Labels for the nav buttons, in display order. */
const NAV_ADAPTERS: ReadonlyArray<{ name: AdapterName; label: string }> = [
  { name: 'material', label: 'Material' },
  { name: 'bootstrap', label: 'Bootstrap' },
  { name: 'primeng', label: 'PrimeNG' },
  { name: 'ionic', label: 'Ionic' },
  { name: 'core', label: 'Core' },
];

/**
 * Returns the default route for the given adapter, derived from the registration.
 * Single source of truth — avoids duplicating AdapterRegistration.defaultRoute.
 */
function getDefaultRoute(adapter: AdapterName): string {
  return SANDBOX_ADAPTERS.find((r) => r.name === adapter)?.defaultRoute ?? 'examples';
}

/**
 * Extracts the adapter name from the hash URL (`#/<adapter>/...`).
 * SSR-safe: returns null when window is unavailable.
 */
function getAdapterFromHash(): AdapterName | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#\/?/, '');
  const segment = hash.split('/')[0];
  return segment && isAdapterName(segment) ? segment : null;
}

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

@Component({
  selector: 'sandbox-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sandbox-host">
      <nav class="sandbox-nav">
        <h1>Sandbox Examples</h1>
        @for (a of navAdapters; track a.name) {
          <button class="adapter-btn" [class.active]="activeAdapter() === a.name" (click)="navigateTo(a.name)">
            {{ a.label }}
          </button>
        }
      </nav>

      @if (loading()) {
        <div class="adapter-loading">Loading adapter...</div>
      }
      @if (error()) {
        <div class="adapter-error">Failed to load adapter: {{ error() }}</div>
      }

      <div class="adapter-container" #adapterContainer></div>
    </div>
  `,
})
export class HostComponent {
  private readonly harness = inject(SandboxHarness);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly containerRef = viewChild.required<ElementRef<HTMLElement>>('adapterContainer');

  // Initialized synchronously from the hash so the correct nav button is active on first render.
  readonly activeAdapter = signal<AdapterName>(getAdapterFromHash() ?? DEFAULT_ADAPTER);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly navAdapters = NAV_ADAPTERS;

  // Slot created lazily on first mount — container element only available after view init.
  private slot: SandboxSlot | null = null;
  private readonly adapterSwitch$ = new Subject<AdapterName>();

  constructor() {
    // switchMap auto-cancels any in-flight bootstrap when a new adapter is requested,
    // preventing race conditions from rapid clicks or fast hash changes.
    this.adapterSwitch$
      .pipe(
        switchMap((adapter) =>
          this.mountAdapter(adapter).pipe(
            catchError((err) => {
              const msg = err instanceof Error ? err.message : String(err);
              console.error(`[Sandbox] Failed to mount adapter "${adapter}":`, err);
              this.error.set(msg);
              this.loading.set(false);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    afterNextRender(() => {
      const detectedAdapter = getAdapterFromHash();
      if (!detectedAdapter) {
        window.location.hash = `#/${DEFAULT_ADAPTER}/${getDefaultRoute(DEFAULT_ADAPTER)}`;
      }
      this.adapterSwitch$.next(detectedAdapter ?? DEFAULT_ADAPTER);

      // Only handles external URL changes (back/forward, direct URL edits).
      // Button clicks go through navigateTo() → adapterSwitch$ directly.
      fromEvent(window, 'hashchange')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          const newAdapter = getAdapterFromHash();
          if (newAdapter && newAdapter !== this.activeAdapter()) {
            this.adapterSwitch$.next(newAdapter);
          }
        });

      if (window.self !== window.top) {
        merge(fromResizeObserver(document.body), fromMutationObserver(document.body, { childList: true, subtree: true }))
          .pipe(
            map(() => document.documentElement.scrollHeight),
            distinctUntilChanged((a, b) => Math.abs(a - b) <= 2),
            takeUntilDestroyed(this.destroyRef),
          )
          .subscribe((height) => window.parent.postMessage({ type: 'resize', height }, window.location.origin));
      }
    });
  }

  navigateTo(adapter: AdapterName): void {
    if (this.activeAdapter() === adapter) return;
    window.location.hash = `#/${adapter}/${getDefaultRoute(adapter)}`;
    // Emit directly so the mount starts immediately without waiting for the hashchange event.
    this.adapterSwitch$.next(adapter);
  }

  private getSlot(): SandboxSlot {
    if (!this.slot) {
      const container = this.containerRef().nativeElement;
      // runInInjectionContext is required because SandboxSlot's constructor calls inject(DestroyRef).
      this.slot = runInInjectionContext(this.injector, () => this.harness.createSlot(container));
    }
    return this.slot;
  }

  private mountAdapter(adapter: AdapterName): Observable<void> {
    return new Observable((subscriber) => {
      this.loading.set(true);
      this.error.set(null);
      this.activeAdapter.set(adapter);

      const controller = new AbortController();
      const hashUrl = window.location.hash.replace(/^#/, '') || '/';

      this.getSlot()
        .mount(adapter, hashUrl, controller.signal)
        .then(() => {
          if (subscriber.closed) return;
          this.loading.set(false);
          subscriber.next();
          subscriber.complete();
        })
        .catch((err: unknown) => {
          if ((err as { name?: string })?.name === 'AbortError') return;
          if (!subscriber.closed) subscriber.error(err);
        });

      // Teardown: abort the in-flight bootstrap when switchMap cancels (newer adapter requested).
      return () => {
        controller.abort();
        this.loading.set(false);
      };
    });
  }
}
