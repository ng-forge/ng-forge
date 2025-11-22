import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { PageOrchestratorComponent } from './page-orchestrator.component';
import { EventBus } from '../../events/event.bus';
import { NextPageEvent, PreviousPageEvent, PageChangeEvent } from '../../events/constants';
import { PageField } from '../../definitions/default/page-field';
import { FieldSignalContext } from '../../mappers/types';
import { firstValueFrom, take } from 'rxjs';

describe('PageOrchestratorComponent', () => {
  let component: PageOrchestratorComponent;
  let fixture: ComponentFixture<PageOrchestratorComponent>;
  let eventBus: EventBus;

  // Helper function to create mock page fields
  function createMockPageFields(count: number): PageField[] {
    return Array.from({ length: count }, (_, i) => ({
      type: 'page' as const,
      key: `page${i}`,
      fields: [],
    }));
  }

  // Helper function to create mock field signal context
  function createMockFieldSignalContext(): FieldSignalContext {
    return {
      form: signal({} as any),
      rootFormValues: signal({} as any),
      rootFormRegistry: {} as any,
      fieldContextRegistry: {} as any,
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageOrchestratorComponent],
      providers: [EventBus],
    }).compileComponents();

    fixture = TestBed.createComponent(PageOrchestratorComponent);
    component = fixture.componentInstance;
    eventBus = TestBed.inject(EventBus);

    // Set default inputs
    fixture.componentRef.setInput('pageFields', createMockPageFields(3));
    fixture.componentRef.setInput('form', signal({} as any));
    fixture.componentRef.setInput('fieldSignalContext', createMockFieldSignalContext());
    fixture.componentRef.setInput('config', {});

    fixture.detectChanges();
  });

  // Test Suite 4.1: Component Initialization
  describe('Component Initialization', () => {
    describe('Basic Setup', () => {
      it('should create component successfully', () => {
        expect(component).toBeDefined();
        expect(component).toBeInstanceOf(PageOrchestratorComponent);
      });

      it('should initialize with default config', () => {
        expect(component.config()).toEqual({});
      });

      it('should set up event listeners on creation', () => {
        const eventSpy = vi.spyOn(eventBus, 'on');

        // Create new component to test initialization
        const newFixture = TestBed.createComponent(PageOrchestratorComponent);
        newFixture.componentRef.setInput('pageFields', createMockPageFields(2));
        newFixture.componentRef.setInput('form', signal({} as any));
        newFixture.componentRef.setInput('fieldSignalContext', createMockFieldSignalContext());
        newFixture.detectChanges();

        expect(eventSpy).toHaveBeenCalledWith('next-page');
        expect(eventSpy).toHaveBeenCalledWith('previous-page');
      });

      it('should inject EventBus correctly', () => {
        expect(eventBus).toBeDefined();
        expect(eventBus).toBeInstanceOf(EventBus);
      });
    });

    describe('Initial State', () => {
      it('should start with currentPageIndex = 0 by default', () => {
        expect(component.state().currentPageIndex).toBe(0);
      });

      it('should respect config.initialPageIndex', () => {
        fixture.componentRef.setInput('config', { initialPageIndex: 1 });
        fixture.detectChanges();

        expect(component.state().currentPageIndex).toBe(1);
      });

      it('should clamp initialPageIndex to valid range (0 to totalPages-1)', () => {
        fixture.componentRef.setInput('config', { initialPageIndex: 10 });
        fixture.detectChanges();

        expect(component.state().currentPageIndex).toBe(2); // Max is 2 for 3 pages
      });

      it('should handle initialPageIndex > totalPages', () => {
        fixture.componentRef.setInput('pageFields', createMockPageFields(5));
        fixture.componentRef.setInput('config', { initialPageIndex: 100 });
        fixture.detectChanges();

        expect(component.state().currentPageIndex).toBe(4); // Max is 4 for 5 pages
      });

      it('should handle initialPageIndex < 0', () => {
        fixture.componentRef.setInput('config', { initialPageIndex: -5 });
        fixture.detectChanges();

        expect(component.state().currentPageIndex).toBe(0);
      });

      it('should handle empty pageFields array', () => {
        fixture.componentRef.setInput('pageFields', []);
        fixture.detectChanges();

        expect(component.state().currentPageIndex).toBe(0);
        expect(component.state().totalPages).toBe(0);
      });
    });

    describe('State Computation', () => {
      it('should compute isFirstPage correctly', () => {
        expect(component.state().isFirstPage).toBe(true);

        component.navigateToNextPage();
        expect(component.state().isFirstPage).toBe(false);
      });

      it('should compute isLastPage correctly', () => {
        expect(component.state().isLastPage).toBe(false);

        component.navigateToPage(2);
        expect(component.state().isLastPage).toBe(true);
      });

      it('should compute totalPages correctly', () => {
        expect(component.state().totalPages).toBe(3);

        fixture.componentRef.setInput('pageFields', createMockPageFields(5));
        fixture.detectChanges();

        expect(component.state().totalPages).toBe(5);
      });

      it('should compute navigationDisabled from config', () => {
        expect(component.state().navigationDisabled).toBe(false);

        fixture.componentRef.setInput('config', { initialNavigationDisabled: true });
        fixture.detectChanges();

        expect(component.state().navigationDisabled).toBe(true);
      });

      it('should update state when pageFields changes', () => {
        expect(component.state().totalPages).toBe(3);

        fixture.componentRef.setInput('pageFields', createMockPageFields(7));
        fixture.detectChanges();

        expect(component.state().totalPages).toBe(7);
      });
    });
  });

  // Test Suite 4.2: navigateToNextPage()
  describe('navigateToNextPage()', () => {
    describe('Successful Navigation', () => {
      it('should navigate from page 0 to page 1', () => {
        const result = component.navigateToNextPage();

        expect(result.success).toBe(true);
        expect(result.newPageIndex).toBe(1);
        expect(component.state().currentPageIndex).toBe(1);
      });

      it('should navigate from middle page to next page', () => {
        component.navigateToPage(1);
        const result = component.navigateToNextPage();

        expect(result.success).toBe(true);
        expect(result.newPageIndex).toBe(2);
        expect(component.state().currentPageIndex).toBe(2);
      });

      it('should update currentPageIndex signal', () => {
        const initialIndex = component.state().currentPageIndex;
        component.navigateToNextPage();

        expect(component.state().currentPageIndex).toBe(initialIndex + 1);
      });

      it('should return success: true', () => {
        const result = component.navigateToNextPage();
        expect(result.success).toBe(true);
      });

      it('should return correct newPageIndex', () => {
        const result = component.navigateToNextPage();
        expect(result.newPageIndex).toBe(1);
      });

      it('should dispatch PageChangeEvent', async () => {
        const eventPromise = firstValueFrom(eventBus.on<PageChangeEvent>('page-change').pipe(take(1)));
        component.navigateToNextPage();

        const event = await eventPromise;
        expect(event.currentPageIndex).toBe(1);
        expect(event.totalPages).toBe(3);
        expect(event.previousPageIndex).toBe(0);
      });

      it('should include previous page index in event', async () => {
        component.navigateToPage(1);

        const eventPromise = firstValueFrom(eventBus.on<PageChangeEvent>('page-change').pipe(take(1)));
        component.navigateToNextPage();

        const event = await eventPromise;
        expect(event.previousPageIndex).toBe(1);
      });
    });

    describe('Boundary Conditions', () => {
      it('should fail when on last page (isLastPage = true)', () => {
        component.navigateToPage(2); // Last page
        const result = component.navigateToNextPage();

        expect(result.success).toBe(false);
      });

      it('should return success: false when on last page', () => {
        component.navigateToPage(2);
        const result = component.navigateToNextPage();

        expect(result.success).toBe(false);
      });

      it('should return error message when on last page', () => {
        component.navigateToPage(2);
        const result = component.navigateToNextPage();

        expect(result.error).toBe('Already on the last page');
      });

      it('should not change page index when on last page', () => {
        component.navigateToPage(2);
        component.navigateToNextPage();

        expect(component.state().currentPageIndex).toBe(2);
      });

      it('should not dispatch event when on last page', () => {
        component.navigateToPage(2);

        const dispatchSpy = vi.spyOn(eventBus, 'dispatch');
        dispatchSpy.mockClear(); // Clear any previous dispatch calls

        component.navigateToNextPage();
        TestBed.flushEffects();
        fixture.detectChanges();

        // Filter calls to only PageChangeEvent
        const pageChangeEventCalls = dispatchSpy.mock.calls.filter((call) => call[0] === PageChangeEvent);
        expect(pageChangeEventCalls).toHaveLength(0);
      });
    });

    describe('Navigation Disabled', () => {
      beforeEach(() => {
        fixture.componentRef.setInput('config', { initialNavigationDisabled: true });
        fixture.detectChanges();
      });

      it('should fail when navigationDisabled = true', () => {
        const result = component.navigateToNextPage();
        expect(result.success).toBe(false);
      });

      it('should return success: false when disabled', () => {
        const result = component.navigateToNextPage();
        expect(result.success).toBe(false);
      });

      it('should return error message about disabled navigation', () => {
        const result = component.navigateToNextPage();
        expect(result.error).toBe('Navigation is currently disabled');
      });

      it('should not change page index when disabled', () => {
        const initialIndex = component.state().currentPageIndex;
        component.navigateToNextPage();

        expect(component.state().currentPageIndex).toBe(initialIndex);
      });

      it('should not dispatch event when disabled', () => {
        const dispatchSpy = vi.spyOn(eventBus, 'dispatch');
        dispatchSpy.mockClear(); // Clear any previous dispatch calls

        component.navigateToNextPage();
        TestBed.flushEffects();
        fixture.detectChanges();

        // Filter calls to only PageChangeEvent
        const pageChangeEventCalls = dispatchSpy.mock.calls.filter((call) => call[0] === PageChangeEvent);
        expect(pageChangeEventCalls).toHaveLength(0);
      });
    });
  });

  // Test Suite 4.3: navigateToPreviousPage()
  describe('navigateToPreviousPage()', () => {
    describe('Successful Navigation', () => {
      beforeEach(() => {
        component.navigateToPage(1); // Start on page 1
      });

      it('should navigate from page 1 to page 0', () => {
        const result = component.navigateToPreviousPage();

        expect(result.success).toBe(true);
        expect(result.newPageIndex).toBe(0);
        expect(component.state().currentPageIndex).toBe(0);
      });

      it('should navigate from middle page to previous page', () => {
        component.navigateToPage(2);
        const result = component.navigateToPreviousPage();

        expect(result.success).toBe(true);
        expect(result.newPageIndex).toBe(1);
      });

      it('should navigate from last page backwards', () => {
        component.navigateToPage(2);
        const result = component.navigateToPreviousPage();

        expect(result.success).toBe(true);
        expect(result.newPageIndex).toBe(1);
        expect(component.state().currentPageIndex).toBe(1);
      });

      it('should update currentPageIndex signal', () => {
        const initialIndex = component.state().currentPageIndex;
        component.navigateToPreviousPage();

        expect(component.state().currentPageIndex).toBe(initialIndex - 1);
      });

      it('should return success: true', () => {
        const result = component.navigateToPreviousPage();
        expect(result.success).toBe(true);
      });

      it('should return correct newPageIndex', () => {
        const result = component.navigateToPreviousPage();
        expect(result.newPageIndex).toBe(0);
      });

      it('should dispatch PageChangeEvent', async () => {
        const eventPromise = firstValueFrom(eventBus.on<PageChangeEvent>('page-change').pipe(take(1)));
        component.navigateToPreviousPage();

        const event = await eventPromise;
        expect(event.currentPageIndex).toBe(0);
        expect(event.totalPages).toBe(3);
        expect(event.previousPageIndex).toBe(1);
      });
    });

    describe('Boundary Conditions', () => {
      it('should fail when on first page (isFirstPage = true)', () => {
        const result = component.navigateToPreviousPage();
        expect(result.success).toBe(false);
      });

      it('should return success: false when on first page', () => {
        const result = component.navigateToPreviousPage();
        expect(result.success).toBe(false);
      });

      it('should return error message when on first page', () => {
        const result = component.navigateToPreviousPage();
        expect(result.error).toBe('Already on the first page');
      });

      it('should not change page index when on first page', () => {
        component.navigateToPreviousPage();
        expect(component.state().currentPageIndex).toBe(0);
      });

      it('should not dispatch event when on first page', () => {
        const dispatchSpy = vi.spyOn(eventBus, 'dispatch');
        dispatchSpy.mockClear(); // Clear any previous dispatch calls

        component.navigateToPreviousPage();
        TestBed.flushEffects();
        fixture.detectChanges();

        // Filter calls to only PageChangeEvent
        const pageChangeEventCalls = dispatchSpy.mock.calls.filter((call) => call[0] === PageChangeEvent);
        expect(pageChangeEventCalls).toHaveLength(0);
      });
    });

    describe('Navigation Disabled', () => {
      beforeEach(() => {
        component.navigateToPage(1);
        fixture.componentRef.setInput('config', { initialNavigationDisabled: true });
        fixture.detectChanges();
      });

      it('should fail when navigationDisabled = true', () => {
        const result = component.navigateToPreviousPage();
        expect(result.success).toBe(false);
      });

      it('should return success: false when disabled', () => {
        const result = component.navigateToPreviousPage();
        expect(result.success).toBe(false);
      });

      it('should return error message about disabled navigation', () => {
        const result = component.navigateToPreviousPage();
        expect(result.error).toBe('Navigation is currently disabled');
      });

      it('should not change page index when disabled', () => {
        const initialIndex = component.state().currentPageIndex;
        component.navigateToPreviousPage();

        expect(component.state().currentPageIndex).toBe(initialIndex);
      });
    });
  });

  // Test Suite 4.4: navigateToPage()
  describe('navigateToPage()', () => {
    describe('Valid Navigation', () => {
      it('should navigate to page 0', () => {
        component.navigateToPage(1);
        const result = component.navigateToPage(0);

        expect(result.success).toBe(true);
        expect(component.state().currentPageIndex).toBe(0);
      });

      it('should navigate to middle page', () => {
        const result = component.navigateToPage(1);

        expect(result.success).toBe(true);
        expect(component.state().currentPageIndex).toBe(1);
      });

      it('should navigate to last page', () => {
        const result = component.navigateToPage(2);

        expect(result.success).toBe(true);
        expect(component.state().currentPageIndex).toBe(2);
      });

      it('should update currentPageIndex signal', () => {
        component.navigateToPage(2);
        expect(component.state().currentPageIndex).toBe(2);
      });

      it('should return success: true', () => {
        const result = component.navigateToPage(1);
        expect(result.success).toBe(true);
      });

      it('should dispatch PageChangeEvent', async () => {
        const eventPromise = firstValueFrom(eventBus.on<PageChangeEvent>('page-change').pipe(take(1)));
        component.navigateToPage(2);

        const event = await eventPromise;
        expect(event.currentPageIndex).toBe(2);
        expect(event.totalPages).toBe(3);
      });

      it('should allow navigation to current page (no-op)', () => {
        component.navigateToPage(1);
        const result = component.navigateToPage(1);

        expect(result.success).toBe(true);
        expect(component.state().currentPageIndex).toBe(1);
      });
    });

    describe('Invalid Page Index', () => {
      it('should reject negative page index', () => {
        const result = component.navigateToPage(-1);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid page index');
      });

      it('should reject page index >= totalPages', () => {
        const result = component.navigateToPage(3);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid page index');
      });

      it('should return success: false for invalid index', () => {
        const result = component.navigateToPage(10);
        expect(result.success).toBe(false);
      });

      it('should return error message with valid range', () => {
        const result = component.navigateToPage(10);

        expect(result.error).toContain('Valid range is 0 to 2');
      });

      it('should not change page index for invalid input', () => {
        const initialIndex = component.state().currentPageIndex;
        component.navigateToPage(-5);

        expect(component.state().currentPageIndex).toBe(initialIndex);
      });

      it('should not dispatch event for invalid input', () => {
        const dispatchSpy = vi.spyOn(eventBus, 'dispatch');
        dispatchSpy.mockClear(); // Clear any previous dispatch calls

        component.navigateToPage(100);
        TestBed.flushEffects();
        fixture.detectChanges();

        // Filter calls to only PageChangeEvent
        const pageChangeEventCalls = dispatchSpy.mock.calls.filter((call) => call[0] === PageChangeEvent);
        expect(pageChangeEventCalls).toHaveLength(0);
      });
    });

    describe('Navigation to Current Page', () => {
      it('should return success: true when navigating to current page', () => {
        component.navigateToPage(1);
        const result = component.navigateToPage(1);

        expect(result.success).toBe(true);
      });

      it('should not dispatch event when already on target page', () => {
        component.navigateToPage(1);

        const dispatchSpy = vi.spyOn(eventBus, 'dispatch');
        dispatchSpy.mockClear(); // Clear any previous dispatch calls

        component.navigateToPage(1);
        TestBed.flushEffects();
        fixture.detectChanges();

        // Filter calls to only PageChangeEvent
        const pageChangeEventCalls = dispatchSpy.mock.calls.filter((call) => call[0] === PageChangeEvent);
        expect(pageChangeEventCalls).toHaveLength(0);
      });

      it('should return current page as newPageIndex', () => {
        component.navigateToPage(1);
        const result = component.navigateToPage(1);

        expect(result.newPageIndex).toBe(1);
      });
    });

    describe('Edge Cases', () => {
      it('should handle totalPages = 0', () => {
        fixture.componentRef.setInput('pageFields', []);
        fixture.detectChanges();

        const result = component.navigateToPage(0);

        expect(result.success).toBe(false);
      });

      it('should handle totalPages = 1', () => {
        fixture.componentRef.setInput('pageFields', createMockPageFields(1));
        fixture.detectChanges();

        const result = component.navigateToPage(0);

        expect(result.success).toBe(true);
        expect(component.state().currentPageIndex).toBe(0);
      });

      it('should validate against current totalPages', () => {
        const result = component.navigateToPage(2);
        expect(result.success).toBe(true);

        fixture.componentRef.setInput('pageFields', createMockPageFields(2));
        fixture.detectChanges();

        const result2 = component.navigateToPage(2);
        expect(result2.success).toBe(false);
      });
    });
  });

  // Test Suite 4.5: Event Handling
  describe('Event Handling', () => {
    describe('Event Listeners Setup', () => {
      it('should subscribe to NextPageEvent on creation', () => {
        const spy = vi.spyOn(eventBus, 'on');

        TestBed.createComponent(PageOrchestratorComponent);

        expect(spy).toHaveBeenCalledWith('next-page');
      });

      it('should subscribe to PreviousPageEvent on creation', () => {
        const spy = vi.spyOn(eventBus, 'on');

        TestBed.createComponent(PageOrchestratorComponent);

        expect(spy).toHaveBeenCalledWith('previous-page');
      });
    });

    describe('NextPageEvent Response', () => {
      it('should call navigateToNextPage() when NextPageEvent received', () => {
        const spy = vi.spyOn(component, 'navigateToNextPage');

        eventBus.dispatch(NextPageEvent);

        expect(spy).toHaveBeenCalled();
      });

      it('should handle multiple NextPageEvent emissions', () => {
        eventBus.dispatch(NextPageEvent);
        expect(component.state().currentPageIndex).toBe(1);

        eventBus.dispatch(NextPageEvent);
        expect(component.state().currentPageIndex).toBe(2);
      });

      it('should navigate correctly in response to event', () => {
        expect(component.state().currentPageIndex).toBe(0);

        eventBus.dispatch(NextPageEvent);

        expect(component.state().currentPageIndex).toBe(1);
      });
    });

    describe('PreviousPageEvent Response', () => {
      beforeEach(() => {
        component.navigateToPage(1);
      });

      it('should call navigateToPreviousPage() when PreviousPageEvent received', () => {
        const spy = vi.spyOn(component, 'navigateToPreviousPage');

        eventBus.dispatch(PreviousPageEvent);

        expect(spy).toHaveBeenCalled();
      });

      it('should handle multiple PreviousPageEvent emissions', () => {
        component.navigateToPage(2);

        eventBus.dispatch(PreviousPageEvent);
        expect(component.state().currentPageIndex).toBe(1);

        eventBus.dispatch(PreviousPageEvent);
        expect(component.state().currentPageIndex).toBe(0);
      });

      it('should navigate correctly in response to event', () => {
        expect(component.state().currentPageIndex).toBe(1);

        eventBus.dispatch(PreviousPageEvent);

        expect(component.state().currentPageIndex).toBe(0);
      });
    });

    describe('PageChangeEvent Emission', () => {
      it('should dispatch PageChangeEvent on successful navigation', async () => {
        const eventPromise = firstValueFrom(eventBus.on<PageChangeEvent>('page-change').pipe(take(1)));
        component.navigateToNextPage();

        const event = await eventPromise;
        expect(event.type).toBe('page-change');
      });

      it('should include currentPageIndex in event', async () => {
        const eventPromise = firstValueFrom(eventBus.on<PageChangeEvent>('page-change').pipe(take(1)));
        component.navigateToNextPage();

        const event = await eventPromise;
        expect(event.currentPageIndex).toBe(1);
      });

      it('should include totalPages in event', async () => {
        const eventPromise = firstValueFrom(eventBus.on<PageChangeEvent>('page-change').pipe(take(1)));
        component.navigateToNextPage();

        const event = await eventPromise;
        expect(event.totalPages).toBe(3);
      });

      it('should include previousPageIndex in event', async () => {
        const eventPromise = firstValueFrom(eventBus.on<PageChangeEvent>('page-change').pipe(take(1)));
        component.navigateToNextPage();

        const event = await eventPromise;
        expect(event.previousPageIndex).toBe(0);
      });
    });
  });

  // Test Suite 4.6: State Signal Behavior
  describe('State Signal Behavior', () => {
    describe('State Properties', () => {
      it('should expose currentPageIndex in state', () => {
        const state = component.state();
        expect(state.currentPageIndex).toBeDefined();
        expect(typeof state.currentPageIndex).toBe('number');
      });

      it('should expose totalPages in state', () => {
        const state = component.state();
        expect(state.totalPages).toBeDefined();
        expect(state.totalPages).toBe(3);
      });

      it('should expose isFirstPage in state', () => {
        const state = component.state();
        expect(state.isFirstPage).toBeDefined();
        expect(typeof state.isFirstPage).toBe('boolean');
      });

      it('should expose isLastPage in state', () => {
        const state = component.state();
        expect(state.isLastPage).toBeDefined();
        expect(typeof state.isLastPage).toBe('boolean');
      });

      it('should expose navigationDisabled in state', () => {
        const state = component.state();
        expect(state.navigationDisabled).toBeDefined();
        expect(typeof state.navigationDisabled).toBe('boolean');
      });
    });

    describe('State Reactivity', () => {
      it('should update state when navigating', () => {
        const initialState = component.state();
        component.navigateToNextPage();
        const newState = component.state();

        expect(newState.currentPageIndex).not.toBe(initialState.currentPageIndex);
      });

      it('should update state when pageFields changes', () => {
        const initialState = component.state();

        fixture.componentRef.setInput('pageFields', createMockPageFields(5));
        fixture.detectChanges();

        const newState = component.state();
        expect(newState.totalPages).not.toBe(initialState.totalPages);
      });

      it('should update state when config changes', () => {
        fixture.componentRef.setInput('config', { initialNavigationDisabled: true });
        fixture.detectChanges();

        expect(component.state().navigationDisabled).toBe(true);
      });
    });

    describe('Computed State Values', () => {
      it('should compute isFirstPage = true on page 0', () => {
        expect(component.state().isFirstPage).toBe(true);
      });

      it('should compute isFirstPage = false on page > 0', () => {
        component.navigateToNextPage();
        expect(component.state().isFirstPage).toBe(false);
      });

      it('should compute isLastPage = true on last page', () => {
        component.navigateToPage(2);
        expect(component.state().isLastPage).toBe(true);
      });

      it('should compute isLastPage = false on page < last', () => {
        component.navigateToPage(1);
        expect(component.state().isLastPage).toBe(false);
      });

      it('should compute totalPages from pageFields length', () => {
        expect(component.state().totalPages).toBe(3);

        fixture.componentRef.setInput('pageFields', createMockPageFields(10));
        fixture.detectChanges();

        expect(component.state().totalPages).toBe(10);
      });
    });
  });

  // Test Suite 4.9: Integration Tests
  describe('Integration Tests', () => {
    describe('Full Navigation Flow', () => {
      it('should navigate through all pages forward', () => {
        expect(component.state().currentPageIndex).toBe(0);

        component.navigateToNextPage();
        expect(component.state().currentPageIndex).toBe(1);

        component.navigateToNextPage();
        expect(component.state().currentPageIndex).toBe(2);
      });

      it('should navigate through all pages backward', () => {
        component.navigateToPage(2);

        component.navigateToPreviousPage();
        expect(component.state().currentPageIndex).toBe(1);

        component.navigateToPreviousPage();
        expect(component.state().currentPageIndex).toBe(0);
      });

      it('should jump to arbitrary pages', () => {
        component.navigateToPage(2);
        expect(component.state().currentPageIndex).toBe(2);

        component.navigateToPage(0);
        expect(component.state().currentPageIndex).toBe(0);

        component.navigateToPage(1);
        expect(component.state().currentPageIndex).toBe(1);
      });

      it('should validate boundaries correctly', () => {
        component.navigateToPage(2);
        expect(component.state().isLastPage).toBe(true);

        const result = component.navigateToNextPage();
        expect(result.success).toBe(false);

        component.navigateToPage(0);
        expect(component.state().isFirstPage).toBe(true);

        const result2 = component.navigateToPreviousPage();
        expect(result2.success).toBe(false);
      });
    });

    describe('Config Changes', () => {
      it('should handle initialPageIndex change', () => {
        fixture.componentRef.setInput('config', { initialPageIndex: 2 });
        fixture.detectChanges();

        expect(component.state().currentPageIndex).toBe(2);
      });

      it('should handle navigationDisabled toggle', () => {
        expect(component.state().navigationDisabled).toBe(false);

        fixture.componentRef.setInput('config', { initialNavigationDisabled: true });
        fixture.detectChanges();

        expect(component.state().navigationDisabled).toBe(true);
      });

      it('should handle pageFields array changes', () => {
        expect(component.state().totalPages).toBe(3);

        fixture.componentRef.setInput('pageFields', createMockPageFields(10));
        fixture.detectChanges();

        expect(component.state().totalPages).toBe(10);
      });
    });

    describe('Error Recovery', () => {
      it('should recover from invalid navigation attempts', () => {
        const result = component.navigateToPage(-1);
        expect(result.success).toBe(false);

        const result2 = component.navigateToNextPage();
        expect(result2.success).toBe(true);
      });

      it('should maintain valid state after errors', () => {
        component.navigateToPage(2);
        component.navigateToNextPage(); // Invalid

        expect(component.state().currentPageIndex).toBe(2);
        expect(component.state().isLastPage).toBe(true);
      });

      it('should continue functioning after failed navigation', () => {
        component.navigateToPage(2);
        component.navigateToNextPage(); // Fails

        component.navigateToPreviousPage();
        expect(component.state().currentPageIndex).toBe(1);
      });
    });
  });
});
