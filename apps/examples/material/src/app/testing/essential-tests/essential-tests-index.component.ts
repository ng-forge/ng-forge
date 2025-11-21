import { Component } from '@angular/core';
import { BasicFormTestComponent } from './basic-form.component';
import { AgeBasedLogicTestComponent } from './age-based-logic.component';
import { MultiPageNavigationTestComponent } from './multi-page-navigation.component';

/**
 * Essential Tests Index Component
 * Renders all test scenarios on a single page for E2E testing
 */
@Component({
  selector: 'example-essential-tests-index',
  imports: [BasicFormTestComponent, AgeBasedLogicTestComponent, MultiPageNavigationTestComponent],
  template: `
    <div class="test-page-container">
      <h1 class="page-title">Essential Tests</h1>
      <p class="page-subtitle">All test scenarios</p>

      <div class="test-scenarios">
        <example-basic-form-test />
        <example-age-based-logic-test />
        <example-multi-page-navigation-test />
      </div>
    </div>
  `,
  styles: [
    `
      .test-page-container {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-title {
        color: #1976d2;
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }

      .page-subtitle {
        color: #666;
        font-size: 1.1rem;
        margin-bottom: 2rem;
      }

      .test-scenarios {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }
    `,
  ],
})
export class EssentialTestsIndexComponent {}
