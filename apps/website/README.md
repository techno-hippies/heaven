# Heaven V2 - Minimal Setup

Minimal SolidJS + Tailwind CSS v4 + Storybook setup with core UI building blocks.

## Stack

- **SolidJS** - Reactive UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling with custom theme
- **Kobalte** - Accessible UI primitives
- **Corvu** - Drawer/sheet component
- **Phosphor Icons** - Icon system
- **Storybook** - Component development
- **Bun** - Package manager and runtime
- **Vite** - Build tool

## Structure

```
v2-app/
├── src/
│   ├── app/                      # App entry + routes
│   ├── layouts/                  # AppLayout + nav chrome
│   ├── pages/                    # Route-level pages
│   ├── features/                 # Feature slices (onboarding, survey, profile)
│   ├── ui/                       # UI primitives (stories live here)
│   ├── icons/                    # Phosphor icon wrapper
│   ├── lib/                      # Cross-cutting helpers
│   ├── index.css                 # Tailwind + theme
│   └── main.tsx                  # App entry
├── .storybook/                   # Storybook config
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

## UI Components

All components have Storybook stories (`.stories.tsx`):

| Component | Description |
|-----------|-------------|
| `Button` | Primary button with variants (default, outline, ghost, etc.) |
| `IconButton` | Icon-only button with accessible labels |
| `Dialog` | Modal dialog (Kobalte) with back button support |
| `Drawer` | Mobile-friendly bottom sheet (Corvu) with keyboard handling |
| `ChoiceSelect` | Single/multi-select button group |
| `Input` | Text input with variants (InputWithCopy, InputWithSuffix, Spinner, InputStatus) |
| `NotificationBadge` | Unread count badge |
| `Toggle` | Switch/toggle component |

## Scripts

```bash
bun install              # Install dependencies
bun run dev             # Start dev server (port 3001)
bun run storybook       # Start Storybook (port 6006)
bun run build           # Build for production
bun run check           # TypeScript check
```

## Features

- Full Tailwind CSS v4 theme from main app (colors, animations, utilities)
- Accessible components using Kobalte primitives
- Mobile-optimized drawer with keyboard support
- Tree-shakeable Phosphor icon system
- Haptic feedback utilities
- TypeScript strict mode
- All UI primitives have Storybook stories
