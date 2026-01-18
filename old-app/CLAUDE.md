# Neodate App

## Package Manager

Always use **bun** instead of npm for all package management commands:

- `bun install` instead of `npm install`
- `bun run dev` instead of `npm run dev`
- `bun run build` instead of `npm run build`
- `bun run check` instead of `npm run check`
- `bun add <package>` instead of `npm install <package>`
- `bun remove <package>` instead of `npm uninstall <package>`

## Tech Stack

- SolidJS with TypeScript
- Tailwind CSS v4
- Vite
- Storybook for component development
- Kobalte for accessible UI primitives
- Corvu for drawer/sheet components
- Phosphor Icons (phosphor-icons-solid)

## Project Structure

- `src/components/ui/` - Base UI components (Button, Avatar, Input, Dialog, Drawer, etc.)
- `src/components/icons/` - Icon system using Phosphor icons
- `src/components/chat/` - Chat-related components
- `src/pages/` - Page components
- `src/lib/utils.ts` - Utility functions (cn, haptic)

## Architecture

See [../README.md](../README.md) for full architecture, database schema, claim system, and integration details.
