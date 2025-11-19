import { RegistrationWorkflowComponent } from './registration-workflow.component';
import { ProfileEditWorkflowComponent } from './profile-edit-workflow.component';
import { ValidationWorkflowComponent } from './validation-workflow.component';
import { ResetWorkflowComponent } from './reset-workflow.component';
import { ContactFormWorkflowComponent } from './contact-form-workflow.component';

export default [
  {
    path: '',
    loadComponent: () => import('./user-workflows-index.component').then((m) => m.UserWorkflowsIndexComponent),
  },
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
