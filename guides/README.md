# ng-forge Dynamic Forms - Developer Guides

This directory contains in-depth technical guides for developers working on or extending ng-forge dynamic forms. These guides explain the internal architecture, design patterns, and best practices used throughout the library.

## Overview

ng-forge is a type-safe, UI-agnostic dynamic forms library for Angular 21+ that provides declarative form configuration with full TypeScript inference and native signal forms integration.

## Guide Structure

### 1. [Architecture Overview](./01-architecture-overview.md)

**Topics Covered:**

- High-level system architecture
- Core components and their responsibilities
- Data flow from configuration to rendering
- Type system architecture
- Mapper system overview
- Validation system
- Conditional logic system
- Value handling patterns
- Event system
- Performance optimizations

### 2. [Type System Deep Dive](./02-type-system-deep-dive.md)

**Topics Covered:**

- Module augmentation pattern for type registry
- Field definition type hierarchy
- Form value type inference (recursive type mapping)
- Component type inference
- DynamicText type for i18n
- Generic type constraints
- Type inference limitations
- Advanced type patterns

### 3. [Creating a UI Adapter](./03-creating-ui-adapter.md)

**Topics Covered:**

- Complete walkthrough of building a UI adapter
- Project structure and setup
- Type registry augmentation
- Field component implementation patterns
- Shared components (error display)
- Field configuration
- Provider functions
- Test utilities
- Styles and theming
- Public API exports

### 4. [Mappers & Binding System](./04-mappers-and-binding-system.md)

**Topics Covered:**

- Understanding Angular Bindings
- Mapper interface and flow
- Built-in mappers (base, value, checkbox, button, group, row, page)
- Creating custom mappers
- Advanced mapper patterns (composition, factories, context-aware)
- Debugging and testing mappers
- Best practices

### 5. [Testing Guide](./05-testing-guide.md)

**Topics Covered:**

- Testing strategy overview (unit tests, type tests, E2E, visual regression)
- E2E testing with Docker-based Playwright
- Visual regression testing with screenshot comparison
- Type tests for UI adapters
- Unit test utilities for core library
- Testing validation (required, email, length, pattern)
- Testing conditional logic (visibility, required, disabled)
- Testing complex scenarios (multi-step forms, groups)
- Best practices and patterns

### 6. [Release Process](./06-release-process.md)

**Topics Covered:**

- Release branch strategy
- Creating release branches from specific commits
- Semantic versioning (patch, minor, major)
- Release workflow and CI/CD pipeline
- Hotfix process
- GitHub Releases integration
- npm publishing
- Troubleshooting releases
- Best practices

### 7. [Roadmap](./07-roadmap.md)

**Topics Covered:**

- Future development plans
- Planned features and improvements
- Version milestones

### 8. [Derivation System](./08-derivation-system.md)

**Topics Covered:**

- Derivation system architecture overview
- Key components (collector, validator, sorter, cache, orchestrator, applicator)
- Data flow from collection to runtime processing
- DerivationEntry and DerivationCollection structures
- Dependency extraction (automatic and explicit)
- Array field derivations with `$` placeholder
- Loop prevention mechanisms (cycle detection, chain tracking, equality checks, max iterations)
- Performance optimizations (topological sorting, caching, indexed lookups)
- Debugging with verbose logging
- Common issues and troubleshooting

## Quick Reference

### Common Tasks

| Task                                   | Guide                                                          | Section                    |
| -------------------------------------- | -------------------------------------------------------------- | -------------------------- |
| Understanding the library architecture | [Architecture Overview](./01-architecture-overview.md)         | All sections               |
| Creating a new UI adapter              | [Creating a UI Adapter](./03-creating-ui-adapter.md)           | All sections               |
| Adding a custom field type             | [Creating a UI Adapter](./03-creating-ui-adapter.md)           | Step 4-6                   |
| Understanding type inference           | [Type System Deep Dive](./02-type-system-deep-dive.md)         | Form Value Type Inference  |
| Extending the type registry            | [Type System Deep Dive](./02-type-system-deep-dive.md)         | Type Registry Architecture |
| Creating a custom mapper               | [Mappers & Binding System](./04-mappers-and-binding-system.md) | Creating Custom Mappers    |
| Writing type tests                     | [Testing Guide](./05-testing-guide.md)                         | Type Tests                 |
| Running E2E tests                      | [Testing Guide](./05-testing-guide.md)                         | E2E Testing                |
| Visual regression testing              | [Testing Guide](./05-testing-guide.md)                         | Visual Regression Testing  |
| Testing validation                     | [Testing Guide](./05-testing-guide.md)                         | Testing Validation         |
| Releasing a new version                | [Release Process](./06-release-process.md)                     | Release Workflow           |
| Creating a hotfix release              | [Release Process](./06-release-process.md)                     | Hotfix Workflow            |
| Understanding derivation flow          | [Derivation System](./08-derivation-system.md)                 | Data Flow                  |
| Debugging derivations                  | [Derivation System](./08-derivation-system.md)                 | Debugging                  |
| Array field derivations                | [Derivation System](./08-derivation-system.md)                 | Array Field Derivations    |
| Loop prevention mechanisms             | [Derivation System](./08-derivation-system.md)                 | Loop Prevention            |

### Key Concepts

**Type Registry:** Global registry of field types populated via TypeScript module augmentation. Allows UI adapters to register their field types while maintaining type safety.

**Mappers:** Functions that convert field definitions to Angular component bindings. Bridge between declarative config and component inputs.

**Field Definition:** Declarative object describing a form field. Contains key, type, value, validation, props, etc.

**Field Context:** Combination of field definition + form binding + mapper bindings. Everything needed to render a field component.

**Value Handling:** How fields contribute to form values. Modes: `include` (default), `exclude` (buttons), `flatten` (rows/pages).

**DynamicText:** Type allowing string, Observable, or Signal for i18n support.

## Development Workflow

### For Creating a New UI Adapter

1. Read [Architecture Overview](./01-architecture-overview.md) to understand the system
2. Read [Type System Deep Dive](./02-type-system-deep-dive.md) sections on module augmentation
3. Follow [Creating a UI Adapter](./03-creating-ui-adapter.md) step-by-step
4. Reference [Mappers & Binding System](./04-mappers-and-binding-system.md) for custom mappers
5. Write type tests for each field type: [Testing Guide](./05-testing-guide.md) - Type Tests
6. Add E2E tests to the corresponding example app: [Testing Guide](./05-testing-guide.md) - E2E Testing

### For Creating a Custom Field Type

1. Understand field component patterns: [Creating a UI Adapter](./03-creating-ui-adapter.md) - Step 4
2. Create custom mapper if needed: [Mappers & Binding System](./04-mappers-and-binding-system.md)
3. Register in field config: [Creating a UI Adapter](./03-creating-ui-adapter.md) - Step 6
4. Write type test: [Testing Guide](./05-testing-guide.md) - Type Tests

### For Understanding Type Safety

1. Read [Type System Deep Dive](./02-type-system-deep-dive.md) - all sections
2. Reference [Architecture Overview](./01-architecture-overview.md) - Type System section

### For Debugging Issues

1. Check data flow: [Architecture Overview](./01-architecture-overview.md) - Data Flow section
2. Debug mappers: [Mappers & Binding System](./04-mappers-and-binding-system.md) - Debugging Mappers
3. Add tests to reproduce: [Testing Guide](./05-testing-guide.md)

### For Releasing New Versions

1. Understand the release strategy: [Release Process](./06-release-process.md) - Overview
2. Create release branch: [Release Process](./06-release-process.md) - Release Workflow
3. Trigger and monitor: [Release Process](./06-release-process.md) - CI/CD Pipeline
4. Handle hotfixes: [Release Process](./06-release-process.md) - Hotfix Workflow

## Code Examples

All guides include extensive code examples demonstrating:

- ✅ Correct patterns (marked with ✅ DO)
- ❌ Anti-patterns (marked with ❌ DON'T)
- Real-world scenarios
- Complete implementations

## Related Documentation

- **CLAUDE.md** - Quick reference guide for AI assistant (project rules and patterns)
- **README.md** - User-facing documentation and getting started guide
- **internal/** - Project specifications and technical architecture
- **packages/\*/README.md** - Package-specific documentation

## Contributing

When adding new features or modifying existing ones:

1. Update relevant guides with new patterns
2. Add code examples demonstrating the feature
3. Update this README if adding new guides

## Architecture Principles

These guides are based on ng-forge's core principles:

1. **Type Safety** - End-to-end TypeScript inference
2. **Declarative Configuration** - Forms as data, not templates
3. **Signal Forms Integration** - Native Angular 21 support
4. **UI Agnostic** - Core library independent of UI frameworks
5. **Extensibility** - Easy to add custom field types and UI adapters
6. **Performance** - Lazy loading, OnPush, memoization, signals
7. **Developer Experience** - Autocomplete, type checking, clear errors

## Support

For questions or issues:

- 📖 Read these guides thoroughly
- 🔍 Check code examples in the guides
- 🐛 Search existing issues
- 💡 Open a discussion for architecture questions
- 🚀 Refer to the main README for user documentation

---

**Built with ❤️ for developers building dynamic forms in Angular**
