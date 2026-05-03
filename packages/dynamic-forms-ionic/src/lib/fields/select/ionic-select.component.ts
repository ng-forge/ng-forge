import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { IonNote, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { DynamicTextPipe, FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { NgForgeField, NG_FORGE_FIELD_INPUTS, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { IonicSelectProps } from './ionic-select.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-ion-select',
  imports: [IonSelect, IonSelectOption, IonNote, FormField, DynamicTextPipe, AsyncPipe],
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  providers: [provideMetaTarget('ion-select')],
  template: `
    @let f = formFieldTree();
    @let selectId = field.key() + '-select';

    <ion-select
      [id]="selectId"
      [formField]="f"
      [label]="(field.label() | dynamicText | async) ?? undefined"
      [labelPlacement]="props()?.labelPlacement ?? 'stacked'"
      [placeholder]="(field.placeholder() | dynamicText | async) ?? ''"
      [multiple]="props()?.multiple ?? false"
      [compareWith]="props()?.compareWith ?? defaultCompare"
      [interface]="props()?.interface ?? 'alert'"
      [interfaceOptions]="props()?.interfaceOptions ?? {}"
      [cancelText]="props()?.cancelText ?? 'Cancel'"
      [okText]="props()?.okText ?? 'OK'"
      [color]="props()?.color"
      [fill]="props()?.fill ?? 'outline'"
      [shape]="props()?.shape"
      [attr.tabindex]="field.tabIndex()"
      [attr.aria-invalid]="field.ariaInvalid()"
      [attr.aria-required]="field.ariaRequired()"
      [attr.aria-describedby]="field.ariaDescribedBy()"
    >
      @for (option of options(); track option.value) {
        <ion-select-option [value]="option.value" [disabled]="option.disabled || false">
          {{ option.label | dynamicText | async }}
        </ion-select-option>
      }
    </ion-select>
    @if (field.errorsToDisplay()[0]; as error) {
      <ion-note color="danger" class="df-ion-error" [id]="field.errorId()" role="alert">{{ error.message }}</ion-note>
    } @else if (props()?.hint; as hint) {
      <ion-note class="df-ion-hint" [id]="field.hintId()">{{ hint | dynamicText | async }}</ion-note>
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
export default class IonicSelectFieldComponent {
  protected readonly field = inject(NgForgeField);

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<IonicSelectProps>();

  // Narrow FieldTree<unknown> back to FieldTree<ValueType> for the inner control's
  // strict template type-check; runtime shape is correct.
  protected readonly formFieldTree = computed(() => this.field.field() as FieldTree<ValueType>);

  defaultCompare = Object.is;
}
