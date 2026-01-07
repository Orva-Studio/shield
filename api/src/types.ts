import type { Context } from 'hono';

// Cloudflare Worker bindings
export interface Bindings {
  DB: D1Database;
  TEAM_DOMAIN: string;
  POLICY_AUD: string;
}

// Variables stored in Hono context (set by middleware)
export interface Variables {
  user: AuthUser;
}

// Authenticated user from Cloudflare Access JWT
export interface AuthUser {
  id: string;
  email: string;
}

// Hono context with our bindings and variables
export type AppContext = Context<{ Bindings: Bindings; Variables: Variables }>;

// Database models
export interface User {
  id: string;
  email: string;
  created_at: number;
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
