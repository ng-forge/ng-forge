import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import {
  DfAddonSlot,
  injectNgForgeAddons,
  injectNgForgeField,
  NgForgeAddons,
  NgForgeControl,
  NgForgeFieldHost,
  WrapperFieldInputs,
} from '@ng-forge/dynamic-forms/integration';
import { MatTextareaProps } from './mat-textarea.type';
import { AsyncPipe } from '@angular/common';
import { MATERIAL_CONFIG } from '@ng-forge/dynamic-forms-material/shared';

@Component({
  selector: 'df-mat-textarea',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatHint,
    FormField,
    MatError,
    MatPrefix,
    MatSuffix,
    DynamicTextPipe,
    AsyncPipe,
    NgForgeControl,
    DfAddonSlot,
  ],
  hostDirectives: [NgForgeFieldHost, NgForgeAddons],
  template: `
    @let textareaId = ngf.key() + '-textarea';

    <mat-form-field
      [appearance]="appearance()"
      [subscriptSizing]="subscriptSizing()"
      [floatLabel]="floatLabel()"
      [hideRequiredMarker]="hideRequiredMarker()"
    >
      @if (ngf.label()) {
        <mat-label>{{ ngf.label() | dynamicText | async }}</mat-label>
      }

      @for (a of ngfa.prefixAddons(); track $index) {
        <df-addon-slot
          matPrefix
          [class.df-mat-addon-text]="a.type === 'text'"
          [addon]="a"
          [fieldInputs]="fieldInputs()"
          [hidden]="ngfa.hiddenSignalCache().get(a)"
        />
      }
      <textarea
        ngForgeControl
        matInput
        [id]="textareaId"
        [formField]="ngf.field()"
        [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="ngf.tabIndex()"
        [style.resize]="props()?.resize || 'vertical'"
      ></textarea>
      @for (a of ngfa.suffixAddons(); track $index) {
        <df-addon-slot
          matSuffix
          [class.df-mat-addon-text]="a.type === 'text'"
          [addon]="a"
          [fieldInputs]="fieldInputs()"
          [hidden]="ngfa.hiddenSignalCache().get(a)"
        />
      }

      @if (ngf.errorsToDisplay()[0]; as error) {
        <mat-error [id]="ngf.errorId()">{{ error.message }}</mat-error>
      } @else if (props()?.hint; as hint) {
        <mat-hint [id]="ngf.hintId()">{{ hint | dynamicText | async }}</mat-hint>
      }
    </mat-form-field>
  `,
  styleUrl: '../../styles/_form-field.scss',
  styles: [
    `
      mat-form-field {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatTextareaFieldComponent {
  private materialConfig = inject(MATERIAL_CONFIG, { optional: true });

  protected readonly ngf = injectNgForgeField<string>();
  protected readonly ngfa = injectNgForgeAddons();

  readonly props = input<MatTextareaProps>();
  /**
   * Wrapper-style host bag pushed by `DfFieldOutlet`. Declared at the
   * component level so `setInputIfDeclared` (which uses
   * `reflectComponentType`) can write it.
   */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();

  readonly appearance = computed(() => this.props()?.appearance ?? this.materialConfig?.appearance ?? 'outline');
  readonly subscriptSizing = computed(() => this.props()?.subscriptSizing ?? this.materialConfig?.subscriptSizing ?? 'dynamic');

  readonly floatLabel = computed(() => this.props()?.floatLabel ?? this.materialConfig?.floatLabel ?? 'auto');
  readonly hideRequiredMarker = computed(() => this.props()?.hideRequiredMarker ?? this.materialConfig?.hideRequiredMarker ?? false);
}
