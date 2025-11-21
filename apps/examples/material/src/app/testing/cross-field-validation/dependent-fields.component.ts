import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Dependent Field Testing Component
 * Tests dependent fields that change based on category selection
 */
@Component({
  selector: 'example-dependent-fields-test',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <div class="test-scenario" data-testid="dependent-fields">
        <h2>Dependent Field Testing</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output form-state">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-dependent-fields'">{{ value() | json }}</pre>
          @if (submissions().length > 0) {
            <div class="submissions">
              <strong>Submissions:</strong>
              @for (sub of submissions(); track sub.timestamp; let idx = $index) {
                <div [attr.data-testid]="'submission-' + idx">{{ sub.timestamp }}: {{ sub.data | json }}</div>
              }
            </div>
          }
        </details>
      </div>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class DependentFieldsTestComponent {
  value = signal<Record<string, unknown>>({});
  submissions = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  config = {
    fields: [
      {
        key: 'category',
        type: 'select',
        label: 'Product Category',
        options: [
          { value: 'electronics', label: 'Electronics' },
          { value: 'clothing', label: 'Clothing' },
          { value: 'books', label: 'Books' },
        ],
        required: true,
        col: 6,
      },
      {
        key: 'subcategory',
        type: 'select',
        label: 'Subcategory',
        options: [
          { value: 'laptop', label: 'Laptop' },
          { value: 'phone', label: 'Phone' },
          { value: 'tablet', label: 'Tablet' },
          { value: 'shirt', label: 'Shirt' },
          { value: 'pants', label: 'Pants' },
          { value: 'shoes', label: 'Shoes' },
          { value: 'fiction', label: 'Fiction' },
          { value: 'nonfiction', label: 'Non-Fiction' },
          { value: 'textbook', label: 'Textbook' },
        ],
        col: 6,
      },
      {
        key: 'productName',
        type: 'input',
        label: 'Product Name',
        props: {
          placeholder: 'Enter product name',
        },
        required: true,
        col: 12,
      },
      {
        key: 'price',
        type: 'input',
        label: 'Price',
        props: {
          type: 'number',
          placeholder: 'Enter price',
        },
        min: 0,
        required: true,
        col: 6,
      },
      {
        key: 'currency',
        type: 'select',
        label: 'Currency',
        options: [
          { value: 'usd', label: 'USD' },
          { value: 'eur', label: 'EUR' },
          { value: 'gbp', label: 'GBP' },
          { value: 'cad', label: 'CAD' },
        ],
        value: 'usd',
        col: 6,
      },
      {
        key: 'submitDependent',
        type: 'submit',
        label: 'Add Product',
        col: 12,
      },
    ],
  } as const satisfies FormConfig;

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      data: value,
    };

    this.submissions.update((subs) => [...subs, submission]);

    window.dispatchEvent(
      new CustomEvent('formSubmitted', {
        detail: { testId: 'dependent-fields', ...submission },
      }),
    );
  }
}
