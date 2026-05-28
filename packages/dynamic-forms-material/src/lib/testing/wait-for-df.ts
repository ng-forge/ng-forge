import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicForm } from '@ng-forge/dynamic-forms';
import { firstValueFrom } from 'rxjs';

/** Waits for all dynamic form definitions to be initialized and ready */
export async function waitForDFInit(component: DynamicForm, fixture: ComponentFixture<DynamicForm>): Promise<void> {
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

  // Step 4: One final render cycle to ensure all attributes are set
  TestBed.flushEffects();
  fixture.detectChanges();
  await fixture.whenStable();
}

/** Deterministic DOM stability check */
async function waitForFieldComponents(fixture: ComponentFixture<DynamicForm>, timeoutMs = 500): Promise<void> {
  const formElement = fixture.nativeElement.querySelector('.df-form');
  if (!formElement) return;

  const startTime = Date.now();
  let previousComponentCount = 0;
  let stableCount = 0;
  const REQUIRED_STABLE_CHECKS = 3;

  while (Date.now() - startTime < timeoutMs) {
    TestBed.flushEffects();
    fixture.detectChanges();

    // Check for field components and Material components
    const fieldComponents = formElement.querySelectorAll('[data-testid]');
    const materialComponents = formElement.querySelectorAll(
      'mat-checkbox, mat-slide-toggle, mat-radio-group, mat-select, input[matInput], textarea[matInput], mat-slider, button[mat-button], button[mat-raised-button], button[mat-flat-button]',
    );

    const currentComponentCount = fieldComponents.length + materialComponents.length;

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
  fixture.detectChanges();
}
