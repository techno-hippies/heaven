# Noir Date - Zama FHE Client

## Package Manager

Always use Bun, never npm/yarn/pnpm:
- `bun install` not `npm install`
- `bun add <pkg>` not `npm install <pkg>`
- `bun run <script>` not `npm run <script>`

## Stack

- **SolidJS** - Not React
- **Vite** - Dev server and bundler
- **Storybook** - Component development (`bun run storybook`)
- **Tailwind CSS v4** - Styling
- **phosphor-solid** - Icons (no emojis in UI)

## Icons

Use phosphor-solid, not emojis:
```tsx
import { Lock, Eye, X } from 'phosphor-solid'

<Lock size={20} weight="bold" />
```

Common icons:
- Lock, LockOpen - Privacy/security
- Eye, EyeSlash - Visibility
- Check, X - Confirm/cancel
- Heart, HeartBreak - Like/pass
- User, Users - Profile
- Sliders, Funnel - Filters/preferences
- Shield, ShieldCheck - Verified

## Commands

```bash
bun install          # Install deps
bun run storybook    # Component dev (port 6006)
bun run dev          # Vite dev server
bun run build        # Production build
```

## Project Structure

```
src/
  components/
    atoms/       # Primitives (OptionCard, ScaleButton, PolicyChip)
    molecules/   # Combinations (QuestionCard, etc)
    screens/     # Full-page components
    ui/          # Generic UI (Button, Input, etc)
    dating/      # Dating-specific (deprecated, use atoms)
  lib/
    utils.ts     # cn() helper
encoding.ts      # Contract types and encoding
```

## Contracts

See `../contracts/DatingV2.sol` and `../contracts/Directory.sol` for:
- 12 encrypted attributes (FHE)
- NONE/DEALBREAKER/CRITERIA policies
- 0=hidden encoding for public fields
