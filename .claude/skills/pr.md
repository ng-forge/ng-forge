---
name: pr
description: Run all quality checks and create a pull request with proper conventional commit title and summary
---

# Create Pull Request

Runs full quality checks and creates a PR with commitlint-compliant title and comprehensive summary.

## Required User Input

The user may provide:

- **Target branch** (default: `main`)
- **PR title** (if not provided, will be inferred from commits)
- **Description context** (optional additional notes)

## Workflow

### 1. Assess current state

```bash
git status
git log --oneline main..HEAD
git diff --stat main..HEAD
```

Verify:

- Branch is not `main` or `master`
- There are commits to PR
- Working tree is clean (or ask user about uncommitted changes)

### 2. Run all quality checks

Run these in parallel where possible:

```bash
# Build all affected libraries
nx run-many -t build --affected

# Run all affected tests
nx run-many -t test --affected

# Lint all affected projects
nx run-many -t lint --affected

# Check formatting
pnpm format:check
```

**If any check fails, stop and report.** Do not create the PR with failing checks.

### 3. Check MCP registry (if dynamic-forms changed)

```bash
nx run dynamic-form-mcp:generate-registry
git diff --exit-code packages/dynamic-form-mcp/src/registry/
```

If registry is out of date, commit the update before proceeding.

### 4. Push branch

```bash
git push -u origin $(git branch --show-current)
```

### 5. Draft PR title and body

**Title format** — must follow conventional commits:

```
<type>(<scope>): <subject>
```

Infer from the commits:

- Single feature commit → use its message
- Multiple commits → summarize the overall change
- Mixed types → use the dominant type

**Body format:**

```markdown
## Summary

- [1-3 bullet points describing the change]

## Changes

- [List of specific changes made]

## Test plan

- [ ] Unit tests pass
- [ ] Build succeeds
- [ ] Lint passes
- [ ] [Any additional testing done]
```

### 6. Create the PR

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
<body content>
EOF
)"
```

### 7. Report

Return the PR URL to the user.

## Title Rules

- Lowercase subject
- Imperative mood ("add", not "added")
- No period at end
- Max 100 characters
- **No AI attribution** — never mention Claude, AI, or automated tools
- Allowed types: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `build`, `ci`, `chore`, `style`, `revert`
- Allowed scopes: `core`, `forms`, `dynamic-forms`, `material`, `bootstrap`, `primeng`, `ionic`, `mcp`, `docs`, `examples`, `release`, `deps`, `config`, or empty

## Checklist

- [ ] All quality checks pass (build, test, lint, format)
- [ ] MCP registry up to date (if applicable)
- [ ] Branch pushed to remote
- [ ] PR title follows conventional commit format
- [ ] PR body includes summary and test plan
- [ ] No AI attribution in title or body
