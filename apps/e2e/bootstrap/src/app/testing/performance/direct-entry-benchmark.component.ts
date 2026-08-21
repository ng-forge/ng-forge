import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DynamicForm, EventDispatcher, NextPageEvent, PagerStateEvent, PreviousPageEvent, type FormOptions } from '@ng-forge/dynamic-forms';
import {
  DIRECT_ENTRY_PAGE_COUNT,
  DIRECT_ENTRY_TOTAL_FIELDS,
  directEntryFullConfig,
  directEntryWizardConfig,
} from '@ng-forge/examples-shared-testing/perf';

const ACTIVE_PAGE_MARK = 'ng-forge:active-page-initialized';
const ACTIVE_PAGE_MEASURE = 'ng-forge:active-page-ready';
const BOOTSTRAP_START_MARK = 'ng-forge:bootstrap-start';
const FULL_FORM_MARK = 'ng-forge:full-form-initialized';

@Component({
  selector: 'bs-example-direct-entry-benchmark',
  imports: [DynamicForm],
  providers: [EventDispatcher],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main
      class="benchmark"
      data-testid="direct-entry-benchmark"
      [attr.data-mode]="mode"
      [attr.data-total-fields]="totalFields"
      [attr.data-preload-window]="preloadWindow()"
      [attr.data-field-windowing-eager]="fieldWindowingEager()"
      [attr.data-active-page-ready]="activePageReady()"
    >
      <div class="heading-slot">
        <h1 [class.is-ready]="activePageReady()">{{ heading() }}</h1>
      </div>

      @if (mode === 'wizard') {
        <nav aria-label="Benchmark page navigation">
          <button type="button" [disabled]="currentPage() === 0" (click)="previousPage()">Previous</button>
          <span aria-live="polite">Page {{ currentPage() + 1 }} of {{ pageCount }}</span>
          <button type="button" [disabled]="currentPage() === pageCount - 1" (click)="nextPage()">Next</button>
        </nav>
      }

      <form
        [dynamic-form]="config"
        [formOptions]="formOptions()"
        (initialized)="onInitialized()"
        (activePageInitialized)="onActivePageInitialized()"
        (onPageNavigationStateChange)="onPagerState($event)"
      ></form>
    </main>
  `,
  styles: `
    :host {
      display: block;
    }

    .benchmark {
      width: min(100% - 2rem, 64rem);
      margin: 1rem auto;
    }

    .heading-slot {
      min-height: 2.8rem;
    }

    h1 {
      visibility: hidden;
      margin: 0;
      font-size: 1.5rem;
    }

    h1.is-ready {
      visibility: visible;
    }

    nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
    }
  `,
})
export class DirectEntryBenchmarkComponent {
  private readonly dispatcher = inject(EventDispatcher);
  private readonly benchmarkUrl = new URL(location.hash.replace(/^#/, '') || '/wizard', location.origin);

  readonly mode = this.benchmarkUrl.pathname === '/full' ? 'full' : 'wizard';
  readonly totalFields = DIRECT_ENTRY_TOTAL_FIELDS;
  readonly pageCount = DIRECT_ENTRY_PAGE_COUNT;
  readonly config = this.mode === 'full' ? directEntryFullConfig() : directEntryWizardConfig();
  readonly currentPage = signal(0);
  readonly activePageReady = signal(this.mode === 'full');

  readonly preloadWindow = computed(() => {
    const raw = this.benchmarkUrl.searchParams.get('preload');
    if (raw === null) return 1;

    const parsed = Number(raw);
    return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 1;
  });

  readonly fieldWindowingEager = computed(() => {
    const raw = this.benchmarkUrl.searchParams.get('eager');
    if (raw === null) return null;

    const parsed = Number(raw);
    return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : null;
  });

  readonly formOptions = computed<FormOptions>(() => {
    const eager = this.fieldWindowingEager();
    return {
      pagePreloadWindow: this.preloadWindow(),
      ...(eager === null ? {} : { fieldWindowing: { eager } }),
    };
  });
  readonly heading = computed(() =>
    this.mode === 'wizard'
      ? `Performance benchmark, page ${this.currentPage() + 1} of ${this.pageCount}`
      : 'Performance benchmark, full form',
  );

  nextPage(): void {
    this.dispatcher.dispatch(new NextPageEvent());
  }

  previousPage(): void {
    this.dispatcher.dispatch(new PreviousPageEvent());
  }

  onPagerState(event: PagerStateEvent): void {
    if (event.state.currentPageIndex !== this.currentPage()) {
      this.activePageReady.set(false);
    }
    this.currentPage.set(event.state.currentPageIndex);
  }

  onActivePageInitialized(): void {
    this.activePageReady.set(true);
    performance.clearMarks(ACTIVE_PAGE_MARK);
    performance.mark(ACTIVE_PAGE_MARK);

    if (performance.getEntriesByName(BOOTSTRAP_START_MARK, 'mark').length > 0) {
      performance.clearMeasures(ACTIVE_PAGE_MEASURE);
      performance.measure(ACTIVE_PAGE_MEASURE, BOOTSTRAP_START_MARK, ACTIVE_PAGE_MARK);
    }
  }

  onInitialized(): void {
    performance.clearMarks(FULL_FORM_MARK);
    performance.mark(FULL_FORM_MARK);
  }
}
