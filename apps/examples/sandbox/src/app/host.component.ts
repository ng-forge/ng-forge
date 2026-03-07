import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, EMPTY, fromEvent, map, merge, Observable, Subject, switchMap } from 'rxjs';
import { AdapterName, isAdapterName, SandboxHarness, SandboxRef } from '@ng-forge/sandbox-harness';
import { SANDBOX_ADAPTERS } from './adapter-registrations';

const DEFAULT_ADAPTER: AdapterName = 'material';

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
        <button class="adapter-btn" [class.active]="activeAdapter() === 'material'" (click)="navigateTo('material')">Material</button>
        <button class="adapter-btn" [class.active]="activeAdapter() === 'bootstrap'" (click)="navigateTo('bootstrap')">Bootstrap</button>
        <button class="adapter-btn" [class.active]="activeAdapter() === 'primeng'" (click)="navigateTo('primeng')">PrimeNG</button>
        <button class="adapter-btn" [class.active]="activeAdapter() === 'ionic'" (click)="navigateTo('ionic')">Ionic</button>
        <button class="adapter-btn" [class.active]="activeAdapter() === 'core'" (click)="navigateTo('core')">Core</button>
      </nav>

      @if (loading()) {
        <div class="adapter-loading">Loading adapter...</div>
      }

      <div class="adapter-container" #adapterContainer></div>
    </div>
  `,
})
export class HostComponent {
  private readonly harness = inject(SandboxHarness);
  private readonly destroyRef = inject(DestroyRef);
  private readonly containerRef = viewChild.required<ElementRef<HTMLElement>>('adapterContainer');

  // Initialized synchronously from the hash so the correct nav button is active on first render.
  readonly activeAdapter = signal<AdapterName>(getAdapterFromHash() ?? DEFAULT_ADAPTER);
  readonly loading = signal(false);

  private currentRef: SandboxRef | null = null;
  private readonly adapterSwitch$ = new Subject<AdapterName>();

  constructor() {
    // switchMap auto-cancels any in-flight bootstrap when a new adapter is requested,
    // preventing race conditions from rapid clicks or fast hash changes.
    this.adapterSwitch$
      .pipe(
        switchMap((adapter) =>
          this.mountAdapter(adapter).pipe(
            catchError((err) => {
              console.error(`[Sandbox] Failed to mount adapter "${adapter}":`, err);
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

      // takeUntilDestroyed with explicit destroyRef works outside injection context
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
  }

  private mountAdapter(adapter: AdapterName): Observable<void> {
    return new Observable((subscriber) => {
      this.loading.set(true);
      this.activeAdapter.set(adapter);
      this.currentRef?.destroy();
      this.currentRef = null;

      const container = this.containerRef().nativeElement;
      const hashUrl = window.location.hash.replace(/^#/, '') || '/';

      this.harness
        .bootstrap(adapter, container, { route: hashUrl })
        .then((ref) => {
          if (subscriber.closed) {
            // A newer adapter was requested while this one was loading — discard.
            ref.destroy();
            return;
          }
          this.currentRef = ref;
          this.loading.set(false);
          subscriber.next();
          subscriber.complete();
        })
        .catch((err) => {
          if (!subscriber.closed) subscriber.error(err);
        });

      // Teardown: called by switchMap when a newer adapter arrives before this one resolves.
      return () => {
        this.currentRef?.destroy();
        this.currentRef = null;
        this.loading.set(false);
      };
    });
  }
}
