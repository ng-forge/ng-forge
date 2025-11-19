import { Route } from '@angular/router';
import { RegistrationJourneyTestComponent } from './registration-journey-test.component';
import { CheckoutJourneyTestComponent } from './checkout-journey-test.component';
import { SurveyJourneyTestComponent } from './survey-journey-test.component';

export const USER_JOURNEY_FLOWS_ROUTES: Route[] = [
  {
    path: 'registration-journey',
    component: RegistrationJourneyTestComponent,
  },
  {
    path: 'checkout-journey',
    component: CheckoutJourneyTestComponent,
  },
  {
    path: 'survey-journey',
    component: SurveyJourneyTestComponent,
  },
  {
    path: '',
    redirectTo: 'registration-journey',
    pathMatch: 'full',
  },
];
