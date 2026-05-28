import { untracked } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicForm } from '@ng-forge/dynamic-forms';
import { firstValueFrom } from 'rxjs';

/** Waits for all dynamic form definitions to be initialized and ready */
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

/** Deterministic DOM stability check */
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
