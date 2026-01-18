import { betterAuth } from 'better-auth';
import { D1Dialect } from 'kysely-d1';
import type { D1Database } from '@cloudflare/workers-types';

// Environment bindings for Cloudflare Workers
export interface AuthEnv {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  RESEND_API_KEY: string;
  DEV_MODE?: string;
}

// Creates a Better Auth instance configured for the request context
export function createAuth(env: AuthEnv) {
  return betterAuth({
    database: {
      dialect: new D1Dialect({ database: env.DB }),
      type: 'sqlite',
    },
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: ['http://localhost:8081', 'http://localhost:8787'],

    // Email and password authentication
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: env.DEV_MODE !== 'true',
      sendResetPassword: async ({ user, url }) => {
        if (!env.RESEND_API_KEY) {
          console.warn('RESEND_API_KEY not configured, skipping password reset email');
          return;
        }
        await sendEmail(env.RESEND_API_KEY, {
          to: user.email,
          subject: 'Reset your ShieldTap password',
          html: `
            <h1>Reset your password</h1>
            <p>Click the link below to reset your password:</p>
            <a href="${url}">Reset Password</a>
            <p>If you didn't request this, you can safely ignore this email.</p>
          `,
        });
      },
    },

    // Email verification
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        if (!env.RESEND_API_KEY) {
          console.warn('RESEND_API_KEY not configured, skipping verification email');
          return;
        }
        await sendEmail(env.RESEND_API_KEY, {
          to: user.email,
          subject: 'Verify your ShieldTap email',
          html: `
            <h1>Verify your email</h1>
            <p>Click the link below to verify your email address:</p>
            <a href="${url}">Verify Email</a>
            <p>If you didn't create an account, you can safely ignore this email.</p>
          `,
        });
      },
      sendOnSignUp: env.DEV_MODE !== 'true',
    },

    // Social providers
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        enabled: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
      },
    },

    // Custom table and field mapping to match our schema
    user: {
      modelName: 'users',
      fields: {
        emailVerified: 'email_verified',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },
    session: {
      modelName: 'sessions',
      fields: {
        userId: 'user_id',
        expiresAt: 'expires_at',
        ipAddress: 'ip_address',
        userAgent: 'user_agent',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },
    account: {
      modelName: 'accounts',
      fields: {
        userId: 'user_id',
        accountId: 'account_id',
        providerId: 'provider_id',
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        accessTokenExpiresAt: 'access_token_expires_at',
        refreshTokenExpiresAt: 'refresh_token_expires_at',
        idToken: 'id_token',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },
    verification: {
      modelName: 'verifications',
      fields: {
        expiresAt: 'expires_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },

    // Advanced options
    advanced: {
      // Generate UUIDs for IDs
      database: {
        generateId: () => crypto.randomUUID(),
      },
    },
  });
}

// Helper to send emails via Resend API
async function sendEmail(
  apiKey: string,
  options: { to: string; subject: string; html: string }
) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'ShieldTap <noreply@shieldtap.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to send email:', error);
    throw new Error(`Failed to send email: ${error}`);
  }
}

// Type exports for use in other parts of the app
export type Auth = ReturnType<typeof createAuth>;
