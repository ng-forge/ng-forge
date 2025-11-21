import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Conditional Page Visibility Scenario
 * Tests showing/hiding pages based on account type selection
 */
@Component({
  selector: 'example-conditional-pages',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>Conditional Page Visibility</h1>

      <section class="test-scenario" data-testid="conditional-pages">
        <h2>Conditional Page Visibility</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-conditional-pages'">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class ConditionalPagesComponent {
  value = signal<Record<string, unknown>>({});

  config = {
    fields: [
      // Page 1: Account Type Selection
      {
        key: 'accountTypePage',
        type: 'page',

        fields: [
          {
            key: 'account-type-description',
            type: 'text',
            label: 'Select your account type',
          },
          {
            key: 'accountType',
            type: 'radio',
            label: 'Account Type',
            options: [
              { value: 'individual', label: 'Individual Account' },
              { value: 'business', label: 'Business Account' },
              { value: 'nonprofit', label: 'Non-Profit Organization' },
            ],
            required: true,
            col: 12,
          },
          {
            key: 'primaryUse',
            type: 'select',
            label: 'Primary Use',
            options: [
              { value: 'personal', label: 'Personal Use' },
              { value: 'professional', label: 'Professional Use' },
              { value: 'education', label: 'Educational Use' },
              { value: 'charity', label: 'Charitable Work' },
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
      // Page 2: Individual Information
      {
        key: 'individualPage',
        type: 'page',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'accountType',
              operator: 'notEquals',
              value: 'individual',
            },
          },
        ],
        fields: [
          {
            key: 'individual-description',
            type: 'text',
            label: 'Personal account details',
          },
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            props: {
              placeholder: 'Enter first name',
            },
            required: true,
            col: 6,
          },
          {
            key: 'lastName',
            type: 'input',
            label: 'Last Name',
            props: {
              placeholder: 'Enter last name',
            },
            required: true,
            col: 6,
          },
          {
            key: 'birthDate',
            type: 'datepicker',
            label: 'Date of Birth',
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
      // Page 3: Business Information
      {
        key: 'businessPage',
        type: 'page',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'accountType',
              operator: 'notEquals',
              value: 'business',
            },
          },
        ],
        fields: [
          {
            key: 'business-page-description',
            type: 'text',
            label: 'Business account details',
          },
          {
            key: 'businessName',
            type: 'input',
            label: 'Business Name',
            props: {
              placeholder: 'Enter business name',
            },
            required: true,
            col: 12,
          },
          {
            key: 'taxId',
            type: 'input',
            label: 'Tax ID / EIN',
            props: {
              placeholder: 'Enter tax identification number',
            },
            pattern: '^[0-9]{2}-[0-9]{7}$',
            required: true,
            col: 6,
          },
          {
            key: 'businessType',
            type: 'select',
            label: 'Business Type',
            options: [
              { value: 'llc', label: 'LLC' },
              { value: 'corporation', label: 'Corporation' },
              { value: 'partnership', label: 'Partnership' },
              { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
            ],
            required: true,
            col: 6,
          },
          {
            key: 'previousToPage2',
            type: 'previous',
            label: 'Previous',
            col: 6,
          },
          {
            key: 'nextToPage4',
            type: 'next',
            label: 'Next',
            col: 6,
          },
        ],
      },
      // Page 4: Final Confirmation
      {
        key: 'finalPage',
        type: 'page',
        fields: [
          {
            key: 'final-page-description',
            type: 'text',
            label: 'Review and submit your information',
          },
          {
            key: 'confirmationCode',
            type: 'input',
            label: 'Confirmation Code',
            props: {
              placeholder: 'Enter confirmation code (sent via email)',
            },
            pattern: '^[A-Z0-9]{6}$',
            required: true,
            col: 12,
          },
          {
            key: 'finalTerms',
            type: 'checkbox',
            label: 'I confirm all information is accurate',
            required: true,
            col: 12,
          },
          {
            key: 'previousToPage3',
            type: 'previous',
            label: 'Previous',
            col: 6,
          },
          {
            key: 'submitConditional',
            type: 'submit',
            label: 'Create Account',
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
      testId: 'conditional-pages',
      data: value,
    };

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
