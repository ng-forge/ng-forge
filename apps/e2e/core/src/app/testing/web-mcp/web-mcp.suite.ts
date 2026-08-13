import { TestSuite } from '../shared/types';
import { agentFillSubmitScenario } from './scenarios/agent-fill-submit.scenario';

/**
 * WebMCP Suite
 * Verifies that a form declaring `options.webMcp` registers its tools against
 * the browser's model context and that those tools drive the real form.
 */
export const webMcpSuite: TestSuite = {
  id: 'web-mcp',
  title: 'WebMCP Tests',
  description: 'Test scenarios for exposing forms to browser AI agents through WebMCP tools',
  path: '/test/web-mcp',
  scenarios: [agentFillSubmitScenario],
};

export function getWebMcpScenario(testId: string) {
  return webMcpSuite.scenarios.find((s) => s.testId === testId);
}
