import { createMiddleware } from 'hono/factory';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import type { Bindings, Variables, AuthUser } from '../types.ts';

// Extended bindings to include optional DEV_MODE
interface AuthBindings extends Bindings {
  DEV_MODE?: string;
}

// Cloudflare Access JWT payload structure
interface CFAccessJWTPayload {
  sub: string;
  email: string;
  aud: string[];
  iss: string;
  iat: number;
  exp: number;
}

// Creates middleware that validates Cloudflare Access JWT tokens
export function createAuthMiddleware() {
  return createMiddleware<{ Bindings: AuthBindings; Variables: Variables }>(
    async (c, next) => {
      // Dev mode bypass for local testing (DO NOT use in production)
      if (c.env.DEV_MODE === 'true') {
        const devUser: AuthUser = {
          id: 'dev-user-id',
          email: 'dev@example.com',
        };
        c.set('user', devUser);
        await next();
        return;
      }

      const teamDomain = c.env.TEAM_DOMAIN;
      const policyAud = c.env.POLICY_AUD;

      if (!policyAud || !teamDomain) {
        return c.json({ error: 'Missing required auth configuration' }, 500);
      }

      const token = c.req.header('cf-access-jwt-assertion');

      if (!token) {
        return c.json({ error: 'Missing required CF Access JWT' }, 401);
      }

      try {
        const JWKS = createRemoteJWKSet(
          new URL(`${teamDomain}/cdn-cgi/access/certs`)
        );

        const { payload } = await jwtVerify(token, JWKS, {
          issuer: teamDomain,
          audience: policyAud,
        });

        const cfPayload = payload as unknown as CFAccessJWTPayload;

        const user: AuthUser = {
          id: cfPayload.sub,
          email: cfPayload.email,
        };

        c.set('user', user);

        await next();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return c.json({ error: `Invalid token: ${message}` }, 401);
      }
    }
  );
}
