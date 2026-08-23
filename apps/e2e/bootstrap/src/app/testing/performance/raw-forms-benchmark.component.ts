import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';

const FIELD_COUNT = 240;
const KEYS = Array.from({ length: FIELD_COUNT }, (_, i) => `field${i + 1}`);

/**
 * Bare Signal Forms vs bare Reactive Forms, same field count, same DOM, no form library
 * on either side. `?raw=signal` or `?raw=reactive`.
 */
@Component({
  selector: 'bs-raw-forms-benchmark',
  imports: [ReactiveFormsModule, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="benchmark" data-testid="raw-benchmark" [attr.data-mode]="mode" [attr.data-total-fields]="count">
      <h1>Raw {{ mode }} forms, {{ count }} controls</h1>

      @if (mode === 'signal') {
        @for (key of keys; track key) {
          <div class="mb-3">
            <label class="form-label" [attr.for]="key + '-input'">{{ key }}</label>
            <input class="form-control" [formField]="signalForm[key]" [id]="key + '-input'" />
          </div>
        }
      } @else {
        <form [formGroup]="reactiveForm">
          @for (key of keys; track key) {
            <div class="mb-3">
              <label class="form-label" [attr.for]="key + '-input'">{{ key }}</label>
              <input class="form-control" [formControlName]="key" [id]="key + '-input'" />
            </div>
          }
        </form>
      }
    </main>
  `,
  styles: `
    :host {
      display: block;
    }
    .benchmark {
      width: min(100% - 2rem, 64rem);
      margin: 1rem auto;
    }
  `,
})
export class RawFormsBenchmarkComponent {
  readonly keys = KEYS;
  readonly count = FIELD_COUNT;
  readonly mode = new URL(location.href).searchParams.get('raw') === 'reactive' ? 'reactive' : 'signal';

  private readonly model = signal<Record<string, string>>(Object.fromEntries(KEYS.map((k) => [k, ''])));
  readonly signalForm = form(this.model) as unknown as Record<string, never>;

  readonly reactiveForm = new FormGroup(Object.fromEntries(KEYS.map((k) => [k, new FormControl('')])));
}
