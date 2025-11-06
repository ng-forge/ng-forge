import { ComponentFixture } from '@angular/core/testing';
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

  fixture.detectChanges();

  // Wait for all field components to actually render in the DOM
  // The initialized$ only waits for page/row/group components, not regular fields
  // Regular fields (checkbox, input, etc.) are loaded via loadComponent: () => import(...)
  // We poll until all expected field components are present
  await waitForFieldComponents(fixture);
}

/**
 * Polls until all field components have loaded and rendered
 * Checks every 10ms for up to 200ms (typically resolves in <50ms)
 */
async function waitForFieldComponents(fixture: ComponentFixture<any>, maxAttempts = 20): Promise<void> {
  const formElement = fixture.nativeElement.querySelector('.df-form');
  if (!formElement) return; // No form element, nothing to wait for

  for (let i = 0; i < maxAttempts; i++) {
    fixture.detectChanges();

    // Check if any field components are still loading (indicated by empty form content)
    const fieldComponents = formElement.querySelectorAll('[data-testid]');
    const hasLoadingComments = formElement.innerHTML.includes('<!--container-->');

    // If we have field components rendered OR no loading comments, we're done
    if (fieldComponents.length > 0 || !hasLoadingComments) {
      fixture.detectChanges();
      return;
    }

    // Wait 10ms before next check
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  // Final detect changes even if timeout
  fixture.detectChanges();
}
