import * as SecureStore from 'expo-secure-store';

const SESSION_TOKEN_KEY = 'session_token';

export async function saveSessionToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

export async function getSessionToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
}

export async function clearSessionToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
}

export function extractSessionToken(response: Response): string | null {
  const setCookieHeader = response.headers.get('set-cookie');
  
  if (!setCookieHeader) {
    return null;
  }

  const cookies = setCookieHeader.split(', ');
  
  for (const cookie of cookies) {
    if (cookie.startsWith('__Secure-better-auth.session_token=')) {
      const tokenMatch = cookie.match(/__Secure-better-auth\.session_token=([^;]+)/);
      if (tokenMatch) {
        return decodeURIComponent(tokenMatch[1]);
      }
    }
  }

  return null;
}
