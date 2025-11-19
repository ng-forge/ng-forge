import { EmailVerificationComponent } from './email-verification.component';
import { ConditionalPagesComponent } from './conditional-pages.component';
import { BusinessFlowComponent } from './business-flow.component';
import { CascadeDependenciesComponent } from './cascade-dependencies.component';
import { ProgressiveValidationComponent } from './progressive-validation.component';

export default [
  {
    path: 'email-verification',
    component: EmailVerificationComponent,
    data: { testId: 'cross-page-email-verification' },
  },
  {
    path: 'conditional-pages',
    component: ConditionalPagesComponent,
    data: { testId: 'conditional-pages' },
  },
  {
    path: 'business-flow',
    component: BusinessFlowComponent,
    data: { testId: 'business-flow' },
  },
  {
    path: 'cascade-dependencies',
    component: CascadeDependenciesComponent,
    data: { testId: 'cascade-dependencies' },
  },
  {
    path: 'progressive-validation',
    component: ProgressiveValidationComponent,
    data: { testId: 'progressive-validation' },
  },
];
