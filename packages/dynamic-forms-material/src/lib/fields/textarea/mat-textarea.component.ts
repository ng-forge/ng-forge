import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import { NgForgeControl, injectNgForgeField, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { MatTextareaProps } from './mat-textarea.type';
import { AsyncPipe } from '@angular/common';
import { MATERIAL_CONFIG } from '../../models/material-config.token';

@Component({
  selector: 'df-mat-textarea',
  imports: [MatFormField, MatLabel, MatInput, MatHint, FormField, MatError, DynamicTextPipe, AsyncPipe, NgForgeControl],
  hostDirectives: [NgForgeFieldHost],
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

      <textarea
        ngForgeControl
        matInput
        [id]="textareaId"
        [formField]="ngf.field()"
        [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="ngf.tabIndex()"
        [style.resize]="props()?.resize || 'vertical'"
      ></textarea>

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

  readonly props = input<MatTextareaProps>();

  readonly appearance = computed(() => this.props()?.appearance ?? this.materialConfig?.appearance ?? 'outline');
  readonly subscriptSizing = computed(() => this.props()?.subscriptSizing ?? this.materialConfig?.subscriptSizing ?? 'dynamic');

  readonly floatLabel = computed(() => this.props()?.floatLabel ?? this.materialConfig?.floatLabel ?? 'auto');
  readonly hideRequiredMarker = computed(() => this.props()?.hideRequiredMarker ?? this.materialConfig?.hideRequiredMarker ?? false);
}
