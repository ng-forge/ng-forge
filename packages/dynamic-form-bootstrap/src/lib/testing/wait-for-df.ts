import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { firstValueFrom } from 'rxjs';

/**
 * Waits for all dynamic form definitions to be initialized and ready
 *
 * Hybrid approach:
 * 1. Event-based: Wait for initialized$ (tracks container components + field loading cascade)
 * 2. DOM verification: Short poll to ensure Bootstrap components fully rendered
 *
 * The initialized$ observable tracks page/row/group containers. Each container waits
 * for its children via forkJoin + afterNextRender before emitting its initialized event.
 * This creates a cascade where parent containers only emit after all descendants are ready.
 *
 * The short poll handles edge cases where Bootstrap component templates need additional
 * change detection cycles before DOM elements match test selectors.
 */
export async function waitForDFInit(component: DynamicForm, fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();

  // Step 1: Wait for event-based initialization (handles ~95% of waiting)
  await firstValueFrom(component.initialized$);

  // Step 2: Ensure all effects processed (zoneless mode)
  TestBed.flushEffects();
  fixture.detectChanges();
  await fixture.whenStable();

  // Step 3: Quick DOM verification poll (handles Bootstrap template rendering edge cases)
  await waitForFieldComponents(fixture);
}

/**
 * Quick DOM verification poll to ensure Bootstrap components are fully rendered
 *
 * Reduced to 5 iterations (50ms max) since initialized$ event handles most waiting.
 * This only needs to verify Bootstrap component templates have completed rendering.
 */
async function waitForFieldComponents(fixture: ComponentFixture<any>, maxAttempts = 5): Promise<void> {
  const formElement = fixture.nativeElement.querySelector('.df-form, form');
  if (!formElement) return;

  let previousComponentCount = 0;
  let stableCount = 0;

  for (let i = 0; i < maxAttempts; i++) {
    TestBed.flushEffects();
    fixture.detectChanges();

    // Check for Bootstrap field components
    const bsComponents = formElement.querySelectorAll(
      'df-bs-input, df-bs-select, df-bs-checkbox, df-bs-radio, df-bs-toggle, ' +
        'df-bs-textarea, df-bs-datepicker, df-bs-slider, df-bs-button, df-bs-multi-checkbox, ' +
        'input.form-control, select.form-select, input[type="checkbox"].form-check-input, ' +
        'input[type="radio"].form-check-input, button.btn, [data-testid]'
    );
    const hasLoadingComments = formElement.innerHTML.includes('<!--container-->');

    const currentComponentCount = bsComponents.length;

    // Check if we've stabilized (component count hasn't changed)
    if (currentComponentCount > 0 && currentComponentCount === previousComponentCount) {
      stableCount++;
      // Wait for 2 consecutive stable iterations before exiting
      if (stableCount >= 2 && !hasLoadingComments) {
        return;
      }
    } else {
      stableCount = 0;
      previousComponentCount = currentComponentCount;
    }

    // Wait 10ms before next check
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  // Final stabilization even if max attempts reached
  TestBed.flushEffects();
  fixture.detectChanges();
}
