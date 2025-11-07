import { ComponentFixture } from '@angular/core/testing';
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

  fixture.detectChanges();
}
