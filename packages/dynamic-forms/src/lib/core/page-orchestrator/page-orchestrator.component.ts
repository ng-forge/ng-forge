import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventBus } from '@ng-forge/dynamic-forms/internal';
import { PageNavigationOptions } from '../../events/constants/go-to-page.event';
import { NextPageEvent } from '../../events/constants/next-page.event';
import { PageChangeEvent } from '../../events/constants/page-change.event';
import { PreviousPageEvent } from '../../events/constants/previous-page.event';
import { NavigationResult, PagerState } from './page-orchestrator.interfaces';
import { PageField } from '@ng-forge/dynamic-forms/internal';
import { ContainerLogicConfig } from '@ng-forge/dynamic-forms/internal';
import { FieldSignalContext } from '@ng-forge/dynamic-forms/internal';
import PageFieldComponent from '../../fields/page/page-field.component';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { PagerStateEvent } from '../../events/constants/pager-state.event';
import { FieldTree } from '@angular/forms/signals';
import { FIELD_SIGNAL_CONTEXT, FORM_OPTIONS } from '@ng-forge/dynamic-forms/internal';
import { ConditionalExpression } from '@ng-forge/dynamic-forms/internal';
import { evaluateCondition } from '@ng-forge/dynamic-forms/internal';
import { FunctionRegistryService } from '@ng-forge/dynamic-forms/internal';
import { FieldContextRegistryService } from '@ng-forge/dynamic-forms/internal';
import { PAGE_PRELOAD_WINDOW } from '../../providers/features/page-preload/page-preload.token';
import { clampWindowSize } from '../../providers/features/clamp-window';
import { collectLeafFieldKeys } from '../../utils/page-utils/collect-leaf-field-keys';
import { FormStateManager } from '../../state/form-state-manager';
import { injectFormComponentPreloader } from '../../utils/preload-form-components/preload-form-components';

/**
 * PageOrchestrator manages page navigation and visibility for paged forms.
 * It acts as an intermediary between the DynamicForm component and PageField components,
 * handling page state management and navigation events without interfering with form data.
 */
@Component({
  selector: 'div[page-orchestrator]',
  imports: [PageFieldComponent],
  template: `
    @for (page of pageRenderStates(); track page.field.key) {
      <!--
        Skip pages hidden by 'hidden' logic conditions entirely. FormStateManager
        derives schema/value/validators from config (not from mounted components),
        so unmounting a hidden page has no effect on form state — only on render +
        CD cost. This is the page-level equivalent of the existing field-level
        \`@if (!field.hidden())\` gate in page-field.component.ts.
      -->
      @if (!page.hidden) {
        @if (page.active || page.preload) {
          @defer (when page.active; on idle) {
            <section page-field [field]="page.field" [key]="page.field.key" [pageIndex]="page.index" [isVisible]="page.active"></section>
          } @placeholder {
            <div class="df-page-placeholder" [attr.data-page-index]="page.index" [attr.data-page-key]="page.field.key"></div>
          }
        } @else {
          <!--
            Pages outside the preload window remain lightweight placeholders.
            Form state derives from config, so leaving their components unmounted
            does not affect validity, derivations, or navigation. The active page
            renders directly; configured neighbours preload declaratively on idle.
          -->
          <div class="df-page-placeholder" [attr.data-page-index]="page.index" [attr.data-page-key]="page.field.key"></div>
        }
      }
    }
  `,
  styleUrl: './page-orchestrator.component.scss',
  host: {
    class: 'df-page-orchestrator',
    '[attr.data-current-page]': 'state().currentPageIndex',
    '[attr.data-total-pages]': 'state().totalPages',
  },
  providers: [
    {
      provide: FIELD_SIGNAL_CONTEXT,
      useFactory: (orchestrator: PageOrchestratorComponent) => orchestrator.extendedFieldSignalContext(),
      deps: [PageOrchestratorComponent],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageOrchestratorComponent {
  private readonly eventBus = inject(EventBus);
  private readonly fieldContextRegistry = inject(FieldContextRegistryService);
  private readonly functionRegistry = inject(FunctionRegistryService);
  private readonly formOptions = inject(FORM_OPTIONS, { optional: true });
  private readonly globalPreloadWindow = inject(PAGE_PRELOAD_WINDOW);
  private readonly stateManager = inject(FormStateManager, { optional: true });

  /** Pending programmatic page request, owned by FormStateManager. */
  private readonly pendingPageRequest = computed(() => this.stateManager?.pendingPageRequest() ?? null);

  /** Whether validation belongs to the page definitions currently being rendered. */
  private readonly schemaCurrent = computed(() => this.stateManager?.isSchemaCurrent() ?? true);

  /** Stable ownership scope; page arrays can be recreated during one config transition. */
  private readonly configScope = computed(() => this.stateManager?.activeConfig());

  /** Array of page field definitions to render */
  pageFields = input.required<PageField[]>();

  /**
   * Root form instance from parent DynamicForm.
   * Uses FieldTree<unknown> to accept any form type.
   */
  form = input.required<FieldTree<unknown>>();

  /** Field signal context for child fields */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- FieldSignalContext is contravariant in TModel, using any allows accepting any form type
  fieldSignalContext = input.required<FieldSignalContext<any>>();

  /**
   * Computed signal that tracks which pages are hidden.
   * Returns an array of booleans where true means the page is hidden.
   * This signal is reactive and will re-evaluate when form values change.
   */
  readonly pageHiddenStates = computed(() => {
    const pages = this.pageFields();

    return pages.map((page) => this.evaluatePageHidden(page));
  });

  /**
   * Computed signal that returns indices of visible (non-hidden) pages.
   * This is used for navigation to skip hidden pages.
   */
  readonly visiblePageIndices = computed(() => {
    const hiddenStates = this.pageHiddenStates();
    return hiddenStates
      .map((hidden, index) => ({ index, hidden }))
      .filter((item) => !item.hidden)
      .map((item) => item.index);
  });

  /** Current page ownership, reset atomically when the active config changes. */
  private readonly activePageOwnership = linkedSignal<
    object | undefined,
    {
      config: object | undefined;
      initialized: boolean;
      index: number;
    }
  >({
    source: this.configScope,
    computation: (config, previous) => {
      const totalPages = this.pageFields().length;

      if (totalPages === 0) return { config, initialized: true, index: 0 };

      // Untracked: re-land on a config swap, but never on a later validity or visibility change.
      return untracked(() => {
        // A newly mounted pager may restore ownership for the same config. An existing pager must
        // ignore ownership when the config changes because its outgoing effect can still publish
        // the previous index during that transition.
        const owned = this.stateManager?.activePageState();
        const mayRestore = previous === undefined || previous.source === config;
        if (
          mayRestore &&
          owned !== undefined &&
          owned.config === config &&
          owned.initialized &&
          owned.index >= 0 &&
          owned.index < totalPages
        ) {
          return { config, initialized: true, index: owned.index };
        }

        if (this.initialPage().validate && !this.schemaCurrent()) {
          return { config, initialized: false, index: 0 };
        }

        return { config, initialized: true, index: this.resolveInitialLanding() };
      });
    },
  });

  /** Actual page index, excluding hidden pages from its numbering. */
  private readonly currentPageIndex = computed(() => this.activePageOwnership().index);

  private setCurrentPageIndex(index: number): void {
    this.activePageOwnership.update((ownership) => ({ ...ownership, initialized: true, index }));
  }

  /** Where `initialPage` actually lands: hidden targets resolve forward, gated ones stop on the first invalid page. */
  private resolveInitialLanding(): number {
    const { index, validate } = this.initialPage();
    const visible = this.visiblePageIndices();
    if (index === 0 || visible.length === 0) return 0;

    const target = visible.includes(index) ? index : this.findNearestVisiblePage(index, visible);
    if (target <= 0) return Math.max(target, 0);
    if (!validate) return target;

    const firstInvalid = visible.filter((i) => i < target).find((i) => !this.isPageValid(i));
    return firstInvalid ?? target;
  }

  /** Resolved `FormOptions.initialPage`: out-of-range clamps to the last page, invalid values fall back to 0. */
  private readonly initialPage = computed<{ index: number; validate: boolean }>(() => {
    const raw = this.formOptions?.()?.initialPage;
    const totalPages = this.pageFields().length;
    const requested = typeof raw === 'number' ? raw : raw?.index;
    const validate = typeof raw === 'number' ? false : (raw?.validate ?? false);

    if (typeof requested !== 'number' || !Number.isFinite(requested) || requested < 0 || totalPages === 0) {
      return { index: 0, validate: false };
    }

    return { index: Math.min(Math.trunc(requested), totalPages - 1), validate };
  });

  /** Computed state for the orchestrator */
  readonly state = computed<PagerState>(() => {
    const currentIndex = this.currentPageIndex();
    const totalPages = this.pageFields().length;
    const visibleIndices = this.visiblePageIndices();

    // Find where the current index is in the visible pages list
    const currentVisiblePosition = visibleIndices.indexOf(currentIndex);
    const isFirstVisiblePage = currentVisiblePosition === 0 || currentVisiblePosition === -1;
    const isLastVisiblePage = currentVisiblePosition >= visibleIndices.length - 1;

    return {
      currentPageIndex: currentIndex,
      totalPages,
      isFirstPage: isFirstVisiblePage,
      isLastPage: isLastVisiblePage,
    };
  });

  /**
   * Signal indicating whether all fields on the current page are valid.
   *
   * @returns `true` if current page is valid, `false` otherwise
   */
  // Reports invalid while the schema is stale: the incoming page's fields are mounted but not
  // yet validated, so trusting them would let a second click skip a page.
  readonly currentPageValid = computed(() => (this.stateManager?.isSchemaCurrent() ?? true) && this.isPageValid(this.currentPageIndex()));

  /**
   * Whether all fields on the given page are currently valid.
   *
   * Form state derives from config, not from mounted components, so any page can
   * be checked without having been visited.
   *
   * @param pageIndex The page index (0-based)
   * @returns `true` if the page is valid or the index is out of range
   */
  private isPageValid(pageIndex: number): boolean {
    const pages = this.pageFields();
    const form = this.form();

    if (pageIndex < 0 || pageIndex >= pages.length) {
      return true;
    }

    // Collect all leaf field keys, recursively traversing group/row containers
    const leafKeys = collectLeafFieldKeys(pages[pageIndex].fields || []);

    // Check validity of each leaf field on the page
    // Fields are stored at root level in the form (pages don't add nesting)
    for (const fieldKey of leafKeys) {
      const field = (form as Record<string, unknown>)[fieldKey];
      if (field && typeof field === 'function') {
        const fieldState = (field as () => { valid: () => boolean })();
        if (fieldState && typeof fieldState.valid === 'function' && !fieldState.valid()) {
          return false;
        }
      }
    }

    return true;
  }

  /** Extended field signal context that includes currentPageValid. */
  readonly extendedFieldSignalContext = computed(() => ({
    ...this.fieldSignalContext(),
    currentPageValid: this.currentPageValid,
  }));

  /**
   * Effective preload window (pages preloaded on idle on each side of the current page).
   * Per-form `FormOptions.pagePreloadWindow` wins over the global
   * `withPagePreload(n)` default; both fall back to `1`. Clamped to `>= 0`.
   */
  readonly preloadWindow = computed(() => {
    const perForm = this.formOptions?.()?.pagePreloadWindow;
    // The global is already normalized; a non-finite per-form value falls back to it.
    return clampWindowSize(perForm, this.globalPreloadWindow);
  });

  /** Declarative render mode for every configured page. */
  readonly pageRenderStates = computed(() => {
    const activeIndex = this.currentPageIndex();
    const hiddenStates = this.pageHiddenStates();
    const preloadWindow = this.preloadWindow();

    return this.pageFields().map((field, index) => ({
      field,
      index,
      hidden: hiddenStates[index],
      active: index === activeIndex,
      preload: index !== activeIndex && Math.abs(index - activeIndex) <= preloadWindow,
    }));
  });

  constructor() {
    // Setup event listeners for navigation
    this.setupEventListeners();

    // Warm only the pages that can currently render. When navigation moves the
    // window this effect preloads the newly selected subtree before its deferred
    // page component discovers those chunks field by field.
    const preloader = injectFormComponentPreloader();
    explicitEffect([this.pageRenderStates], ([states]) => {
      preloader.preloadFields(states.filter((page) => !page.hidden && (page.active || page.preload)).map((page) => page.field));
    });

    // A config swap exposes its page definitions before their schema is current. Defer a gated
    // landing until those fields can be validated, then resolve it exactly once for this page set.
    explicitEffect([this.schemaCurrent, this.pageFields], ([schemaCurrent]) => {
      const ownership = this.activePageOwnership();
      if (!schemaCurrent || ownership.initialized) return;
      this.activePageOwnership.set({ ...ownership, initialized: true, index: this.resolveInitialLanding() });
    });

    // B15: Auto-navigate away when current page becomes hidden
    explicitEffect([this.state, this.visiblePageIndices], ([state, visibleIndices]) => {
      const currentVisiblePosition = visibleIndices.indexOf(state.currentPageIndex);
      if (currentVisiblePosition === -1 && visibleIndices.length > 0) {
        // Current page is hidden — navigate to the nearest visible page
        const nearest = this.findNearestVisiblePage(state.currentPageIndex, visibleIndices);
        if (nearest !== -1) {
          this.executePageChange(nearest);
        }
      }
    });
  }

  /**
   * Navigate to the next visible page, skipping hidden pages.
   *
   * @returns Navigation result
   */
  navigateToNextPage(): NavigationResult {
    // Guard: do not advance if current page has invalid fields.
    // Respects disableWhenPageInvalid option (defaults to true).
    const disableWhenPageInvalid = this.formOptions?.()?.nextButton?.disableWhenPageInvalid ?? true;
    if (disableWhenPageInvalid && !this.currentPageValid()) {
      return {
        success: false,
        newPageIndex: this.state().currentPageIndex,
        error: 'Current page has invalid fields',
      };
    }

    const currentState = this.state();
    const visibleIndices = this.visiblePageIndices();

    if (currentState.isLastPage) {
      return {
        success: false,
        newPageIndex: currentState.currentPageIndex,
        error: 'Already on the last visible page',
      };
    }

    // Find the next visible page after the current index
    const currentVisiblePosition = visibleIndices.indexOf(currentState.currentPageIndex);
    if (currentVisiblePosition === -1 || currentVisiblePosition >= visibleIndices.length - 1) {
      return {
        success: false,
        newPageIndex: currentState.currentPageIndex,
        error: 'No next visible page available',
      };
    }

    const nextVisiblePageIndex = visibleIndices[currentVisiblePosition + 1];
    return this.executePageChange(nextVisiblePageIndex);
  }

  /**
   * Navigate to the previous visible page, skipping hidden pages.
   *
   * @returns Navigation result
   */
  navigateToPreviousPage(): NavigationResult {
    const currentState = this.state();
    const visibleIndices = this.visiblePageIndices();

    if (currentState.isFirstPage) {
      return {
        success: false,
        newPageIndex: currentState.currentPageIndex,
        error: 'Already on the first visible page',
      };
    }

    // Find the previous visible page before the current index
    const currentVisiblePosition = visibleIndices.indexOf(currentState.currentPageIndex);
    if (currentVisiblePosition <= 0) {
      return {
        success: false,
        newPageIndex: currentState.currentPageIndex,
        error: 'No previous visible page available',
      };
    }

    const prevVisiblePageIndex = visibleIndices[currentVisiblePosition - 1];
    return this.executePageChange(prevVisiblePageIndex);
  }

  /**
   * Navigate to an arbitrary page, applying the jump validation semantics.
   *
   * Backward jumps are unconditional, matching `previous` having no validity gate.
   * Forward jumps validate every visible page crossed by the jump — from the
   * current page up to, but excluding, the target — because conditions may have
   * changed since those pages were last visited. On failure, navigation lands on
   * the first invalid page rather than staying put, so the user ends up where
   * work is required. Hidden pages are never validated.
   *
   * Respects `nextButton.disableWhenPageInvalid`, the same option that gates
   * next-page navigation.
   *
   * @param pageIndex The target page index (0-based)
   * @returns Navigation result
   */
  navigateToPage(pageIndex: number, options?: PageNavigationOptions): NavigationResult {
    const currentIndex = this.state().currentPageIndex;
    const visibleIndices = this.visiblePageIndices();

    // Backward jumps and no-ops need no gate. Out-of-bounds and hidden targets
    // fall through too — executePageChange reports those without navigating.
    if (pageIndex <= currentIndex || !visibleIndices.includes(pageIndex)) {
      return this.executePageChange(pageIndex);
    }

    // Per-dispatch opt-out, for restoring a saved session onto its exact page.
    if (options?.validate === false) {
      return this.executePageChange(pageIndex);
    }

    const disableWhenPageInvalid = this.formOptions?.()?.nextButton?.disableWhenPageInvalid ?? true;
    if (!disableWhenPageInvalid) {
      return this.executePageChange(pageIndex);
    }

    const crossedPages = visibleIndices.filter((index) => index >= currentIndex && index < pageIndex);
    const firstInvalidPage = crossedPages.find((index) => !this.isPageValid(index));

    if (firstInvalidPage === undefined) {
      return this.executePageChange(pageIndex);
    }

    // Partial jump: land on the first invalid page and report the failure.
    this.executePageChange(firstInvalidPage);

    return {
      success: false,
      newPageIndex: firstInvalidPage,
      error: `Cannot navigate to page ${pageIndex}: page ${firstInvalidPage} has invalid fields`,
    };
  }

  /**
   * Performs the actual page change, with no validity gating.
   *
   * Validates bounds and target visibility, updates the active index, and emits
   * `PageChangeEvent`. All gated entry points funnel through here.
   *
   * @param pageIndex The target page index (0-based)
   * @returns Navigation result
   */
  private executePageChange(pageIndex: number): NavigationResult {
    const currentState = this.state();
    const totalPages = currentState.totalPages;

    // Validate page index bounds
    if (pageIndex < 0 || pageIndex >= totalPages) {
      return {
        success: false,
        newPageIndex: currentState.currentPageIndex,
        error: `Invalid page index: ${pageIndex}. Valid range is 0 to ${totalPages - 1}`,
      };
    }

    // Validate target page is visible
    const visibleIndices = this.visiblePageIndices();
    if (!visibleIndices.includes(pageIndex)) {
      return {
        success: false,
        newPageIndex: currentState.currentPageIndex,
        error: `Cannot navigate to hidden page at index ${pageIndex}. Visible pages: [${visibleIndices.join(', ')}]`,
      };
    }

    // Check if already on target page
    if (pageIndex === currentState.currentPageIndex) {
      return {
        success: true,
        newPageIndex: pageIndex,
      };
    }

    // Perform navigation
    const previousIndex = currentState.currentPageIndex;
    this.setCurrentPageIndex(pageIndex);

    // Emit page change event
    this.eventBus.dispatch(PageChangeEvent, pageIndex, totalPages, previousIndex);

    return {
      success: true,
      newPageIndex: pageIndex,
    };
  }

  /**
   * Finds the nearest visible page index to the given index.
   * Prefers the forward (higher index) page when equidistant.
   */
  private findNearestVisiblePage(currentIndex: number, visibleIndices: number[]): number {
    let nearest = -1;
    let minDistance = Infinity;

    for (const idx of visibleIndices) {
      const distance = Math.abs(idx - currentIndex);
      // Prefer forward (higher index) when tied
      if (distance < minDistance || (distance === minDistance && idx > nearest)) {
        minDistance = distance;
        nearest = idx;
      }
    }

    return nearest;
  }

  /** Set up event listeners for navigation events */
  private setupEventListeners(): void {
    // Listen for next page events
    this.eventBus
      .on<NextPageEvent>('next-page')
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.navigateToNextPage();
      });

    // Listen for previous page events
    this.eventBus
      .on<PreviousPageEvent>('previous-page')
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.navigateToPreviousPage();
      });

    // Programmatic jumps arrive as pending intent on FormStateManager rather than as a live
    // subscription here: this component mounts behind the render gate, so a request made on
    // `initialized` would otherwise reach the bus before this listener existed. Draining it
    // here keeps visibility and validity resolution in the one place that knows about them.
    explicitEffect([this.pendingPageRequest], ([request]) => {
      if (!request) return;
      this.stateManager?.pendingPageRequest.set(null);
      this.navigateToPage(request.index, request.options);
    });

    explicitEffect([this.state], ([state]) => this.eventBus.dispatch(PagerStateEvent, state));

    // Publish upward so navigation survives this pager being temporarily unmounted.
    explicitEffect([this.activePageOwnership], ([ownership]) => this.stateManager?.activePageState.set(ownership));
  }

  /**
   * Evaluates whether a page should be hidden based on its logic configuration.
   * A page is hidden if ANY of its hidden logic conditions evaluate to true.
   *
   * @param page The page field to evaluate
   * @returns true if the page should be hidden, false otherwise
   */
  private evaluatePageHidden(page: PageField): boolean {
    // If no logic defined, page is visible
    if (!page.logic || page.logic.length === 0) {
      return false;
    }

    // Filter to only hidden logic (pages only support hidden type)
    const hiddenLogic = page.logic.filter((l): l is ContainerLogicConfig => l.type === 'hidden');

    // If no hidden logic, page is visible
    if (hiddenLogic.length === 0) {
      return false;
    }

    // Check each hidden logic - if ANY condition is true, the page is hidden
    for (const logic of hiddenLogic) {
      // Handle static boolean conditions (fast path)
      if (typeof logic.condition === 'boolean') {
        if (logic.condition) {
          return true;
        }
        continue;
      }

      // Evaluate conditional expression using centralized context creation
      const condition = logic.condition as ConditionalExpression;
      const context = this.fieldContextRegistry.createDisplayOnlyContext(page.key || '', this.functionRegistry.getCustomFunctions());

      if (evaluateCondition(condition, context)) {
        return true;
      }
    }

    return false;
  }
}
