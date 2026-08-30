import { ChangeDetectionStrategy, Component, computed, inject, signal, untracked } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, pipe, switchMap } from 'rxjs';
import { derivedFrom } from 'ngxtension/derived-from';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { DynamicForm, EventDispatcher, FormConfig, GoToPageEvent, PagerStateEvent } from '@ng-forge/dynamic-forms';

/** Shape returned by the mocked backend. */
interface SavedSession {
  config: FormConfig;
  value: Record<string, unknown>;
  /** Page the user was last on, as the backend recorded it. */
  savedPage?: number;
}

type SessionResult = { ok: true; session: SavedSession } | { ok: false; session: undefined };

/**
 * Deep-link / session-resume harness.
 *
 * Query params:
 * - `formId`  which saved session to fetch from the mocked backend
 * - `page`    target page; falls back to the session's `savedPage`
 * - `mode`    `declarative` uses `options.initialPage`, `effect` dispatches
 *             `GoToPageEvent` once the form reports ready
 * - `gate`    `on` applies the validity gate to the landing
 */
@Component({
  selector: 'example-deep-link-scenario',
  imports: [DynamicForm, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EventDispatcher],
  template: `
    <div class="test-page">
      <h1>Deep Link / Resume</h1>

      <section class="test-scenario" data-testid="deep-link">
        @if (loading()) {
          <div data-testid="loading">Loading saved session...</div>
        }

        @if (loadError()) {
          <div data-testid="load-error">Failed to load session</div>
        }

        @if (config(); as cfg) {
          <div class="readouts">
            <span data-testid="requested-page">{{ requestedPageLabel() }}</span>
            <span data-testid="current-page">{{ currentPage() ?? 'unknown' }}</span>
            <span data-testid="total-pages">{{ totalPages() ?? 'unknown' }}</span>
            <span data-testid="mode">{{ mode() }}</span>
          </div>

          <form
            [dynamic-form]="cfg"
            [(value)]="formValue"
            (initialized)="onInitialized()"
            (onPageNavigationStateChange)="onPagerState($event)"
          ></form>
        }

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre data-testid="form-value-deep-link">{{ formValue() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class DeepLinkScenarioComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly dispatcher = inject(EventDispatcher);

  readonly formValue = signal<Record<string, unknown>>({});
  readonly currentPage = signal<number | undefined>(undefined);
  readonly totalPages = signal<number | undefined>(undefined);
  readonly loadError = signal(false);

  private readonly ready = signal(false);

  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });

  readonly mode = computed(() => this.params().get('mode') ?? 'declarative');
  private readonly gated = computed(() => this.params().get('gate') === 'on');
  private readonly syncUrl = computed(() => this.params().get('sync') === 'on');
  private readonly formId = computed(() => this.params().get('formId') ?? 'default');

  /** Session fetched from the mocked backend, keyed by `formId`. */
  private readonly session = derivedFrom(
    [this.formId],
    pipe(
      switchMap(([id]) =>
        this.http.get<SavedSession>(`/api/saved-session/${id}`).pipe(
          map((session): SessionResult => ({ ok: true, session })),
          catchError(() => of<SessionResult>({ ok: false, session: undefined })),
        ),
      ),
    ),
    { initialValue: undefined },
  );

  readonly loading = computed(() => this.session() === undefined);

  /**
   * Requested page: an explicit `page` param wins over whatever the backend saved.
   * Malformed values are forwarded as `NaN` so the library's own guard handles them.
   */
  readonly requestedPage = computed(() => {
    const raw = this.params().get('page');
    if (raw !== null) return Number(raw);
    return this.session()?.session?.savedPage;
  });

  readonly requestedPageLabel = computed(() => {
    const target = this.requestedPage();
    if (target === undefined) return 'none';
    return Number.isNaN(target) ? 'invalid' : String(target);
  });

  /**
   * Target captured when the session first arrives. `initialPage` is an *initial*
   * value, so later URL changes must not feed back into the config and rebuild the
   * form — those drive effect mode instead.
   */
  private readonly initialTarget = signal<number | undefined>(undefined);

  /** Config with `initialPage` folded in for declarative mode. */
  readonly config = computed<FormConfig | undefined>(() => {
    const loaded = this.session();
    if (!loaded?.ok) return undefined;

    const base = loaded.session.config;
    const target = this.initialTarget();

    if (this.mode() !== 'declarative' || target === undefined) return base;

    return {
      ...base,
      options: { ...base.options, initialPage: this.gated() ? { index: target, validate: true } : target },
    };
  });

  constructor() {
    explicitEffect([this.session], ([s]) => {
      this.loadError.set(s?.ok === false);
      if (!s?.ok) return;
      this.formValue.set(s.session.value);
      // Capture once; the config must not react to later URL changes.
      if (this.initialTarget() === undefined) this.initialTarget.set(untracked(() => this.requestedPage()));
    });

    // Effect mode: re-navigate whenever the requested page changes, which covers
    // in-place URL edits and browser back/forward without a reload.
    explicitEffect([this.requestedPage, this.mode, this.ready], ([target, mode, ready]) => {
      if (!ready || mode !== 'effect' || target === undefined || Number.isNaN(target)) return;
      this.dispatcher.dispatch(new GoToPageEvent(target, { validate: this.gated() }));
    });
  }

  onInitialized(): void {
    this.ready.set(true);
  }

  onPagerState(event: PagerStateEvent): void {
    this.currentPage.set(event.state.currentPageIndex);
    this.totalPages.set(event.state.totalPages);

    // Mirror the active page into the URL so a refresh resumes where the user left off.
    // Opt-in: the write changes `page`, which would otherwise feed straight back into
    // effect mode and drag the form back to whatever landed first.
    if (!this.syncUrl()) return;
    if (this.params().get('page') === String(event.state.currentPageIndex)) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: event.state.currentPageIndex },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
