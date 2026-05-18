import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, forwardRef, inject, input, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
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
import { BOOTSTRAP_CONFIG } from '../../models/bootstrap-config.token';
import { runBsPresetAction } from '../../addons/preset-actions';
import { BS_INPUT_TYPE_OVERRIDE } from '../../tokens/input-type-override.token';
import { BsInputAddon, BsInputProps } from './bs-input.type';

@Component({
  selector: 'df-bs-input',
  imports: [FormField, DynamicTextPipe, AsyncPipe, NgForgeControl, DfAddonSlot, NgTemplateOutlet],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [NgForgeFieldHost, NgForgeAddons],
  template: `
    @let f = ngf.field(); @let p = props(); @let inputId = ngf.key() + '-input';
    <ng-template #control>
      <input
        ngForgeControl
        [formField]="f"
        [id]="inputId"
        [type]="type()"
        [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="ngf.tabIndex()"
        class="form-control"
        [class.form-control-sm]="size() === 'sm'"
        [class.form-control-lg]="size() === 'lg'"
        [class.form-control-plaintext]="p?.plaintext"
        [class.is-invalid]="f().invalid() && f().touched()"
        [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
      />
    </ng-template>
    @if (floatingLabel()) {
      <!-- Floating label variant -->
      <div class="mb-3">
        @if (ngfa.hasAddons()) {
          <div class="input-group">
            @for (a of ngfa.prefixAddons(); track $index) {
              <span class="input-group-text">
                <df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
              </span>
            }
            <div class="form-floating">
              <ng-container *ngTemplateOutlet="control" />
              @if (ngf.label()) {
                <label [for]="inputId">{{ ngf.label() | dynamicText | async }}</label>
              }
            </div>
            @for (a of ngfa.suffixAddons(); track $index) {
              <span class="input-group-text">
                <df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
              </span>
            }
          </div>
        } @else {
          <div class="form-floating">
            <ng-container *ngTemplateOutlet="control" />
            @if (ngf.label()) {
              <label [for]="inputId">{{ ngf.label() | dynamicText | async }}</label>
            }
          </div>
        }
        @if (p?.validFeedback && f().valid() && f().touched()) {
          <div class="valid-feedback d-block">
            {{ p?.validFeedback | dynamicText | async }}
          </div>
        }
        @if (ngf.errorsToDisplay()[0]; as error) {
          <div class="invalid-feedback d-block" [id]="ngf.errorId()" role="alert">{{ error.message }}</div>
        }
      </div>
    } @else {
      <!-- Standard variant -->
      <div class="mb-3">
        @if (ngf.label()) {
          <label [for]="inputId" class="form-label">{{ ngf.label() | dynamicText | async }}</label>
        }
        @if (ngfa.hasAddons()) {
          <div class="input-group">
            @for (a of ngfa.prefixAddons(); track $index) {
              @if (a.kind === 'bs-button') {
                <df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
              } @else {
                <span class="input-group-text">
                  <df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
                </span>
              }
            }
            <ng-container *ngTemplateOutlet="control" />
            @for (a of ngfa.suffixAddons(); track $index) {
              @if (a.kind === 'bs-button') {
                <df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
              } @else {
                <span class="input-group-text">
                  <df-addon-slot [addon]="a" [fieldInputs]="fieldInputs()" [hidden]="ngfa.hiddenSignalCache().get(a)" />
                </span>
              }
            }
          </div>
        } @else {
          <ng-container *ngTemplateOutlet="control" />
        }
        @if (p?.validFeedback && f().valid() && f().touched()) {
          <div class="valid-feedback d-block">
            {{ p?.validFeedback | dynamicText | async }}
          </div>
        }
        @if (ngf.errorsToDisplay()[0]; as error) {
          <div class="invalid-feedback d-block" [id]="ngf.errorId()" role="alert">{{ error.message }}</div>
        } @else if (p?.hint) {
          <div class="form-text" [id]="ngf.hintId()">{{ p?.hint | dynamicText | async }}</div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: BS_INPUT_TYPE_OVERRIDE,
      useFactory: () => signal<string | undefined>(undefined),
    },
    {
      // Adapter-specific preset semantics for `bs-button` addons (clear /
      // reset / paste / copy / toggle-password-visibility). The directive
      // (`NgForgeAddonAction`) delegates here when an addon configures a
      // `preset`. Per-bs-input-instance so the `typeOverride` signal is
      // scoped to one field.
      provide: ADDON_PRESET_HANDLER,
      useFactory: (): AddonPresetHandler => {
        const typeOverride = inject(BS_INPUT_TYPE_OVERRIDE);
        const fsc = inject(FIELD_SIGNAL_CONTEXT, { optional: true });
        const logger = inject(DynamicFormLogger);
        const host = inject(forwardRef(() => BsInputFieldComponent));
        return {
          run: (preset: string, ctx: AddonActionContext) => {
            const fieldKey = ctx.field.key;
            // The handler contract is `preset: string`; cast back to the
            // narrow union at the runner's signature boundary.
            return runBsPresetAction(preset as AddonActionPreset, ctx, {
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
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
})
export default class BsInputFieldComponent {
  private bootstrapConfig = inject(BOOTSTRAP_CONFIG, { optional: true });

  protected readonly ngf = injectNgForgeField<string>();
  protected readonly ngfa = injectNgForgeAddons<BsInputAddon>();

  readonly props = input<BsInputProps>();

  /**
   * Wrapper-style host bag pushed by `DfFieldOutlet`. Declared at the
   * component level so `setInputIfDeclared` (which uses
   * `reflectComponentType`) can write it.
   */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();

  /** Per-instance type override populated by `toggle-password-visibility` preset. */
  private readonly typeOverride = inject(BS_INPUT_TYPE_OVERRIDE);

  readonly size = computed(() => this.props()?.size ?? this.bootstrapConfig?.size);
  readonly floatingLabel = computed(() => this.props()?.floatingLabel ?? this.bootstrapConfig?.floatingLabel ?? false);

  /** Override (set by `toggle-password-visibility` preset) wins over `props().type`. */
  protected readonly type = computed(() => this.typeOverride() ?? this.props()?.type ?? 'text');
}
