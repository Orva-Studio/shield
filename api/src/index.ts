import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createAuthMiddleware } from './middleware/auth.ts';
import { UserService } from './services/UserService.ts';
import { TapService } from './services/TapService.ts';
import type { Bindings, Variables, CreateTapInput } from './types.ts';
import openAPISpec from './openapi.ts';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use('*', cors());

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/*', createAuthMiddleware());

app.get('/api/me', async (c) => {
  const authUser = c.get('user');
  const userService = new UserService(c.env.DB);

  const user = await userService.findOrCreate(authUser);

  return c.json({ user });
});

app.post('/api/taps', async (c) => {
  const authUser = c.get('user');
  const userService = new UserService(c.env.DB);
  const tapService = new TapService(c.env.DB);

  await userService.findOrCreate(authUser);

  const body = await c.req.json<CreateTapInput>();

  if (!body.type || !['resist', 'yield'].includes(body.type)) {
    return c.json({ error: 'Invalid tap type. Must be "resist" or "yield".' }, 400);
  }

  const tap = await tapService.create(authUser.id, body);

  return c.json({ tap }, 201);
});

app.get('/api/taps', async (c) => {
  const authUser = c.get('user');
  const tapService = new TapService(c.env.DB);

  const from = c.req.query('from');
  const to = c.req.query('to');
  const limit = c.req.query('limit');

  const taps = await tapService.list(authUser.id, {
    from: from ? parseInt(from, 10) : undefined,
    to: to ? parseInt(to, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  return c.json({ taps });
});

app.get('/api/taps/stats', async (c) => {
  const authUser = c.get('user');
  const tapService = new TapService(c.env.DB);

  const stats = await tapService.getStats(authUser.id);

  return c.json({ stats });
});

app.get('/openapi.json', (c) => c.json(openAPISpec));

app.get('/docs', async (c) => {
  if (c.env.DEV_MODE !== 'true') {
    return c.json({ error: 'Documentation is only available in development mode' }, 404);
  }

  const { swaggerUI } = await import('@hono/swagger-ui');
  return swaggerUI({ url: '/openapi.json' })(c);
});

export default app;
