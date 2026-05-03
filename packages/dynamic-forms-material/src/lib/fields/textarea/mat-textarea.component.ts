import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, viewChild } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, NG_FORGE_FIELD_INPUTS, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { MatTextareaProps } from './mat-textarea.type';
import { AsyncPipe } from '@angular/common';
import { MATERIAL_CONFIG } from '../../models/material-config.token';

@Component({
  selector: 'df-mat-textarea',
  imports: [MatFormField, MatLabel, MatInput, MatHint, FormField, MatError, DynamicTextPipe, AsyncPipe],
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  providers: [provideMetaTarget('textarea')],
  template: `
    @let textareaId = field.key() + '-textarea';

    <mat-form-field
      [appearance]="effectiveAppearance()"
      [subscriptSizing]="effectiveSubscriptSizing()"
      [floatLabel]="effectiveFloatLabel()"
      [hideRequiredMarker]="effectiveHideRequiredMarker()"
    >
      @if (field.label()) {
        <mat-label>{{ field.label() | dynamicText | async }}</mat-label>
      }

      <textarea
        #textareaRef
        matInput
        [id]="textareaId"
        [formField]="formFieldTree()"
        [placeholder]="(field.placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="field.tabIndex()"
        [attr.aria-invalid]="field.ariaInvalid()"
        [attr.aria-required]="field.ariaRequired()"
        [attr.aria-describedby]="field.ariaDescribedBy()"
        [style.resize]="props()?.resize || 'vertical'"
      ></textarea>

      @if (field.errorsToDisplay()[0]; as error) {
        <mat-error [id]="field.errorId()">{{ error.message }}</mat-error>
      } @else if (props()?.hint; as hint) {
        <mat-hint [id]="field.hintId()">{{ hint | dynamicText | async }}</mat-hint>
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

  protected readonly field = inject(NgForgeField);

  readonly props = input<MatTextareaProps>();

  // Narrow FieldTree<unknown> to FieldTree<string> for the inner control's strict template type-check.
  protected readonly formFieldTree = computed(() => this.field.field() as FieldTree<string>);

  /**
   * Reference to the native textarea element.
   * Used to imperatively sync the readonly attribute since Angular Signal Forms'
   * [field] directive doesn't sync FieldState.readonly() to the DOM.
   */
  private readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textareaRef');

  /**
   * Computed signal that extracts the readonly state from the field.
   * Used by the effect to reactively sync the readonly attribute to the DOM.
   */
  private readonly isReadonly = computed(() => this.formFieldTree()().readonly());

  /**
   * Workaround: Angular Signal Forms' [field] directive does NOT sync the readonly
   * attribute to the DOM, even though FieldState.readonly() returns the correct value.
   * This effect imperatively sets/removes the readonly attribute on the native textarea
   * element whenever the readonly state changes.
   *
   * Note: We cannot use [readonly] or [attr.readonly] bindings because Angular throws
   * NG8022: "Binding to '[readonly]' is not allowed on nodes using the '[field]' directive"
   *
   * Uses afterRenderEffect to ensure DOM is ready before manipulating attributes.
   *
   * @see https://github.com/angular/angular/issues/65897
   */
  private readonly syncReadonlyToDom = afterRenderEffect({
    write: () => {
      const textareaRef = this.textareaRef();
      const isReadonly = this.isReadonly();
      if (textareaRef?.nativeElement) {
        if (isReadonly) {
          textareaRef.nativeElement.setAttribute('readonly', '');
        } else {
          textareaRef.nativeElement.removeAttribute('readonly');
        }
      }
    },
  });

  readonly effectiveAppearance = computed(() => this.props()?.appearance ?? this.materialConfig?.appearance ?? 'outline');
  readonly effectiveSubscriptSizing = computed(() => this.props()?.subscriptSizing ?? this.materialConfig?.subscriptSizing ?? 'dynamic');

  readonly effectiveFloatLabel = computed(() => this.props()?.floatLabel ?? this.materialConfig?.floatLabel ?? 'auto');
  readonly effectiveHideRequiredMarker = computed(
    () => this.props()?.hideRequiredMarker ?? this.materialConfig?.hideRequiredMarker ?? false,
  );
}
