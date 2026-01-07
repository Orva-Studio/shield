import type { Context } from 'hono';
import type { Auth } from './lib/auth.ts';

// Cloudflare Worker bindings
export interface Bindings {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  RESEND_API_KEY: string;
  DEV_MODE?: string;
}

// Variables stored in Hono context (set by middleware)
export interface Variables {
  user: AuthUser | null;
  session: AuthSession | null;
  auth: Auth;
}

// Authenticated user from Better Auth session
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Session from Better Auth
export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Hono context with our bindings and variables
export type AppContext = Context<{ Bindings: Bindings; Variables: Variables }>;

// Database models
export interface User {
  id: string;
  name: string;
  email: string;
  email_verified: number;
  image: string | null;
  created_at: number;
  updated_at: number;
}

export type TapType = 'resist' | 'yield';

export interface Tap {
  id: number;
  user_id: string;
  type: TapType;
  category: string | null;
  timestamp: number;
  created_at: number;
}

// API request/response types
export interface CreateTapInput {
  type: TapType;
  category?: string;
  timestamp?: number;
}

export interface TapStats {
  total_resists: number;
  total_yields: number;
  current_streak: number;
  last_tap_date: string | null;
}

export interface TapListQuery {
  from?: number;
  to?: number;
  limit?: number;
}
