# 🚀 @ng-forge Dynamic Forms - First Two Libraries

Welcome! This package contains everything you need to get started with the **@ng-forge dynamic forms library** - a modern, signal-based dynamic forms solution for Angular 21+.

## 📦 What's Included

This package contains the complete source code and documentation for:

1. **@ng-forge/dynamic-form-core** - The headless core library
2. **@ng-forge/dynamic-form-material** - Material Design implementation

For detailed instructions, see **[SETUP_GUIDE.md](docs/SETUP_GUIDE.md)**

## 📚 Documentation

### Start Here:
- **[INDEX.md](docs/INDEX.md)** - Overview and file structure
- **[SETUP_GUIDE.md](docs/SETUP_GUIDE.md)** - Step-by-step setup
- **[QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)** - Quick lookup guide

### Deep Dive:
- **[GENERATED_FILES_SUMMARY.md](docs/GENERATED_FILES_SUMMARY.md)** - Architecture and implementation details
- **[DIRECTORY_TREE.txt](docs/DIRECTORY_TREE.txt)** - Visual directory structure
- **[core-lib/README.md](./core-lib/README.md)** - Core library docs
- **[material-lib/README.md](./material-lib/README.md)** - Material library docs

## 🎯 Example Usage

```typescript
import { Component, signal } from '@angular/core';
import { DynamicFormComponent, FieldConfig } from '@ng-forge/dynamic-form-core';

@Component({
  selector: 'app-user-form',
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
  model = signal({
    firstName: '',
    lastName: '',
    email: '',
  });

  fields: FieldConfig[] = [
    {
      key: 'firstName',
      type: 'input',
      props: {
        label: 'First Name',
        required: true
      }
    },
    {
      key: 'lastName',
      type: 'input',
      props: {
        label: 'Last Name',
        required: true
      }
    },
    {
      key: 'email',
      type: 'email',
      props: {
        label: 'Email',
        required: true
      },
      validators: {
        email: true
      }
    }
  ];
}
```

## ✨ Key Features

### Core Library:
- 🎯 **Headless Architecture** - UI-agnostic core
- ⚡ **Signal-Based** - Angular 21's Signal Forms API
- 🔒 **Type-Safe** - Full TypeScript support
- 🌳 **Tree-Shakeable** - Optimal bundle sizes
- 🔌 **Extensible** - Easy to customize
- 🚀 **Lazy Loading** - Code-splitting support

### Material Library:
- 🎨 **Material Design** - Beautiful, accessible components
- ♿ **WCAG 2.1 AA** - Accessibility compliant
- 📝 **8 Field Types** - Input, email, password, number, tel, url, select, checkbox
- 🎭 **Error Handling** - Automatic validation messages
- 🎯 **Type Inheritance** - DRY field definitions

## 📁 Package Structure

```
ng-forge-libraries/
├── core-lib/              # Core library source
├── material-lib/          # Material library source
├── generate-libs.sh       # Setup script
└── *.md                   # Documentation
```

## 🛠️ What You Get

- **20 Source Files** - Production-ready TypeScript code
- **4,300+ Lines** - Fully implemented features
- **4 Documentation Files** - Comprehensive guides
- **Complete Examples** - Working code samples
- **Best Practices** - Angular 21+ patterns

## 🎓 Learning Path

1. **Beginner** → Start with [QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)
2. **Setup** → Follow [SETUP_GUIDE.md](docs/SETUP_GUIDE.md)
3. **Understanding** → Read [INDEX.md](docs/INDEX.md)
4. **Deep Dive** → Explore [GENERATED_FILES_SUMMARY.md](docs/GENERATED_FILES_SUMMARY.md)
5. **Building** → Check library README files

## 🚦 Implementation Status

### ✅ Completed (Phase 1):
- [x] Core library architecture
- [x] Field configuration models
- [x] Field registry with lazy loading
- [x] Form builder service
- [x] Provider configuration
- [x] Main form component
- [x] Material input fields (6 variants)
- [x] Material select fields
- [x] Material checkbox fields
- [x] Comprehensive documentation

### 🔄 Next Phase:
- [ ] Radio buttons
- [ ] Date picker
- [ ] Textarea
- [ ] Autocomplete
- [ ] Validation framework
- [ ] Expression parser
- [ ] Testing utilities

## 💡 Use Cases

Perfect for:
- ✅ Dynamic form generation from JSON
- ✅ Admin panels and CRUD interfaces
- ✅ Multi-step wizards
- ✅ Conditional form logic
- ✅ Form builders and designers
- ✅ API-driven forms

## 🏗️ Architecture Highlights

### Design Principles:
1. **Headless Core** - UI-agnostic design
2. **Provider Pattern** - Functional configuration
3. **Signal-Based** - Fine-grained reactivity
4. **Type-Safe** - Strong TypeScript support
5. **Standalone** - No NgModules

### Best Practices:
- ✅ OnPush change detection
- ✅ Input/output functions
- ✅ Computed signals
- ✅ Lazy loading support
- ✅ Tree-shakeable exports

## 🤝 Contributing

This is the initial release (v0.0.1). Future contributions should:
1. Follow Angular style guide
2. Use TypeScript strict mode
3. Include tests
4. Update documentation

## 📞 Support

### Documentation:
- [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) - Setup help
- [QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) - Usage help
- Library README files - API docs

### Resources:
- [Angular Docs](https://angular.dev)
- [Material Docs](https://material.angular.io)
- [Nx Docs](https://nx.dev)

## 📄 License

MIT

## 🎉 Ready to Build?

Start with the [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) and you'll have your first dynamic form running in minutes!
