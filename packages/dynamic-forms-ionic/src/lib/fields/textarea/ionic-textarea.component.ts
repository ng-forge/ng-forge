import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { FormField, FieldTree } from '@angular/forms/signals';
import { IonNote, IonTextarea } from '@ionic/angular/standalone';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { IonicTextareaProps } from './ionic-textarea.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-ion-textarea',
  imports: [IonTextarea, IonNote, FormField, DynamicTextPipe, AsyncPipe],
  hostDirectives: [
    {
      directive: NgForgeField,
      inputs: ['field', 'key', 'label', 'placeholder', 'className', 'tabIndex', 'props', 'meta', 'validationMessages'],
    },
  ],
  providers: [provideMetaTarget('ion-textarea')],
  template: `
    @let f = formFieldTree();
    @let textareaId = field.key() + '-textarea';

    <ion-textarea
      [id]="textareaId"
      [formField]="f"
      [label]="(field.label() | dynamicText | async) ?? undefined"
      [labelPlacement]="props()?.labelPlacement ?? 'stacked'"
      [placeholder]="(field.placeholder() | dynamicText | async) ?? ''"
      [rows]="props()?.rows ?? 4"
      [autoGrow]="props()?.autoGrow ?? false"
      [counter]="props()?.counter ?? false"
      [minlength]="f().minLength?.()"
      [maxlength]="f().maxLength?.()"
      [color]="props()?.color"
      [fill]="props()?.fill ?? 'outline'"
      [shape]="props()?.shape"
      [readonly]="f().readonly()"
      [helperText]="field.errorsToDisplay().length === 0 ? ((props()?.hint | dynamicText | async) ?? undefined) : undefined"
      [attr.tabindex]="field.tabIndex()"
      [attr.aria-invalid]="field.ariaInvalid()"
      [attr.aria-required]="field.ariaRequired()"
      [attr.aria-describedby]="field.ariaDescribedBy()"
    />
    @if (field.errorsToDisplay()[0]; as error) {
      <ion-note color="danger" class="df-ion-error" [id]="field.errorId()" role="alert">{{ error.message }}</ion-note>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../../styles/_form-field.scss',
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
})
export default class IonicTextareaFieldComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly field = inject(NgForgeField);

  readonly props = input<IonicTextareaProps>();

  // Narrow FieldTree<unknown> back to FieldTree<string> for the inner control's
  // strict template type-check; runtime shape is correct.
  protected readonly formFieldTree = computed(() => this.field.field() as FieldTree<string>);

  constructor() {
    // ion-textarea encapsulates a native <textarea> in shadow DOM and does not automatically
    // propagate aria-describedby to it. This effect imperatively syncs the attribute
    // after a microtask to ensure Ionic has resolved the internal element.
    explicitEffect([this.field.ariaDescribedBy], ([describedBy]) => {
      queueMicrotask(() => {
        const ionTextarea = this.elementRef.nativeElement.querySelector('ion-textarea') as HTMLIonTextareaElement | null;
        if (ionTextarea?.getInputElement) {
          ionTextarea.getInputElement().then((textareaEl) => {
            if (!textareaEl) return;
            if (describedBy) {
              textareaEl.setAttribute('aria-describedby', describedBy);
            } else {
              textareaEl.removeAttribute('aria-describedby');
            }
          });
        }
      });
    });
  }
}
