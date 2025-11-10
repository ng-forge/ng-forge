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

  // Step 1: Wait for event-based initialization
  await firstValueFrom(component.initialized$);

  // Step 2: Ensure all effects processed and DOM updated
  TestBed.flushEffects();
  fixture.detectChanges();
  await fixture.whenStable();
  TestBed.flushEffects();
  fixture.detectChanges();

  // Step 3: Wait for DOM to stabilize (no more components loading)
  await waitForFieldComponents(fixture);
}

/**
 * Deterministic DOM stability check
 *
 * Waits until Bootstrap component count stabilizes for 3 consecutive checks
 * and no loading placeholders remain. Uses timeout-based safety net instead
 * of arbitrary iteration limits.
 */
async function waitForFieldComponents(fixture: ComponentFixture<any>, timeoutMs = 1000): Promise<void> {
  const formElement = fixture.nativeElement.querySelector('.df-form, form');
  if (!formElement) return;

  const startTime = Date.now();
  let previousComponentCount = 0;
  let stableCount = 0;
  const REQUIRED_STABLE_CHECKS = 3;

  while (Date.now() - startTime < timeoutMs) {
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

    // Check if DOM has stabilized
    if (currentComponentCount > 0 && currentComponentCount === previousComponentCount && !hasLoadingComments) {
      stableCount++;
      if (stableCount >= REQUIRED_STABLE_CHECKS) {
        // DOM is truly stable - exit
        return;
      }
    } else {
      stableCount = 0;
      previousComponentCount = currentComponentCount;
    }

    // Wait one tick before next check
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  // Final stabilization even if timeout reached
  TestBed.flushEffects();
  fixture.detectChanges();
}
