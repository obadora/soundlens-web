# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Soundlens Web is a Next.js 16-based web application using the App Router architecture. The project is developed primarily in Japanese, with all documentation and templates in Japanese.

## Development Commands

### Running the Application
```bash
npm run dev          # Start dev server on http://localhost:3000 (binds to 0.0.0.0)
npm run build        # Production build
npm start            # Run production server
npm run lint         # Run ESLint
```

### Dev Container Setup
This project uses Docker with dev containers:
- Dev container automatically runs `npm install` on creation
- Git operations should be performed on the host machine, not inside the container

## Architecture & Tech Stack

### Core Stack
- **Next.js 16.0.1** - App Router (not Pages Router)
- **React 19.2.0** - Server components by default
- **TypeScript 5.x** - Strict mode enabled
- **Tailwind CSS 4.x** - Utility-first styling with PostCSS

### Project Structure
```
app/
├── layout.tsx       # Root layout with metadata, Geist font, dark mode support
├── page.tsx         # Home page (server component)
└── globals.css      # Tailwind + CSS custom properties for theming
```

**Key architectural points:**
- Server components are the default - use `'use client'` directive only when needed
- Path alias `@/*` maps to project root (configured in tsconfig.json)
- Styling uses Tailwind utilities + CSS variables for theme values
- Dark mode via `prefers-color-scheme` media query

### Styling Approach
- Tailwind CSS 4 with inline configuration in `globals.css`
- Custom CSS variables defined in `:root` and `@media (prefers-color-scheme: dark)`
- Geist font family loaded via `next/font`
- Responsive breakpoints: `sm:`, `md:`, etc.

## Git Workflow & Collaboration

### Branch Strategy
- **Main branch:** `main`
- **Development branch:** `develop` (use this as PR base)
- **Feature branches:** `feature/*` pattern (e.g., `feature/4-spotify-auth-ui`)

### Creating Pull Requests
Use the Japanese PR template structure:
- **概要** (Overview): Background, purpose, summary
- **関連タスク** (Related Tasks): Link issues with `#<IssueNumber>`
- **やったこと** (What was done): Changes made
- **やらないこと** (Out of scope): What this PR doesn't cover
- **動作確認** (Testing): How it was verified
- **備考** (Notes): Additional information for reviewers

### Issue Templates
Two Japanese templates available:
- Bug report template
- Feature request template

Issues are automatically added to GitHub Project via Actions workflow.

## TypeScript Configuration

**Important settings:**
- `strict: true` - All strict checks enabled
- Path mapping: `@/*` resolves to root
- Target: ES2017
- JSX: react-jsx (automatic runtime)
- Includes Next.js TypeScript plugin

## ESLint Configuration

Uses Next.js recommended config with:
- `eslint-config-next` for Next.js-specific rules
- TypeScript ESLint integration
- Ignores: `.next/`, `out/`, `build/`
- Auto-fix on save enabled in dev container

## Current Development Context

Based on branch `feature/4-spotify-auth-ui`, active work includes:
- Spotify authentication UI implementation
- Likely needs OAuth flow, API routes, session management

## DevContainer Features

VS Code extensions auto-installed:
- ESLint, Prettier, Tailwind CSS IntelliSense
- Docker, GitLens
- Format on save with Prettier
- ESLint auto-fix on save

Container includes:
- zsh with oh-my-zsh
- Node 22

## Important Notes

- All commit messages, PRs, and issues should be in Japanese
- Server runs on `0.0.0.0:3000` to allow Docker port forwarding
- No environment variables configured yet (add `.env.local` for secrets)
- Project uses strict TypeScript - no `any` types without explicit reason
