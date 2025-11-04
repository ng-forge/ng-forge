import { Component, output, signal } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { checkoutConfig } from '../configs/checkout-config';

@Component({
  selector: 'demo-checkout-form',
  imports: [DynamicForm],
  template: ` <dynamic-form [config]="config" [(value)]="formValue" (submitted)="onSubmit($event || {})" /> `,
})
export class CheckoutFormComponent {
  config = checkoutConfig;
  formValue = signal<Record<string, unknown>>({});

  submitted = output<Record<string, unknown>>();

  onSubmit(value: Record<string, unknown>) {
    this.submitted.emit(value);
  }
}
