import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Index component for Submission Behavior Tests
 */
@Component({
  selector: 'example-submission-behavior-index',
  imports: [RouterLink],
  template: `
    <div class="test-page">
      <h1>Submission Behavior Tests</h1>
      <p class="scenario-description">
        Tests for form submission behavior including button disabled states, submission configuration, and form/page validity.
      </p>

      <nav class="test-nav">
        <a routerLink="basic-submission">Basic Submission</a>
        <a routerLink="button-disabled-states">Button Disabled States</a>
        <a routerLink="next-button-page-validation">Next Button Page Validation</a>
        <a routerLink="custom-button-logic">Custom Button Logic</a>
      </nav>
    </div>
  `,
  styleUrl: '../test-styles.scss',
  styles: [
    `
      .test-nav {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .test-nav a {
        padding: 0.75rem 1rem;
        background: #1976d2;
        color: white;
        text-decoration: none;
        border-radius: 4px;
      }
      .test-nav a:hover {
        background: #1565c0;
      }
    `,
  ],
})
export class SubmissionBehaviorIndexComponent {}
