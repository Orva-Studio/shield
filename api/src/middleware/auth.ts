import { createMiddleware } from 'hono/factory';
import { createAuth, type AuthEnv } from '../lib/auth.ts';
import type { Bindings, Variables, AuthUser, AuthSession } from '../types.ts';

// Creates middleware that initializes Better Auth and validates sessions
export function createAuthMiddleware() {
  return createMiddleware<{ Bindings: Bindings; Variables: Variables }>(
    async (c, next) => {
      // Initialize Better Auth for this request
      const auth = createAuth(c.env as AuthEnv);
      c.set('auth', auth);

      // Get session from request headers/cookies
      const session = await auth.api.getSession({ headers: c.req.raw.headers });

      if (!session) {
        c.set('user', null);
        c.set('session', null);
        await next();
        return;
      }

      // Set user and session in context
      c.set('user', session.user as AuthUser);
      c.set('session', session.session as AuthSession);
      await next();
    }
  );
}

// Middleware that requires authentication (returns 401 if not authenticated)
export function requireAuth() {
  return createMiddleware<{ Bindings: Bindings; Variables: Variables }>(
    async (c, next) => {
      const user = c.get('user');

      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      await next();
    }
  );
}
