import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { DynamicTextPipe } from '../../pipes';
import { TextProps } from '../../definitions/default/text-field';
import { DynamicText } from '../../models';

@Component({
  selector: 'df-text',
  template: `
    @switch (elementType()) { @case ('p') {
    <p class="df-text df-text-p" [class]="className() || ''" [attr.data-testid]="key()">
      {{ label() | dynamicText | async }}
    </p>
    } @case ('h1') {
    <h1 class="df-text df-text-h1" [class]="className() || ''" [attr.data-testid]="key()">
      {{ label() | dynamicText | async }}
    </h1>
    } @case ('h2') {
    <h2 class="df-text df-text-h2" [class]="className() || ''" [attr.data-testid]="key()">
      {{ label() | dynamicText | async }}
    </h2>
    } @case ('h3') {
    <h3 class="df-text df-text-h3" [class]="className() || ''" [attr.data-testid]="key()">
      {{ label() | dynamicText | async }}
    </h3>
    } @case ('h4') {
    <h4 class="df-text df-text-h4" [class]="className() || ''" [attr.data-testid]="key()">
      {{ label() | dynamicText | async }}
    </h4>
    } @case ('h5') {
    <h5 class="df-text df-text-h5" [class]="className() || ''" [attr.data-testid]="key()">
      {{ label() | dynamicText | async }}
    </h5>
    } @case ('h6') {
    <h6 class="df-text df-text-h6" [class]="className() || ''" [attr.data-testid]="key()">
      {{ label() | dynamicText | async }}
    </h6>
    } @case ('span') {
    <span class="df-text df-text-span" [class]="className() || ''" [attr.data-testid]="key()">
      {{ label() | dynamicText | async }}
    </span>
    } }
  `,
  styleUrl: './text-field.component.scss',
  imports: [AsyncPipe, DynamicTextPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
  },
})
export default class TextFieldComponent {
  readonly key = input.required<string>();
  readonly label = input.required<DynamicText>();
  readonly className = input<string>();
  readonly tabIndex = input<number>();
  readonly hidden = input<boolean>();
  readonly props = input<TextProps>();

  readonly elementType = computed(() => this.props()?.elementType || 'p');
}
