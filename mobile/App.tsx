import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import {
  createTap,
  getMe,
  getSession,
  signInEmail,
  signOut,
  signUpEmail,
  type AuthUser,
} from './src/api';
import { error, log } from './src/logger';
import { LoadingScreen } from './src/screens/LoadingScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { AppNavigator } from './src/navigation';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    log('App bootstrapping');
    void bootstrap();
  }, []);

  async function bootstrap() {
    try {
      await refreshAuth();
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshAuth() {
    try {
      await getSession();
      const me = await getMe();
      setUser(me.user);
    } catch (err) {
      error('Auth refresh failed - clearing user state', err);
      setUser(null);
    }
  }

  async function handleSignIn(email: string, password: string) {
    try {
      await signInEmail({ email, password });
      await refreshAuth();
    } catch (err) {
      showError(err, 'sign in');
      throw err;
    }
  }

  async function handleSignUp(name: string, email: string, password: string) {
    try {
      await signUpEmail({ name, email, password });
      log('Sign up successful');
      Alert.alert(
        'Account created',
        'If email verification is enabled, check your email. Otherwise, try signing in now.'
      );
    } catch (err) {
      showError(err, 'sign up');
      throw err;
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      await refreshAuth();
    } catch (err) {
      showError(err, 'sign out');
      throw err;
    }
  }

  async function handleTap(type: 'resist' | 'yield') {
    try {
      await createTap({ type, category: 'mobile' });
    } catch (err) {
      showError(err, `tap ${type}`);
      throw err;
    }
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <>
        <AuthScreen onSignIn={handleSignIn} onSignUp={handleSignUp} setUser={setUser} />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator user={user} onTap={handleTap} onSignOut={handleSignOut} />
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

function showError(err: unknown, context?: string) {
  const errorMessage = err instanceof Error ? err.message : String(err);
  const contextStr = context ? ` (${context})` : '';

  error(`Error shown to user${contextStr}`, err);
  Alert.alert('Error', errorMessage);
}
