# Contributing to ng-forge

Thank you for your interest in contributing to ng-forge dynamic forms! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Types of Contributions

We welcome several types of contributions:

- 🐛 **Bug fixes** - Fix issues in existing functionality
- ✨ **New features** - Add new field types, UI adapters, or core features
- 📝 **Documentation** - Improve docs, guides, or examples
- 🧪 **Tests** - Add or improve test coverage
- 🎨 **UI adapters** - Create integrations for new UI libraries
- 🔧 **Tooling** - Improve build, dev experience, or CI/CD

### Before You Start

1. **Check existing issues** - Search for related issues or PRs
2. **Open an issue first** - For major changes, discuss your idea before implementing
3. **Read the guides** - Familiarize yourself with the [Developer Guides](./guides/README.md)

## Development Setup

### Prerequisites

- **Node.js**: >=20.0.0
- **pnpm**: >=8.0.0
- **Git**: Latest version

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/ng-forge/ng-forge.git
cd ng-forge

# Install dependencies
pnpm install

# Build all libraries
pnpm build:libs

# Run tests
pnpm test

# Start development server
pnpm serve:all
```

### IDE Setup

We recommend using **WebStorm** or **VS Code** with the following extensions:

- Angular Language Service
- ESLint
- Prettier
- EditorConfig

## Project Structure

```
ng-forge/
├── packages/           # Publishable libraries
│   ├── dynamic-forms/          # Core library
│   ├── dynamic-forms-material/ # Material Design adapter
│   ├── dynamic-forms-primeng/  # PrimeNG adapter
│   ├── dynamic-forms-ionic/    # Ionic adapter
│   └── dynamic-forms-bootstrap/# Bootstrap adapter
├── apps/
│   ├── docs/          # Documentation site
│   └── examples/      # Example applications
├── guides/            # Developer guides
├── .github/           # GitHub templates and workflows
└── internal/          # Internal documentation
```

## Development Workflow

### 1. Create a Branch

```bash
# For features
git checkout -b feature/your-feature-name

# For bug fixes
git checkout -b fix/issue-description

# For documentation
git checkout -b docs/what-you-are-documenting
```

### 2. Make Changes

Follow our [Coding Standards](./CODING_STANDARDS.md) while making changes.

### 3. Run Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
nx run dynamic-forms:test

# Run tests in watch mode
pnpm test:watch
```

### 4. Build

```bash
# Build all libraries
pnpm build:libs

# Build specific library
nx run dynamic-forms:build

# Build everything (libs + docs + examples)
pnpm build:all:prod
```

### 5. Lint

```bash
# Lint all projects
pnpm lint

# Auto-fix linting issues
pnpm lint:fix
```

## Coding Standards

See [CODING_STANDARDS.md](./CODING_STANDARDS.md) for detailed coding standards. Key points:

### Angular Patterns

- ✅ Use standalone components
- ✅ Use `input()` and `output()` functions
- ✅ Use signals for state management
- ✅ Use `@if`, `@for`, `@switch` (not `*ngIf`, `*ngFor`, `*ngSwitch`)
- ✅ Use OnPush change detection
- ❌ No NgModules
- ❌ No `@Input()` or `@Output()` decorators

### TypeScript

- Use strict type checking
- Avoid `any` - use `unknown` when uncertain
- Document public APIs with TSDoc
- Use type inference when obvious

### Testing

- Write tests for all new features
- Maintain or improve code coverage
- Test from user perspective
- Include edge cases

## Testing Guidelines

### Unit Tests

```typescript
describe('MyComponent', () => {
  it('should do something specific', async () => {
    // Arrange
    const config = TestUtils.builder().field({ key: 'test', type: 'input', value: '' }).build();

    // Act
    const { fixture, component } = await TestUtils.createTest({ config });

    // Assert
    expect(component).toBeTruthy();
  });
});
```

### Test Coverage

- Aim for **>80% coverage** for new code
- Test happy paths and edge cases
- Test error handling
- Test accessibility

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
feat(dynamic-forms): add support for async validators

Add AsyncValidatorConfig interface and implement async validation
support in form structure builder.

Closes #123

---

fix(primeng): correct select field option binding

The option binding was not properly updating when options changed
dynamically. This fixes the reactivity issue.

Fixes #456

---

docs(guides): add mapper creation custom-integrations

Add comprehensive custom-integrations for creating custom mappers with examples.
```

### Commit Message Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- First line should be ≤72 characters
- Reference issues and PRs in footer

## Pull Request Process

### Before Submitting

1. ✅ All tests pass: `pnpm test`
2. ✅ No linting errors: `pnpm lint`
3. ✅ Code is formatted: `pnpm lint:fix`
4. ✅ Documentation updated (if needed)
5. ✅ Changeset added (for library changes)
6. ✅ Commit messages follow convention

### Submitting a PR

1. **Push your branch**:

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** on GitHub

3. **Fill out the PR template** completely

4. **Request review** from maintainers

### PR Title Format

Use the same format as commit messages:

```
feat(dynamic-forms): add async validator support
fix(primeng): correct select field reactivity
docs: improve getting started guide
```

### PR Description

Include:

- **Summary**: What does this PR do?
- **Motivation**: Why is this change needed?
- **Changes**: Detailed list of changes
- **Breaking Changes**: If any
- **Testing**: How was this tested?
- **Screenshots**: If UI changes
- **Related Issues**: Links to related issues

### Review Process

1. **Automated checks** must pass (CI/CD, tests, lint)
2. **Code review** by at least one maintainer
3. **Address feedback** - make requested changes
4. **Approval** - PR is approved by maintainer
5. **Merge** - Maintainer will merge the PR

### After Merge

- Delete your branch
- Pull latest changes: `git pull origin main`
- Your changes will be included in the next release

## Documentation

### When to Update Docs

Update documentation when you:

- Add new features
- Change public APIs
- Add new field types or UI adapters
- Fix bugs that affect usage
- Add new examples

### Documentation Locations

- **User docs**: `apps/docs/src/docs/`
- **Developer guides**: `guides/`
- **API reference**: TSDoc comments in code
- **README files**: Package-level READMEs
- **Examples**: `apps/examples/`

### Writing Guidelines

- Be clear and concise
- Include code examples
- Use proper formatting (headings, lists, code blocks)
- Test all code examples
- Add diagrams where helpful

## Release Process

Releases are managed by maintainers. The process:

1. **Version bump**: Using Nx release
2. **Changelog**: Auto-generated from commits
3. **Build**: All libraries built for production
4. **Tests**: Full test suite passes
5. **Publish**: Published to npm
6. **Tag**: Git tag created
7. **GitHub Release**: Release notes published

### For Contributors

You don't need to worry about releases. Just:

1. Add changeset if your PR affects published packages:

   ```bash
   nx release version --dry-run
   ```

2. Maintainers will handle the release

## Working on Specific Areas

### Adding a New UI Adapter

See [Creating a UI Adapter Guide](./guides/03-creating-ui-adapter.md)

**Checklist:**

- [ ] Package structure follows standard
- [ ] Type registry augmentation created
- [ ] All field components implemented
- [ ] Provider function created
- [ ] Test utilities created
- [ ] Tests pass
- [ ] Documentation added
- [ ] Example application created

### Adding a New Field Type

**Checklist:**

- [ ] Type definition created
- [ ] Component implemented
- [ ] Mapper configured (or custom mapper created)
- [ ] Type registry updated
- [ ] Tests added
- [ ] Documentation updated

### Fixing Bugs

**Checklist:**

- [ ] Issue identified and reproduced
- [ ] Test added that reproduces the bug
- [ ] Fix implemented
- [ ] Test now passes
- [ ] No regressions (all tests pass)
- [ ] Documentation updated (if needed)

## Getting Help

- 📖 Read the [Developer Guides](./guides/README.md)
- 💬 Open a [Discussion](https://github.com/ng-forge/ng-forge/discussions)
- 🐛 Report bugs via [Issues](https://github.com/ng-forge/ng-forge/issues)
- 📧 Contact maintainers (see package.json)

## Recognition

Contributors are recognized in:

- Repository contributors page
- Release notes
- CHANGELOG.md
- Project README (for significant contributions)

## Questions?

If you have questions about contributing, feel free to:

1. Check existing documentation
2. Search closed issues and PRs
3. Open a discussion
4. Ask in your PR

Thank you for contributing to ng-forge! 🎉
