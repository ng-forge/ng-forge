---
title: WebMCP
slug: ai-integration/webmcp
description: 'Expose a dynamic form to browser AI agents as WebMCP tools, so an agent can fill it and read back live validation, with submission kept opt-in per form.'
---

# WebMCP

[WebMCP](https://developer.chrome.com/docs/ai/webmcp) lets a web page offer structured tools to an AI agent running in the browser. Instead of the agent guessing at your DOM and simulating clicks, it calls a function you declared, with arguments described by a schema.

ng-forge can generate those tools from a form config. Because the config already carries labels, option lists, and validators, the schema an agent receives is far richer than one inferred from the form's runtime values.

> [!WARNING]
> WebMCP is an emerging standard, and the Angular APIs underneath this feature are marked experimental. Expect changes outside major versions. It is in origin trial in Chrome 149; to try it locally you can use a browser extension such as the [Model Context Tool Inspector](https://github.com/beaufortfrancois/model-context-tool-inspector).

## Setup

Add the feature to your providers, then opt individual forms in.

```typescript
import { provideDynamicForm, withWebMcp } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withMaterialFields(), withWebMcp())],
};
```

```typescript
const config: FormConfig = {
  options: {
    webMcp: {
      name: 'signup',
      description: 'Sign a new user up with a username, plan and newsletter preference.',
    },
  },
  fields: [
    { key: 'username', type: 'input', label: 'Username', required: true },
    {
      key: 'plan',
      type: 'select',
      label: 'Plan',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Pro', value: 'pro' },
      ],
    },
  ],
};
```

Forms without `options.webMcp` register nothing, and the registration code is loaded on demand, so forms that never opt in carry no extra bundle weight.

## The tools

| Tool            | Registered              | What it does                                                                                                                           |
| --------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `fill_{name}`   | Always                  | Applies any subset of fields to the form and returns its current values, which fields apply, and any validation errors. Never submits. |
| `submit_{name}` | Only with `allowSubmit` | Applies any fields given, then submits. Returns the errors instead if validation fails.                                                |

### fill

`fill` writes to the real form, so the user watching the page sees the agent's work land in the fields. It accepts a partial patch and leaves everything else alone, which lets an agent build the form up over several calls.

Calling it with no fields changes nothing and just reports the current state, which is the natural way for an agent to orient itself before it starts.

Because it applies to the live form, everything it reports back is the genuine answer: cross-field validators, conditional visibility, and derivations all evaluate exactly as they would for a human typing.

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

This mirrors the platform's own posture: WebMCP's declarative forms API also defaults to manual submission and requires an explicit `toolautosubmit` to let an agent submit.

When `submit` does fail validation, the values it was given have already been applied and stay in the form. The response says so, so the agent can send just the corrections rather than starting over.

## What the agent sees

The tool schema is generated from your config, not from the form's current values. That means:

- `label` becomes the property title, and `placeholder` or `hint` becomes its description
- A select's `options` become an `enum`, so the agent knows the exact accepted values
- Static validators become constraints: `minLength`, `maxLength`, `pattern`, `minimum`, `maximum`, and the `required` list
- `nullable: true` widens the property to accept `null`

Conditional validators (those with a `when` clause) and expression-driven ones are deliberately left out of the schema. They depend on live form state, so freezing them into a schema the agent may have cached would misreport what the form accepts. They surface through `fill` instead, which reports live errors.

Validation errors come back using the messages you already wrote: a field's `validationMessages` first, then the form's `defaultValidationMessages`, with parameters interpolated. Both tools are flagged `untrustedContentHint`, because the values they echo back are user content and a well-behaved agent should not treat them as instructions.

## Paged forms

A paged form is a single flat model, since pages affect layout rather than value shape. One set of tools covers every page, and an agent can fill fields from any page in one call. Navigation is not exposed as a tool.

## Known limitations

- **Heterogeneous arrays are omitted.** JSON Schema describes an array with a single `items` schema, so an array whose item definitions differ by position cannot be expressed. Such a field is left out of the schema with a console warning. Arrays with a consistent item shape work normally.
- **Tool names must be unique across the page.** Two forms sharing a `webMcp.name` would register colliding tools. Give each form its own name, in the same way you would give it its own `idPrefix`.
- **Dynamic messages fall back to the error kind.** A `validationMessages` entry that is an Observable or Signal resolves per field at render time, which is not available when building a tool response.

## Testing

The browser contract is a single `document.modelContext.registerTool` call, which makes it straightforward to fake. Install a recording stub before your app boots, then call the registered tools directly:

```typescript
await page.addInitScript(() => {
  const tools: Record<string, unknown> = {};
  (window as any).__mcpTools = tools;
  (document as any).modelContext = {
    registerTool: (tool: { name: string }) => {
      tools[tool.name] = tool;
    },
  };
});
```

This gives you deterministic coverage of the whole round trip without needing an extension or a live agent. Use the Model Context Tool Inspector for exploratory checks of how a real agent behaves.
