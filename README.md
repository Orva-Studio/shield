# ShieldTap

A minimalist, faith-centered application designed to help users resist temptations and build spiritual discipline.

## Features

- **Single tap**: Records successful resistance to temptation
- **Double tap**: Records yielding to temptation (honest tracking without judgment)
- Cross-device sync (desktop and mobile)

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono (TypeScript)
- **Database**: Cloudflare D1
- **Authentication**: Cloudflare Access

## Getting Started

```bash
cd api
bun install
bun run dev
```

## API Documentation

Interactive API documentation is available via Swagger UI:

1. Start the dev server: `bun run dev`
2. Visit `http://localhost:8787/docs` in your browser
3. Explore all endpoints and test them directly from the UI

The API supports these main endpoints:
- `GET /health` - Health check (no auth required)
- `GET /api/me` - Get user profile
- `POST /api/taps` - Record a new tap (resist or yield)
- `GET /api/taps` - List tap history
- `GET /api/taps/stats` - Get statistics

**Note:** Local development uses `DEV_MODE="true"` in `wrangler.toml`, which bypasses authentication for easy testing. For production deployment, a valid Cloudflare Access JWT token is required in the `cf-access-jwt-assertion` header.

## License

MIT
