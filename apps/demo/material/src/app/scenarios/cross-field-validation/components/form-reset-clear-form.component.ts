import { Component, output, signal } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { formResetClearConfig } from '../configs/form-reset-clear-config';
import { JsonPipe, DatePipe } from '@angular/common';

@Component({
  imports: [DynamicForm, JsonPipe, DatePipe],
  selector: 'demo-form-reset-clear-form',
  template: `
    <div>
      <dynamic-form [config]="config" (submitted)="onSubmit($event)" (reset)="onReset()" (cleared)="onClear()" [(value)]="formValue" />

      @if (eventLog().length > 0) {
      <div class="event-log">
        <h3>Event Log</h3>
        @for (event of eventLog(); track event.timestamp) {
        <div class="event-item" [class]="event.type">
          <span class="event-type">{{ event.type }}</span>
          <span class="event-time">{{ event.timestamp | date : 'HH:mm:ss' }}</span>
        </div>
        }
      </div>
      } @if (lastSubmission()) {
      <div class="submission-display">
        <h3>Last Submission</h3>
        <pre>{{ lastSubmission() | json }}</pre>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .event-log {
        margin-top: 2rem;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 4px;

        h3 {
          margin-top: 0;
          color: #1976d2;
        }
      }

      .event-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;
        margin: 0.5rem 0;
        border-radius: 4px;
        background: white;

        &.reset {
          border-left: 4px solid #ff9800;
        }

        &.clear {
          border-left: 4px solid #f44336;
        }

        &.submit {
          border-left: 4px solid #4caf50;
        }

        .event-type {
          font-weight: 500;
          text-transform: capitalize;
        }

        .event-time {
          color: #666;
          font-size: 0.875rem;
        }
      }

      .submission-display {
        margin-top: 2rem;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 4px;

        h3 {
          margin-top: 0;
          color: #1976d2;
        }

        pre {
          background: white;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
        }
      }
    `,
  ],
})
export class FormResetClearFormComponent {
  submitted = output<Partial<Record<string, any>> | undefined>();
  config = formResetClearConfig;
  formValue = signal<Partial<Record<string, any>> | undefined>(undefined);
  eventLog = signal<{ type: string; timestamp: Date }[]>([]);
  lastSubmission = signal<Partial<Record<string, any>> | undefined>(undefined);

  onReset() {
    console.log('Form was reset to default values');
    this.addEvent('reset');
  }

  onClear() {
    console.log('Form was cleared');
    this.addEvent('clear');
  }

  onSubmit(value: Partial<Record<string, any>> | undefined) {
    console.log('Form submitted:', value);
    this.lastSubmission.set(value);
    this.addEvent('submit');
    this.submitted.emit(value);
  }

  private addEvent(type: string) {
    const currentLog = this.eventLog();
    this.eventLog.set([...currentLog, { type, timestamp: new Date() }]);
  }
}
