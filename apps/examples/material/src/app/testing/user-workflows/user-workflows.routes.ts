import { Routes } from '@angular/router';
import { RegistrationWorkflowComponent } from './registration-workflow.component';
import { ProfileEditWorkflowComponent } from './profile-edit-workflow.component';
import { ValidationWorkflowComponent } from './validation-workflow.component';
import { ResetWorkflowComponent } from './reset-workflow.component';
import { ContactFormWorkflowComponent } from './contact-form-workflow.component';

export const USER_WORKFLOWS_ROUTES: Routes = [
  {
    path: 'registration',
    component: RegistrationWorkflowComponent,
  },
  {
    path: 'profile-edit',
    component: ProfileEditWorkflowComponent,
  },
  {
    path: 'validation',
    component: ValidationWorkflowComponent,
  },
  {
    path: 'reset',
    component: ResetWorkflowComponent,
  },
  {
    path: 'contact-form',
    component: ContactFormWorkflowComponent,
  },
];
