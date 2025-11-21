import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Scenario {
  id: string;
  title: string;
  description: string;
  features: string[];
  route: string;
  status: 'Ready' | 'In Progress' | 'Planned';
}

@Component({
  selector: 'example-scenario-list-index',
  imports: [RouterLink],
  template: `
    <div class="demo-header">
      <h1>Dynamic Form Material Demo</h1>
      <p>E2E Testing Scenarios</p>
    </div>

    <div class="scenarios-container">
      <h2>E2E Testing Scenarios</h2>

      <div class="scenario-grid">
        @for (scenario of scenarios; track scenario.id) {
          <a [routerLink]="scenario.route" class="scenario-card" [attr.data-testid]="scenario.id">
            <div class="scenario-header">
              <h3>{{ scenario.title }}</h3>
              <span class="badge">{{ scenario.status }}</span>
            </div>
            <p>{{ scenario.description }}</p>
            <ul>
              @for (feature of scenario.features; track feature) {
                <li>{{ feature }}</li>
              }
            </ul>
          </a>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .demo-header {
        background: #1976d2;
        color: white;
        padding: 2rem;
        text-align: center;
      }

      .demo-header h1 {
        margin: 0 0 0.5rem 0;
        font-size: 2rem;
      }

      .demo-header p {
        margin: 0;
        font-size: 1.2rem;
        opacity: 0.9;
      }

      .scenarios-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .scenarios-container h2 {
        color: #333;
        margin-bottom: 2rem;
      }

      .scenario-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
      }

      .scenario-card {
        background: white;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 1.5rem;
        text-decoration: none;
        color: inherit;
        display: block;
        transition: all 0.3s ease;
      }

      .scenario-card:hover {
        border-color: #1976d2;
        box-shadow: 0 4px 12px rgba(25, 118, 210, 0.15);
        transform: translateY(-2px);
      }

      .scenario-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.75rem;
      }

      .scenario-card h3 {
        margin: 0;
        color: #1976d2;
        font-size: 1.25rem;
      }

      .badge {
        background: #4caf50;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
      }

      .scenario-card p {
        color: #666;
        margin: 0 0 1rem 0;
        line-height: 1.5;
      }

      .scenario-card ul {
        margin: 0;
        padding-left: 1.25rem;
        list-style-type: disc;
      }

      .scenario-card li {
        color: #555;
        margin-bottom: 0.5rem;
        line-height: 1.4;
      }

      .scenario-card li:last-child {
        margin-bottom: 0;
      }
    `,
  ],
})
export class ScenarioListIndexComponent {
  scenarios: Scenario[] = [
    {
      id: 'single-page-scenario',
      title: 'Single Page Form',
      description: 'Test comprehensive single-page forms with all field types',
      features: ['All Material field types', 'Validation patterns', 'Real-time updates', 'Error handling'],
      route: 'single-page',
      status: 'Ready',
    },
    {
      id: 'multi-page-scenario',
      title: 'Multi-Page Form',
      description: 'Test paginated forms with navigation and state persistence',
      features: ['Page navigation', 'Data persistence', 'Progress tracking', 'Step validation'],
      route: 'multi-page',
      status: 'Ready',
    },
    {
      id: 'cross-field-validation-scenario',
      title: 'Cross-Field Validation',
      description: 'Test validators that depend on multiple field values',
      features: ['Conditional validation', 'Field dependencies', 'Dynamic error messages', 'Real-time feedback'],
      route: 'cross-field-validation',
      status: 'Ready',
    },
    {
      id: 'user-registration-scenario',
      title: 'User Registration',
      description: 'Complete user registration flow with complex validation',
      features: ['Email validation', 'Password strength', 'Async username check', 'Terms acceptance'],
      route: 'user-registration',
      status: 'Ready',
    },
    {
      id: 'profile-management-scenario',
      title: 'Profile Management',
      description: 'User profile editing with dynamic field groups',
      features: ['Conditional fields', 'Array fields', 'File uploads', 'Save/Cancel actions'],
      route: 'profile-management',
      status: 'Ready',
    },
  ];
}
