import { untracked } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { firstValueFrom } from 'rxjs';

/**
 * Waits for all dynamic form definitions to be initialized and ready
 *
 * Hybrid approach:
 * 1. Event-based: Wait for initialized$ (tracks container components + field loading cascade)
 * 2. DOM verification: Short poll to ensure PrimeNG components fully rendered
 *
 * The initialized$ observable tracks page/row/group containers. Each container waits
 * for its children via forkJoin + afterNextRender before emitting its initialized event.
 * This creates a cascade where parent containers only emit after all descendants are ready.
 *
 * The short poll handles edge cases where PrimeNG component templates need additional
 * change detection cycles before DOM elements match test selectors.
 */
export async function waitForDFInit(component: DynamicForm, fixture: ComponentFixture<DynamicForm>): Promise<void> {
  untracked(() => fixture.detectChanges());

  // Step 1: Wait for event-based initialization (handles ~95% of waiting)
  await firstValueFrom(component.initialized$);

  // Step 2: Ensure all effects processed (zoneless mode)
  TestBed.flushEffects();
  untracked(() => fixture.detectChanges());
  await fixture.whenStable();

  // Step 3: Quick DOM verification poll (handles PrimeNG template rendering edge cases)
  await waitForFieldComponents(fixture);
}

/**
 * Quick DOM verification poll to ensure PrimeNG components are fully rendered
 *
 * Reduced to 5 iterations (50ms max) since initialized$ event handles most waiting.
 * This only needs to verify PrimeNG component templates have completed rendering.
 */
async function waitForFieldComponents(fixture: ComponentFixture<any>, maxAttempts = 5): Promise<void> {
  const formElement = fixture.nativeElement.querySelector('.df-form, form');
  if (!formElement) return;

  let previousComponentCount = 0;
  let stableCount = 0;

  for (let i = 0; i < maxAttempts; i++) {
    TestBed.flushEffects();
    untracked(() => fixture.detectChanges());

    // Check for PrimeNG field components
    const primeComponents = formElement.querySelectorAll(
      'df-prime-input, df-prime-select, df-prime-checkbox, df-prime-radio, df-prime-toggle, ' +
        'df-prime-textarea, df-prime-datepicker, df-prime-slider, df-prime-button, df-prime-multi-checkbox, ' +
        'input[pInputText], p-select, p-checkbox, p-radiobutton, p-inputswitch, textarea[pInputTextarea], ' +
        'p-calendar, p-slider, button[pButton], [data-testid]'
    );
    const hasLoadingComments = formElement.innerHTML.includes('<!--container-->');

    const currentComponentCount = primeComponents.length;

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
  untracked(() => fixture.detectChanges());
}
