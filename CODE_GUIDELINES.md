# CODE_GUIDELINES.md

This document captures repeatable patterns and workflows for scaffolding new full-stack projects with AI agents. These patterns are derived from the ShieldTap codebase and are intended as a template for future projects.

---

## Table of Contents

1. [Project Architecture Patterns](#project-architecture-patterns)
2. [Critical Code Style Standards](#critical-code-style-standards)
3. [Recommended Code Style Standards](#recommended-code-style-standards)
4. [API Development Workflow](#api-development-workflow)
5. [Database Development Workflow](#database-development-workflow)
6. [Git Workflow Standards](#git-workflow-standards)
7. [Environment & Configuration](#environment--configuration)
8. [Service Class Pattern](#service-class-pattern)

---

## Project Architecture Patterns

### Directory Structure

**CRITICAL**: Use monorepo-lite structure with separate backend and frontend directories.

```
project-root/
├── .gitignore
├── README.md
├── LICENSE
├── AGENTS.md              # AI agent guidelines
├── CODE_GUIDELINES.md     # This file
├── api/                   # Backend (Cloudflare Workers/Hono)
│   ├── package.json
│   ├── tsconfig.json
│   ├── wrangler.toml
│   ├── src/
│   │   ├── index.ts       # Main app with routes
│   │   ├── types.ts       # Centralized types
│   │   ├── openapi.ts     # OpenAPI specification
│   │   ├── middleware/     # Auth, CORS, etc.
│   │   ├── services/      # Business logic (classes)
│   │   └── db/            # Database schema
├── mobile/                # Mobile app (React Native)
├── web/                   # Web app (future)
└── marketing/             # Marketing site (future)
```

### Separation of Concerns

**CRITICAL**: Maintain strict separation between layers.

- **Routes** (`index.ts`): Thin handlers that delegate to services
- **Services** (`services/`): Business logic implemented as classes
- **Middleware** (`middleware/`): Cross-cutting concerns (auth, CORS)
- **Database** (`db/`): Schema and migrations only

**CRITICAL**: All types centralized in `types.ts`, not scattered across files.

---

## Critical Code Style Standards

### Function Declarations Only

**CRITICAL**: Use function declarations, NOT arrow functions for top-level exports.

```typescript
// Good
export function createAuthMiddleware() {
  return createMiddleware(/* ... */);
}

// Bad - DO NOT USE
export const createAuthMiddleware = () => { /* ... */ };
```

### TypeScript Extensions in Imports

**CRITICAL**: Always use `.ts` extensions in import statements.

```typescript
import { Hono } from 'hono';
import { UserService } from './services/UserService.ts';
import type { User } from './types.ts';
```

### Package Manager

**CRITICAL**: Use Bun exclusively, never npm.

```bash
bun install
bun add package-name
bun run script-name
```

### Variable Naming

**CRITICAL**: Use descriptive variable names that clearly indicate what the value represents.

- Include units when dealing with time-related values
- Use specific names that describe the data type and purpose
- Avoid generic names that don't provide context

```typescript
// Good - descriptive names with units
const currentUnixTimestamp = Math.floor(Date.now() / 1000);
const currentDateTime = new Date();
const userResponseData = await response.json();
const tapCountResult = await db.prepare('SELECT COUNT(*) as count FROM taps').first();

// Good - descriptive names without units when context is clear
const userId = session.user.id;
const userName = user.name;
const tapType = 'resist';

// Bad - non-descriptive or generic
const now = Math.floor(Date.now() / 1000);
const now = new Date();
const data = await response.json();
const result = await db.prepare('SELECT COUNT(*) as count FROM taps').first();
```

### Type-Only Imports

**RECOMMENDED**: Use `import type` for type-only imports.

```typescript
import type { User, Bindings } from './types.ts';
```

### Comments

**RECOMMENDED**: Single-line JSDoc comments above methods and endpoints.

```typescript
// Creates a new tap record for a user
async create(userId: string, input: CreateTapInput): Promise<Tap> {
  // implementation
}

// Records a new tap (resist or yield) for the authenticated user
app.post('/api/taps', async (c) => { /* ... */ });
```

---

## Recommended Code Style Standards

### TypeScript Configuration

**RECOMMENDED**: Use ESNext target, strict mode, and allow `.ts` extensions.

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "strict": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true
  }
}
```

---

## API Development Workflow

### OpenAPI Documentation

**CRITICAL**: MUST provide OpenAPI specification for all endpoints.

- Create/Update `openapi.ts` when adding/modifying routes
- Define schemas in `components.schemas`
- Include examples for request/response
- Document authentication requirements

### Swagger UI Integration

**CRITICAL**: MUST provide Swagger UI for interactive testing (dev-only).

```typescript
// Serve OpenAPI spec as JSON
app.get('/openapi.json', (c) => c.json(openAPISpec));

// Serve Swagger UI (dev-only)
app.get('/docs', async (c) => {
  if (c.env.DEV_MODE !== 'true') {
    return c.json({ error: 'Documentation is only available in development mode' }, 404);
  }

  const { swaggerUI } = await import('@hono/swagger-ui');
  return swaggerUI({ url: '/openapi.json' })(c);
});
```

**CRITICAL**: Use dynamic import to avoid bundling Swagger UI in production.

### Route Handler Pattern

**CRITICAL**: Thin handlers that delegate to services.

```typescript
app.get('/api/me', async (c) => {
  const authUser = c.get('user');
  const userService = new UserService(c.env.DB);

  const user = await userService.findOrCreate(authUser);

  return c.json({ user });
});
```


---

## Database Development Workflow

### Schema Organization

**CRITICAL**: Schema as SQL file in `db/schema.sql`.

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

### Prepared Statements

**CRITICAL**: MUST use prepared statements with `.bind()` for all queries.

```typescript
const result = await this.db
  .prepare('SELECT * FROM users WHERE id = ?')
  .bind(userId)
  .first<User>();
```

### Type-Safe Queries

**CRITICAL**: Type all database queries.

```typescript
.first<User>()              // Single row, typed
.all<Tap[]>()               // All rows, typed
.first<{ count: number }>() // Inline type for aggregates
```

### Idempotent Statements

**RECOMMENDED**: Use `IF NOT EXISTS` for schema changes.

```sql
CREATE TABLE IF NOT EXISTS taps (/* ... */);
CREATE INDEX IF NOT EXISTS idx_taps_user ON taps(user_id);
```

---

## Git Workflow Standards

### Commit Messages

**CRITICAL**: MUST use conventional commits.

Pattern: `<type>: <short description>`

Types:
- `feat:` - New feature
- `refactor:` - Code refactoring
- `chore:` - Maintenance (formatting, docs)
- `Initial commit` - Repository initialization

Examples:
```bash
feat: add user authentication
refactor: extract service layer
chore: update dependencies
Initial commit
```

### Branching Strategy

**RECOMMENDED**: Feature branches from `main`.

```bash
git checkout main
git checkout -b feature/add-feature-name
# work on feature
git push --set-upstream origin feature/add-feature-name
```

### Git Push Requirement

**CRITICAL**: MUST push all changes to remote repository.

```bash
git add .
git commit -m "type: description"
git push
# Verify: git status shows "up to date with origin"
```

### Git Ignore Patterns

**RECOMMENDED**: Standard ignore patterns.

```
node_modules/
dist/
.wrangler/
.env
.env.*
!.env.example
*.log
coverage/
.DS_Store
```

---

## Environment & Configuration

### DEV_MODE Pattern

**CRITICAL**: MUST use DEV_MODE flag for dev/prod separation.

**In wrangler.toml:**
```toml
[vars]
DEV_MODE = "true"  # Local development
# DEV_MODE = "false"  # Production (change before deploy)
```

**In code:**
```typescript
// Check for dev mode
if (c.env.DEV_MODE !== 'true') {
  // Production-only behavior
}

// Bypass auth in dev mode
if (c.env.DEV_MODE === 'true') {
  const devUser = { id: 'dev-user-id', email: 'dev@example.com' };
  c.set('user', devUser);
  return;
}
```

**CRITICAL**: Use string comparison `=== 'true'`, not boolean.

### Environment Variables

**RECOMMENDED**: Access via bindings interface.

```typescript
interface Bindings {
  DB: D1Database;
  TEAM_DOMAIN: string;
  POLICY_AUD: string;
  DEV_MODE: string;
}

// In route handler
const db = c.env.DB;
const teamDomain = c.env.TEAM_DOMAIN;
```

### Wrangler Configuration

**RECOMMENDED**: Define all Cloudflare config in `wrangler.toml`.

```toml
name = "app-name"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
TEAM_DOMAIN = "https://yourteam.cloudflareaccess.com"
POLICY_AUD = "your-policy-aud-here"
DEV_MODE = "true"

[[d1_databases]]
binding = "DB"
database_name = "app-db"
database_id = "local-dev-db"
```

---

## Service Class Pattern

### Class Structure

**CRITICAL**: Services MUST be classes with constructor dependency injection.

```typescript
export class UserService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first<User>();

    return result ?? null;
  }
}
```

**CRITICAL**: Declare properties explicitly in the class and assign them in the constructor body.

### Async Methods

**CRITICAL**: All service methods MUST be async returning `Promise<T>`.

```typescript
async create(input: CreateInput): Promise<T> { /* ... */ }
async list(query: Query): Promise<T[]> { /* ... */ }
async getStats(id: string): Promise<Stats> { /* ... */ }
```

### Upsert Pattern

**RECOMMENDED**: Use findOrCreate pattern where appropriate.

```typescript
async findOrCreate(id: string): Promise<User> {
  const existing = await this.findById(id);

  if (existing) {
    return existing;
  }

  return this.create(id);
}
```

