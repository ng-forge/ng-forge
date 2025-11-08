import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { firstValueFrom } from 'rxjs';

/**
 * Waits for all dynamic form definitions to be initialized and ready
 * Uses the form's internal initialized$ observable for deterministic waiting
 */
export async function waitForDFInit(component: DynamicForm, fixture: ComponentFixture<any>): Promise<void> {
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

    // Check for Ionic field components
    const ionicComponents = formElement.querySelectorAll(
      'df-ionic-input, df-ionic-select, df-ionic-checkbox, df-ionic-radio, df-ionic-toggle, ' +
        'df-ionic-textarea, df-ionic-datepicker, df-ionic-slider, df-ionic-button, df-ionic-multi-checkbox, ' +
        'ion-input, ion-select, ion-checkbox, ion-radio, ion-toggle, ion-textarea, ' +
        'ion-datetime, ion-range, ion-button, [data-testid]'
    );
    const hasLoadingComments = formElement.innerHTML.includes('<!--container-->');

    const currentComponentCount = ionicComponents.length;

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
