import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Cross-Page Cascade Dependencies Scenario
 * Tests dependencies across multiple pages (region -> address -> payment)
 */
@Component({
  selector: 'example-cascade-dependencies',
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
  styleUrl: '../test-styles.scss',
})
export class CascadeDependenciesComponent {
  value = signal<Record<string, unknown>>({});

  config = {
    fields: [
      // Page 1: Region Selection
      {
        key: 'regionPage',
        type: 'page',
        fields: [
          {
            key: 'region-selection-title',
            type: 'text',
            label: 'Region Selection',
          },
          {
            key: 'region-selection-description',
            type: 'text',
            label: 'Select your region and preferences',
          },
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
          {
            key: 'nextToPage2',
            type: 'next',
            label: 'Next',
            col: 12,
          },
        ],
      },
      // Page 2: Address Information
      {
        key: 'addressPage',
        type: 'page',

        fields: [
          {
            key: 'address-title',
            type: 'text',
            label: 'Address Information',
          },
          {
            key: 'address-description',
            type: 'text',
            label: 'Provide your address details',
          },
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
          {
            key: 'previousToPage1',
            type: 'previous',
            label: 'Previous',
            col: 6,
          },
          {
            key: 'nextToPage3',
            type: 'next',
            label: 'Next',
            col: 6,
          },
        ],
      },
      // Page 3: Payment Information
      {
        key: 'paymentPage',
        type: 'page',
        fields: [
          {
            key: 'payment-title',
            type: 'text',
            label: 'Payment Information',
          },
          {
            key: 'payment-description',
            type: 'text',
            label: 'Set up your payment preferences',
          },
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
            key: 'previousToPage2',
            type: 'previous',
            label: 'Previous',
            col: 6,
          },
          {
            key: 'submitCascade',
            type: 'submit',
            label: 'Complete Setup',
            col: 6,
          },
        ],
      },
    ],
  } as const satisfies FormConfig;

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
