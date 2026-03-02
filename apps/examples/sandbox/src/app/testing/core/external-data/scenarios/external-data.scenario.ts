import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Scenario component for testing external data in conditional logic.
 *
 * This component manages external state (userRole, featureFlags) via signals
 * and passes them to the form config via `externalData`. This allows fields
 * to conditionally show/hide based on external application state.
 */
@Component({
  selector: 'example-external-data-scenario',
  imports: [DynamicForm, JsonPipe, MatButtonModule, MatChipsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="test-page">
      <h1>External Data in Conditional Logic</h1>

      <section class="test-scenario" data-testid="external-data-test">
        <h2>External Data Controls</h2>
        <p class="scenario-description">Toggle external state to see fields show/hide based on externalData conditions.</p>

        <div class="external-controls" data-testid="external-controls">
          <div class="control-group">
            <span class="control-label">User Role:</span>
            <mat-chip-set>
              <mat-chip [highlighted]="userRole() === 'guest'" (click)="setUserRole('guest')" data-testid="role-guest"> Guest </mat-chip>
              <mat-chip [highlighted]="userRole() === 'user'" (click)="setUserRole('user')" data-testid="role-user"> User </mat-chip>
              <mat-chip [highlighted]="userRole() === 'admin'" (click)="setUserRole('admin')" data-testid="role-admin"> Admin </mat-chip>
            </mat-chip-set>
          </div>

          <div class="control-group">
            <span class="control-label">Feature Flags:</span>
            <mat-chip-set>
              <mat-chip [highlighted]="advancedMode()" (click)="toggleAdvancedMode()" data-testid="flag-advanced">
                Advanced Mode: {{ advancedMode() ? 'ON' : 'OFF' }}
              </mat-chip>
              <mat-chip [highlighted]="betaFeatures()" (click)="toggleBetaFeatures()" data-testid="flag-beta">
                Beta Features: {{ betaFeatures() ? 'ON' : 'OFF' }}
              </mat-chip>
            </mat-chip-set>
          </div>

          <div class="current-state" data-testid="current-state">
            <strong>Current State:</strong>
            Role: {{ userRole() }} | Advanced: {{ advancedMode() }} | Beta: {{ betaFeatures() }}
          </div>
        </div>

        <form [dynamic-form]="config" [(value)]="formValue"></form>

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre data-testid="form-value">{{ formValue() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styles: `
    .external-controls {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }
    .control-group {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }
    .control-label {
      font-weight: 500;
      min-width: 100px;
    }
    .current-state {
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid #ddd;
      font-family: monospace;
      font-size: 0.875rem;
    }
    .debug-output {
      margin-top: 1rem;
    }
    .debug-output pre {
      background: #fafafa;
      padding: 1rem;
      border-radius: 4px;
      overflow: auto;
    }
  `,
})
export class ExternalDataScenarioComponent {
  // External state signals
  readonly userRole = signal<'guest' | 'user' | 'admin'>('guest');
  readonly advancedMode = signal(false);
  readonly betaFeatures = signal(false);

  // Form value
  readonly formValue = signal<Record<string, unknown>>({});

  // Form config with externalData - static object since signals handle reactivity internally
  readonly config = {
    externalData: {
      userRole: this.userRole,
      featureFlags: computed(() => ({
        advancedMode: this.advancedMode(),
        betaFeatures: this.betaFeatures(),
      })),
    },
    fields: [
      {
        key: 'name',
        type: 'input',
        label: 'Name',
        value: '',
        col: 12,
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        value: '',
        col: 12,
      },
      // Admin-only field
      {
        key: 'adminNotes',
        type: 'textarea',
        label: 'Admin Notes (Admin Only)',
        value: '',
        col: 12,
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'javascript',
              expression: "externalData.userRole !== 'admin'",
            },
          },
        ],
      },
      // Advanced mode field
      {
        key: 'advancedSettings',
        type: 'input',
        label: 'Advanced Settings (Advanced Mode Only)',
        value: '',
        col: 12,
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'javascript',
              expression: 'externalData.featureFlags.advancedMode !== true',
            },
          },
        ],
      },
      // Beta features field
      {
        key: 'betaOption',
        type: 'checkbox',
        label: 'Enable Beta Option (Beta Features Only)',
        value: false,
        col: 12,
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'javascript',
              expression: 'externalData.featureFlags.betaFeatures !== true',
            },
          },
        ],
      },
      // User or Admin field (not guest)
      {
        key: 'userProfile',
        type: 'input',
        label: 'User Profile (Logged In Only)',
        value: '',
        col: 12,
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'javascript',
              expression: "externalData.userRole === 'guest'",
            },
          },
        ],
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
        props: {
          type: 'submit',
          color: 'primary',
        },
        col: 12,
      },
    ],
  } as const satisfies FormConfig;

  setUserRole(role: 'guest' | 'user' | 'admin'): void {
    this.userRole.set(role);
  }

  toggleAdvancedMode(): void {
    this.advancedMode.update((v) => !v);
  }

  toggleBetaFeatures(): void {
    this.betaFeatures.update((v) => !v);
  }
}
