import { Component } from '@angular/core';
import { BackwardNavigationComponent } from './backward-navigation.component';
import { DirectNavigationComponent } from './direct-navigation.component';
import { MultiPageRegistrationComponent } from './multi-page-registration.component';
import { PageTransitionsComponent } from './page-transitions.component';
import { ValidationNavigationComponent } from './validation-navigation.component';

/**
 * Multi-Page Navigation Index Component
 * Renders all test scenarios on a single page for E2E testing
 */
@Component({
  selector: 'example-multi-page-navigation-index',
  imports: [
    BackwardNavigationComponent,
    DirectNavigationComponent,
    MultiPageRegistrationComponent,
    PageTransitionsComponent,
    ValidationNavigationComponent,
  ],
  template: `
    <div class="test-page-container">
      <h1 class="page-title">Multi-Page Navigation Tests</h1>
      <p class="page-subtitle">All test scenarios</p>

      <div class="test-scenarios">
        <example-multi-page-registration />
        <example-validation-navigation />
        <example-backward-navigation />
        <example-direct-navigation />
        <example-page-transitions />
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
export class MultiPageNavigationIndexComponent {}
