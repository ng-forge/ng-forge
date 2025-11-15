import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { PersonalInfoFormComponent } from './components/personal-info-form.component';
import { AccountSetupFormComponent } from './components/account-setup-form.component';
import { ConfirmationFormComponent } from './components/confirmation-form.component';

@Component({
  imports: [JsonPipe, PersonalInfoFormComponent, AccountSetupFormComponent, ConfirmationFormComponent],
  selector: 'demo-user-registration',
  template: `
    <div class="user-registration-demo">
      <h1>User Registration Flow Demo</h1>
      <p>Experience a complete user registration process with realistic data requirements and validation.</p>

      <div class="demo-controls">
        @for (scenario of scenarios; track scenario.id) {
          <button (click)="loadScenario(scenario.id)" [class.active]="currentScenario() === scenario.id" class="scenario-btn">
            {{ scenario.name }}
          </button>
        }
      </div>

      <div class="form-container">
        @switch (currentScenario()) {
          @case ('personal-info') {
            <demo-personal-info-form (submitted)="onSubmit($event)" />
          }
          @case ('account-setup') {
            <demo-account-setup-form (submitted)="onSubmit($event)" />
          }
          @case ('confirmation') {
            <demo-confirmation-form (submitted)="onSubmit($event)" />
          }
        }
      </div>

      @if (showDebug()) {
        <div class="debug-section">
          <details>
            <summary>Current Scenario</summary>
            <pre>{{ currentScenario() | json }}</pre>
          </details>

          <details>
            <summary>Submission History</summary>
            @for (submission of submissions(); track submission; let i = $index) {
              <div class="submission-item">
                <h4>Submission {{ i + 1 }}</h4>
                <pre>{{ submission | json }}</pre>
              </div>
            }
          </details>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .user-registration-demo {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;

        h1 {
          color: #1976d2;
          margin-bottom: 0.5rem;
        }

        > p {
          color: #666;
          margin-bottom: 2rem;
        }
      }

      .demo-controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
      }

      .scenario-btn {
        padding: 0.75rem 1.5rem;
        border: 2px solid #1976d2;
        background: white;
        color: #1976d2;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #f5f5f5;
        }

        &.active {
          background: #1976d2;
          color: white;
        }
      }

      .form-container {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 2rem;
        margin-bottom: 2rem;
      }

      .debug-section {
        details {
          margin-bottom: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 4px;

          summary {
            padding: 1rem;
            background: #f5f5f5;
            cursor: pointer;
            font-weight: 500;
          }

          pre {
            padding: 1rem;
            background: #f9f9f9;
            overflow-x: auto;
            margin: 0;
          }
        }
      }

      .submission-item {
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 1rem;
        margin-bottom: 1rem;

        h4 {
          margin: 0 0 0.5rem 0;
          color: #1976d2;
        }
      }
    `,
  ],
})
export class UserRegistrationDemoComponent {
  currentScenario = signal<string>('personal-info');
  showDebug = signal(true);
  submissions = signal<any[]>([]);

  scenarios = [
    {
      id: 'personal-info',
      name: 'Personal Information',
      description: 'Basic personal details and address',
    },
    {
      id: 'account-setup',
      name: 'Account Setup',
      description: 'Login credentials and security questions',
    },
    {
      id: 'confirmation',
      name: 'Review & Confirmation',
      description: 'Terms & conditions with final confirmation',
    },
  ];

  loadScenario(scenarioId: string) {
    this.currentScenario.set(scenarioId);
  }

  onSubmit(value: Partial<Record<string, any>> | undefined) {
    console.log('Form submitted:', value);
    const currentSubmissions = this.submissions();
    this.submissions.set([
      ...currentSubmissions,
      {
        timestamp: new Date().toISOString(),
        scenario: this.currentScenario(),
        data: value,
      },
    ]);
  }
}
