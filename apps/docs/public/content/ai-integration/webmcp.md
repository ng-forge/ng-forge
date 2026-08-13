---
title: WebMCP
slug: ai-integration/webmcp
description: 'Expose a dynamic form to browser AI agents as WebMCP tools, so an agent can read the form, check values against live validation, and submit through the form own submission path.'
---

# WebMCP

[WebMCP](https://developer.chrome.com/docs/ai/web-mcp) lets a web page offer structured tools to an AI agent running in the browser. Instead of the agent guessing at your DOM and simulating clicks, it calls a function you declared, with arguments described by a schema.

ng-forge can generate those tools from a form config. Because the config already carries labels, option lists, and validators, the schema an agent receives is far richer than one inferred from the form's runtime values.

> [!WARNING]
> WebMCP is an emerging standard, and the Angular APIs underneath this feature are marked experimental. Expect changes outside major versions. Today you need a browser extension such as the [Model Context Tool Inspector](https://github.com/beaufortfrancois/model-context-tool-inspector) to exercise it.

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

## The two tools

Each opted-in form registers a pair, named from `webMcp.name`.

| Tool             | Purpose                                                                                 | Modifies the form |
| ---------------- | --------------------------------------------------------------------------------------- | ----------------- |
| `{name}_inspect` | Read current values, which fields apply, and current errors. Optionally dry-run values. | No                |
| `{name}_submit`  | Apply values and submit through the form's normal submission path.                      | Yes               |

### inspect

Called with no arguments, it reports the form as it stands: current values, which fields are currently applicable, which are required right now, and any validation errors.

Called with `values`, it checks those values without touching the form. The agent gets validation feedback and can correct itself before committing to a submit.

### submit

Applies the values and dispatches the form's `submit` event, so your `submission.action` runs exactly as it would for a user pressing the button. If validation fails, nothing is submitted and the errors come back instead.

## What the agent sees

The tool schema is generated from your config, not from the form's current values. That means:

- `label` becomes the property title, and `placeholder` or `hint` becomes its description
- A select's `options` become an `enum`, so the agent knows the exact accepted values
- Static validators become constraints: `minLength`, `maxLength`, `pattern`, `minimum`, `maximum`, and the `required` list
- `nullable: true` widens the property to accept `null`

Conditional validators (those with a `when` clause) and expression-driven ones are deliberately left out of the schema. They depend on live form state, so freezing them into a schema the agent may have cached would misreport what the form accepts. The `inspect` tool reports them instead.

## Async validation on dry runs

By default, `inspect` runs synchronous validation only. An agent may call it repeatedly while it works out what to send, and each call would otherwise hit whatever endpoint your async or HTTP validators talk to. The response tells the agent that server-side checks run on submit.

If every async validator on your forms is safe to call speculatively, opt in:

```typescript
provideDynamicForm(...withMaterialFields(), withWebMcp({ allowAsyncValidation: true }));
```

## Paged forms

A paged form is a single flat model, since pages affect layout rather than value shape. One pair of tools covers every page, and an agent can fill fields from any page in one call. Navigation is not exposed as a tool.

## Known limitations

- **Dry runs do not re-derive visibility.** Conditional `hidden` and `disabled` logic resolves through an evaluation context bound to the live form, so `inspect` reports applicability as the form stands now. Sending values that change visibility may bring other fields into play. The response says so, and a real submit applies the change.
- **Heterogeneous arrays are omitted.** JSON Schema describes an array with a single `items` schema, so an array whose item definitions differ by position cannot be expressed. Such a field is left out of the schema with a console warning. Arrays with a consistent item shape work normally.
- **Tool names must be unique across the page.** Two forms sharing a `webMcp.name` would register colliding tools. Give each form its own name, in the same way you would give it its own `idPrefix`.

## Testing

The browser contract is a single `navigator.modelContext.registerTool` call, which makes it straightforward to fake. Install a recording stub before your app boots, then call the registered tools directly:

```typescript
await page.addInitScript(() => {
  const tools: Record<string, unknown> = {};
  (window as any).__mcpTools = tools;
  (navigator as any).modelContext = {
    registerTool: (tool: { name: string }) => {
      tools[tool.name] = tool;
    },
  };
});
```

This gives you deterministic coverage of the whole round trip without needing an extension or a live agent. Use the Model Context Tool Inspector for exploratory checks of how a real agent behaves.
