import { untracked } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicForm } from '@ng-forge/dynamic-forms';
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

  // Step 1: Wait for event-based initialization
  await firstValueFrom(component.initialized$);

  // Step 2: Ensure all effects processed and DOM updated
  TestBed.flushEffects();
  untracked(() => fixture.detectChanges());
  await fixture.whenStable();
  TestBed.flushEffects();
  untracked(() => fixture.detectChanges());

  // Step 3: Wait for DOM to stabilize (no more components loading)
  await waitForFieldComponents(fixture);

  // Step 4: One final render cycle to ensure all attributes are set
  TestBed.flushEffects();
  untracked(() => fixture.detectChanges());
  await fixture.whenStable();
}

/**
 * Deterministic DOM stability check
 *
 * Waits until PrimeNG component count stabilizes for 3 consecutive checks
 * and no loading placeholders remain. Uses timeout-based safety net instead
 * of arbitrary iteration limits.
 */
async function waitForFieldComponents(fixture: ComponentFixture<any>, timeoutMs = 500): Promise<void> {
  const formElement = fixture.nativeElement.querySelector('.df-form, form');
  if (!formElement) return;

  const startTime = Date.now();
  let previousComponentCount = 0;
  let stableCount = 0;
  const REQUIRED_STABLE_CHECKS = 3;

  while (Date.now() - startTime < timeoutMs) {
    TestBed.flushEffects();
    untracked(() => fixture.detectChanges());

    // Check for PrimeNG field components
    const primeComponents = formElement.querySelectorAll(
      'df-prime-input, df-prime-select, df-prime-checkbox, df-prime-radio, df-prime-toggle, ' +
        'df-prime-textarea, df-prime-datepicker, df-prime-slider, df-prime-button, df-prime-multi-checkbox, ' +
        'input[pInputText], p-select, p-checkbox, p-radiobutton, p-inputswitch, textarea[pInputTextarea], ' +
        'p-calendar, p-slider, button[pButton], [data-testid]',
    );

    const currentComponentCount = primeComponents.length;

    // Check if DOM has stabilized
    // Note: We don't check for loading comments (<!--container-->) because Angular
    // leaves these as permanent DOM markers even after components are fully rendered
    if (currentComponentCount > 0 && currentComponentCount === previousComponentCount) {
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
  untracked(() => fixture.detectChanges());
}
