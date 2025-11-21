import { Component } from '@angular/core';
import { AndLogicTestComponent } from './and-logic-test.component';
import { DisabledLogicTestComponent } from './disabled-logic-test.component';
import { HiddenLogicTestComponent } from './hidden-logic-test.component';
import { NestedAndWithinOrTestComponent } from './nested-and-within-or-test.component';
import { NestedOrWithinAndTestComponent } from './nested-or-within-and-test.component';
import { OrLogicTestComponent } from './or-logic-test.component';
import { ReadonlyLogicTestComponent } from './readonly-logic-test.component';

/**
 * Expression Based Logic Index Component
 * Renders all test scenarios on a single page for E2E testing
 */
@Component({
  selector: 'example-expression-based-logic-index',
  imports: [
    AndLogicTestComponent,
    DisabledLogicTestComponent,
    HiddenLogicTestComponent,
    NestedAndWithinOrTestComponent,
    NestedOrWithinAndTestComponent,
    OrLogicTestComponent,
    ReadonlyLogicTestComponent,
  ],
  template: `
    <div class="test-page-container">
      <h1 class="page-title">Expression Based Logic Tests</h1>
      <p class="page-subtitle">All test scenarios</p>

      <div class="test-scenarios">
        <example-and-logic-test />
        <example-disabled-logic-test />
        <example-hidden-logic-test />
        <example-nested-and-within-or-test />
        <example-nested-or-within-and-test />
        <example-or-logic-test />
        <example-readonly-logic-test />
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
export class ExpressionBasedLogicIndexComponent {}
