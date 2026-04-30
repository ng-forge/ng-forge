import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TextAddon } from '../models/addon/addon-def';
import { DynamicTextPipe } from '../pipes/dynamic-text/dynamic-text.pipe';

/**
 * Renderer for the universal `text` addon kind.
 *
 * Renders the addon's `text` (a `DynamicText`) inside a span. Decorative —
 * sets `aria-hidden="true"` on the host so screen readers skip it; users
 * who need announcement should use a `*-button` kind with `ariaLabel` instead.
 */
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
}
