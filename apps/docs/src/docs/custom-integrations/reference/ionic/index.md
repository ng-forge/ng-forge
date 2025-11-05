# Ionic Integration

> **Status: Coming Soon** 🚧
> Ionic integration for ng-forge dynamic forms is currently in development. Check back soon for updates!

## What's Planned

The Ionic integration will provide:

- **Ionic mobile-first components** - All native Ionic form components
- **iOS and Android styling** - Platform-specific styling (Material on Android, iOS native on iOS)
- **Touch-optimized controls** - Large touch targets, swipe gestures
- **Mobile gestures support** - Pull-to-refresh, slide-to-delete, and more
- **Ionic icons** - Full Ionicons integration

## In the Meantime

While we complete the Ionic integration, you have two options:

### 1. Use the Material Integration

The **[Material Design integration](../material)** is production-ready and fully documented. It provides the same features and works well on mobile with proper viewport configuration.

### 2. Build Your Own Integration

You can create Ionic field components using our integration system. The **[Material integration source code](https://github.com/ng-forge/ng-forge/tree/main/packages/dynamic-form-material)** serves as a complete reference implementation:

- **Field Components**: See how Material components are implemented
- **Type Safety**: Module augmentation patterns for custom props
- **Validation Integration**: How Material displays validation errors
- **Field Mappers**: Registration and configuration patterns

Start with the **[Custom Integration Guide](../../guide)** which walks through the process step-by-step.

## Stay Updated

Want to be notified when Ionic integration is ready?

- ⭐ [Star the project on GitHub](https://github.com/ng-forge/ng-forge)
- 💬 [Join discussions](https://github.com/ng-forge/ng-forge/discussions)
- 📢 [Track the Ionic integration issue](https://github.com/ng-forge/ng-forge/issues)
