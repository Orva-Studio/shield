# ShieldTap

A minimalist, faith-centered application designed to help users resist temptations and build spiritual discipline.

## Features

- **Onboarding flow**: First-time user onboarding experience
- **Single tap**: Records successful resistance to temptation
- **Double tap**: Records yielding to temptation (honest tracking without judgment)
- Cross-device sync (desktop and mobile)

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono (TypeScript)
- **Database**: Cloudflare D1
- **Authentication**: Better Auth (email/password + Google OAuth)

## Local Development Setup

### 1. Install dependencies

```bash
cd api
bun install
```

### 2. Configure environment

Copy the example environment file and add your secrets:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` with at least:
```bash
# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your-secret-here

# Optional: Configure Google OAuth for social login
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: Configure Resend for email verification and password reset
RESEND_API_KEY=re_xxxxxxxxxxxx
```

### 3. Run database migration

Create the local D1 database and apply schema:

```bash
bun run db:migrate
```

### 4. Start dev server

```bash
bun run dev
```

The API will be available at `http://localhost:8787`.

## Testing Authentication Locally

### Using curl

**Sign up (create account):**
```bash
curl -X POST http://localhost:8787/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

**Sign in (create session):**
```bash
curl -X POST http://localhost:8787/api/auth/sign-in/email \
  -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Get current session:**
```bash
curl http://localhost:8787/api/auth/get-session -b cookies.txt
```

**Get authenticated user:**
```bash
curl http://localhost:8787/api/me -b cookies.txt
```

**Mark onboarding as complete (authenticated):**
```bash
curl -X POST http://localhost:8787/api/me/onboarding -b cookies.txt
```

**Create tap (authenticated):**
```bash
curl -X POST http://localhost:8787/api/taps \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"type":"resist","category":"test"}'
```

**Sign out:**
```bash
curl -X POST http://localhost:8787/api/auth/sign-out -b cookies.txt
```

### Using Swagger UI

Interactive API documentation is available in development mode:

1. Visit `http://localhost:8787/docs` in your browser
2. Explore all endpoints and test them directly from the UI
3. Note: Better Auth endpoints (`/api/auth/*`) handle session cookies automatically

**Note:** Documentation routes (`/docs` and `/openapi.json`) are disabled in production.

## Authentication

ShieldTap uses **Better Auth** with session-based authentication (cookies):

- **Email/password**: Users can sign up and sign in with email and password
- **Google OAuth**: Optional social login via Google account
- **Email verification**: Required for new accounts (requires Resend API key)
- **Password reset**: Users can reset password via email link (requires Resend API key)

All authenticated endpoints (`/api/me`, `/api/taps`, etc.) require a valid session cookie, which is automatically set by Better Auth when signing in.

## API Endpoints

**Authentication** (`/api/auth/*`):
- `POST /api/auth/sign-up/email` - Create new account
- `POST /api/auth/sign-in/email` - Sign in with email/password
- `POST /api/auth/sign-in/social` - Initiate OAuth flow (Google)
- `POST /api/auth/sign-out` - End current session
- `POST /api/auth/forgot-password` - Request password reset email
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/get-session` - Get current session

**Application**:
- `GET /health` - Health check (no auth required)
- `GET /api/me` - Get user profile (includes onboardingCompleted flag) (auth required)
- `POST /api/me/onboarding` - Mark onboarding as complete (auth required)
- `POST /api/taps` - Record a new tap (resist or yield) (auth required)
- `GET /api/taps` - List tap history (auth required)
- `GET /api/taps/stats` - Get statistics (auth required)

## Production Deployment

### 1. Set Cloudflare secrets

```bash
# In the api directory
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put RESEND_API_KEY
```

### 2. Update base URL

Edit `wrangler.toml` and set `BETTER_AUTH_URL` to your production domain:
```toml
[vars]
BETTER_AUTH_URL = "https://your-domain.com"
```

### 3. Run production migration

```bash
wrangler d1 execute shieldtap-db --remote --file=src/db/schema.sql
```

### 4. Deploy

```bash
bun run deploy
```

## License

MIT
