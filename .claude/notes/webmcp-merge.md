# Merging feat/ai-tooling-without-mcp with feat/webmcp-integration

Both branches turn the AI Integration nav entry into a category, from
opposite directions. Whichever lands second hits one real conflict.

## The only conflict this branch causes

`apps/docs/src/app/layout/nav.config.ts`, the `children` array.

Resolution: take the label from webmcp, which drops the "(MCP)" suffix,
correct once the category holds more than the MCP page. Then concatenate
the three children.

```ts
{
  label: 'AI Integration',
  path: 'ai-integration',
  cssClass: 'sidebar-link--ai',
  children: [
    { label: 'IDE Usage (MCP)', path: 'ai-integration/mcp-server' },
    { label: 'WebMCP', path: 'ai-integration/webmcp', badge: 'NEW' },
    { label: 'Agent Skill', path: 'ai-integration/skills', badge: 'NEW' },
  ],
},
```

Only one of the three should keep `badge: 'NEW'` for long. Drop whichever
is no longer new at merge time.

## Not caused by this branch

`packages/dynamic-forms/internal/src/lib/models/index.ts` also conflicts.
That one is between webmcp and main: webmcp branched at `40cf5fe43`, which
main is well ahead of. This branch touches nothing under
`packages/dynamic-forms/internal/`. Rebasing webmcp on main resolves it
independently of this work.

## Follow-up once merged

`ai-integration/mcp-server.md` has no link to the skills page. That was
left out deliberately: this branch avoided editing the file webmcp
renames, so the merge stays a one-hunk content conflict rather than a
rename/modify. Add a pointer from the MCP page to the skill page after
merging.

Badge rendering on second-level nav links came from this branch, in
`docs-layout.component.html`. Before it, `badge` was only honoured on
top-level items, so webmcp's `badge: 'NEW'` on the WebMCP child would
have been silently dropped.
