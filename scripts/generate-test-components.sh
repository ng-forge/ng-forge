#!/bin/bash

# Script to generate test components for each e2e test spec file

TEST_NAMES=(
  "advanced-validation"
  "age-based-logic-test"
  "async-validation"
  "comprehensive-field-tests"
  "conditional-fields-test"
  "cross-field-validation"
  "cross-page-validation"
  "debug-test"
  "demo-scenarios-test"
  "error-handling"
  "essential-tests"
  "expression-based-logic"
  "form-reset-clear"
  "material-components"
  "multi-page-navigation"
  "navigation-edge-cases"
  "scenario-list"
  "user-journey-flows"
  "user-workflows"
)

TESTING_DIR="apps/examples/material/src/app/testing"

# Function to convert kebab-case to PascalCase
to_pascal_case() {
  echo "$1" | sed -r 's/(^|-)(\w)/\U\2/g'
}

# Function to convert kebab-case to Title Case with spaces
to_title_case() {
  echo "$1" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g'
}

for test_name in "${TEST_NAMES[@]}"; do
  component_name=$(to_pascal_case "$test_name")
  title=$(to_title_case "$test_name")

  cat > "$TESTING_DIR/${test_name}-test.component.ts" << EOF
import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  DynamicForm,
  SubmitEvent,
  FormResetEvent,
  FormClearEvent,
  AddArrayItemEvent,
  RemoveArrayItemEvent,
} from '@ng-forge/dynamic-form';

/**
 * ${component_name} Test Component
 * Dedicated component for ${title} e2e tests
 */
@Component({
  selector: 'app-${test_name}-test',
  imports: [DynamicForm, JsonPipe],
  template: \`
    <div class="test-page">
      <h1>${title} Tests</h1>
      <div class="test-container">
        <dynamic-form
          [config]="config"
          [(value)]="formValue"
          (submitted)="onSubmitted(\$event)"
        />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre>{{ formValue() | json }}</pre>
          @if (submissionLog().length > 0) {
            <div class="submissions">
              <strong>Submissions:</strong>
              @for (sub of submissionLog(); track sub.timestamp) {
                <div>{{ sub.timestamp }}: {{ sub.data | json }}</div>
              }
            </div>
          }
        </details>
      </div>
    </div>
  \`,
  styles: [\`
    .test-page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .test-container {
      max-width: 800px;
      margin: 2rem auto;
    }

    .debug-output {
      margin-top: 2rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    pre {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }

    .submissions div {
      padding: 0.5rem;
      margin: 0.25rem 0;
      background: #f8f9fa;
      border-radius: 4px;
    }
  \`]
})
export class ${component_name}TestComponent {
  config = signal<any>({ fields: [] });
  formValue = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  constructor() {
    this.setupTestEnvironment();
  }

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(
      new CustomEvent('formSubmitted', { detail: submission })
    );
  }

  private setupTestEnvironment(): void {
    // Expose event classes for e2e tests
    (window as any).SubmitEvent = SubmitEvent;
    (window as any).FormResetEvent = FormResetEvent;
    (window as any).FormClearEvent = FormClearEvent;
    (window as any).AddArrayItemEvent = AddArrayItemEvent;
    (window as any).RemoveArrayItemEvent = RemoveArrayItemEvent;

    // Expose test control methods
    (window as any).loadTestScenario = (
      testConfig: any,
      options?: { initialValue?: Record<string, unknown> }
    ) => {
      this.formValue.set(options?.initialValue || {});
      this.config.set(testConfig);
      this.submissionLog.set([]);
    };

    (window as any).clearTestScenario = () => {
      this.config.set({ fields: [] });
      this.formValue.set({});
      this.submissionLog.set([]);
    };
  }
}
EOF

  echo "Created: ${test_name}-test.component.ts"
done

echo ""
echo "All test components created!"
echo "Next steps:"
echo "1. Add routes to app.routes.ts"
echo "2. Update test specs to use new routes"
