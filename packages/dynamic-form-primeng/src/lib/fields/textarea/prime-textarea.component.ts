import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-form';
import { PrimeErrorsComponent } from '../../shared/prime-errors.component';
import { PrimeTextareaComponent, PrimeTextareaProps } from './prime-textarea.type';
import { AsyncPipe } from '@angular/common';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'df-prime-textarea',
  imports: [TextareaModule, FloatLabelModule, PrimeErrorsComponent, Field, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <div class="p-field" [class]="className() || ''">
      @if (label()) {
      <p-floatlabel>
        <textarea
          pInputTextarea
          [field]="f"
          [id]="key()"
          [placeholder]="(placeholder() | dynamicText | async) ?? ''"
          [rows]="props()?.rows || 4"
          [autoResize]="props()?.autoResize ?? false"
          [attr.tabindex]="tabIndex()"
          [class]="props()?.styleClass || ''"
        ></textarea>
        <label [for]="key()">{{ label() | dynamicText | async }}</label>
      </p-floatlabel>
      } @else {
      <textarea
        pInputTextarea
        [field]="f"
        [id]="key()"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [rows]="props()?.rows || 4"
        [autoResize]="props()?.autoResize ?? false"
        [attr.tabindex]="tabIndex()"
        [class]="props()?.styleClass || ''"
      ></textarea>
      } @if (props()?.hint; as hint) {
      <small class="p-text-secondary">{{ hint | dynamicText | async }}</small>
      }

      <df-prime-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" />
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
}
