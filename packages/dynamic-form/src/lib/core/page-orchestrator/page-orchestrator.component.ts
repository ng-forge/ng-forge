import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventBus } from '../../events/event.bus';
import { NextPageEvent, PageChangeEvent, PreviousPageEvent } from '../../events/constants';
import { NavigationResult, PageOrchestratorConfig, PageOrchestratorState } from './page-orchestrator.interfaces';
import { PageField } from '../../definitions/default/page-field';
import { FieldSignalContext } from '../../mappers/types';
import PageFieldComponent from '../../fields/page/page-field.component';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { PageNavigationStateChangeEvent } from '../../events/constants/page-navigation-state-change.event';
import { FieldTree } from '@angular/forms/signals';

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
 * <page-orchestrator
 *   [pageFields]="pageFields"
 *   [form]="form"
 *   [fieldSignalContext]="fieldSignalContext"
 *   [config]="orchestratorConfig"
 *   (pageChanged)="onPageChanged($event)"
 *   (navigationStateChanged)="onNavigationStateChanged($event)">
 * </page-orchestrator>
 * ```
 */
@Component({
  selector: 'page-orchestrator',
  imports: [PageFieldComponent],
  template: `
    <div class="df-page-orchestrator-content">
      @for (pageField of pageFields(); track pageField.key; let i = $index) {
        @if (i === state().currentPageIndex || i === state().currentPageIndex + 1 || i === state().currentPageIndex - 1) {
          <!-- Current and adjacent pages (±1): render immediately for flicker-free navigation -->
          @defer (on immediate) {
            <page-field
              [field]="pageField"
              [key]="pageField.key"
              [form]="form()"
              [fieldSignalContext]="fieldSignalContext()"
              [pageIndex]="i"
              [isVisible]="i === state().currentPageIndex"
            />
          } @placeholder {
            <div class="df-page-placeholder" [attr.data-page-index]="i" [attr.data-page-key]="pageField.key"></div>
          }
        } @else {
          <!-- Distant pages: defer until browser is idle for memory savings -->
          @defer (on idle) {
            <page-field
              [field]="pageField"
              [key]="pageField.key"
              [form]="form()"
              [fieldSignalContext]="fieldSignalContext()"
              [pageIndex]="i"
              [isVisible]="false"
            />
          } @placeholder {
            <div class="df-page-placeholder" [attr.data-page-index]="i" [attr.data-page-key]="pageField.key"></div>
          }
        }
      }
    </div>
  `,
  styleUrl: './page-orchestrator.component.scss',
  host: {
    class: 'df-page-orchestrator',
    '[attr.data-current-page]': 'state().currentPageIndex',
    '[attr.data-total-pages]': 'state().totalPages',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageOrchestratorComponent {
  private readonly eventBus = inject(EventBus);

  /**
   * Array of page field definitions to render
   */
  pageFields = input.required<PageField[]>();

  /**
   * Root form instance from parent DynamicForm
   */
  form = input.required<FieldTree<unknown>>();

  /**
   * Field signal context for child fields
   */
  fieldSignalContext = input.required<FieldSignalContext>();

  /**
   * Configuration for the orchestrator
   */
  config = input<PageOrchestratorConfig>({});

  /**
   * Internal signal for current page index that tracks with page fields
   */
  private readonly currentPageIndex = linkedSignal(() => {
    const totalPages = this.pageFields().length;
    const initialIndex = this.config().initialPageIndex ?? 0;

    if (totalPages === 0) return 0;

    // Clamp initial index within valid page range
    return Math.max(0, Math.min(initialIndex, totalPages - 1));
  });

  /**
   * Computed state for the orchestrator
   */
  readonly state = computed<PageOrchestratorState>(() => {
    const currentIndex = this.currentPageIndex();
    const totalPages = this.pageFields().length;

    return {
      currentPageIndex: currentIndex,
      totalPages,
      isFirstPage: currentIndex === 0,
      isLastPage: currentIndex >= totalPages - 1,
      navigationDisabled: this.config().initialNavigationDisabled || false,
    };
  });

  constructor() {
    // Setup event listeners for navigation
    this.setupEventListeners();
  }

  /**
   * Navigate to the next page
   * @returns Navigation result
   */
  navigateToNextPage(): NavigationResult {
    const currentState = this.state();

    if (currentState.isLastPage) {
      return {
        success: false,
        newPageIndex: currentState.currentPageIndex,
        error: 'Already on the last page',
      };
    }

    if (currentState.navigationDisabled) {
      return {
        success: false,
        newPageIndex: currentState.currentPageIndex,
        error: 'Navigation is currently disabled',
      };
    }

    const newIndex = currentState.currentPageIndex + 1;
    return this.navigateToPage(newIndex);
  }

  /**
   * Navigate to the previous page
   * @returns Navigation result
   */
  navigateToPreviousPage(): NavigationResult {
    const currentState = this.state();

    if (currentState.isFirstPage) {
      return {
        success: false,
        newPageIndex: currentState.currentPageIndex,
        error: 'Already on the first page',
      };
    }

    if (currentState.navigationDisabled) {
      return {
        success: false,
        newPageIndex: currentState.currentPageIndex,
        error: 'Navigation is currently disabled',
      };
    }

    const newIndex = currentState.currentPageIndex - 1;
    return this.navigateToPage(newIndex);
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
}
