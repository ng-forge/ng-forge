import { ChangeDetectionStrategy, Component, computed, linkedSignal, signal } from '@angular/core';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Exercises view preservation across a wrapper chain rebuild. The input's
 * component class is stable (`type: 'input'`); only its wrapper chain changes
 * on button click. The E2E asserts focus + caret + value survive the rebuild.
 */
@Component({
  selector: 'example-wrapper-chain-rebuild',
  imports: [DynamicForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="test-page">
      <h1>Wrapper Chain Rebuild — View Preservation</h1>

      <section class="test-scenario" data-testid="wrapper-chain-rebuild">
        <h2>Wrapper Chain Rebuild</h2>
        <p class="scenario-description">Toggling the wrapper chain should not tear down the input — focus, caret, and value persist.</p>

        <!-- tabindex=-1 + preventDefault on mousedown keeps focus on the input. -->
        <button type="button" tabindex="-1" data-testid="toggle-wrappers" (mousedown)="$event.preventDefault()" (click)="toggleWrappers()">
          Toggle wrappers
        </button>

        <form [dynamic-form]="config()" [(value)]="formValue"></form>
      </section>
    </div>
  `,
})
export class WrapperChainRebuildComponent {
  private readonly wrapped = signal(false);

  protected readonly config = computed<FormConfig>(() => ({
    // Toggle the chain at the form level — goes through `DEFAULT_WRAPPERS`,
    // which is reactive. A field-level toggle wouldn't propagate here because
    // `reconcileFields` preserves the old `ResolvedField` (and its frozen
    // fieldDef) when component + injector match.
    defaultWrappers: this.wrapped() ? [{ type: 'css', cssClasses: 'chain-rebuild-wrap' }] : undefined,
    fields: [
      {
        key: 'focused',
        type: 'input',
        label: 'Focused input',
      },
    ],
  }));

  protected readonly formValue = linkedSignal<Record<string, unknown>>(() => ({}));

  protected toggleWrappers(): void {
    this.wrapped.update((v) => !v);
  }
}
