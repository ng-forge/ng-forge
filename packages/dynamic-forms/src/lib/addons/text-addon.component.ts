import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TextAddon } from '@ng-forge/dynamic-forms/internal';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/internal';
import { WrapperFieldInputs } from '@ng-forge/dynamic-forms/internal';

/** Renderer for the universal `text` addon type. */
@Component({
  selector: 'df-text-addon',
  imports: [AsyncPipe, DynamicTextPipe],
  template: `<span>{{ addon().text | dynamicText | async }}</span>`,
  host: {
    '[attr.aria-hidden]': '"true"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextAddonComponent {
  readonly addon = input.required<TextAddon>();
  /** Accepted for contract uniformity — `NgComponentOutlet` setInput is strict; every kind must declare it. */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();
}
