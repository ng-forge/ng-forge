import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { firstValueFrom } from 'rxjs';

/**
 * Waits for all dynamic form definitions to be initialized and ready
 * Uses the form's internal initialized$ observable for deterministic waiting
 *
 * IMPORTANT: The initialized$ observable only tracks page/row/group components,
 * not regular field components. Field components are loaded asynchronously via
 * dynamic imports, so we poll until all field components are rendered.
 *
 * WHY POLLING: This app uses zoneless change detection, so fixture.whenStable()
 * cannot track async operations inside RxJS streams (forkJoin/switchMap/toSignal).
 * Polling waits for the actual DOM outcome - field components with [data-testid].
 */
export async function waitForDFInit(component: DynamicForm, fixture: ComponentFixture<any>): Promise<void> {
  fixture.detectChanges();

  // Wait for the form to be initialized (all definitions created and bound)
  await firstValueFrom(component.initialized$);

  // Flush effects to ensure all reactive updates are processed (zoneless mode)
  TestBed.flushEffects();
  fixture.detectChanges();

  // Wait for all field components to actually render in the DOM
  // The initialized$ only waits for page/row/group components, not regular fields
  // Regular fields (checkbox, input, etc.) are loaded via loadComponent: () => import(...)
  // We poll until all expected field components are present
  await waitForFieldComponents(fixture);
}

/**
 * Polls until all field components have loaded and rendered
 * Checks every 10ms for up to 500ms to handle async component loading
 */
async function waitForFieldComponents(fixture: ComponentFixture<any>, maxAttempts = 50): Promise<void> {
  const formElement = fixture.nativeElement.querySelector('.df-form');
  if (!formElement) return; // No form element, nothing to wait for

  let previousComponentCount = 0;
  let stableCount = 0;

  for (let i = 0; i < maxAttempts; i++) {
    TestBed.flushEffects();
    fixture.detectChanges();
    await fixture.whenStable();
    TestBed.flushEffects();
    fixture.detectChanges();

    // Check for field components and Material components
    const fieldComponents = formElement.querySelectorAll('[data-testid]');
    const materialComponents = formElement.querySelectorAll(
      'mat-checkbox, mat-slide-toggle, mat-radio-group, mat-select, input[matInput], textarea[matInput], mat-slider, button[mat-button], button[mat-raised-button], button[mat-flat-button]'
    );
    const hasLoadingComments = formElement.innerHTML.includes('<!--container-->');

    const currentComponentCount = fieldComponents.length + materialComponents.length;

    // Check if we've stabilized (component count hasn't changed)
    if (currentComponentCount > 0 && currentComponentCount === previousComponentCount) {
      stableCount++;
      // Wait for 3 consecutive stable iterations before exiting
      if (stableCount >= 3 && !hasLoadingComments) {
        fixture.detectChanges();
        return;
      }
    } else {
      stableCount = 0;
      previousComponentCount = currentComponentCount;
    }

    // Wait 10ms before next check
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  // Final detect changes even if timeout
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}
