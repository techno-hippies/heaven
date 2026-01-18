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

### Three-Phase Structure

Onboarding is split into 3 phases based on where data is stored:

**Phase 1: On-Chain Profile (ENS + Contract)**
- `name` - ENS subname
- `photo` - Avatar (non-realistic, public)
- `gender` - Gender identity → `encGenderId` (encrypted)
- `age` - Age → `encAge` (encrypted)
- `interested-in` - Gender preferences → `encDesiredMask` (encrypted)

After Phase 1, profile is minted to contract (optimistic - fires in background, user continues to Phase 2).

**Phase 2: Extended Profile (IPFS/Filebase)**
- `private-photos` - Realistic photos (encrypted, revealed on match)
- `region` - Location
- `also-dating-in` - Secondary regions
- `relationship-status-about-me`
- `relationship-structure-about-me`
- `group-play`
- `kids-about-me`
- `family-plans`
- `looking-for`
- `religion`

**Phase 3: Match Preferences**
- `seeking-age` - Age range filter
- `relationship-structure-pref`
- `kids-pref`

### Contract Fields (DatingV3)

```solidity
// Gender IDs: 1=Man, 2=Woman, 3=Trans man, 4=Trans woman, 5=Non-binary
encGenderId   // euint8 - user's gender
encAge        // euint8 - user's age
encDesiredMask // euint16 - 5-bit bitmask of desired genders
```

### Step Configuration

Step order defined in `features/onboarding/config.ts`:
```typescript
import { onboardingStepOrder } from './config'
// Always import from config - don't hardcode step arrays
```

### Step Components

**Steps** (`features/onboarding/steps/`):
- Handle only their own UI and data
- Receive `data` and `onChange` props
- Export `*StepMeta` with id, title, subtitle (string or string[] for bullets), validate
- Do NOT render navigation or headers

**OnboardingFlow** (`features/onboarding/OnboardingFlow.tsx`):
- Uses `StepHeader` for title/subtitle (supports bullet points)
- Manages navigation and validation
- Step order passed via `stepIds` prop (use `onboardingStepOrder` from config)

### Mint Strategy

Optimistic minting - user doesn't wait:
1. User clicks "Next" on preview step
2. Mint transaction fires in background
3. User immediately advances to Phase 2
4. If mint fails: show non-blocking toast/banner with retry
5. If mint succeeds: silent (profile active)

## Conventions

- **Icons**: Use `Icon` from `@/icons` (Phosphor)
- **Loading**: Always use `Spinner` from `@/ui/spinner`
- **Icon buttons**: Always use `IconButton` from `@/ui/icon-button`
- **Utilities**: `cn()` for classes, `haptic` for feedback
- **No emojis** in UI unless user-facing content requires it
