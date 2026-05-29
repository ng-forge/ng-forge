import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { PackageManagerService } from '../../services/package-manager.service';
import { UidService } from '../../services/uid.service';
import { CodeHighlightDirective } from '../../directives/code-highlight.directive';
import { DocsTabKeyboardDirective } from '../../directives/tab-keyboard.directive';
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
  imports: [CodeHighlightDirective, CopyButtonComponent, DocsTabKeyboardDirective],
})
export class DocsInstallCommandComponent {
  readonly packages = input.required<string>();

  readonly pmService = inject(PackageManagerService);

  readonly managers: { id: PackageManager; label: PackageManager }[] = [
    { id: 'npm', label: 'npm' },
    { id: 'pnpm', label: 'pnpm' },
    { id: 'yarn', label: 'yarn' },
  ];

  readonly command = computed(() => {
    const { binary, subcommand } = PM_COMMANDS[this.pmService.pm()];
    return `${binary} ${subcommand} ${this.packages()}`;
  });

  private readonly uid = inject(UidService).next('pm');

  tabId(id: PackageManager): string {
    return `${this.uid}-tab-${id}`;
  }
  readonly panelId = `${this.uid}-panel`;

  select(pm: PackageManager): void {
    this.pmService.pm.set(pm);
  }
}

export default DocsInstallCommandComponent;
