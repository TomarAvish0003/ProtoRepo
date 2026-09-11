# ProtoDex Core API Engine

High-performance backend API service powering the ProtoDex competitive Pokémon platform. Built with Node.js, Express.js 5, Drizzle ORM, and Turso (libSQL/SQLite).

---

## Overview

`prototype-dex-backend` serves as the core persistence and data delivery layer for ProtoDex. It manages:
- Pre-seeded local and edge relational storage for all 1,025 Pokémon species, stats, and move pools.
- Multi-tenant authenticated trainer accounts with Bcrypt credential hashing.
- Scoped row-level mutations for bookmarks (favorites) and caught collection status.
- Guest collection synchronization merging local browser records into cloud profiles.
- Resilient upstream PokeAPI ingestion with memory caching, request deduplication, and `p-limit` rate protection.

---

## Architecture & Directory Layout

```
src/
├── controllers/
│   ├── authController.js     # User registration, login, logout, and token blocklist
│   ├── moveController.js     # Batch move learnset queries
│   ├── pokemonController.js  # Catalog retrieval, search filtering, and details
│   └── userController.js     # Row-isolated favorites, caught status, and profile updates
├── db/
│   ├── index.js              # Turso libSQL client initialization and Drizzle instance
│   ├── migrate.js            # Migration execution script
│   ├── schema.js             # Drizzle ORM relational schema definitions
│   └── seed.js               # Ingestion script for 1,025 Pokémon and move records
├── middleware/
│   ├── auth.js               # Cryptographic JWT authentication and session extraction
│   └── rateLimiter.js        # Tiered IP rate limiting via express-rate-limit
├── routes/
│   ├── authRoutes.js         # /api/auth endpoints
│   ├── cloudinaryRoutes.js   # /api/cloudinary signed signature endpoint
│   ├── pokeRoutes.js         # /api/pokemon read-only catalog endpoints
│   └── userRoutes.js         # /api/user authenticated mutation endpoints
├── utils/
│   ├── cache.js              # In-memory Map caches and in-flight request deduplication
│   └── fetchFromPokeAPI.js   # Resilient upstream client with retry and backoff
├── validators/
│   └── authValidator.js      # Zod runtime input validation schemas
└── index.js                  # Express application setup, CORS, and server entry
```

---

## Database Schema Design

Managed via Drizzle ORM over libSQL:

- `users`: Primary key UUID v4 (`id`), unique `username`, unique `email`, Bcrypt hashed `password` (cost factor 12), `avatar` URL, and timestamps.
- `user_favorites`: Foreign key `userId` referencing `users(id)` with `ON DELETE CASCADE`. Unique index on `(userId, pokemon)` preventing duplicates. Index on `userId` for sub-millisecond retrieval.
- `user_caught`: Foreign key `userId` referencing `users(id)` with `ON DELETE CASCADE`. Unique index on `(userId, pokemon)`. Index on `userId`.
- `pokemon`: Master record for each Pokémon (1 through 1025). Stores primary stats, type arrays, sprites, and full details payload. Indexed on `generation`.
- `moves`: Master move dataset with power, accuracy, PP, priority, and damage class.
- `api_cache`: Key-value cache for ancillary PokeAPI resources with timestamp expiration.

---

## Security Architecture

1. **Cryptographic Identity Derivation**:
   `req.user.id` is extracted strictly from the verified JWT payload in `src/middleware/auth.js`. No user-supplied IDs from client payloads are trusted.
2. **Row-Level SQL Scoping**:
   All user state mutations enforce compound `WHERE` clauses combining the authenticated `userId` and the target resource.
3. **Password Security**:
   One-way salted hashing using `bcryptjs` with 12 rounds of work.
4. **Token Revocation**:
   In-memory `tokenBlocklist` immediately invalidates JWT sessions upon logout.
5. **Tiered Rate Limiting**:
   - Public authentication endpoints: 50 requests per 15 minutes.
   - User mutation endpoints: 300 requests per minute.
   - Pokémon catalog queries: 5,000 requests per minute.

---

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Create trainer account
- `POST /api/auth/login`: Authenticate and receive HTTP-only session cookie
- `POST /api/auth/logout`: Invalidate token and clear cookie
- `GET /api/auth/me`: Fetch authenticated session user

### Trainer State (`/api/user`)
- `GET /api/user/profile`: Retrieve trainer profile and collection
- `PATCH /api/user/profile`: Update profile fields
- `DELETE /api/user/profile`: Terminate account (cascades related data)
- `GET /api/user/favorite`: List user's bookmarked Pokémon
- `POST /api/user/favorite`: Toggle bookmark
- `DELETE /api/user/favorite/:pokemon`: Remove bookmark
- `GET /api/user/caught`: List user's caught Pokémon
- `POST /api/user/caught`: Toggle caught status
- `DELETE /api/user/caught/:pokemon`: Remove caught status
- `POST /api/user/sync`: Batch merge guest local storage into user profile

### Catalog (`/api/pokemon`)
- `GET /api/pokemon`: Paginated National Dex search with query and type filters
- `GET /api/pokemon/:nameOrId`: Complete species dossier
- `GET /api/pokemon/generation/:genId`: Generation catalog (1 through 9)
- `GET /api/pokemon/types`: All 18 elemental types
- `POST /api/pokemon/batch`: Batch retrieve species details
- `POST /api/pokemon/moves/batch`: Batch retrieve move statistics

---

## Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in this directory:
```env
PORT=5000
NODE_ENV=development
TURSO_DATABASE_URL=file:protodex.db
TURSO_AUTH_TOKEN=
JWT_SECRET=your_secret_jwt_key
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Database Migration & Seed
```bash
# Apply schema to database
npm run db:migrate

# Populate Pokémon and move catalog
npm run db:seed
```

### 4. Start Server
```bash
npm run dev
```

