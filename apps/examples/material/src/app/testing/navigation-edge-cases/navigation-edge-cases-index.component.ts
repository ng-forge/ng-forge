import { Component } from '@angular/core';
import { BrowserNavigationTestComponent } from './browser-navigation.component';
import { DestructionTestComponent } from './destruction-test.component';
import { InvalidNavigationTestComponent } from './invalid-navigation.component';
import { NetworkInterruptionTestComponent } from './network-interruption.component';
import { RapidNavigationTestComponent } from './rapid-navigation.component';
import { RefreshTestComponent } from './refresh-test.component';

/**
 * Navigation Edge Cases Index Component
 * Renders all test scenarios on a single page for E2E testing
 */
@Component({
  selector: 'example-navigation-edge-cases-index',
  imports: [
    BrowserNavigationTestComponent,
    DestructionTestComponent,
    InvalidNavigationTestComponent,
    NetworkInterruptionTestComponent,
    RapidNavigationTestComponent,
    RefreshTestComponent,
  ],
  template: `
    <div class="test-page-container">
      <h1 class="page-title">Navigation Edge Cases Tests</h1>
      <p class="page-subtitle">All test scenarios</p>

      <div class="test-scenarios">
        <example-browser-navigation-test />
        <example-destruction-test />
        <example-invalid-navigation-test />
        <example-network-interruption-test />
        <example-rapid-navigation-test />
        <example-refresh-test />
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
export class NavigationEdgeCasesIndexComponent {}
