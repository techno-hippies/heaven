# Heaven Client

SolidJS UI and TypeScript helpers for the Heaven FHE dating contracts.

## Development

```bash
bun install
bun run storybook    # Component development
bun run dev          # Vite dev server
```

## Structure

```
src/
  components/
    atoms/       # Primitives (OptionCard, ScaleButton)
    molecules/   # Combinations (QuestionCard)
    screens/     # Full-page components
    ui/          # Generic UI (Button, Input)
encoding.ts      # Contract encoding helpers
```

See [`../CLAUDE.md`](../CLAUDE.md) for detailed attribute specifications.
