import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { CodeHighlightDirective } from '../../directives/code-highlight.directive';
import { DocsTabKeyboardDirective } from '../../directives/tab-keyboard.directive';
import { UidService } from '../../services/uid.service';
import { CopyButtonComponent } from '../copy-button/copy-button.component';

type Cli = 'angular' | 'nx';

@Component({
  selector: 'docs-cli-command',
  templateUrl: './cli-command.component.html',
  styleUrl: './cli-command.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeHighlightDirective, CopyButtonComponent, DocsTabKeyboardDirective],
})
export class DocsCliCommandComponent {
  readonly package = input<string>('@ng-forge/dynamic-forms');
  readonly selected = signal<Cli>('angular');
  readonly clis: { id: Cli; label: string }[] = [
    { id: 'angular', label: 'Angular CLI' },
    { id: 'nx', label: 'Nx' },
  ];
  readonly command = computed(() => (this.selected() === 'angular' ? `ng add ${this.package()}` : `nx g ${this.package()}:add`));

  private readonly uid = inject(UidService).next('cli');

  tabId(id: Cli): string {
    return `${this.uid}-tab-${id}`;
  }
  readonly panelId = `${this.uid}-panel`;

  select(c: Cli): void {
    this.selected.set(c);
  }
}

export default DocsCliCommandComponent;
