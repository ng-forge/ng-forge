import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'example-test-index',
  imports: [RouterLink],
  template: `
    <div class="test-index-container">
      <h1>E2E Test Scenarios</h1>
      <p class="subtitle">Browse and test all E2E test scenarios</p>

      <div class="test-suites">
        @for (suite of testSuites; track suite) {
          <div class="suite-card">
            <h2>{{ suite.title }}</h2>
            <p class="suite-description">{{ suite.description }}</p>
            <a [routerLink]="suite.path" class="suite-link">View Tests →</a>
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
        color: #1976d2;
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
        border-color: #1976d2;
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
        color: #1976d2;
        text-decoration: none;
        font-weight: 500;
        padding: 0.5rem 1rem;
        border: 1px solid #1976d2;
        border-radius: 4px;
        transition: all 0.2s;
      }

      .suite-link:hover {
        background: #1976d2;
        color: white;
      }
    `,
  ],
})
export class TestIndexComponent {
  testSuites = [
    {
      title: 'Advanced Validation',
      description: 'Custom validators, cross-field validation, conditional validation',
      path: '/test/advanced-validation',
    },
    {
      title: 'Array Fields',
      description: 'Dynamic array operations, add/remove items, nested arrays',
      path: '/test/array-fields',
    },
    {
      title: 'Async Validation',
      description: 'HTTP validators, resource-based validation, error handling',
      path: '/test/async-validation',
    },
    {
      title: 'Comprehensive Field Tests',
      description: 'All field types, validation, grid layouts, state management',
      path: '/test/comprehensive-field-tests',
    },
    {
      title: 'Cross-Field Validation',
      description: 'Password matching, conditional requirements, dependent fields',
      path: '/test/cross-field-validation',
    },
    {
      title: 'Cross-Page Validation',
      description: 'Multi-page forms with validation across pages',
      path: '/test/cross-page-validation',
    },
    {
      title: 'Demo Scenarios',
      description: 'Real-world form scenarios and use cases',
      path: '/test/demo-scenarios',
    },
    {
      title: 'Error Handling',
      description: 'Form errors, validation errors, submission errors',
      path: '/test/error-handling',
    },
    {
      title: 'Essential Tests',
      description: 'Core functionality tests',
      path: '/test/essential-tests',
    },
    {
      title: 'Expression-Based Logic',
      description: 'Dynamic expressions, conditional logic',
      path: '/test/expression-based-logic',
    },
    {
      title: 'Form Reset & Clear',
      description: 'Reset to defaults, clear forms, state management',
      path: '/test/form-reset-clear',
    },
    {
      title: 'Material Components',
      description: 'Datepicker, slider, toggle, multi-checkbox components',
      path: '/test/material-components',
    },
    {
      title: 'Multi-Page Navigation',
      description: 'Page transitions, navigation, data persistence',
      path: '/test/multi-page-navigation',
    },
    {
      title: 'Navigation Edge Cases',
      description: 'Page refresh, network interruptions, invalid navigation',
      path: '/test/navigation-edge-cases',
    },
    {
      title: 'Scenario List',
      description: 'Browse all available test scenarios',
      path: '/test/scenarios',
    },
    {
      title: 'User Journey Flows',
      description: 'Complete user workflows from start to finish',
      path: '/test/user-journey-flows',
    },
    {
      title: 'User Workflows',
      description: 'Registration, profile editing, form submission',
      path: '/test/user-workflows',
    },
  ];
}
