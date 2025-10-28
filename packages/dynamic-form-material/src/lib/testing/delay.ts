import { ComponentFixture } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Test utility for creating delays in tests
 * Internal utility for dynamic-form-material testing - not exported from the package
 */
export function delay(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for dynamic form to be initialized with all fields rendered
 * This provides a more deterministic way to wait for form initialization than using arbitrary delays
 */
export async function waitForDynamicFormInitialized(component: DynamicForm, fixture: ComponentFixture<any>): Promise<void> {
  await firstValueFrom(component.initialized$);
  fixture.detectChanges();
}
