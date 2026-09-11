# ProtoDex Frontend Client

Tournament-grade competitive Pokédex, battle simulation drawer, and team composition studio built with Next.js 15 App Router, React 19, TypeScript, and Tailwind CSS v4.

---

## Overview

The `prototype-dex` package provides the complete presentation layer and client-side computational engine for ProtoDex. It interfaces with the `prototype-dex-backend` API service and contains local execution engines for discrete damage probability calculations, Smogon / VGC tier legality checking, and dynamic theme switching.

---

## Directory Layout

```
src/
├── app/
│   ├── builder/            # Competitive Teambuilder Studio
│   ├── context/            # AuthContext, ThemeProvider, Toast Providers
│   ├── login/              # Trainer Sign-In Interface
│   ├── pokedex/            # National Pokédex Grid & Archival Table Views
│   ├── pokemon/[name]/     # Complete Pokémon Dossier & Lore Archives
│   ├── profile/            # Trainer Account Dashboard & Collection Stats
│   ├── register/           # New Trainer Registration Interface
│   ├── sitemap.ts          # Automated Dynamic XML Sitemap for 1,025 Species
│   ├── utils/
│   │   ├── api.ts          # Resilient Fetch Client with In-Memory Cache
│   │   ├── pokemonDataHelpers.ts # Typographic & Visual Badge Formatting
│   │   ├── teamBuilder/    # Mathematical & Competitive Analysis Engines
│   │   │   ├── damageCalcEngine.ts # 16-Roll Discrete Battle Math Engine
│   │   │   ├── formatEngine.ts     # Format Tier & Smogon Rule Enforcement
│   │   │   ├── roleClassifier.ts   # Tactical Role Radar Categorization
│   │   │   └── synergyEngine.ts    # Defensive Synergy Matrices
│   │   └── types.ts        # Comprehensive Domain Types
│   ├── error.tsx           # Global Cybernetic Error Boundary
│   ├── layout.tsx          # Root Application Layout & Font Injections
│   └── not-found.tsx       # Cybernetic 404 Route Handler
└── styles/                 # Global Design Tokens & Tailwind Directives
```

---

## Key Technical Features

### 1. Client-Side 16-Roll Discrete Battle Engine
All combat calculations are executed deterministically on the client using the Showdown Gen 9 damage algorithm:
- Real-time 16-integer roll generation ($R \in [85, 100]$).
- Exact 256-cell discrete bivariate convolution for 2HKO and OHKO probabilities.
- Dynamic stat stages $[-6, +6]$, EV/IV overrides, Terastallization multipliers, and weather/terrain modifications.

### 2. Zero-Overhead Memory Caching
To minimize repetitive network requests while browsing the National Dex:
- In-memory client caching with 24-hour TTL for static encyclopedia responses.
- Automatic deduplication of in-flight requests.
- Automatic token cleanup on 401 Unauthorized API responses.

### 3. Real-Time Team Synergy Matrix
- 18-elemental type defense matrix computing total team weaknesses and resistances.
- Offensive move coverage analyzer detecting blind spots against common defensive cores.
- Tier legality validation against OU, Ubers, UU, RU, NU, PU, LC, Monotype, Doubles OU, and VGC 2025 regulations.

---

## Scripts & Development

```bash
# Start development server with Turbopack
npm run dev

# Run static type checking
npx tsc --noEmit

# Run ESLint static analysis
npm run lint

# Build production bundle
npm run build
```

---

## Environment Configuration

Create a `.env.local` file in the root of this directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
