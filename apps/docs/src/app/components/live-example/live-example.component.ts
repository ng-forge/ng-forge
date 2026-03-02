import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormConfig } from '@ng-forge/dynamic-forms';
import { SandboxMountDirective } from '@ng-forge/sandbox-harness';
import { ActiveAdapterService } from '../../services/active-adapter.service';
import { EXAMPLE_CONFIGS } from '../../example-configs';

@Component({
  selector: 'docs-live-example',
  template: `
    <div
      class="live-example-container"
      sandboxMount
      [adapter]="activeAdapter.adapter()"
      [route]="resolvedRoute()"
      [config]="resolvedConfig()"
      locationStrategy="memory"
      styleIsolation="scoped"
    ></div>
  `,
  styleUrl: './live-example.component.scss',
  imports: [SandboxMountDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveExampleComponent {
  readonly scenario = input.required<string>();
  protected readonly activeAdapter = inject(ActiveAdapterService);

  private readonly scenarioKey = computed(() => {
    const raw = this.scenario();
    // Strip "examples/" prefix if present to get the config key
    return raw.startsWith('examples/') ? raw.slice('examples/'.length) : raw;
  });

  private readonly scenarioConfig = computed((): FormConfig | undefined => EXAMPLE_CONFIGS[this.scenarioKey()]);

  protected readonly resolvedConfig = computed(() => this.scenarioConfig());

  protected readonly resolvedRoute = computed(() => (this.scenarioConfig() ? '/examples/demo' : '/' + this.scenario()));
}
