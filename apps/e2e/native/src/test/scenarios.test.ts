import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withNativeFields } from '@ng-forge/dynamic-forms-native';
import { render, screen } from '@ng-native/testing';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { ScenarioComponent } from '../app/scenario.component';
import { SUITES } from '../app/scenarios';

const phone = { conditions: { width: 411, height: 914, colorScheme: 'light' as const } };

describe.each(SUITES)('$id scenarios mount', (suite) => {
  const errors: unknown[] = [];
  afterEach(() => vi.restoreAllMocks());

  test.each(suite.scenarios)('$testId', async (scenario) => {
    errors.length = 0;
    vi.spyOn(console, 'error').mockImplementation((...args) => void errors.push(args));
    await render(ScenarioComponent, {
      ...phone,
      inputs: { scenario },
      providers: [provideDynamicForm(...withNativeFields())],
    });
    expect(await screen.findByTestId(scenario.testId)).toBeTruthy();
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(errors.map((e) => String((e as unknown[]).map(String).join(' ')).slice(0, 400))).toEqual([]);
  });
});

describe('Maestro flows', () => {
  const flowsDir = fileURLToPath(new URL('../../e2e/flows', import.meta.url));
  const flows = readdirSync(flowsDir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.yaml'));

  test.each(flows)('%s opens a scenario the app has', (flow) => {
    const env = readFileSync(join(flowsDir, flow), 'utf8').match(/SUITE: ([\w-]+), SCENARIO: ([\w-]+)/);
    expect(env, 'flow opens a scenario via open-scenario.yaml').not.toBeNull();
    const [, suiteId, testId] = env as RegExpMatchArray;
    expect(SUITES.find((s) => s.id === suiteId)?.scenarios.some((s) => s.testId === testId)).toBe(true);
  });
});
