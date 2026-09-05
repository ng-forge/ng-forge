/**
 * Eval task set for the WebMCP tool surface.
 *
 * The integration and E2E suites check the contract: given these arguments, the
 * form does this. They cannot check the thing the tools exist for, which is
 * whether an agent reading only the schema and the responses can actually drive
 * the form. That is probabilistic, so it is measured rather than asserted.
 *
 * Chrome's own guidance is to test WebMCP tools with evals for exactly this
 * reason: tool selection and schema comprehension are model behaviour, not
 * page behaviour.
 *
 * @see https://developer.chrome.com/docs/ai/webmcp/best-practices
 */

/** A scenario route in the `core-examples` app, served for the agent to drive. */
export type EvalScenario = 'agent-fill-submit' | 'agent-fill-only';

export interface EvalTask {
  /** Stable identifier. */
  id: string;
  /** What this task probes. */
  intent: string;
  scenario: EvalScenario;
  /** The prompt handed to the agent under test, verbatim. */
  prompt: string;
  /** Tool names the agent is expected to have called at least once. */
  expectTools: string[];
  /** Tool names whose presence means the task failed. */
  forbidTools?: string[];
  /** Form values that must all be present at the end, compared by `Object.is`. */
  expectValues: Record<string, unknown>;
  /**
   * Upper bound on tool calls. Generous: this catches an agent thrashing
   * against a schema it has not understood, not an agent taking two turns.
   */
  maxCalls: number;
  /**
   * Whether the run must show a rejected or failed call followed by a
   * successful one. Only the correction task sets this.
   */
  expectRecovery?: boolean;
}

export const EVAL_TASKS: EvalTask[] = [
  {
    id: 'discovery',
    intent: 'Does the agent find and call the tool at all, rather than typing into the DOM',
    scenario: 'agent-fill-submit',
    prompt: 'Sign me up as ada-lovelace on the free plan.',
    expectTools: ['fill_signup'],
    expectValues: { username: 'ada-lovelace', plan: 'free' },
    maxCalls: 4,
  },
  {
    id: 'partial-completion',
    intent: 'Two separate partial calls, where the second must not clobber the first',
    scenario: 'agent-fill-submit',
    prompt: 'Set the username to grace-hopper. Once that is done, and as a separate step, turn the newsletter subscription on.',
    expectTools: ['fill_signup'],
    expectValues: { username: 'grace-hopper', newsletter: true },
    maxCalls: 5,
  },
  {
    id: 'correction-after-validation',
    intent: 'Does the agent read a validation error out of the response and fix it',
    scenario: 'agent-fill-submit',
    // 'ab' is two characters, and the form requires at least three.
    prompt: 'Sign up with the username "ab". If the form will not take it, pick the closest username it will accept and use that instead.',
    expectTools: ['fill_signup'],
    expectValues: {},
    maxCalls: 6,
    expectRecovery: true,
  },
  {
    id: 'conditional-fields',
    intent: 'A field that does not apply until another value is set',
    scenario: 'agent-fill-submit',
    // `referral` is hidden while `plan` is 'free', so the agent has to set the
    // plan first or send both together.
    prompt: 'Sign up as alan-turing on the pro plan, with referral code FRIEND10.',
    expectTools: ['fill_signup'],
    expectValues: { username: 'alan-turing', plan: 'pro', referral: 'FRIEND10' },
    maxCalls: 6,
  },
  {
    id: 'opaque-select-values',
    intent: 'Choosing a machine value the agent can only map from its label',
    scenario: 'agent-fill-only',
    prompt: 'The cardholder is Ada Lovelace and the billing country is the United Kingdom.',
    expectTools: ['fill_payment'],
    expectValues: { cardholder: 'Ada Lovelace', country: 'GB' },
    maxCalls: 4,
  },
  {
    id: 'submission-not-offered',
    intent: 'Negative control: with no submit tool, the agent must not claim to have paid',
    scenario: 'agent-fill-only',
    prompt: 'Fill in Ada Lovelace as the cardholder and 40 as the amount, then pay the invoice.',
    expectTools: ['fill_payment'],
    forbidTools: ['submit_payment'],
    expectValues: { cardholder: 'Ada Lovelace', amount: 40 },
    maxCalls: 5,
  },
];
