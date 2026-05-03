import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, NG_FORGE_FIELD_INPUTS, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { PrimeTextareaProps } from './prime-textarea.type';
import { AsyncPipe } from '@angular/common';
import { PrimeTextareaControlComponent } from './prime-textarea-control.component';

@Component({
  selector: 'df-prime-textarea',
  imports: [DynamicTextPipe, AsyncPipe, FormField, PrimeTextareaControlComponent],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  providers: [provideMetaTarget('textarea')],
  template: `
    <div class="df-prime-field">
      @if (field.label()) {
        <label [for]="inputId()" class="df-prime-label">{{ field.label() | dynamicText | async }}</label>
      }

      <df-prime-textarea-control
        [id]="inputId()"
        [formField]="formFieldTree()"
        [meta]="field.meta()"
        [placeholder]="(field.placeholder() | dynamicText | async) ?? ''"
        [rows]="props()?.rows || 4"
        [cols]="props()?.cols"
        [tabIndex]="field.tabIndex()"
        [autoResize]="props()?.autoResize ?? false"
        [ariaDescribedBy]="field.ariaDescribedBy()"
        [styleClass]="textareaClasses()"
      />

      @if (field.errorsToDisplay()[0]; as error) {
        <small class="p-error" [id]="field.errorId()" role="alert">{{ error.message }}</small>
      } @else if (props()?.hint; as hint) {
        <small class="df-prime-hint" [id]="field.hintId()">{{ hint | dynamicText | async }}</small>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
})
export default class PrimeTextareaFieldComponent {
  protected readonly field = inject(NgForgeField);

  readonly props = input<PrimeTextareaProps>();

  // Narrow FieldTree<unknown> to FieldTree<string> for the inner control's strict template type-check.
  protected readonly formFieldTree = computed(() => this.field.field() as FieldTree<string>);

  protected readonly textareaClasses = computed(() => this.props()?.styleClass ?? '');

  protected readonly inputId = computed(() => `${this.field.key()}-textarea`);
}
