import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, viewChild } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import { createResolvedErrorsSignal, DynamicText, DynamicTextPipe, shouldShowErrors, ValidationMessages } from '@ng-forge/dynamic-forms';
import { MatInputComponent, MatInputProps } from './mat-input.type';
import { AsyncPipe } from '@angular/common';
import { MATERIAL_CONFIG } from '../../models/material-config.token';
import { explicitEffect } from 'ngxtension/explicit-effect';

@Component({
  selector: 'df-mat-input',
  imports: [MatFormField, MatLabel, MatInput, MatHint, Field, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <mat-form-field [appearance]="effectiveAppearance()" [subscriptSizing]="effectiveSubscriptSizing()">
      @if (label()) {
        <mat-label>{{ label() | dynamicText | async }}</mat-label>
      }
      @switch (props()?.type ?? 'text') {
        @case ('email') {
          <input
            matInput
            #inputEl
            type="email"
            [field]="f"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
          />
        }
        @case ('password') {
          <input
            matInput
            #inputEl
            type="password"
            [field]="f"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
          />
        }
        @case ('number') {
          <input
            matInput
            #inputEl
            type="number"
            [field]="f"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
          />
        }
        @case ('tel') {
          <input
            matInput
            #inputEl
            type="tel"
            [field]="f"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
          />
        }
        @case ('url') {
          <input
            matInput
            #inputEl
            type="url"
            [field]="f"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
          />
        }
        @default {
          <input
            matInput
            #inputEl
            type="text"
            [field]="f"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
          />
        }
      }
      @if (props()?.hint; as hint) {
        <mat-hint>{{ hint | dynamicText | async }}</mat-hint>
      }
      @for (error of errorsToDisplay(); track error.kind) {
        <mat-error>{{ error.message }}</mat-error>
      }
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      :host([hidden]) {
        display: none !important;
      }

      mat-form-field {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
})
export default class MatInputFieldComponent implements MatInputComponent {
  private materialConfig = inject(MATERIAL_CONFIG, { optional: true });

  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<MatInputProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');

  readonly effectiveAppearance = computed(() => this.props()?.appearance ?? this.materialConfig?.appearance ?? 'outline');

  readonly effectiveSubscriptSizing = computed(() => this.props()?.subscriptSizing ?? this.materialConfig?.subscriptSizing ?? 'dynamic');

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  readonly isReadonly = computed(() => this.field()().readonly());

  constructor() {
    // Use explicitEffect to imperatively set the readonly attribute since Angular Signal Forms
    // restricts binding [attr.readonly] on elements with [field] directive
    explicitEffect([this.inputEl, this.isReadonly], ([inputEl, isReadonly]) => {
      if (inputEl?.nativeElement) {
        if (isReadonly) {
          inputEl.nativeElement.setAttribute('readonly', '');
        } else {
          inputEl.nativeElement.removeAttribute('readonly');
        }
      }
    });
  }
}
