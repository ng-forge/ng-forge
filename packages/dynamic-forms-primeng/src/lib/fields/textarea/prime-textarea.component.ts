import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { injectNgForgeField, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { PrimeTextareaProps } from './prime-textarea.type';
import { AsyncPipe } from '@angular/common';
import { PrimeTextareaControlComponent } from './prime-textarea-control.component';

@Component({
  selector: 'df-prime-textarea',
  imports: [DynamicTextPipe, AsyncPipe, FormField, PrimeTextareaControlComponent],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [NgForgeFieldHost],
  template: `
    <div class="df-prime-field">
      @if (ngf.label()) {
        <label [for]="inputId()" class="df-prime-label">{{ ngf.label() | dynamicText | async }}</label>
      }

      <df-prime-textarea-control
        [inputId]="inputId()"
        [formField]="ngf.field()"
        [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
        [rows]="props()?.rows || 4"
        [cols]="props()?.cols"
        [tabIndex]="ngf.tabIndex()"
        [autoResize]="props()?.autoResize ?? false"
        [styleClass]="textareaClasses()"
      />

      @if (ngf.errorsToDisplay()[0]; as error) {
        <small class="p-error" [id]="ngf.errorId()" role="alert">{{ error.message }}</small>
      } @else if (props()?.hint; as hint) {
        <small class="df-prime-hint" [id]="ngf.hintId()">{{ hint | dynamicText | async }}</small>
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
  protected readonly ngf = injectNgForgeField<string>();

  readonly props = input<PrimeTextareaProps>();

  protected readonly textareaClasses = computed(() => this.props()?.styleClass ?? '');

  protected readonly inputId = computed(() => `${this.ngf.key()}-textarea`);
}
