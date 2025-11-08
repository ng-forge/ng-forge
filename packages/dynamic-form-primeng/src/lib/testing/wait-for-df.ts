import { untracked } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { firstValueFrom } from 'rxjs';

/**
 * Waits for all dynamic form definitions to be initialized and ready
 * Uses the form's internal initialized$ observable for deterministic waiting
 */
export async function waitForDFInit(component: DynamicForm, fixture: ComponentFixture<DynamicForm>): Promise<void> {
  untracked(() => fixture.detectChanges());

  // Wait for the form to be initialized (all definitions created and bound)
  await firstValueFrom(component.initialized$);

  // Flush effects to ensure all reactive updates are processed (zoneless mode)
  TestBed.flushEffects();
  untracked(() => fixture.detectChanges());

  // Poll for actual DOM elements to appear (async component loading)
  await waitForFieldComponents(fixture);
}

/**
 * Polls until all field components have loaded and rendered
 * Necessary because components are loaded via dynamic imports
 */
async function waitForFieldComponents(fixture: ComponentFixture<any>, maxAttempts = 50): Promise<void> {
  const formElement = fixture.nativeElement.querySelector('.df-form, form');
  if (!formElement) return;

  let previousComponentCount = 0;
  let stableCount = 0;

  for (let i = 0; i < maxAttempts; i++) {
    TestBed.flushEffects();
    untracked(() => fixture.detectChanges());
    await fixture.whenStable();
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
      // Wait for 3 consecutive stable iterations before exiting
      if (stableCount >= 3 && !hasLoadingComments) {
        untracked(() => fixture.detectChanges());
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
  TestBed.flushEffects();
  untracked(() => fixture.detectChanges());
  await fixture.whenStable();
  TestBed.flushEffects();
  untracked(() => fixture.detectChanges());
}
