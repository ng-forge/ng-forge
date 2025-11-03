import { Component, signal } from '@angular/core';
import { E2ETestHostComponent } from '../../../e2e/src/utils/e2e-test-host.component';
import { FormConfig } from '@ng-forge/dynamic-form';

/**
 * E2E Test Page Component
 * Provides a testing endpoint for Playwright e2e tests
 */
@Component({
  selector: 'demo-e2e-test-page',
  imports: [E2ETestHostComponent],
  template: `
    <div class="e2e-test-page">
      <h1>E2E Test Environment</h1>
      <p>This page is used for automated testing. Load test scenarios via JavaScript console or window object.</p>

      @if (currentConfig()) {
      <e2e-test-host
        [config]="currentConfig()!"
        [testId]="currentTestId()"
        [title]="currentTitle()"
        [description]="currentDescription()"
        [showConfig]="true"
        [initialValue]="currentInitialValue()"
      >
      </e2e-test-host>
      } @else {
      <div class="no-scenario">
        <h2>No Scenario Loaded</h2>
        <p>Use the following JavaScript to load a test scenario:</p>
        <pre><code>window.loadTestScenario(scenarioConfig);</code></pre>

        <h3>Available Scenarios:</h3>
        <ul>
          <li>userProfile</li>
          <li>contactForm</li>
          <li>registrationForm</li>
          <li>gridLayout</li>
          <li>surveyForm</li>
          <li>complexValidation</li>
          <li>registrationWizard</li>
          <li>customerSurvey</li>
          <li>jobApplication</li>
          <li>ecommerceCheckout</li>
          <li>ecommerceRegistration</li>
          <li>healthcareRegistration</li>
          <li>corporateEventRegistration</li>
        </ul>

        <h3>Example Usage:</h3>
        <pre><code>
// Load a specific scenario
const &#123; getScenario &#125; = window.testUtils;
window.loadTestScenario(getScenario('userProfile'));

// Or load with custom config
window.loadTestScenario(&#123;
  pages: [&#123;
    fields: [&#123;
      key: 'test',
      type: 'input',
      label: 'Test Field'
    &#125;]
  &#125;]
&#125;);
          </code></pre>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .e2e-test-page {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
        font-family: 'Roboto', sans-serif;
      }

      .e2e-test-page h1 {
        color: #1976d2;
        margin-bottom: 1rem;
        text-align: center;
      }

      .e2e-test-page > p {
        text-align: center;
        color: #666;
        margin-bottom: 2rem;
      }

      .no-scenario {
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 2rem;
        margin-top: 2rem;
      }

      .no-scenario h2 {
        color: #1976d2;
        margin-bottom: 1rem;
      }

      .no-scenario h3 {
        color: #333;
        margin: 1.5rem 0 0.5rem 0;
      }

      .no-scenario ul {
        list-style-type: disc;
        margin-left: 2rem;
        margin-bottom: 1rem;
      }

      .no-scenario li {
        margin-bottom: 0.25rem;
        font-family: monospace;
        background: #e8f4f8;
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
        display: inline-block;
        margin-right: 0.5rem;
      }

      pre {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 1rem;
        font-size: 0.875rem;
        line-height: 1.4;
        overflow-x: auto;
        margin: 1rem 0;
      }

      code {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      }
    `,
  ],
})
export class E2ETestPageComponent {
  currentConfig = signal<FormConfig | null>(null);
  currentTestId = signal<string>('default');
  currentTitle = signal<string>('');
  currentDescription = signal<string>('');
  currentInitialValue = signal<Record<string, unknown>>({});

  constructor() {
    // Expose test utilities to window for e2e tests
    this.setupWindowTestUtils();

    // Set up global scenario loader
    this.setupScenarioLoader();
  }

  private setupWindowTestUtils(): void {
    // Import test utilities and expose them globally
    import('../../../e2e/src/utils/test-scenarios').then((testScenarios) => {
      (window as any).testUtils = {
        getScenario: testScenarios.getScenario,
        getScenariosByCategory: testScenarios.getScenariosByCategory,
        getAllScenarioNames: testScenarios.getAllScenarioNames,
        QUICK_SCENARIOS: testScenarios.QUICK_SCENARIOS,
        TEST_CATEGORIES: testScenarios.TEST_CATEGORIES,
      };
    });
  }

  private setupScenarioLoader(): void {
    // Create global function for loading test scenarios
    (window as any).loadTestScenario = (
      config: FormConfig,
      options?: {
        testId?: string;
        title?: string;
        description?: string;
        initialValue?: Record<string, unknown>;
      }
    ) => {
      this.currentConfig.set(config);
      this.currentTestId.set(options?.testId || 'default');
      this.currentTitle.set(options?.title || '');
      this.currentDescription.set(options?.description || '');
      this.currentInitialValue.set(options?.initialValue || {});
    };

    // Helper function to clear current scenario
    (window as any).clearTestScenario = () => {
      this.currentConfig.set(null);
      this.currentTestId.set('default');
      this.currentTitle.set('');
      this.currentDescription.set('');
      this.currentInitialValue.set({});
    };

    // Helper function to load scenario by name
    (window as any).loadScenarioByName = (scenarioName: string) => {
      import('../../../e2e/src/utils/test-scenarios').then((testScenarios) => {
        try {
          const config = testScenarios.getScenario(scenarioName as any);
          (window as any).loadTestScenario(config, {
            testId: scenarioName,
            title: `Test Scenario: ${scenarioName}`,
            description: `Automated test scenario for ${scenarioName}`,
          });
        } catch (error) {
          console.error(`Failed to load scenario: ${scenarioName}`, error);
        }
      });
    };
  }
}
