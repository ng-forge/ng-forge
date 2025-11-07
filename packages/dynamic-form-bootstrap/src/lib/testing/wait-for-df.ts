import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { firstValueFrom } from 'rxjs';

/**
 * Waits for all dynamic form definitions to be initialized and ready
 * Uses the form's internal initialized$ observable for deterministic waiting
 */
export async function waitForDFInit(component: DynamicForm, fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();

  // Wait for the form to be initialized (all definitions created and bound)
  await firstValueFrom(component.initialized$);

  // Flush effects to ensure all reactive updates are processed (zoneless mode)
  TestBed.flushEffects();
  fixture.detectChanges();

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
    fixture.detectChanges();
    await fixture.whenStable();
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
  TestBed.flushEffects();
  fixture.detectChanges();
  await fixture.whenStable();
  TestBed.flushEffects();
  fixture.detectChanges();
}
