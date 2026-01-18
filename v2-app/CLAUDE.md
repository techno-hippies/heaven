# v2-app

## Directory Structure

```
src/
├── ui/           # Design system primitives (dapp-agnostic)
├── components/   # Shared app components (app-specific, reusable)
├── features/     # Feature modules
│   └── <feature>/
│       ├── components/   # Feature-internal components
│       ├── hooks/        # Feature-specific hooks
│       └── steps/        # Multi-step flows (onboarding)
├── pages/        # Route pages
├── layouts/      # Page layouts
├── icons/        # Icon system (Phosphor)
├── lib/          # Utilities
└── app/          # App setup (providers, router)
```

## Component Hierarchy

| Layer | Location | Storybook Title | Purpose |
|-------|----------|-----------------|---------|
| **UI** | `src/ui/` | `UI/*` | Generic primitives. No app-specific copy or logic. |
| **Components** | `src/components/` | `Components/*` | App-specific but reusable across features. |
| **Features** | `src/features/<name>/` | `Features/<Name>/*` | Feature-scoped. Not shared outside feature. |

**Rule:** If it has app-specific copy (e.g., "Shared with matches"), it's not UI - put it in `components/` or `features/`.

## UI Primitives

### ChoiceSelect
Pill buttons for compact choices:
```tsx
import { ChoiceSelect } from '@/ui/choice-select'

<ChoiceSelect
  options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]}
  value={selected}
  onChange={setSelected}
  columns={2}
/>
```

### RadioCardSelect
Stacked cards for detailed options:
```tsx
import { RadioCardSelect } from '@/ui/radio-card-select'

<RadioCardSelect
  options={[
    { value: 'a', label: 'Option A', description: 'Details', icon: <Icon /> },
    { value: 'b', label: 'Option B', metadata: '$5' },
  ]}
  value={selected}
  onChange={setSelected}
/>
```

### Other UI
- `Button` - Primary actions
- `IconButton` - Icon-only buttons (always use for icon buttons)
- `Input` - Text input with validation states
- `Dialog` - Modal dialogs
- `Drawer` - Bottom sheets
- `Spinner` - Loading states (always use for loading)
- `Avatar` - User avatars
- `Toggle` - Boolean switches

## App Components

### VisibilitySelect
Pre-configured RadioCardSelect for privacy settings:
```tsx
import { VisibilitySelect } from '@/components/visibility-select'

<VisibilitySelect
  value={visibility}  // 'public' | 'match' | 'private'
  onChange={setVisibility}
  label="Who can see this?"
/>
```

## Onboarding Architecture

**Steps** (`features/onboarding/steps/`):
- Handle only their own UI and data
- Receive `data` and `onChange` props
- Do NOT render navigation

**OnboardingFlow** (`features/onboarding/OnboardingFlow.tsx`):
- Wraps steps with progress bar, back/next buttons
- Manages navigation and validation
- Configurable step order via `stepIds` prop

## Conventions

- **Icons**: Use `Icon` from `@/icons` (Phosphor)
- **Loading**: Always use `Spinner` from `@/ui/spinner`
- **Icon buttons**: Always use `IconButton` from `@/ui/icon-button`
- **Utilities**: `cn()` for classes, `haptic` for feedback
- **No emojis** in UI unless user-facing content requires it
