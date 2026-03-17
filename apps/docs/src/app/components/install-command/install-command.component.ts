import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { PackageManagerService } from '../../services/package-manager.service';
import { CodeHighlightDirective } from '../../directives/code-highlight.directive';
import { CopyButtonComponent } from '../copy-button/copy-button.component';

type PackageManager = 'npm' | 'pnpm' | 'yarn';

const PM_COMMANDS: Record<PackageManager, { binary: string; subcommand: string }> = {
  npm: { binary: 'npm', subcommand: 'install' },
  pnpm: { binary: 'pnpm', subcommand: 'add' },
  yarn: { binary: 'yarn', subcommand: 'add' },
};

@Component({
  selector: 'docs-install-command',
  templateUrl: './install-command.component.html',
  styleUrl: './install-command.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeHighlightDirective, CopyButtonComponent],
})
export class DocsInstallCommandComponent {
  readonly packages = input.required<string>();

  readonly pmService = inject(PackageManagerService);

  readonly managers: PackageManager[] = ['npm', 'pnpm', 'yarn'];

  readonly command = computed(() => {
    const { binary, subcommand } = PM_COMMANDS[this.pmService.pm()];
    return `${binary} ${subcommand} ${this.packages()}`;
  });

  select(pm: PackageManager): void {
    this.pmService.pm.set(pm);
  }
}
