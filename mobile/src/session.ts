import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const SESSION_TOKEN_KEY = 'session_token';

export async function saveSessionToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
  }
}

export async function getSessionToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
}

export async function clearSessionToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
  }
}

export function extractSessionToken(response: Response): string | null {
  const setCookieHeader = response.headers.get('set-cookie');

  if (!setCookieHeader) {
    return null;
  }

  const cookieMatch = setCookieHeader.match(/__Secure-better-auth\.session_token=([^;]+)/);
  if (cookieMatch && cookieMatch[1]) {
    return decodeURIComponent(cookieMatch[1]);
  }

  return null;
}
