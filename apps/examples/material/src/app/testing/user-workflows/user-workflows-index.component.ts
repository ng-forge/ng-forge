import { Component } from '@angular/core';
import { ContactFormWorkflowComponent } from './contact-form-workflow.component';
import { ProfileEditWorkflowComponent } from './profile-edit-workflow.component';
import { RegistrationWorkflowComponent } from './registration-workflow.component';
import { ResetWorkflowComponent } from './reset-workflow.component';
import { ValidationWorkflowComponent } from './validation-workflow.component';

/**
 * User Workflows Index Component
 * Renders all test scenarios on a single page for E2E testing
 */
@Component({
  selector: 'example-user-workflows-index',
  imports: [
    ContactFormWorkflowComponent,
    ProfileEditWorkflowComponent,
    RegistrationWorkflowComponent,
    ResetWorkflowComponent,
    ValidationWorkflowComponent,
  ],
  template: `
    <div class="test-page-container">
      <h1 class="page-title">User Workflows Tests</h1>
      <p class="page-subtitle">All test scenarios</p>

      <div class="test-scenarios">
        <example-contact-form-workflow />
        <example-profile-edit-workflow />
        <example-registration-workflow />
        <example-reset-workflow />
        <example-validation-workflow />
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
export class UserWorkflowsIndexComponent {}
