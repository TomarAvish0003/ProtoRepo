# ProtoDex

A full-stack Pokémon competitive analytics platform, national encyclopedia, and tournament team composition studio. ProtoDex indexes all 1,025 Pokémon across Generations I through IX, providing competitive damage calculations, Smogon tier validation, and authenticated trainer profile synchronization.

---

## Table of Contents

- [System Overview](#system-overview)
- [Monorepo Architecture](#monorepo-architecture)
- [Core Engineering Pillars](#core-engineering-pillars)
  - [Competitive Battle Engine & Mathematical Rigor](#competitive-battle-engine--mathematical-rigor)
  - [Data Ingestion, Dual-Layer Caching, and Concurrency](#data-ingestion-dual-layer-caching-and-concurrency)
  - [Multi-Tenant Security and Authorization](#multi-tenant-security-and-authorization)
  - [Database Schema and Relational Design](#database-schema-and-relational-design)
- [Application Modules](#application-modules)
- [API Specification](#api-specification)
- [Technology Stack](#technology-stack)
- [Local Development and Setup](#local-development-and-setup)
- [Verification and Code Quality](#verification-and-code-quality)
- [Deployment Configuration](#deployment-configuration)
- [License and Disclaimers](#license-and-disclaimers)

---

## System Overview

ProtoDex was engineered to address common limitations found in traditional reference tools: slow upstream API latency, loss of cartridge-accurate damage variance, and lack of integrated tier legality validation.

The system combines:
1. An authoritative encyclopedia covering 1,025 Pokémon with full stats, abilities, complete move learnsets, regional variants, and historical game lore.
2. A tournament team builder supporting Smogon and VGC competitive formats with real-time defensive synergy matrix analysis.
3. A Generation IX battle damage calculator executing cartridge-accurate 16-roll damage distributions and exact discrete probability convolutions.
4. An authenticated backend providing encrypted session management and cloud synchronization for trainer collections.

---

## Monorepo Architecture

The repository is structured into an isolated frontend application and a dedicated backend API service:

```
ProtoRepo/
├── prototype-dex/                  # Frontend: Next.js 15 App Router
│   ├── public/                     # Static assets, SVG icons, and manifest
│   ├── src/
│   │   ├── app/
│   │   │   ├── builder/            # Competitive Teambuilder Studio
│   │   │   ├── context/            # Auth, Theme, and Application Contexts
│   │   │   ├── login/              # Trainer Authentication View
│   │   │   ├── pokedex/            # National Dex Catalog (Grid & List)
│   │   │   ├── pokemon/[name]/     # Complete Pokémon Dossier View
│   │   │   ├── profile/            # Trainer Dashboard & Collection Sync
│   │   │   ├── register/           # Trainer Registration View
│   │   │   ├── sitemap.ts          # Dynamic XML Sitemap (1,025 entries)
│   │   │   ├── utils/
│   │   │   │   ├── api.ts          # Type-safe API Client with Retry Logic
│   │   │   │   ├── pokemonDataHelpers.ts # Typographic and Type Formatting
│   │   │   │   ├── teamBuilder/    # Calculation Engine & Tier Rules
│   │   │   │   │   ├── damageCalcEngine.ts # 16-Roll Discrete Math Engine
│   │   │   │   │   ├── formatEngine.ts     # Format Tier & Rule Enforcement
│   │   │   │   │   ├── roleClassifier.ts   # Tactical Role Categorization
│   │   │   │   │   └── synergyEngine.ts    # Defensive Synergy Matrices
│   │   │   │   └── types.ts        # Comprehensive Domain Types
│   │   │   ├── error.tsx           # Global Cybernetic Error Boundary
│   │   │   ├── layout.tsx          # Root Shell & Global Metadata
│   │   │   └── not-found.tsx       # Standard 404 Route Handler
│   │   └── styles/                 # Tailwind CSS Configuration
│   ├── next.config.ts              # Next.js Build & Compiler Settings
│   ├── package.json
│   └── tsconfig.json
│
└── prototype-dex-backend/          # Backend: Express 5 Core API
    ├── src/
    │   ├── controllers/
    │   │   ├── authController.js   # Session Issuance & Token Management
    │   │   ├── moveController.js   # Batch Move Learnset Queries
    │   │   ├── pokemonController.js# Catalog Retrieval & Search Logic
    │   │   └── userController.js   # Scoped Trainer Mutation Handlers
    │   ├── db/
    │   │   ├── index.js            # Turso / libSQL Connection & Drizzle Init
    │   │   ├── migrate.js          # Schema Migration Runner
    │   │   ├── schema.js           # Relational Database Schema Definitions
    │   │   └── seed.js             # 1,025 Pokémon & Move Seeder
    │   ├── middleware/
    │   │   ├── auth.js             # Cryptographic JWT Extraction & Verification
    │   │   └── rateLimiter.js      # Multi-Tiered Request Throttling
    │   ├── routes/
    │   │   ├── authRoutes.js       # /api/auth Endpoints
    │   │   ├── cloudinaryRoutes.js # /api/cloudinary Media Signature Endpoints
    │   │   ├── pokeRoutes.js       # /api/pokemon Read-Only Catalog Endpoints
    │   │   └── userRoutes.js       # /api/user Scoped Mutation Endpoints
    │   ├── utils/
    │   │   ├── cache.js            # In-Memory Cache Maps & In-Flight Dedup
    │   │   └── fetchFromPokeAPI.js # Upstream Fetcher with Exponential Backoff
    │   ├── validators/
    │   │   └── authValidator.js    # Zod Input Validation Schemas
    │   └── index.js                # Server Lifecycle & Reverse Proxy Trust
    ├── package.json
    └── drizzle.config.js           # Drizzle Kit Migration Settings
```

---

## Core Engineering Pillars

### Competitive Battle Engine & Mathematical Rigor

The damage calculation suite in `prototype-dex/src/app/utils/teamBuilder/damageCalcEngine.ts` implements official Generation IX Pokémon Showdown mechanics with integer arithmetic and rounding rules.

#### 1. Discrete 16-Roll Damage Range

Damage is not modeled as a single average value. It is calculated across all 16 discrete integer rolls between 85% and 100%:

$$\text{BaseDamage} = \left\lfloor \frac{\left\lfloor \frac{2 \times \text{Level}}{5} + 2 \right\rfloor \times \text{Power} \times \left\lfloor \frac{A}{D} \right\rfloor}{50} \right\rfloor + 2$$

$$\text{RollDamage}(R) = \left\lfloor \text{BaseDamage} \times \text{Modifier} \times \frac{R}{100} \right\rfloor \quad \text{for } R \in [85, 100]$$

Where:
- $A$ and $D$ are effective offensive and defensive stats including nature modifiers, stat stages $[-6, +6]$, and ability multipliers (such as Huge Power, Tablets of Ruin, or Protosynthesis).
- $\text{Modifier}$ accounts for Same Type Attack Bonus (STAB at $1.5\times$ or Adaptability at $2.0\times$), Terastallization multipliers, Type Effectiveness ($\{0, 0.25, 0.5, 1, 2, 4\}$), Weather (Sun, Rain, Snow, Sand), Critical Hits ($1.5\times$), Entry Hazards, and item modifiers (Life Orb, Choice Specs/Band, Expert Belt).

#### 2. Exact Discrete Probability Convolution

Rather than relying on naive heuristic approximations, two-hit knockout (2HKO) chances are determined through a discrete bivariate probability convolution across the entire $16 \times 16 = 256$ damage matrix:

$$P(\text{2HKO}) = \frac{1}{256} \sum_{r_1=85}^{100} \sum_{r_2=85}^{100} \mathbf{1}_{\{ \text{Damage}(r_1) + \text{Damage}(r_2) \ge \text{DefenderHP} \}}$$

This provides exact tournament-critical knockout thresholds (for example: "guaranteed 2HKO after Stealth Rock" or "84.4% chance to OHKO").

#### 3. Format Legality Enforcement

The format engine in `prototype-dex/src/app/utils/teamBuilder/formatEngine.ts` validates rosters against competitive rule sets:
- **Formats Supported**: Gen 9 OU, Gen 9 Ubers, Gen 9 UU, Gen 9 RU, Gen 9 NU, Gen 9 PU, Gen 9 Little Cup (LC), Gen 9 Monotype, Gen 9 Doubles OU, VGC 2025 (Regulation Set), National Dex, and National Dex Ubers / AG.
- **Constraints Checked**: Roster size limits (max 6), species clause (no duplicate National Dex numbers), item clause, ability ban lists (e.g., Moody, Shadow Tag, Arena Trap), move bans (e.g., Baton Pass, Revival Blessing), and level caps.

---

### Data Ingestion, Dual-Layer Caching, and Concurrency

To eliminate network latency and protect against upstream rate limiting (HTTP 429), the backend uses a multi-tier caching architecture:

```
[Client Request]
       │
       ▼
[In-Memory RAM Cache] ──(Hit: < 1ms)─────────► [Immediate Response]
       │
      (Miss)
       ▼
[Persistent libSQL / Turso Database] ────────► [Update RAM Cache & Respond]
       │
      (Miss)
       ▼
[Upstream PokeAPI via p-limit Queue] ────────► [Write to libSQL + RAM Cache]
```

1. **In-Memory Cache & In-Flight Request Deduplication**:
   - High-throughput endpoints check memory-resident Map caches with scoped TTLs.
   - Concurrent identical requests are deduplicated using an in-flight Promise registry (`inFlightRequests` Map), preventing duplicate concurrent network requests for the same resource.
2. **Persistent Database Catalog**:
   - The master database stores all 1,025 Pokémon records, detailed stats, and move records directly in libSQL tables.
   - Complex relational payloads are stored using structured JSON columns, eliminating nested join overhead for read-heavy operations.
3. **Upstream Resilience**:
   - When fetching uncached ancillary data from PokeAPI, calls are routed through a concurrency queue managed by `p-limit` (6 concurrent requests maximum).
   - Exponential backoff retry logic handles intermittent network failures and upstream rate limits automatically.

---

### Multi-Tenant Security and Authorization

Trainer accounts, bookmarks, and collection data are strictly isolated:

1. **Cryptographic Identity Derivation**:
   - Identity is determined exclusively by verifying the JSON Web Token (`req.user.id`) in [`prototype-dex-backend/src/middleware/auth.js`](prototype-dex-backend/src/middleware/auth.js). Client-supplied user identifiers in route parameters or request bodies are ignored.
2. **Compound Row-Level Scoping**:
   - All state mutations enforce dual-condition SQL criteria:
     ```javascript
     // prototype-dex-backend/src/controllers/userController.js
     await db
       .delete(userFavorites)
       .where(and(
         eq(userFavorites.userId, req.user.id),
         eq(userFavorites.pokemon, key)
       ));
     ```
   - A user cannot delete, view, or alter another user's favorites or caught entries. Any query targeting a foreign record matches zero rows.
3. **Master Catalog Immutability**:
   - The master catalog tables (`pokemon`, `moves`) are segregated from user tables.
   - No mutating HTTP methods (`POST`, `PUT`, `PATCH`, `DELETE`) are registered on catalog routes. Catalog tables are read-only.
4. **Credential Hashing**:
   - Passwords are encrypted using `bcryptjs` with 12 salt rounds (~250ms compute time), ensuring resistance to GPU-based dictionary and rainbow table attacks.
5. **Session Security**:
   - JWT tokens are issued via `HttpOnly`, `SameSite: Lax/None`, `Secure` cookies, mitigating Cross-Site Scripting (XSS) exfiltration.
   - An in-memory revocation blocklist (`tokenBlocklist`) immediately invalidates tokens upon logout.
6. **Cascade Account Termination**:
   - Account deletion (`DELETE /api/user/profile`) leverages foreign key cascade definitions (`onDelete: 'cascade'`), ensuring that deleting an account removes only that trainer's dependent records.

---

### Database Schema and Relational Design

The database schema is defined in [`prototype-dex-backend/src/db/schema.js`](prototype-dex-backend/src/db/schema.js) using Drizzle ORM over libSQL:

| Table | Primary Key | Key Foreign Keys | Purpose |
| :--- | :--- | :--- | :--- |
| `users` | `id` (UUID v4) | None | Trainer credentials, username, email, and avatar CDN URL |
| `user_favorites` | `id` (Auto-inc) | `userId` -> `users.id` (Cascade) | Normalized relation tracking bookmarked Pokémon per user |
| `user_caught` | `id` (Auto-inc) | `userId` -> `users.id` (Cascade) | Normalized relation tracking caught collection status |
| `pokemon` | `id` (Integer) | None | Master catalog of 1,025 Pokémon: stats, types, sprites, metadata |
| `moves` | `id` (Integer) | None | Master move library: power, accuracy, PP, priority, damage class |
| `api_cache` | `cacheKey` (Text) | None | Persistent key-value cache for ancillary PokeAPI resources |

Indexes are maintained on `user_favorites.userId`, `user_caught.userId`, `pokemon.generation`, and unique composite indexes on `(userId, pokemon)` to enforce relational integrity and ensure O(1) lookups.

---

## Application Modules

### 1. National Pokédex (`/pokedex`)
- Real-time searching by name, National Dex ID, or zero-padded number.
- Multi-type matrix filtering (supporting single and dual-type intersection).
- Generation selector tabs covering Generations I through IX (Paldea).
- View mode toggle between visual card grid and data-dense archival table.

### 2. Pokémon Detail Dossier (`/pokemon/[name]`)
- Visual display of official artwork, shiny variations, and high-fidelity cry playback via HTML5 Audio.
- Base stat distributions with percentile bars, total base stat calculation (BST), and stat tier classifications.
- Full evolutionary lineages supporting split evolutions (e.g., Eevee, Slowpoke, Tyrogue, Applin), trade requirements, item triggers, and level conditions.
- Categorized move learnsets grouped by acquisition method: Level-up, TM/HM, and Egg moves.
- Chronological historical Pokédex entries across game versions from Red/Blue (1996) through Scarlet/Violet (2022).

### 3. Teambuilder Studio (`/builder`)
- 6-member team composition workspace with custom slot management.
- Real-time format legality engine (OU, Ubers, VGC, Doubles, LC, etc.).
- Defensive synergy matrix displaying cumulative team weaknesses and resistances across all 18 elemental types.
- Move coverage analyzer showing unresisted offensive spread.
- Dynamic import and export compatible with Pokémon Showdown plaintext format.

### 4. Battle Damage Calculator (Drawer Component)
- Interactive damage simulator accessible throughout the teambuilder and Pokémon detail views.
- Attacker and defender stat overrides: EVs, IVs, natures, stat stages $[-6, +6]$, and active ability toggles.
- Terastallization simulation with active type recoloring and STAB recomputation.
- Environmental condition modifiers: Weather, Terrain, and Entry Hazards (Stealth Rock, Spikes).
- Visual histogram displaying all 16 discrete damage rolls and computed knockout chances.

### 5. Trainer Dashboard (`/profile`)
- Unified overview of caught Pokémon and priority bookmarks.
- Collection progress metrics across each individual generation.
- Profile management with custom avatar uploads via Cloudinary CDN.
- Guest collection synchronization: automatically merges local guest storage into the cloud database upon account creation.

---

## API Specification

### Authentication & Trainer Routes

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Rate-limited | Creates a trainer account; returns JWT cookie and payload |
| `POST` | `/api/auth/login` | Rate-limited | Verifies credentials; issues session cookie |
| `POST` | `/api/auth/logout` | None | Clears session cookie; adds token to revocation blocklist |
| `GET` | `/api/auth/me` | JWT Required | Retrieves current authenticated trainer profile |
| `GET` | `/api/user/profile` | JWT Required | Fetches full trainer state including favorites and caught lists |
| `PATCH` | `/api/user/profile` | JWT Required | Updates username, email, password, or avatar URL |
| `DELETE` | `/api/user/profile` | JWT Required | Deletes account and cascades cleanup of associated records |
| `GET` | `/api/user/favorite` | JWT Required | Lists all bookmarked Pokémon identifiers for current user |
| `POST` | `/api/user/favorite` | JWT Required | Toggles bookmark state for a specific Pokémon |
| `DELETE` | `/api/user/favorite/:name`| JWT Required | Removes a specific Pokémon from user bookmarks |
| `GET` | `/api/user/caught` | JWT Required | Lists all caught Pokémon identifiers for current user |
| `POST` | `/api/user/caught` | JWT Required | Toggles caught status for a specific Pokémon |
| `DELETE` | `/api/user/caught/:name` | JWT Required | Removes a specific Pokémon from user caught collection |
| `POST` | `/api/user/sync` | JWT Required | Batch syncs guest local storage records into user account |

### Catalog & Pokédex Routes (Read-Only)

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/pokemon` | General Rate Limit | Paginated catalog search with query and type filters |
| `GET` | `/api/pokemon/:nameOrId` | General Rate Limit | Full species dossier, base stats, and move learnsets |
| `GET` | `/api/pokemon/generation/:id` | General Rate Limit | Complete Pokémon list for a specific generation (1–9) |
| `GET` | `/api/pokemon/types` | General Rate Limit | Master list of all 18 Pokémon elemental types |
| `POST` | `/api/pokemon/batch` | General Rate Limit | Batch retrieves detailed objects for an array of Pokémon names |
| `POST` | `/api/pokemon/moves/batch` | General Rate Limit | Batch retrieves move statistics for an array of move names |

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.25 (App Router, Server & Client Components)
- **Language**: TypeScript 5.x (Strict Type Checking)
- **UI & Styling**: Tailwind CSS, CSS variables, Glassmorphism design tokens
- **Component Primitives**: Radix UI primitives, Lucide React icons
- **State Management**: React Context, custom local storage hooks

### Backend
- **Runtime & Server**: Node.js (ES Modules), Express.js 5
- **Database Engine**: Turso (libSQL / SQLite over HTTP)
- **ORM**: Drizzle ORM 0.45 (Type-safe SQL query builder)
- **Validation**: Zod 3 / 4 runtime schema guards
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs` (Cost factor 12)
- **Rate Limiting**: `express-rate-limit` (Tiered per-route thresholds)
- **HTTP Client**: Axios with `p-limit` concurrency management
- **Media CDN**: Cloudinary API (Trainer avatar storage)

---

## Local Development and Setup

### Prerequisites
- Node.js 18.17.0 or later
- npm or pnpm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/TomarAvish0003/ProtoRepo.git
cd ProtoRepo
```

### 2. Backend Setup (`prototype-dex-backend`)

Navigate to the backend directory and install dependencies:

```bash
cd prototype-dex-backend
npm install
```

Create a `.env` file in `prototype-dex-backend/`:

```env
PORT=5000
NODE_ENV=development

# Database (Turso libSQL or local SQLite file fallback)
TURSO_DATABASE_URL=file:protodex.db
TURSO_AUTH_TOKEN=

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Client Origin for CORS
CLIENT_URL=http://localhost:3000

# Cloudinary (Optional, for avatar uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Apply database migrations:

```bash
npm run db:migrate
```

Seed the database with all 1,025 Pokémon and move data:

```bash
npm run db:seed
```

Start the backend server:

```bash
npm run dev
# Server will listen on http://localhost:5000
```

### 3. Frontend Setup (`prototype-dex`)

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd ../prototype-dex
npm install
```

Create a `.env.local` file in `prototype-dex/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
# Application will run on http://localhost:3000
```

---

## Verification and Code Quality

Both projects adhere to strict static analysis and type safety standards:

```bash
# In prototype-dex (Frontend):
# 1. Typecheck without emitting files
npx tsc --noEmit

# 2. Run ESLint code quality checks
npm run lint
```

```bash
# In prototype-dex-backend (Backend):
# Verify Node syntax across core files
node -c src/index.js
```

---

## Deployment Configuration

- **Frontend**: Hosted on **Vercel**. Configured with edge routing, automatic SSL, asset compression, and dynamic sitemap generation.
- **Backend API**: Hosted on **Render**. Express 5 server configured with `trust proxy: 1` for accurate IP detection behind reverse proxies.
- **Database**: Hosted on **Turso** (Distributed libSQL edge network). Ensures low-latency database queries across North America, Europe, and Asia.

---

## License and Disclaimers

Distributed under the ISC License.

Pokémon, Pokémon character names, Pokémon sprites, and Pokémon game mechanics are trademarks and copyrights of Nintendo, Game Freak, and Creatures Inc. This project is a non-commercial, open-source educational reference and competitive analysis tool.
