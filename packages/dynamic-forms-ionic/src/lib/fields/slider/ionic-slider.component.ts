import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { IonNote, IonRange } from '@ionic/angular/standalone';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, provideHostMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { IonicSliderProps } from './ionic-slider.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-ion-slider',
  imports: [IonRange, IonNote, FormField, DynamicTextPipe, AsyncPipe],
  hostDirectives: [
    {
      directive: NgForgeField,
      inputs: ['field', 'key', 'label', 'placeholder', 'className', 'tabIndex', 'props', 'meta', 'validationMessages'],
    },
  ],
  providers: [provideHostMetaTarget()],
  template: `
    @let f = formFieldTree();
    @let inputId = field.key() + '-input';

    <ion-range
      [id]="inputId"
      [formField]="f"
      [label]="(field.label() | dynamicText | async) ?? undefined"
      [labelPlacement]="props()?.labelPlacement ?? 'stacked'"
      [min]="f().min?.() ?? props()?.min ?? 0"
      [max]="f().max?.() ?? props()?.max ?? 100"
      [step]="step() ?? props()?.step ?? 1"
      [dualKnobs]="props()?.dualKnobs ?? false"
      [pin]="props()?.pin ?? false"
      [pinFormatter]="props()?.pinFormatter ?? defaultPinFormatter"
      [ticks]="props()?.ticks ?? false"
      [snaps]="props()?.snaps ?? false"
      [color]="props()?.color ?? 'primary'"
      [attr.tabindex]="field.tabIndex()"
      [attr.aria-invalid]="field.ariaInvalid()"
      [attr.aria-required]="field.ariaRequired()"
      [attr.aria-describedby]="field.ariaDescribedBy()"
    />

    @if (field.errorsToDisplay()[0]; as error) {
      <ion-note color="danger" class="df-ion-error" [id]="field.errorId()" role="alert">{{ error.message }}</ion-note>
    } @else if (props()?.hint; as hint) {
      <ion-note class="df-ion-hint" [id]="field.hintId()">{{ hint | dynamicText | async }}</ion-note>
    }
  `,
  styleUrl: '../../styles/_form-field.scss',
  styles: [
    `
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IonicSliderFieldComponent {
  protected readonly field = inject(NgForgeField);

  readonly step = input<number>();
  readonly props = input<IonicSliderProps>();

  // Narrow FieldTree<unknown> back to FieldTree<number> for the inner control's
  // strict template type-check; runtime shape is correct.
  protected readonly formFieldTree = computed(() => this.field.field() as FieldTree<number>);

  protected defaultPinFormatter = (value: number) => String(value);
}
