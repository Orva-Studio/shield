import { apiLog, apiResponse, error, log } from './logger';
import {
  saveSessionToken,
  getSessionToken,
  clearSessionToken,
  extractSessionToken,
} from './session';

const defaultApiUrl = 'http://localhost:8787';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl;
export const APP_ORIGIN = process.env.EXPO_PUBLIC_APP_ORIGIN ?? 'exp://localhost';

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
  log('Attempting sign up', { email: params.email });
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
  log('Attempting sign in', { email: params.email });
  return apiFetch('/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function signOut(): Promise<unknown> {
  log('Attempting sign out');
  return apiFetch('/api/auth/sign-out', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
}

export async function getSession(): Promise<GetSessionResponse> {
  log('Fetching session');
  return apiFetch('/api/auth/get-session');
}

export async function getMe(): Promise<MeResponse> {
  log('Fetching user profile');
  return apiFetch('/api/me');
}

export async function createTap(params: {
  type: 'resist' | 'yield';
  category?: string;
}): Promise<CreateTapResponse> {
  log('Creating tap', { type: params.type, category: params.category });
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
  log('Fetching taps', params);
  return apiFetch(url);
}

async function apiFetch(path: string, init?: RequestInit) {
  const fullUrl = `${API_URL}${path}`;
  const method = init?.method || 'GET';
  const body = init?.body;

  apiLog(method, fullUrl, body ? JSON.parse(body as string) : undefined);

  try {
    const token = await getSessionToken();
    const headers = new Headers(init?.headers);
    
    if (token) {
      headers.set('Cookie', `__Secure-better-auth.session_token=${token}`);
    }

    if (path.includes('/api/auth/')) {
      headers.set('Origin', APP_ORIGIN);
    }

    const response = await fetch(fullUrl, {
      ...init,
      headers,
      credentials: 'include',
    });

    const text = await response.text();

    apiResponse(path, response.status, response.ok);

    if (!response.ok && (response.status === 401 || response.status === 403)) {
      if (path.includes('/sign-out')) {
        await clearSessionToken();
        log('Session token cleared on auth failure');
      }
    }

    if (!response.ok) {
      error(`API request failed: ${method} ${fullUrl}`, text, {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(text || `Request failed (${response.status})`);
    }

    if (!text) {
      log(`API request successful: ${method} ${fullUrl} (empty response)`);
      return {};
    }

    try {
      const json = JSON.parse(text);
      log(`API request successful: ${method} ${fullUrl}`, json);

      if (response.ok) {
        if (path.includes('/sign-in/') || path.includes('/sign-up/')) {
          const sessionToken = extractSessionToken(response);
          if (sessionToken) {
            await saveSessionToken(sessionToken);
            log('Session token saved');
          }
        }

        if (path.includes('/sign-out')) {
          await clearSessionToken();
          log('Session token cleared');
        }
      }

      return json;
    } catch (parseError) {
      error('Failed to parse JSON response', parseError, { text });
      return text;
    }
  } catch (fetchError) {
    error(`Network error: ${method} ${fullUrl}`, fetchError);
    throw fetchError;
  }
}
