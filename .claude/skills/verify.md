---
name: verify
description: Visually verify UI/styling changes using Playwright browser and build checks before claiming a fix is complete
---

# Visual Verification

Verifies that UI, styling, or layout changes actually work by running build checks and visually inspecting affected pages in the browser.

## Required User Input

The user may provide:

- **Pages to check** (specific URLs or routes to verify)
- **What to look for** (specific visual criteria or regression concerns)
- **Modes** (light/dark, mobile/desktop — defaults to both light and dark)

## Workflow

### 1. Build check

```bash
# For library changes
nx build <affected-project>

# For docs site changes
nx build docs
```

If the build fails, stop and fix before proceeding.

### 2. Ensure dev server is running

For docs changes:

```bash
# Check if already running
lsof -i :4200 || pnpm serve:docs &
```

For sandbox/E2E changes:

```bash
lsof -i :4210 || nx serve sandbox-examples &
```

Wait for the server to be ready before proceeding.

### 3. Visual inspection

Use Playwright MCP tools to verify:

1. **Navigate** to each affected page
2. **Take a snapshot** and inspect the DOM state
3. **Check both light and dark mode** if styling was changed (toggle via the theme switcher or by evaluating `document.documentElement.classList.toggle('dark')`)
4. **Check mobile viewport** if layout/responsive changes were made (resize to 375px width)
5. **Look for regressions** on related pages (e.g., if sidebar was changed, check multiple doc pages)

### 4. Report findings

Provide a clear summary:

- What was checked (pages, viewports, modes)
- What looks correct
- Any issues found (with description of what's wrong)
- Screenshots or DOM snapshots as evidence

## When to use this skill

- After any UI, styling, or layout fix — before telling the user it's done
- After SSR/hydration fixes — verify no FOUC, white flash, or hydration mismatch
- After responsive/mobile fixes — verify at mobile and desktop widths
- When the user asks you to verify or check something visually

## Checklist

- [ ] Build passes with no errors
- [ ] Affected pages render correctly
- [ ] No visual regressions on related pages
- [ ] Dark mode checked (if styling changed)
- [ ] Mobile viewport checked (if layout changed)
- [ ] No console errors on affected pages
