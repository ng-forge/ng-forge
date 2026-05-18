import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, forwardRef, inject, input, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import {
  AddonActionContext,
  AddonActionPreset,
  DfAddonSlot,
  DynamicFormLogger,
  DynamicTextPipe,
  FIELD_SIGNAL_CONTEXT,
  WrapperFieldInputs,
} from '@ng-forge/dynamic-forms';
import {
  ADDON_PRESET_HANDLER,
  AddonPresetHandler,
  injectNgForgeAddons,
  injectNgForgeField,
  NgForgeAddons,
  NgForgeControl,
  NgForgeFieldHost,
} from '@ng-forge/dynamic-forms/integration';
import { MATERIAL_CONFIG } from '../../models/material-config.token';
import { runMatPresetAction } from '../../addons/preset-actions';
import { MAT_INPUT_TYPE_OVERRIDE } from '../../tokens/input-type-override.token';
import { MatInputAddon, MatInputProps } from './mat-input.type';

@Component({
  selector: 'df-mat-input',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatHint,
    MatError,
    MatPrefix,
    MatSuffix,
    FormField,
    DynamicTextPipe,
    AsyncPipe,
    NgForgeControl,
    DfAddonSlot,
  ],
  hostDirectives: [NgForgeFieldHost, NgForgeAddons],
  template: `
    @let inputId = ngf.key() + '-input';

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
        @if (a.kind === 'text') {
          <df-addon-slot matTextPrefix [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
        } @else {
          <df-addon-slot matIconPrefix [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
        }
      }
      <input
        matInput
        ngForgeControl
        [id]="inputId"
        [formField]="ngf.field()"
        [type]="type()"
        [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="ngf.tabIndex()"
      />
      @for (a of ngfa.suffixAddons(); track $index) {
        @if (a.kind === 'text') {
          <df-addon-slot matTextSuffix [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
        } @else {
          <df-addon-slot matIconSuffix [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
        }
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
      :host([hidden]) {
        display: none !important;
      }
      /* Spacing is handled by Material's own matIconPrefix / matTextPrefix
         (and matIconSuffix / matTextSuffix) directives, picked per addon
         kind at the template above. No custom CSS needed — themes track
         Material's design tokens for free. */
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: MAT_INPUT_TYPE_OVERRIDE,
      useFactory: () => signal<string | undefined>(undefined),
    },
    {
      // Adapter-specific preset semantics for `mat-button` addons (clear /
      // reset / paste / copy / toggle-password-visibility). The directive
      // (`NgForgeAddonAction`) delegates here when an addon configures a
      // `preset`. Per-mat-input-instance so the `typeOverride` signal is
      // scoped to one field.
      provide: ADDON_PRESET_HANDLER,
      useFactory: (): AddonPresetHandler => {
        const typeOverride = inject(MAT_INPUT_TYPE_OVERRIDE);
        const fsc = inject(FIELD_SIGNAL_CONTEXT, { optional: true });
        const logger = inject(DynamicFormLogger);
        const host = inject(forwardRef(() => MatInputFieldComponent));
        return {
          run: (preset: string, ctx: AddonActionContext) => {
            const fieldKey = ctx.field.key;
            // The handler contract is `preset: string`; cast back to the
            // narrow union at the runner's signature boundary.
            return runMatPresetAction(preset as AddonActionPreset, ctx, {
              typeOverride,
              fieldValueSetter: ctx.setValue,
              fieldDefaultValueGetter:
                fsc && fieldKey ? () => (fsc.defaultValues() as Record<string, unknown> | undefined)?.[fieldKey] : undefined,
              baselineType: () => host.props()?.type,
              logger,
            });
          },
        };
      },
    },
  ],
})
export default class MatInputFieldComponent {
  private materialConfig = inject(MATERIAL_CONFIG, { optional: true });

  protected readonly ngf = injectNgForgeField<string>();
  protected readonly ngfa = injectNgForgeAddons<MatInputAddon>();

  readonly props = input<MatInputProps>();

  /**
   * Wrapper-style host bag pushed by `DfFieldOutlet`. Declared at the
   * component level so `setInputIfDeclared` (which uses
   * `reflectComponentType`) can write it.
   */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();

  /** Per-instance type override populated by `toggle-password-visibility` preset. */
  private readonly typeOverride = inject(MAT_INPUT_TYPE_OVERRIDE);

  readonly appearance = computed(() => this.props()?.appearance ?? this.materialConfig?.appearance ?? 'outline');

  readonly subscriptSizing = computed(() => this.props()?.subscriptSizing ?? this.materialConfig?.subscriptSizing ?? 'dynamic');

  readonly floatLabel = computed(() => this.props()?.floatLabel ?? this.materialConfig?.floatLabel ?? 'auto');

  readonly hideRequiredMarker = computed(() => this.props()?.hideRequiredMarker ?? this.materialConfig?.hideRequiredMarker ?? false);

  /** Override (set by `toggle-password-visibility` preset) wins over `props().type`. */
  protected readonly type = computed(() => this.typeOverride() ?? this.props()?.type ?? 'text');
}
