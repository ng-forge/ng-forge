import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'demo-scenario-list',
  template: `
    <div class="scenario-container">
      <h2>E2E Testing Scenarios</h2>
      <p>Select a scenario to test dynamic form behavior with Material Design components:</p>

      <div class="scenario-grid">
        <a class="scenario-card" routerLink="/single-page" data-testid="single-page-scenario">
          <h3>Single Page Form <span class="badge ready">Ready</span></h3>
          <p>Test comprehensive single-page forms with various field types and validations.</p>
          <ul>
            <li>All Material field types</li>
            <li>Real-time validation</li>
            <li>Form submission</li>
            <li>Default styling</li>
          </ul>
        </a>

        <a class="scenario-card" routerLink="/multi-page" data-testid="multi-page-scenario">
          <h3>Multi-Page Form <span class="badge ready">Ready</span></h3>
          <p>Test paginated forms with navigation and state persistence.</p>
          <ul>
            <li>Page navigation</li>
            <li>State preservation</li>
            <li>Cross-page validation</li>
            <li>Progress indicators</li>
          </ul>
        </a>

        <a class="scenario-card" routerLink="/cross-field-validation" data-testid="cross-field-validation-scenario">
          <h3>Cross-Field Validation <span class="badge ready">Ready</span></h3>
          <p>Test complex validation scenarios with field dependencies.</p>
          <ul>
            <li>Conditional field display</li>
            <li>Dependent validations</li>
            <li>Dynamic field updates</li>
            <li>Error state management</li>
          </ul>
        </a>

        <a class="scenario-card" routerLink="/user-registration" data-testid="user-registration-scenario">
          <h3>User Registration Flow <span class="badge ready">Ready</span></h3>
          <p>Test complete user registration with realistic data requirements.</p>
          <ul>
            <li>Personal information</li>
            <li>Account settings</li>
            <li>Terms & conditions</li>
            <li>Confirmation flow</li>
          </ul>
        </a>

        <a class="scenario-card" routerLink="/profile-management" data-testid="profile-management-scenario">
          <h3>Profile Management <span class="badge ready">Ready</span></h3>
          <p>Test profile editing with pre-populated data and updates.</p>
          <ul>
            <li>Pre-filled forms</li>
            <li>Partial updates</li>
            <li>Data persistence</li>
            <li>Change notifications</li>
          </ul>
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .scenario-container {
        max-width: 1200px;
        margin: 0 auto;

        h2 {
          color: #1976d2;
          margin-bottom: 0.5rem;
          font-size: 2rem;
          font-weight: 400;
        }

        > p {
          color: #666;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }
      }

      .scenario-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
      }

      .scenario-card {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 1.5rem;
        text-decoration: none;
        color: inherit;
        transition: all 0.2s ease;

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #1976d2;
          transform: translateY(-2px);
        }

        h3 {
          color: #1976d2;
          margin: 0 0 0.75rem 0;
          font-size: 1.25rem;
          font-weight: 500;
        }

        > p {
          color: #666;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        ul {
          margin: 0;
          padding-left: 1.25rem;

          li {
            color: #888;
            margin-bottom: 0.25rem;
            font-size: 0.9rem;
          }
        }
      }

      .coming-soon {
        opacity: 0.7;
        cursor: default;

        &:hover {
          transform: none;
          box-shadow: none;
          border-color: #e0e0e0;
        }
      }

      .badge {
        color: white;
        padding: 0.2rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
        margin-left: 0.5rem;

        &.ready {
          background: #4caf50;
        }

        &:not(.ready) {
          background: #ff9800;
        }
      }
    `,
  ],
})
export class ScenarioListComponent {}
