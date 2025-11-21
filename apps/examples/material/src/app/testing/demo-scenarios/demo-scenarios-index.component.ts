import { Component } from '@angular/core';
import { ConditionalFieldsScenarioComponent } from './conditional-fields.component';
import { CrossFieldValidationScenarioComponent } from './cross-field-validation.component';
import { ProfileManagementScenarioComponent } from './profile-management.component';
import { UserRegistrationScenarioComponent } from './user-registration.component';

/**
 * Demo Scenarios Index Component
 * Renders all test scenarios on a single page for E2E testing
 */
@Component({
  selector: 'example-demo-scenarios-index',
  imports: [
    ConditionalFieldsScenarioComponent,
    CrossFieldValidationScenarioComponent,
    ProfileManagementScenarioComponent,
    UserRegistrationScenarioComponent,
  ],
  template: `
    <div class="test-page-container">
      <h1 class="page-title">Demo Scenarios Tests</h1>
      <p class="page-subtitle">All test scenarios</p>

      <div class="test-scenarios">
        <example-conditional-fields-scenario />
        <example-cross-field-validation-scenario />
        <example-profile-management-scenario />
        <example-user-registration-scenario />
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
export class DemoScenariosIndexComponent {}
