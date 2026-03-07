import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TEST_SUITE_REGISTRY } from './shared/test-suite.registry';

@Component({
  selector: 'example-test-index',
  imports: [RouterLink],
  template: `
    <div class="test-index-container">
      <h1>E2E Test Scenarios</h1>
      <p class="subtitle">Browse and test all E2E test scenarios ({{ testSuites.length }} suites)</p>

      <div class="test-suites">
        @for (suite of testSuites; track suite.id) {
          <div class="suite-card">
            <h2>{{ suite.title }}</h2>
            <p class="suite-description">{{ suite.description }}</p>
            <span class="scenario-count">{{ suite.scenarios.length }} scenarios</span>
            <a [routerLink]="suite.path" class="suite-link">View Tests</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .test-index-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        color: #0d6efd;
        margin-bottom: 0.5rem;
      }

      .subtitle {
        color: #666;
        font-size: 1.1rem;
        margin-bottom: 2rem;
      }

      .test-suites {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }

      .suite-card {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 1.5rem;
        transition: all 0.2s;
      }

      .suite-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: #0d6efd;
      }

      .suite-card h2 {
        font-size: 1.25rem;
        color: #333;
        margin: 0 0 0.5rem 0;
      }

      .suite-description {
        color: #666;
        font-size: 0.9rem;
        margin: 0 0 1rem 0;
        line-height: 1.5;
      }

      .suite-link {
        display: inline-block;
        color: #0d6efd;
        text-decoration: none;
        font-weight: 500;
        padding: 0.5rem 1rem;
        border: 1px solid #0d6efd;
        border-radius: 4px;
        transition: all 0.2s;
      }

      .suite-link:hover {
        background: #0d6efd;
        color: white;
      }

      .scenario-count {
        display: block;
        color: #888;
        font-size: 0.8rem;
        margin-bottom: 0.75rem;
      }
    `,
  ],
})
export class TestIndexComponent {
  testSuites = TEST_SUITE_REGISTRY;
}
