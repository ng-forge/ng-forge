# User Journey Flows Test Components

This folder contains refactored test components for user journey flows, split from the original `user-journey-flows-test.component.ts`.

## Structure

- **registration-journey-test.component.ts** - Complete user registration flow (5 pages)
  - Welcome & Account Type
  - Personal Information
  - Address Information
  - Security & Preferences
  - Review & Submit

- **checkout-journey-test.component.ts** - E-commerce checkout journey (4 pages)
  - Cart Review
  - Shipping Information
  - Billing & Payment
  - Order Confirmation

- **survey-journey-test.component.ts** - Customer satisfaction survey (4 pages)
  - Introduction & Demographics
  - Product/Service Experience
  - Feedback & Suggestions
  - Contact & Completion

- **user-journey-flows.routes.ts** - Angular routing configuration for all journey components

- **index.ts** - Barrel export file for easy imports

## Shared Resources

All components use the following shared files:

- `../test-component.html` - Shared template with form display and debug output
- `../test-component.styles.scss` - Shared styling for test scenarios

## Usage

Import routes in your main routing configuration:

```typescript
import { USER_JOURNEY_FLOWS_ROUTES } from './user-journey-flows/user-journey-flows.routes';

const routes: Routes = [
  {
    path: 'user-journey-flows',
    children: USER_JOURNEY_FLOWS_ROUTES,
  },
];
```

Or import individual components:

```typescript
import { RegistrationJourneyTestComponent, CheckoutJourneyTestComponent, SurveyJourneyTestComponent } from './user-journey-flows';
```
