import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

// E2E components for the multi-form id-collision fix. Adapter-agnostic (core
// DynamicForm + `input`); the adapter's renderer resolves at runtime via DI.

const TWO_FIELD_CONFIG = {
  fields: [
    { key: 'email', type: 'input', label: 'Email' },
    { key: 'name', type: 'input', label: 'Name' },
  ],
} as const satisfies FormConfig;

const SINGLE_FIELD_CONFIG = {
  fields: [{ key: 'email', type: 'input', label: 'Email' }],
} as const satisfies FormConfig;

const BILLING_CONFIG = {
  options: { idPrefix: 'billing' },
  fields: [{ key: 'email', type: 'input', label: 'Email' }],
} as const satisfies FormConfig;

const SHIPPING_CONFIG = {
  options: { idPrefix: 'shipping' },
  fields: [{ key: 'email', type: 'input', label: 'Email' }],
} as const satisfies FormConfig;

/** Two forms from the SAME config — auto-prefix must scope each to distinct ids. */
@Component({
  selector: 'bs-example-id-collision-two-forms',
  imports: [DynamicForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="test-page">
      <h1>ID Collision — Two Identical Forms</h1>
      <section class="test-scenario" data-testid="id-collision-two-forms">
        <div data-testid="form-a"><form [dynamic-form]="config"></form></div>
        <div data-testid="form-b"><form [dynamic-form]="config"></form></div>
      </section>
    </div>
  `,
})
export class IdCollisionTwoFormsComponent {
  protected readonly config = TWO_FIELD_CONFIG;
}

/** Two forms with explicit `options.idPrefix` — must win verbatim. */
@Component({
  selector: 'bs-example-id-collision-explicit',
  imports: [DynamicForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="test-page">
      <h1>ID Collision — Explicit Prefixes</h1>
      <section class="test-scenario" data-testid="id-collision-explicit">
        <div data-testid="form-billing"><form [dynamic-form]="billingConfig"></form></div>
        <div data-testid="form-shipping"><form [dynamic-form]="shippingConfig"></form></div>
      </section>
    </div>
  `,
})
export class IdCollisionExplicitComponent {
  protected readonly billingConfig = BILLING_CONFIG;
  protected readonly shippingConfig = SHIPPING_CONFIG;
}

/** Form A always present; form B toggles — exercises the registry cleanup path. */
@Component({
  selector: 'bs-example-id-collision-toggle',
  imports: [DynamicForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="test-page">
      <h1>ID Collision — Toggle / Cleanup</h1>
      <button type="button" data-testid="toggle-form-b" (click)="showB.set(!showB())">Toggle Form B</button>
      <section class="test-scenario" data-testid="id-collision-toggle">
        <div data-testid="form-a"><form [dynamic-form]="config"></form></div>
        @if (showB()) {
          <div data-testid="form-b"><form [dynamic-form]="config"></form></div>
        }
      </section>
    </div>
  `,
})
export class IdCollisionToggleComponent {
  protected readonly showB = signal(false);
  protected readonly config = SINGLE_FIELD_CONFIG;
}
