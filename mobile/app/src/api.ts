const defaultApiUrl = 'http://localhost:8787';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl;

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
}

export interface Tap {
  id: string;
  user_id: string;
  type: 'resist' | 'yield';
  category?: string | null;
  timestamp: number;
}

interface GetSessionResponse {
  session: unknown;
  user: AuthUser;
}

interface MeResponse {
  user: AuthUser;
}

interface SignInResponse {
  session: unknown;
  user: AuthUser;
}

interface SignUpResponse {
  session?: unknown;
  user?: AuthUser;
}

interface CreateTapResponse {
  tap: Tap;
}

interface ListTapsResponse {
  taps: Tap[];
}

export async function signUpEmail(params: {
  name: string;
  email: string;
  password: string;
}): Promise<SignUpResponse> {
  return apiFetch('/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function signInEmail(params: {
  email: string;
  password: string;
}): Promise<SignInResponse> {
  return apiFetch('/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function signOut(): Promise<unknown> {
  return apiFetch('/api/auth/sign-out', {
    method: 'POST',
  });
}

export async function getSession(): Promise<GetSessionResponse> {
  return apiFetch('/api/auth/get-session');
}

export async function getMe(): Promise<MeResponse> {
  return apiFetch('/api/me');
}

export async function createTap(params: {
  type: 'resist' | 'yield';
  category?: string;
}): Promise<CreateTapResponse> {
  return apiFetch('/api/taps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function listTaps(params?: { limit?: number }): Promise<ListTapsResponse> {
  const query = new URLSearchParams();
  if (params?.limit) query.set('limit', String(params.limit));

  const url = query.size ? `/api/taps?${query.toString()}` : '/api/taps';
  return apiFetch(url);
}

async function apiFetch(path: string, init?: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `Request failed (${response.status})`);
  }

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
