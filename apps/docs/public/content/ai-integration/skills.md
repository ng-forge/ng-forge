---
title: Agent Skill
slug: ai-integration/skills
description: 'Install the ng-forge agent skill as plain files, with no server to run, and validate generated FormConfig objects from the command line. The route for environments where MCP servers are not permitted.'
---

# Agent Skill

An [agent skill](https://code.claude.com/docs/en/skills) is a set of instructions your coding assistant loads when it recognises the task. The ng-forge skill teaches an assistant how to write FormConfig objects, and tells it to check its own work with a real validator.

It is plain markdown. No process runs, no port opens, and nothing needs approval beyond letting files into the repository. That makes it the route for teams who cannot run an MCP server, whether because security review has not cleared it, the IDE is locked down, or the policy is simply no.

## Install

```bash
npx skills add ng-forge/ng-forge --skill ng-forge-dynamic-forms
```

The [installer](https://github.com/vercel-labs/skills) supports Claude Code, Cursor, Codex, OpenCode and others, and can install per project or globally. There is no registry involved: it reads this repository directly over git.

If you would rather not use the installer, copy `skills/dynamic-forms/` out of the repository by hand.

## What it contains

`SKILL.md` is deliberately short. The detail sits in reference files the assistant reads only when it needs them.

| File                        | Contents                                                               |
| --------------------------- | ---------------------------------------------------------------------- |
| `SKILL.md`                  | The rules that get broken most often, and the write-then-validate loop |
| `references/rules.md`       | The full authoring contract, including expression syntax and i18n      |
| `references/field-types.md` | Every field type, its props, and where it may be nested                |
| `references/patterns.md`    | Working configurations to adapt                                        |
| `references/pitfalls.md`    | The error-to-fix table                                                 |

All of it is generated from the same registries that back the [MCP server](/ai-integration/mcp-server), so the two cannot drift apart. Every configuration in `patterns.md` is checked against the real schema by the test suite.

## The validation loop

An assistant's confidence in its own output is not evidence. The skill's central instruction is to run a validator, which ships as a command:

```bash
npx @ng-forge/dynamic-forms-cli "src/**/*.form.ts" --ui material
```

It finds every FormConfig in the matched files, validates it against the schema for your adapter, and reports the exact property that is wrong along with the fix. This is the same validation the MCP server performs, because both call the same package.

```
# Validation Report

**File:** src/app/checkout/checkout.form.ts
**UI Integration:** material

## Found 1 FormConfig(s)

### 2 Error(s) Found

#### checkoutForm (line 8): Invalid

- **fields[3].props.options:** "options" MUST be at FIELD level, NOT inside props!
  - **Fix:** Move `options` from `props: { options: [...] }` to field level: `{ key, type, options: [...] }`
- **fields[7].value:** Hidden field "token" is MISSING REQUIRED "value" property.
  - **Fix:** Hidden fields REQUIRE a `value` property. Add: `value: "your-value-here"`
```

### Options

| Flag                     | Default    | Description                                        |
| ------------------------ | ---------- | -------------------------------------------------- |
| `-u, --ui <integration>` | `material` | One of `material`, `bootstrap`, `primeng`, `ionic` |
| `--json`                 | off        | Emit machine-readable JSON instead of the report   |
| `-q, --quiet`            | off        | Only print failures                                |

### Exit codes

| Code | Meaning                                                      |
| ---- | ------------------------------------------------------------ |
| `0`  | Every config valid, or no configs found in the matched files |
| `1`  | At least one config failed validation                        |
| `2`  | Unknown UI integration, or no files matched                  |

Code `2` is separate from `1` so a typo in a glob does not read as a passing run. That makes the command safe as a CI gate:

```yaml
- name: Validate form configs
  run: npx @ng-forge/dynamic-forms-cli "src/**/*.form.ts" --ui material --quiet
```

## What the compiler already covers

For configs written in TypeScript, `as const satisfies FormConfig` plus a typecheck catches a large share of mistakes before any of this runs. Use both.

The CLI exists for what the compiler cannot see: structural rules such as containers accepting only `hidden` logic, hidden fields requiring a `value`, and configs that are not TypeScript at all.

## Configs that arrive at runtime

If your forms come from an API or a CMS, neither the compiler nor the CLI can reach them. Validate them where they land:

```typescript
import { validateFormConfig } from '@ng-forge/dynamic-forms-zod/validate';

const result = validateFormConfig('material', configFromApi);

if (!result.valid) {
  console.error(result.errorSummary);
}
```

The same package generates JSON Schema, which is useful for constraining an LLM's structured output to configs that will actually render:

```typescript
import { getFormConfigJsonSchema } from '@ng-forge/dynamic-forms-zod/validate';

const schema = getFormConfigJsonSchema('material');
```

## Reading the docs directly

The whole documentation site is published in a form assistants can read without any integration:

| File                                                                | Contents                |
| ------------------------------------------------------------------- | ----------------------- |
| [`llms.txt`](https://ng-forge.com/dynamic-forms/llms.txt)           | Index of every page     |
| [`llms-full.txt`](https://ng-forge.com/dynamic-forms/llms-full.txt) | Full text of every page |

## Compared to the MCP server

| MCP tool           | Equivalent with the skill                                                   |
| ------------------ | --------------------------------------------------------------------------- |
| `ngforge_validate` | `npx @ng-forge/dynamic-forms-cli`, or the `@ng-forge/dynamic-forms-zod` API |
| `ngforge_lookup`   | `references/rules.md` and `references/field-types.md`, or `llms-full.txt`   |
| `ngforge_examples` | `references/patterns.md`                                                    |
| `ngforge_scaffold` | The patterns, adapted by the assistant                                      |
| `ngforge_search`   | No direct equivalent. Use the docs site search                              |

The skill loses interactive lookup: the assistant reads whole reference files rather than querying for one topic. In exchange it needs no server, works across assistants, and its validation runs in CI.

## Versioning

`npx skills add` installs a snapshot, and nothing links it to the version of ng-forge you have installed. The skill states which version it documents and tells the assistant to check the installed version first, so a mismatch surfaces as a warning rather than as confidently wrong output. Re-run the install command after upgrading.
