---
title: Addon Password Toggle
slug: examples/addon-password-toggle
description: 'The toggle-password-visibility preset flips a password input between hidden and visible. Ships in every adapter with no handler code.'
---

The `'toggle-password-visibility'` preset flips the input's `type` attribute between `'password'` and `'text'`. The button addon writes to a per-field type-override signal provided by the adapter; the input reads the override when computing its effective `type`. Click the eye icon below to see the value reveal, then click again to hide.

## Live Demo

<docs-live-example scenario="examples/addon-password-toggle"></docs-live-example>

## What to read next

- **[Presets and Actions](/addons/presets-and-actions)**: the full preset table and `actionRef` recipe for registered handlers.
- **[Addons / Overview](/addons/overview)**: addon kinds and slots primer.
