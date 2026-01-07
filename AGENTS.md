# ShieldTap - Agent Guidelines

## App Description

ShieldTap is a minimalist, faith-centered application designed to help users resist temptations and build spiritual discipline. The core interface features a tap-based logging system:
- **Single tap**: Records successful resistance to temptation
- **Double tap**: Records yielding to temptation (honest tracking without judgment)

The app syncs across desktop and mobile, stores data in Cloudflare D1, and uses Cloudflare Access for authentication.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono (TypeScript)
- **Database**: Cloudflare D1 (SQLite-compatible)
- **Authentication**: Cloudflare Access (JWT validation)
- **Package Manager**: Bun
- **Client**: React (future - web first, then mobile)

## Coding Preferences

### General

- Use TypeScript for all code
- Use Bun as the package manager (never npm)
- Use function declarations, not function expressions

```typescript
// Good
function handleRequest() {}

// Bad
const handleRequest = () => {}
```

### Project Structure

- Use a `services/` folder for business logic
- Services should be implemented as classes
- Keep route handlers thin - delegate to services

```
api/
├── src/
│   ├── index.ts           # Main Hono app with routes
│   ├── middleware/        # Auth and other middleware
│   ├── services/          # Business logic classes
│   ├── db/                # Database schema and migrations
│   └── types.ts           # TypeScript types
```

### Routes

- Add a one-line comment above each endpoint explaining its purpose
- Example:
```typescript
// Records a new tap (resist or yield) for the authenticated user
app.post('/api/taps', async (c) => { ... })
```

### Services

- Use classes for services
- Constructor should accept dependencies (like DB connection)
- Methods should use function declaration syntax within the class

```typescript
class TapService {
  constructor(private db: D1Database) {}

  async createTap(userId: string, data: TapInput): Promise<Tap> {
    // implementation
  }
}
```

### Testing

- Use wrangler for local development and testing
- Test API endpoints with curl during development

For detailed repeatable patterns and workflows, see [CODE_GUIDELINES.md](./CODE_GUIDELINES.md).

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
