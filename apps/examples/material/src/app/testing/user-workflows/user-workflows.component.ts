import { Component } from '@angular/core';
import { RegistrationWorkflowComponent } from './registration-workflow.component';
import { ProfileEditWorkflowComponent } from './profile-edit-workflow.component';
import { ValidationWorkflowComponent } from './validation-workflow.component';
import { ResetWorkflowComponent } from './reset-workflow.component';
import { ContactFormWorkflowComponent } from './contact-form-workflow.component';

/**
 * User Workflows Test Container Component
 * Displays all user workflow test scenarios
 */
@Component({
  selector: 'app-user-workflows',
  standalone: true,
  imports: [
    RegistrationWorkflowComponent,
    ProfileEditWorkflowComponent,
    ValidationWorkflowComponent,
    ResetWorkflowComponent,
    ContactFormWorkflowComponent,
  ],
  template: `
    <div class="test-page">
      <h1>User Workflows Tests</h1>
      <app-registration-workflow />
      <app-profile-edit-workflow />
      <app-validation-workflow />
      <app-reset-workflow />
      <app-contact-form-workflow />
    </div>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class UserWorkflowsComponent {}
