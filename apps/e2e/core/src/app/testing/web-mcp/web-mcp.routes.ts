import { Routes } from '@angular/router';
import { getWebMcpScenario, webMcpSuite } from './web-mcp.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: webMcpSuite },
  },
  {
    path: 'agent-fill-submit',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getWebMcpScenario('agent-fill-submit-test') },
  },
  {
    path: 'agent-config-swap',
    loadComponent: () => import('./scenarios/agent-config-swap.component').then((m) => m.AgentConfigSwapComponent),
  },
  {
    path: 'agent-fill-only',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getWebMcpScenario('agent-fill-only-test') },
  },
];

export default routes;
