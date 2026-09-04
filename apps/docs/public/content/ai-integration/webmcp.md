---
title: WebMCP
slug: ai-integration/webmcp
description: 'Expose a dynamic form to browser AI agents as WebMCP tools, so an agent can fill it and read back live validation, with submission and readback both kept opt-in per form.'
---

# WebMCP

[WebMCP](https://developer.chrome.com/docs/ai/webmcp) lets a web page offer structured tools to an AI agent running in the browser. Instead of the agent guessing at your DOM and simulating clicks, it calls a function you declared, with arguments described by a schema.

ng-forge can generate those tools from a form config. Because the config already carries labels, option lists, and validators, the schema an agent receives is far richer than one inferred from the form's runtime values.

> [!WARNING]
> This is experimental in the strongest sense. WebMCP is a proposed standard, not a shipped one, and the browser surface underneath this feature can still change. The API is named `withExperimentalWebMcp()` so that is visible at the call site. Expect breaking changes outside a major version.

## Browser support and page requirements

| Requirement                                                                         | Why                                                                            |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Chrome 149 or later                                                                 | The API is in origin trial. Earlier versions expose no model context at all.   |
| Origin trial token, or `chrome://flags/#web-machine-learning-model-context` locally | Without one, `document.modelContext` is undefined.                             |
| A cross-origin isolated document                                                    | The API is gated on origin isolation (`COOP` plus `COEP` response headers).    |
| The `tools` Permissions Policy                                                      | Allowed on the top-level document by default. An iframe needs `allow="tools"`. |

Where any of these is missing, nothing is registered and nothing breaks. The form renders and behaves exactly as it would without the feature, and `webMcpStatus()` on the component reports `unsupported`.

For exploratory testing, the [Model Context Tool Inspector](https://github.com/beaufortfrancois/model-context-tool-inspector) extension lists a page's tools and calls them.

## Setup

Add the feature to your providers, then opt individual forms in.

```typescript
import { provideDynamicForm, withExperimentalWebMcp } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withMaterialFields(), withExperimentalWebMcp())],
};
```

```typescript
const config = {
  options: {
    webMcp: {
      name: 'signup',
      description: 'Sign a new user up with a username, plan and newsletter preference.',
    },
  },
  fields: [
    { key: 'username', type: 'input', label: 'Username', required: true, placeholder: 'Letters and numbers' },
    {
      key: 'plan',
      type: 'select',
      label: 'Plan',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Pro, billed yearly', value: 'pro' },
      ],
    },
  ],
} as const satisfies FormConfig;
```

`webMcp` is part of `FormOptions`, so it can also come from the `[formOptions]` input instead of the config.

Forms without `options.webMcp` register nothing. The registrar module is loaded on demand, so a form that never opts in never pulls it. The feature, its token, and the small form-scoped hook that decides whether to load are part of the main bundle.

## The tools

| Tool            | Registered              | What it does                                                                                                                                           |
| --------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fill_{name}`   | Always                  | Applies any subset of fields to the form and reports what it set, which fields apply, which are still empty, and any validation errors. Never submits. |
| `submit_{name}` | Only with `allowSubmit` | Applies any fields given, submits, and waits for the result.                                                                                           |

Tool names must satisfy the WebMCP draft's own rule: 1 to 128 characters of `A-Z`, `a-z`, `0-9`, `_`, `-` or `.`. Keep `webMcp.name` short, since Chrome's guidance is that agents scan tool names within roughly a 30-character budget.

### fill

`fill` writes to the real form, so the user watching the page sees the agent's work land in the fields. It accepts a partial patch:

- A **scalar** is replaced.
- A **group** is merged key by key, all the way down. Sending `{ person: { first: 'Grace' } }` changes `person.first` and leaves `person.last` where it was.
- A **list** is replaced whole. There is no positional patch an agent could express unambiguously, since index 1 of a five-item list means nothing once the list is reordered.

Calling it with no fields changes nothing and reports the current state, which is the natural way for an agent to orient itself before it starts.

Because it applies to the live form, everything it reports back is the genuine answer. Cross-field validators, conditional visibility, and derivations all evaluate exactly as they would for a human typing.

### submit

Submission is off by default. To allow it:

```typescript
options: {
  webMcp: {
    name: 'signup',
    description: 'Sign a new user up.',
    allowSubmit: true,
  },
}
```

Without `allowSubmit`, no submit tool is registered at all and the agent simply cannot submit the form. It fills the fields and a human presses the button.

> [!WARNING]
> Leave `allowSubmit` off for anything that spends money, sends a message, or cannot be undone. Every registered tool is callable by any agent that reaches the page, including one following instructions injected somewhere else entirely. See [Chrome's agent security guidance](https://developer.chrome.com/docs/agents/security).

This mirrors the platform's own posture. WebMCP's declarative forms API also defaults to manual submission and requires an explicit `toolautosubmit` to let an agent submit.

`submit` waits for the submission to finish before answering, and reports what actually happened:

| Result                                     | When                                                                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Submitted successfully                     | `submission.action` ran and resolved cleanly.                                                                          |
| Submitted, came back with errors           | The action returned server-side validation errors.                                                                     |
| Not submitted, validation failed           | The form is invalid. The values sent are still in the form for correction.                                             |
| Not submitted, validation had not finished | Async validators were still resolving.                                                                                 |
| Not submitted, the submission failed       | The action threw or rejected.                                                                                          |
| Not submitted, already submitting          | Another submission was in flight and this one was dropped.                                                             |
| Submitted, the page handled it             | No `submission.action` is configured, so the `(submitted)` output received the value and there is no result to report. |

## Validating what the agent sends

Every argument is checked in code before anything reaches the form. The input schema is advisory: Angular's own WebMCP documentation warns that agent input may not be validated against it, and Chrome's guidance is to validate strictly in code.

The parser enforces known properties only, runtime types, `null` only where a field is nullable, enum membership, object and array structure, and each field's write policy. It also refuses a field the form has disabled or made read-only at the moment of the call.

A call that fails any of these is rejected whole. Nothing is half-applied, and the response says plainly that the form is unchanged and lists every problem at once, so one round trip is enough to fix them all.

Value constraints such as `minLength` or `pattern` are deliberately left to the form's own validators, which report them with the message you wrote.

## Controlling what an agent can see and change

Every field carries a policy, derived from the field itself unless you say otherwise:

| Field                               | Readable | Writable |
| ----------------------------------- | -------- | -------- |
| `type: 'hidden'`                    | no       | no       |
| `props.type === 'password'`         | no       | yes      |
| `readonly: true`, or a `derivation` | yes      | no       |
| anything else                       | yes      | yes      |

Override either axis per field, or hide a field from agents entirely:

```typescript
{ key: 'accountNumber', type: 'input', webMcp: { readable: false } },
{ key: 'internalRef', type: 'input', webMcp: false },
```

A field that is not readable still appears in the report by name, along with whether it currently holds a value. Only the value itself is withheld.

### Readback

By default a tool response returns only the values the call itself set, plus which fields apply, which are still empty, and any validation errors. That is enough for an agent to orient itself and correct its own work.

```typescript
options: { webMcp: { name: 'signup', description: '...', readback: 'all' } }
```

`readback: 'all'` returns the whole model instead, minus any field whose `webMcp.readable` is off.

> [!WARNING]
> Choose `readback: 'all'` deliberately. It hands an agent every value the form is holding, including data a user entered before the agent arrived. Chrome's guidance is explicit that even a read-only tool can reveal user information. See [WebMCP tool security](https://developer.chrome.com/docs/ai/webmcp/secure-tools).

Both tools are flagged `untrustedContentHint`, because the values they echo back are user content and a well-behaved agent should not treat them as instructions. That annotation is a prompt-injection hint. It does not keep user data out of the response, which is what the readback and per-field policies are for.

## What the agent sees in the schema

The tool schema is generated from your config, not from the form's current values. That means:

- `label` becomes the property title, and `placeholder` (or `props.placeholder`, or `props.hint`) becomes its description
- A select's `options` become an `enum`, plus an `anyOf` of `const` values carrying each option's label, so an agent choosing between opaque values such as country codes can tell what they mean
- Disabled options are left out, since an agent cannot select them
- Static validators become constraints. Both the shorthand form (`required`, `email`, `min`, `max`, `minLength`, `maxLength`, `pattern` declared on the field) and the advanced `validators` array are read
- `nullable: true` widens the property to accept `null`
- Fields an agent may not write are left out entirely

The schema describes a patch, so it carries no `required` list at any level. A `required` property would tell an agent it has to send that field on every call, which is the opposite of the contract. What is required right now comes back from `fill`, live.

Conditional validators (those with a `when` clause) and expression-driven ones are also left out. They depend on live form state, so freezing them into a schema the agent may have cached would misreport what the form accepts.

Validation errors come back using the messages you already wrote: a field's `validationMessages` first, then the form's `defaultValidationMessages`, with parameters interpolated.

## Following the config

Tools track the form's effective options. Change the config, rename the tools, remove `options.webMcp`, or turn `allowSubmit` off, and the previous tools are unregistered before the new ones are registered. This matters most for `allowSubmit`: turning it off has to actually revoke the agent's submission authority, not merely stop advertising it.

`webMcpStatus()` on the `DynamicForm` component reports where that stands: `disabled`, `idle`, `registering`, `active`, `unsupported`, or `failed`.

## Paged forms

A paged form is a single flat model, since pages affect layout rather than value shape. One set of tools covers every page, and an agent can fill fields from any page in one call. Navigation is not exposed as a tool.

## Known limitations

- **Arrays must be homogeneous.** ng-forge builds a list's schema from its item template, so an array declared with `value: []` is still fully described. An array whose item definitions differ by position is left out with a console warning. JSON Schema 2020-12 can express that shape through `prefixItems`, but the inference layer WebMCP vendors ignores the keyword, so emitting it would imply support agents do not get.
- **Tool names must be unique across the page.** Two forms sharing a `webMcp.name` collide, and the second registration is rejected. Give each form its own name, in the same way you would give it its own `idPrefix`.
- **Dynamic messages fall back to the error kind.** A `validationMessages` entry that is an Observable or Signal resolves per field at render time, which is not available when building a tool response. The same applies to a dynamic `label` or `placeholder`.
- **Async validation has a deadline.** A tool call waits up to five seconds for pending validators. If they are still running it says so rather than reporting a clean form.

## Testing

The browser contract is `document.modelContext`, which fakes cleanly. A useful fake enforces what the real one enforces: registration is asynchronous, a duplicate or malformed name rejects, and an aborted signal unregisters the tool. A recording spy that accepts everything will pass against code that is quietly broken.

```typescript
await page.addInitScript(() => {
  const tools = new Map<string, any>();
  (window as any).__mcp = {
    getTools: () => [...tools.values()],
    executeTool: (name: string, args: unknown) => tools.get(name).execute(args, {}),
  };
  (document as any).modelContext = {
    async registerTool(tool: any, options?: { signal?: AbortSignal }) {
      if (tools.has(tool.name)) throw new DOMException('duplicate', 'InvalidStateError');
      tools.set(tool.name, tool);
      options?.signal?.addEventListener('abort', () => tools.delete(tool.name));
    },
  };
});
```

That gives deterministic coverage of the whole round trip. It does not cover whether a real agent picks the right tool or understands the schema, which is probabilistic and worth checking separately, as [Chrome recommends](https://developer.chrome.com/docs/ai/webmcp/best-practices).

ng-forge keeps a small eval set for that second question, covering discovery, partial completion, correction after a validation error, conditional fields, opaque select values, and a negative control for a form that offers no submit tool. It lives in the repository under `packages/dynamic-forms/src/lib/core/web-mcp/eval`, with deterministic graders and a README describing how to run it. It has no CI target on purpose, since it needs an agent driving a browser.
