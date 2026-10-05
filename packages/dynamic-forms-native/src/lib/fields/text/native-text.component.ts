import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DynamicText } from '@ng-forge/dynamic-forms';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import { Text } from '@ng-native/components';

/**
 * Replaces core's `text` field, which renders `<p>`, `<h1>`-`<h6>` and `<span>`. Those have no
 * native counterpart and would render as empty views.
 */
@Component({
  selector: 'df-native-text',
  imports: [DynamicTextPipe, AsyncPipe, Text],
  template: `
    @if (!hidden()) {
      <text [class]="elementType()" [role]="isHeading() ? 'header' : undefined" [testID]="key()">
        {{ label() | dynamicText | async }}
      </text>
    }
  `,
  styleUrl: '../../styles/field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NativeTextFieldComponent {
  readonly key = input.required<string>();
  readonly label = input<DynamicText>();
  readonly className = input<string>();
  readonly hidden = input(false);
  readonly props = input<{ elementType?: string }>();

  protected readonly elementType = computed(() => this.props()?.elementType ?? 'p');
  protected readonly isHeading = computed(() => /^h[1-6]$/.test(this.elementType()));
}
