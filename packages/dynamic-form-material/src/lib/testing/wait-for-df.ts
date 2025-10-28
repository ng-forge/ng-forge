import { ComponentFixture } from '@angular/core/testing';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { firstValueFrom } from 'rxjs';

/**
 * Waits for all dynamic form fields to be initialized and ready
 * Uses the form's internal initialized$ observable for deterministic waiting
 */
export async function waitForDynamicFormInitialized(component: DynamicForm, fixture: ComponentFixture<any>): Promise<void> {
  fixture.detectChanges();

  // Wait for the form to be initialized (all fields created and bound)
  await firstValueFrom(component.initialized$);

  fixture.detectChanges();
}
