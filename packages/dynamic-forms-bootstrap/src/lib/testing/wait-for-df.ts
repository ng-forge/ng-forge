import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicForm } from '@ng-forge/dynamic-forms';
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
  await waitForFieldComponents(fixture, 1000, false); // Set to true to enable debug logging

  // Step 4: One final render cycle to ensure all attributes are set
  TestBed.flushEffects();
  fixture.detectChanges();
  await fixture.whenStable();
}

/**
 * Deterministic DOM stability check
 *
 * Waits until Bootstrap component count stabilizes for 3 consecutive checks
 * and no loading placeholders remain. Uses timeout-based safety net instead
 * of arbitrary iteration limits.
 */
async function waitForFieldComponents(fixture: ComponentFixture<any>, timeoutMs = 500, debug = false): Promise<void> {
  const formElement = fixture.nativeElement.querySelector('.df-form, form');
  if (!formElement) return;

  const startTime = Date.now();
  let previousComponentCount = 0;
  let stableCount = 0;
  const REQUIRED_STABLE_CHECKS = 3;
  let iterations = 0;

  while (Date.now() - startTime < timeoutMs) {
    iterations++;
    TestBed.flushEffects();
    fixture.detectChanges();

    // Check for Bootstrap field components
    const bsComponents = formElement.querySelectorAll(
      'df-bs-input, df-bs-select, df-bs-checkbox, df-bs-radio, df-bs-toggle, ' +
        'df-bs-textarea, df-bs-datepicker, df-bs-slider, df-bs-button, df-bs-multi-checkbox, ' +
        'input.form-control, select.form-select, input[type="checkbox"].form-check-input, ' +
        'input[type="radio"].form-check-input, button.btn, [data-testid]',
    );

    const currentComponentCount = bsComponents.length;

    if (debug) {
      console.log(
        `[${iterations}] count=${currentComponentCount}, prev=${previousComponentCount}, stable=${stableCount}, elapsed=${
          Date.now() - startTime
        }ms`,
      );
    }

    // Check if DOM has stabilized
    // Note: We don't check for loading comments (<!--container-->) because Angular
    // leaves these as permanent DOM markers even after components are fully rendered
    if (currentComponentCount > 0 && currentComponentCount === previousComponentCount) {
      stableCount++;
      if (stableCount >= REQUIRED_STABLE_CHECKS) {
        if (debug) console.log(`✓ Stabilized after ${iterations} iterations, ${Date.now() - startTime}ms`);
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

  if (debug) console.log(`✗ Timeout reached after ${iterations} iterations, final count=${previousComponentCount}`);

  // Final stabilization even if timeout reached
  TestBed.flushEffects();
  fixture.detectChanges();
}
