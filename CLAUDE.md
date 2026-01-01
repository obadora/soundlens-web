# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Soundlens Web is a Next.js 16-based web application using the App Router architecture with Spotify authentication integration. The project is developed primarily in Japanese, with all documentation and templates in Japanese.

## Development Commands

### Running the Application
```bash
npm run dev          # Start dev server on http://localhost:3000 (binds to 0.0.0.0)
npm run build        # Production build
npm start            # Run production server
npm run lint         # Run ESLint
```

### Testing
```bash
npm test             # Run all tests with Jest
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Type Checking & Validation
```bash
npm run type-check   # Run TypeScript type checking without emitting files
npm run validate     # Run both type-check and lint
```

### Dev Container Setup
This project uses Docker with dev containers:
- Dev container automatically runs `npm install` on creation
- Git operations should be performed on the host machine, not inside the container
- Container uses Node 22 with zsh and oh-my-zsh

## Architecture & Tech Stack

### Core Stack
- **Next.js 16.0.10** - App Router (not Pages Router)
- **React 19.2.1** - Server components by default
- **TypeScript 5.x** - Strict mode enabled with strict type checking
- **Tailwind CSS 4.x** - Utility-first styling with PostCSS
- **Jest 30.x** - Testing framework with React Testing Library

### Project Structure
```
app/
├── api/
│   ├── auth/                           # Spotify OAuth proxy endpoints
│   │   ├── login/                      # GET /api/auth/login - Proxies to backend
│   │   └── callback/                   # POST /api/auth/callback - Proxies token exchange
│   └── soundlens/
│       └── tracks/[trackId]/           # GET /api/soundlens/tracks/{id} - Fetch track info
├── login/                              # Login page
├── callback/                           # OAuth callback handler page
├── track/[trackId]/                    # Dynamic track detail page
├── __tests__/                          # App-level tests
├── layout.tsx                          # Root layout with metadata, Geist font
├── page.tsx                            # Home page (client component with auth check)
└── globals.css                         # Tailwind + CSS custom properties

lib/
├── api/
│   ├── spotify.ts                      # Spotify auth API client (calls /api/auth/*)
│   └── soundlens.ts                    # SoundLens API client (calls /api/soundlens/*)
└── auth/
    └── token.ts                        # Token management (localStorage-based)
```

**Key architectural points:**
- **Backend Proxy Pattern**: Next.js API Routes proxy requests to SoundLens backend API (`SOUNDLENS_API_URL`) to avoid CORS issues
- **Token Management**: Client-side token storage using localStorage with expiration checking
- **Server Components**: Pages are client components (`'use client'`) when auth state or interactivity is needed
- **Path Alias**: `@/*` maps to project root (configured in tsconfig.json)
- **Styling**: Tailwind utilities + CSS variables for theme values
- **Testing**: Jest configured with jsdom environment for component testing

### Authentication Architecture
1. User clicks login → `lib/api/spotify.getLoginUrl()` → fetches from `/api/auth/login`
2. `/api/auth/login` proxies request to SoundLens backend → backend generates Spotify OAuth URL
3. User redirects to Spotify for authorization
4. Spotify redirects back to `/callback` page with auth code
5. Callback page calls `lib/api/spotify.exchangeToken(code)` → posts to `/api/auth/callback`
6. `/api/auth/callback` proxies token exchange to SoundLens backend → backend exchanges code with Spotify API
7. Tokens returned and stored in localStorage via `lib/auth/token.saveToken()`

### Data Flow for Track Information
1. User enters track ID on home page → navigates to `/track/[trackId]`
2. Track page calls `lib/api/soundlens.getTrack(trackId)` with access token from localStorage
3. Request goes to `/api/soundlens/tracks/[trackId]` with Authorization header
4. API route proxies to SoundLens backend at `SOUNDLENS_API_URL/api/tracks/{trackId}`
5. Backend fetches track data from Spotify API and returns it
6. Track page renders album art, artist, duration, and preview audio

## Git Workflow & Collaboration

### Branch Strategy
- **Main branch:** `main` - Production deployments (Vercel auto-deploys on push/merge)
- **Development branch:** `develop` - Base for all PRs
- **Feature branches:** `feature/*` pattern (e.g., `feature/4-spotify-auth-ui`)

### Creating Pull Requests
All PRs should target `develop` branch and use the Japanese PR template:
- **Title format:** 【feature/XXX】タイトル
- **概要** (Overview): Background, purpose, summary
- **関連タスク** (Related Tasks): Link issues with `#<IssueNumber>`
- **やったこと** (What was done): Changes made
- **やらないこと** (Out of scope): What this PR doesn't cover
- **動作確認** (Testing): Verification steps (build success, lint checks, functionality)
- **備考** (Notes): Additional information for reviewers

### Merging to Production
To deploy to production:
1. Create PR from `develop` → `main`
2. Title example: "Sprint X 本番デプロイ準備"
3. Review changes and merge (Squash or Merge commit)
4. Vercel automatically deploys `main` to production

### Issue Templates
Two Japanese templates available:
- Bug report template (`.github/ISSUE_TEMPLATE/bug_report.md`)
- Feature request template (`.github/ISSUE_TEMPLATE/feature_request.md`)

Issues are automatically added to GitHub Project via Actions workflow.

## TypeScript Configuration

**Important settings:**
- `strict: true` - All strict checks enabled
- Path mapping: `@/*` resolves to root
- Target: ES2017
- JSX: react-jsx (automatic runtime)
- Includes Next.js TypeScript plugin

## ESLint Configuration

Uses **Flat Config format** (`eslint.config.mjs`) with:
- `eslint-config-next` for Next.js-specific rules
- TypeScript ESLint with `strictTypeChecked` and `stylisticTypeChecked`
- Relaxed rules for test files (`**/__tests__/**`, `**/*.test.ts`)
- Relaxed rules for config files (`*.config.{js,mjs,ts}`, `*.setup.{js,ts}`)
- Ignores: `.next/`, `out/`, `build/`
- Auto-fix on save enabled in dev container

## Testing Configuration

Jest is configured with:
- `next/jest` for Next.js integration
- `jest-environment-jsdom` for DOM testing
- Setup file: `jest.setup.js`
- Path alias support: `@/*` → `<rootDir>/`
- Test patterns: `**/__tests__/**/*.{js,jsx,ts,tsx}` and `**/*.{spec,test}.{js,jsx,ts,tsx}`
- Coverage collection from `app/` and `lib/` directories

## Deployment

### Vercel Configuration
- Region: `hnd1` (Tokyo) for optimal Japan performance
- Framework: Next.js (auto-detected)
- Build command: `npm run build`
- Production branch: `main` (auto-deploys)
- Preview deployments: Automatic on all PRs

Refer to `DEPLOYMENT.md` for detailed Vercel setup instructions.

## Environment Variables

The project requires environment variables in `.env.local` (never commit this file):

### For Direct Spotify Integration (if bypassing backend)
```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

### For SoundLens Backend Integration (current architecture)
```bash
SOUNDLENS_API_URL=http://host.docker.internal:8000  # Backend API URL
```

The backend API URL defaults to `http://host.docker.internal:8000` for dev container setup. Update this for production deployments via Vercel environment variables.

## Important Notes

- All commit messages, PRs, and issues should be in Japanese
- Server runs on `0.0.0.0:3000` to allow Docker port forwarding
- Environment variables should be added to `.env.local` (not committed)
- Project uses strict TypeScript - no `any` types without explicit reason
- ESLint uses strictTypeChecked - expect rigorous type safety enforcement
- API routes act as proxies to SoundLens backend - they do not directly call Spotify API
