import { ComponentRef } from '@angular/core';
import { FormUiControl } from '@angular/forms/signals';

/**
 * State interface for the page orchestrator
 */
export interface PageOrchestratorState {
  /** Current page index (0-based) */
  currentPageIndex: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether the current page is the first page */
  isFirstPage: boolean;
  /** Whether the current page is the last page */
  isLastPage: boolean;
  /** Whether navigation is currently disabled */
  navigationDisabled: boolean;
}

/**
 * Configuration for page orchestrator
 */
export interface PageOrchestratorConfig {
  /** Initial page index to show (defaults to 0) */
  initialPageIndex?: number;
  /** Whether navigation should be disabled initially */
  initialNavigationDisabled?: boolean;
}

/**
 * Result of a navigation attempt
 */
export interface NavigationResult {
  /** Whether the navigation was successful */
  success: boolean;
  /** The new page index after navigation */
  newPageIndex: number;
  /** Error message if navigation failed */
  error?: string;
}

/**
 * Context for page visibility management
 */
export interface PageVisibilityContext {
  /** Index of the page */
  pageIndex: number;
  /** Whether this page should be visible */
  isVisible: boolean;
  /** Component reference for the page */
  pageComponent: ComponentRef<FormUiControl>;
}
