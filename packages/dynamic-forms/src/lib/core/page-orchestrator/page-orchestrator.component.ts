import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventBus } from '../../events/event.bus';
import { NextPageEvent, PageChangeEvent, PreviousPageEvent } from '../../events/constants';
import { NavigationResult, PageOrchestratorState } from './page-orchestrator.interfaces';
import { PageField } from '../../definitions/default/page-field';
import { ContainerLogicConfig } from '../../definitions/base/container-logic-config';
import { FieldSignalContext } from '../../mappers/types';
import PageFieldComponent from '../../fields/page/page-field.component';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { PageNavigationStateChangeEvent } from '../../events/constants/page-navigation-state-change.event';
import { FieldTree } from '@angular/forms/signals';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { evaluateCondition } from '../expressions/condition-evaluator';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';

/**
 * PageOrchestrator manages page navigation and visibility for paged forms.
 * It acts as an intermediary between the DynamicForm component and PageField components,
 * handling page state management and navigation events without interfering with form data.
 *
 * This component uses declarative rendering with @defer blocks for optimal performance,
 * ensuring that non-visible pages are lazily loaded only when needed.
 *
 * Key responsibilities:
 * - Manage current page index state
 * - Handle navigation events (next/previous)
 * - Declaratively render pages with deferred loading
 * - Emit page change events
 * - Validate navigation boundaries
 *
 * @example
 * ```html
 * <div page-orchestrator
 *   [pageFields]="pageFields"
 *   [form]="form"
 *   [fieldSignalContext]="fieldSignalContext"
 *   [config]="orchestratorConfig"
 *   (pageChanged)="onPageChanged($event)"
 *   (navigationStateChanged)="onNavigationStateChanged($event)">
 * </div>
 * ```
 */
@Component({
  selector: 'div[page-orchestrator]',
  imports: [PageFieldComponent],
  template: `
    @for (pageField of pageFields(); track pageField.key; let i = $index) {
      @if (i === state().currentPageIndex || i === state().currentPageIndex + 1 || i === state().currentPageIndex - 1) {
        <!-- Current and adjacent pages (±1): render immediately for flicker-free navigation -->
        @defer (on immediate) {
          <section
            page-field
            [field]="pageField"
            [key]="pageField.key"
            [pageIndex]="i"
            [isVisible]="i === state().currentPageIndex"
          ></section>
        } @placeholder {
          <div class="df-page-placeholder" [attr.data-page-index]="i" [attr.data-page-key]="pageField.key"></div>
        }
      } @else {
        <!-- Distant pages: defer until browser is idle for memory savings -->
        @defer (on idle) {
          <section page-field [field]="pageField" [key]="pageField.key" [pageIndex]="i" [isVisible]="false"></section>
        } @placeholder {
          <div class="df-page-placeholder" [attr.data-page-index]="i" [attr.data-page-key]="pageField.key"></div>
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

  /**
   * Array of page field definitions to render
   */
  pageFields = input.required<PageField[]>();

  /**
   * Root form instance from parent DynamicForm.
   * Uses FieldTree<unknown> to accept any form type.
   */
  form = input.required<FieldTree<unknown>>();

  /**
   * Field signal context for child fields
   */
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

  /**
   * Internal signal for current page index that tracks with page fields.
   * This tracks the actual page index, not the visible page index.
   *
   * Note: We only track pageFields().length to handle page additions/removals.
   * The hidden state changes should NOT reset the current page index -
   * that would cause unwanted navigation when form values change.
   */
  private readonly currentPageIndex = linkedSignal(() => {
    const totalPages = this.pageFields().length;

    if (totalPages === 0) return 0;

    // Start on page 0 (will be adjusted if page 0 is hidden by initial navigation)
    return 0;
  });

  /**
   * Computed state for the orchestrator
   */
  readonly state = computed<PageOrchestratorState>(() => {
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
      navigationDisabled: false,
    };
  });

  /**
   * Signal indicating whether all fields on the current page are valid.
   *
   * This is used by next page buttons to determine their disabled state.
   * Returns `true` if all fields on the current page pass validation,
   * `false` otherwise.
   *
   * @returns `true` if current page is valid, `false` otherwise
   */
  readonly currentPageValid = computed(() => {
    const currentIndex = this.currentPageIndex();
    const pages = this.pageFields();
    const form = this.form();

    // No pages or invalid index
    if (pages.length === 0 || currentIndex >= pages.length) {
      return true;
    }

    const currentPage = pages[currentIndex];
    const pageFields = currentPage.fields || [];

    // Check validity of each field on the current page
    // Fields are stored at root level in the form (pages don't add nesting)
    for (const fieldDef of pageFields) {
      const fieldKey = fieldDef.key;
      if (!fieldKey) continue;

      // Access the field from the form using bracket notation
      const field = (form as Record<string, unknown>)[fieldKey];
      if (field && typeof field === 'function') {
        const fieldState = (field as () => { valid: () => boolean })();
        if (fieldState && typeof fieldState.valid === 'function' && !fieldState.valid()) {
          return false;
        }
      }
    }

    return true;
  });

  /**
   * Extended field signal context that includes currentPageValid.
   *
   * This extends the parent context from DynamicForm with page-specific
   * information needed by button mappers (e.g., next button needs to know
   * if the current page is valid).
   */
  readonly extendedFieldSignalContext = computed(() => ({
    ...this.fieldSignalContext(),
    currentPageValid: this.currentPageValid,
  }));

  constructor() {
    // Setup event listeners for navigation
    this.setupEventListeners();
  }

  /**
   * Navigate to the next visible page, skipping hidden pages.
   * @returns Navigation result
   */
  navigateToNextPage(): NavigationResult {
    const currentState = this.state();
    const visibleIndices = this.visiblePageIndices();

    if (currentState.isLastPage) {
      return {
        success: false,
        newPageIndex: currentState.currentPageIndex,
        error: 'Already on the last visible page',
      };
    }

    if (currentState.navigationDisabled) {
      return {
        success: false,
        newPageIndex: currentState.currentPageIndex,
        error: 'Navigation is currently disabled',
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
    return this.navigateToPage(nextVisiblePageIndex);
  }

  /**
   * Navigate to the previous visible page, skipping hidden pages.
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

    if (currentState.navigationDisabled) {
      return {
        success: false,
        newPageIndex: currentState.currentPageIndex,
        error: 'Navigation is currently disabled',
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
    return this.navigateToPage(prevVisiblePageIndex);
  }

  /**
   * Navigate to a specific page index
   * @param pageIndex The target page index (0-based)
   * @returns Navigation result
   */
  navigateToPage(pageIndex: number): NavigationResult {
    const currentState = this.state();
    const totalPages = currentState.totalPages;

    // Validate page index
    if (pageIndex < 0 || pageIndex >= totalPages) {
      return {
        success: false,
        newPageIndex: currentState.currentPageIndex,
        error: `Invalid page index: ${pageIndex}. Valid range is 0 to ${totalPages - 1}`,
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
    this.currentPageIndex.set(pageIndex);

    // Emit page change event
    this.eventBus.dispatch(PageChangeEvent, pageIndex, totalPages, previousIndex);

    return {
      success: true,
      newPageIndex: pageIndex,
    };
  }

  /**
   * Set up event listeners for navigation events
   */
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

    explicitEffect([this.state], ([state]) => this.eventBus.dispatch(PageNavigationStateChangeEvent, state));
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
