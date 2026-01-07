import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createAuthMiddleware, requireAuth } from './middleware/auth.ts';
import { createAuth, type AuthEnv } from './lib/auth.ts';
import { TapService } from './services/TapService.ts';
import type { Bindings, Variables, CreateTapInput } from './types.ts';
import openAPISpec from './openapi.ts';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// CORS configuration - allow credentials for cookie-based auth
app.use(
  '*',
  cors({
    origin: (origin) => origin || '*',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
);

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Better Auth handler - handles all auth routes (signup, signin, signout, etc.)
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  const auth = createAuth(c.env as AuthEnv);
  return auth.handler(c.req.raw);
});

// Initialize auth middleware for all other API routes
app.use('/api/*', createAuthMiddleware());

// Returns the authenticated user's profile
app.get('/api/me', requireAuth(), async (c) => {
  const user = c.get('user');
  return c.json({ user });
});

// Records a new tap (resist or yield) for the authenticated user
app.post('/api/taps', requireAuth(), async (c) => {
  const user = c.get('user')!;
  const tapService = new TapService(c.env.DB);

  const body = await c.req.json<CreateTapInput>();

  if (!body.type || !['resist', 'yield'].includes(body.type)) {
    return c.json({ error: 'Invalid tap type. Must be "resist" or "yield".' }, 400);
  }

  const tap = await tapService.create(user.id, body);

  return c.json({ tap }, 201);
});

// Lists taps for the authenticated user with optional filtering
app.get('/api/taps', requireAuth(), async (c) => {
  const user = c.get('user')!;
  const tapService = new TapService(c.env.DB);

  const from = c.req.query('from');
  const to = c.req.query('to');
  const limit = c.req.query('limit');

  const taps = await tapService.list(user.id, {
    from: from ? parseInt(from, 10) : undefined,
    to: to ? parseInt(to, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  return c.json({ taps });
});

// Returns tap statistics for the authenticated user
app.get('/api/taps/stats', requireAuth(), async (c) => {
  const user = c.get('user')!;
  const tapService = new TapService(c.env.DB);

  const stats = await tapService.getStats(user.id);

  return c.json({ stats });
});

// OpenAPI specification
app.get('/openapi.json', (c) => c.json(openAPISpec));

// Swagger UI for development
app.get('/docs', async (c) => {
  if (c.env.DEV_MODE !== 'true') {
    return c.json({ error: 'Documentation is only available in development mode' }, 404);
  }

  const { swaggerUI } = await import('@hono/swagger-ui');
  // @ts-expect-error swaggerUI typing issue with custom bindings
  return swaggerUI({ url: '/openapi.json' })(c, async () => {});
});

export default app;
