import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { firstValueFrom } from 'rxjs';

/**
 * Waits for all dynamic form definitions to be initialized and ready
 *
 * Hybrid approach:
 * 1. Event-based: Wait for initialized$ (tracks container components + field loading cascade)
 * 2. DOM verification: Short poll to ensure Ionic components fully rendered
 *
 * The initialized$ observable tracks page/row/group containers. Each container waits
 * for its children via forkJoin + afterNextRender before emitting its initialized event.
 * This creates a cascade where parent containers only emit after all descendants are ready.
 *
 * The short poll handles edge cases where Ionic component templates need additional
 * change detection cycles before DOM elements match test selectors.
 */
export async function waitForDFInit(component: DynamicForm, fixture: ComponentFixture<any>): Promise<void> {
  fixture.detectChanges();

  // Step 1: Wait for event-based initialization (handles ~95% of waiting)
  await firstValueFrom(component.initialized$);

  // Step 2: Ensure all effects processed (zoneless mode)
  TestBed.flushEffects();
  fixture.detectChanges();
  await fixture.whenStable();

  // Step 3: Quick DOM verification poll (handles Ionic template rendering edge cases)
  await waitForFieldComponents(fixture);
}

/**
 * Quick DOM verification poll to ensure Ionic components are fully rendered
 *
 * Reduced to 5 iterations (50ms max) since initialized$ event handles most waiting.
 * This only needs to verify Ionic component templates have completed rendering.
 */
async function waitForFieldComponents(fixture: ComponentFixture<any>, maxAttempts = 5): Promise<void> {
  const formElement = fixture.nativeElement.querySelector('.df-form, form');
  if (!formElement) return;

  let previousComponentCount = 0;
  let stableCount = 0;

  for (let i = 0; i < maxAttempts; i++) {
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
