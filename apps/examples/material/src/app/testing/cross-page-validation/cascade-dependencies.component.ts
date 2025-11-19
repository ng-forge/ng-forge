import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Cross-Page Cascade Dependencies Scenario
 * Tests dependencies across multiple pages (region -> address -> payment)
 */
@Component({
  selector: 'app-cascade-dependencies',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>Cross-Page Cascade Dependencies</h1>

      <section class="test-scenario" data-testid="cascade-dependencies">
        <h2>Cross-Page Cascade Dependencies</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-cascade-dependencies'">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class CascadeDependenciesComponent {
  value = signal<Record<string, unknown>>({});

  config = {
    fields: [
      // Page 1: Region Selection
      {
        key: 'regionPage',
        type: 'page',
        title: 'Region Selection',
        description: 'Select your region and preferences',
        fields: [
          {
            key: 'country',
            type: 'select',
            label: 'Country',
            options: [
              { value: 'us', label: 'United States' },
              { value: 'ca', label: 'Canada' },
              { value: 'uk', label: 'United Kingdom' },
              { value: 'de', label: 'Germany' },
            ],
            required: true,
            col: 6,
          },
          {
            key: 'language',
            type: 'select',
            label: 'Preferred Language',
            options: [
              { value: 'en', label: 'English' },
              { value: 'fr', label: 'French' },
              { value: 'de', label: 'German' },
              { value: 'es', label: 'Spanish' },
            ],
            required: true,
            col: 6,
          },
          {
            key: 'currency',
            type: 'select',
            label: 'Currency',
            options: [
              { value: 'usd', label: 'US Dollar ($)' },
              { value: 'cad', label: 'Canadian Dollar (CAD)' },
              { value: 'gbp', label: 'British Pound (£)' },
              { value: 'eur', label: 'Euro (€)' },
            ],
            required: true,
            col: 12,
          },
        ],
      },
      // Page 2: Address Information
      {
        key: 'addressPage',
        type: 'page',
        title: 'Address Information',
        description: 'Provide your address details',
        fields: [
          {
            key: 'streetAddress',
            type: 'input',
            label: 'Street Address',
            props: {
              placeholder: 'Enter street address',
            },
            required: true,
            col: 12,
          },
          {
            key: 'city',
            type: 'input',
            label: 'City',
            props: {
              placeholder: 'Enter city',
            },
            required: true,
            col: 6,
          },
          {
            key: 'postalCode',
            type: 'input',
            label: 'Postal/ZIP Code',
            props: {
              placeholder: 'Enter postal/ZIP code',
            },
            required: true,
            col: 6,
          },
          {
            key: 'stateProvince',
            type: 'select',
            label: 'State/Province',
            options: [
              { value: 'ca', label: 'California' },
              { value: 'ny', label: 'New York' },
              { value: 'tx', label: 'Texas' },
              { value: 'on', label: 'Ontario' },
              { value: 'bc', label: 'British Columbia' },
            ],
            required: true,
            col: 12,
          },
        ],
      },
      // Page 3: Payment Information
      {
        key: 'paymentPage',
        type: 'page',
        title: 'Payment Information',
        description: 'Set up your payment preferences',
        fields: [
          {
            key: 'paymentMethod',
            type: 'radio',
            label: 'Payment Method',
            options: [
              { value: 'credit_card', label: 'Credit Card' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
              { value: 'paypal', label: 'PayPal' },
              { value: 'crypto', label: 'Cryptocurrency' },
            ],
            required: true,
            col: 12,
          },
          {
            key: 'bankCountry',
            type: 'select',
            label: 'Bank Country',
            options: [
              { value: 'us', label: 'United States' },
              { value: 'ca', label: 'Canada' },
              { value: 'uk', label: 'United Kingdom' },
              { value: 'de', label: 'Germany' },
            ],
            col: 12,
          },
          {
            key: 'submitCascade',
            type: 'submit',
            label: 'Complete Setup',
            col: 12,
          },
        ],
      },
    ],
  };

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'cascade-dependencies',
      data: value,
    };

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
