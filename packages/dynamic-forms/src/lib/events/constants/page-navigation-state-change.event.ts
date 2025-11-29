import { FormEvent } from '../interfaces/form-event';
import { PageOrchestratorState } from '../../core/page-orchestrator/page-orchestrator.interfaces';

export class PageNavigationStateChangeEvent implements FormEvent {
  type = 'page-navigation-state-change' as const;

  constructor(public state: PageOrchestratorState) {}
}
