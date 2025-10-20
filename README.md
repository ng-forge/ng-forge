# 🚀 @ng-forge Dynamic Forms

A modern, signal-based dynamic forms library for Angular 21+.

## 📦 What's Included

This monorepo contains:

1. **@ng-forge/dynamic-form** - The headless core library
2. **@ng-forge/dynamic-form-material** - Material Design implementation
3. **Interactive Documentation** - Live examples and guides

## 📚 Documentation

**[📖 View Live Documentation](https://ng-forge.github.io/ng-forge)**

The documentation includes:
- Getting started guide
- Field type examples  
- UI integration examples
- API reference

## 🎯 Quick Start

```typescript
import { Component, signal } from '@angular/core';
import { DynamicFormComponent, FieldConfig } from '@ng-forge/dynamic-form';

@Component({
  imports: [DynamicFormComponent],
  template: `
    <ng-forge-dynamic-form
      [fields]="fields"
      [model]="model"
      (modelChange)="model.set($event)"
    />
  `
})
export class UserFormComponent {
  model = signal({ name: '', email: '' });

  fields: FieldConfig[] = [
    {
      key: 'name',
      type: 'input',
      props: { label: 'Name', required: true }
    },
    {
      key: 'email', 
      type: 'email',
      props: { label: 'Email', required: true }
    }
  ];
}
```

## ✨ Features

- 🎯 **Headless Architecture** - UI-agnostic core with Material implementation
- ⚡ **Signal-Based** - Built for Angular 21's Signal Forms API
- 🔒 **Type-Safe** - Full TypeScript support with strict typing
- 🌳 **Tree-Shakeable** - Optimized bundle sizes
- 📱 **Responsive** - Mobile-first Material Design components  
- ♿ **Accessible** - WCAG compliant with proper ARIA support
- 🚀 **Modern** - Signals, Standalone components, Control flow syntax

## 🛠️ Installation

```bash
npm install @ng-forge/dynamic-form @ng-forge/dynamic-form-material
# or
pnpm add @ng-forge/dynamic-form @ng-forge/dynamic-form-material
```

## 💡 Use Cases

- Dynamic form generation from JSON/API
- Admin panels and CRUD interfaces  
- Multi-step wizards and surveys
- Conditional form logic
- Configuration forms
- Data collection forms

## 🏗️ Development

```bash
# Clone and setup
git clone https://github.com/ng-forge/ng-forge.git
cd ng-forge
pnpm install

# Build libraries
pnpm run build:libs

# Serve documentation
pnpm run serve:docs
```

## 📄 License

MIT
