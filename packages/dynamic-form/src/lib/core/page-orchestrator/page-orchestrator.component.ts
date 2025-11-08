import { ChangeDetectionStrategy, Component, ComponentRef, computed, inject, input, linkedSignal } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { outputFromObservable, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormUiControl } from '@angular/forms/signals';
import { map } from 'rxjs';
import { EventBus } from '../../events/event.bus';
import { NextPageEvent, PageChangeEvent, PreviousPageEvent } from '../../events/constants';
import { NavigationResult, PageOrchestratorConfig, PageOrchestratorState } from './page-orchestrator.interfaces';

/**
 * PageOrchestrator manages page navigation and visibility for paged forms.
 * It acts as an intermediary between the DynamicForm component and PageField components,
 * handling page state management and navigation events without interfering with form data.
 *
 * Key responsibilities:
 * - Manage current page index state
 * - Handle navigation events (next/previous)
 * - Control page visibility
 * - Emit page change events
 * - Validate navigation boundaries
 *
 * @example
 * ```html
 * <page-orchestrator
 *   [pageComponents]="pageComponents"
 *   [config]="orchestratorConfig"
 *   (pageChanged)="onPageChanged($event)"
 *   (navigationStateChanged)="onNavigationStateChanged($event)">
 * </page-orchestrator>
 * ```
 */
@Component({
  selector: 'page-orchestrator',
  template: `
    <!-- Page orchestrator manages visibility but doesn't render content directly -->
    <!-- Content is provided by the parent through field renderer -->
    <div class="df-page-orchestrator-content">
      <ng-content></ng-content>
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
   * Array of page component references to manage
   */
  pageComponents = input<ComponentRef<FormUiControl>[]>([]);

  /**
   * Configuration for the orchestrator
   */
  config = input<PageOrchestratorConfig>({});

  /**
   * Internal signal for current page index that tracks with page components
   */
  private readonly currentPageIndex = linkedSignal(() => {
    const totalPages = this.pageComponents().length;
    const initialIndex = this.config().initialPageIndex ?? 0;
    return totalPages > 0 ? Math.max(0, Math.min(initialIndex, totalPages - 1)) : 0;
  });

  /**
   * Computed state for the orchestrator
   */
  readonly state = computed<PageOrchestratorState>(() => {
    const currentIndex = this.currentPageIndex();
    const totalPages = this.pageComponents().length;

    return {
      currentPageIndex: currentIndex,
      totalPages,
      isFirstPage: currentIndex === 0,
      isLastPage: currentIndex >= totalPages - 1,
      navigationDisabled: this.config().initialNavigationDisabled || false,
    };
  });

  /**
   * Emitted when page changes
   */
  readonly pageChanged = outputFromObservable(this.eventBus.on<PageChangeEvent>('page-change').pipe(map((event) => event)));

  /**
   * Emitted when navigation state changes
   */
  readonly navigationStateChanged = outputFromObservable(toObservable(this.state));

  constructor() {
    // Setup visibility management for page components
    explicitEffect([this.pageComponents, this.currentPageIndex], ([components, currentIndex]) => {
      this.updatePageVisibility(components, currentIndex);
    });

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
   * Update page visibility based on current page index
   */
  private updatePageVisibility(components: ComponentRef<FormUiControl>[], currentIndex: number): void {
    components.forEach((componentRef, index) => {
      const instance = componentRef.instance as any;

      // Set page index and visibility if the component supports it
      if (instance && typeof instance.setPageIndex === 'function') {
        instance.setPageIndex(index);
      }

      if (instance && typeof instance.setVisibility === 'function') {
        instance.setVisibility(index === currentIndex);
      }

      // For components that don't have visibility methods,
      // we can use host element styling
      const hostElement = componentRef.location?.nativeElement;
      if (hostElement) {
        hostElement.style.display = index === currentIndex ? 'block' : 'none';
        hostElement.setAttribute('aria-hidden', String(index !== currentIndex));
        hostElement.setAttribute('data-page-index', String(index));

        if (index === currentIndex) {
          hostElement.classList.add('df-page-visible');
          hostElement.classList.remove('df-page-hidden');
        } else {
          hostElement.classList.add('df-page-hidden');
          hostElement.classList.remove('df-page-visible');
        }
      }
    });
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
  }
}
