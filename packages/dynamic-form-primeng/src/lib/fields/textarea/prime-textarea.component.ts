import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import {
  DynamicText, DynamicTextPipe,
  ValidationMessages,
  createResolvedErrorsSignal,
  shouldShowErrors,
} from '@ng-forge/dynamic-form';
import { PrimeTextareaComponent, PrimeTextareaProps } from './prime-textarea.type';
import { AsyncPipe } from '@angular/common';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'df-prime-textarea',
  imports: [TextareaModule, Field, DynamicTextPipe, AsyncPipe, FormsModule],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="df-prime-field">
      @if (label()) {
      <label [for]="inputId()" class="df-prime-label">{{ label() | dynamicText | async }}</label>
      }

      <textarea
        pInputTextarea
        [id]="inputId()"
        [(ngModel)]="f().value"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [rows]="props()?.rows || 4"
        [cols]="props()?.cols"
        [maxlength]="props()?.maxlength ?? null"
        [autoResize]="props()?.autoResize ?? false"
        [attr.tabindex]="tabIndex()"
        [class]="props()?.styleClass || ''"
        [disabled]="f().disabled()"
      ></textarea>

      @if (props()?.hint; as hint) {
      <small class="df-prime-hint">{{ hint | dynamicText | async }}</small>
      }

      @if (showErrors()) {
      @for (error of resolvedErrors(); track error.kind) {
        <small class="p-error">{{ error.message }}</small>
      }
    }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
})
export default class PrimeTextareaFieldComponent implements PrimeTextareaComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<PrimeTextareaProps>();

  readonly inputId = computed(() => `${this.key()}-textarea`);
}
