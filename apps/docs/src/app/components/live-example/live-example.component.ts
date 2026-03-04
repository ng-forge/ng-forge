import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormConfig } from '@ng-forge/dynamic-forms';
import { SandboxMountDirective } from '@ng-forge/sandbox-harness';
import { ActiveAdapterService } from '../../services/active-adapter.service';
import { EXAMPLE_CONFIGS } from '../../example-configs';

@Component({
  selector: 'docs-live-example',
  template: `
    @if (!shouldHide()) {
      <div
        class="live-example-container"
        sandboxMount
        [adapter]="resolvedAdapter()"
        [route]="resolvedRoute()"
        [config]="resolvedConfig()"
        locationStrategy="memory"
        styleIsolation="scoped"
      ></div>
    }
  `,
  styleUrl: './live-example.component.scss',
  imports: [SandboxMountDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveExampleComponent {
  readonly scenario = input.required<string>();
  readonly hideForCustom = input(false, { transform: booleanAttribute });
  protected readonly activeAdapter = inject(ActiveAdapterService);

  protected readonly shouldHide = computed(() => this.hideForCustom() && this.activeAdapter.adapter() === 'custom');

  // Custom adapter has no sandbox — fall back to Material for live examples
  protected readonly resolvedAdapter = computed(() => {
    const adapter = this.activeAdapter.adapter();
    return adapter === 'custom' ? 'material' : adapter;
  });

  private readonly scenarioKey = computed(() => {
    const raw = this.scenario();
    // Strip "examples/" prefix if present to get the config key
    return raw.startsWith('examples/') ? raw.slice('examples/'.length) : raw;
  });

  private readonly scenarioConfig = computed((): FormConfig | undefined => EXAMPLE_CONFIGS[this.scenarioKey()]);

  protected readonly resolvedConfig = computed(() => this.scenarioConfig());

  protected readonly resolvedRoute = computed(() => (this.scenarioConfig() ? '/examples/demo' : '/' + this.scenario()));
}
