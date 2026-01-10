import { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  API_URL,
  createTap,
  getMe,
  getSession,
  listTaps,
  signInEmail,
  signOut,
  signUpEmail,
  type AuthUser,
  type Tap,
} from './src/api';

type AuthMode = 'sign-in' | 'sign-up';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>('sign-in');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');

  const [user, setUser] = useState<AuthUser | null>(null);
  const [taps, setTaps] = useState<Tap[]>([]);

  const title = useMemo(() => {
    return authMode === 'sign-in' ? 'Sign In' : 'Create Account';
  }, [authMode]);

  useEffect(() => {
    void bootstrap();

    async function bootstrap() {
      try {
        await refreshAuth();
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  async function refreshAuth() {
    try {
      await getSession();
      const me = await getMe();
      setUser(me.user);
      await refreshTaps();
    } catch {
      setUser(null);
      setTaps([]);
    }
  }

  async function refreshTaps() {
    const response = await listTaps({ limit: 25 });
    setTaps(response.taps);
  }

  async function handleSignIn() {
    try {
      await signInEmail({ email, password });
      await refreshAuth();
    } catch (error) {
      showError(error);
    }
  }

  async function handleSignUp() {
    try {
      await signUpEmail({ name, email, password });
      Alert.alert(
        'Account created',
        'If email verification is enabled, check your email. Otherwise, try signing in now.'
      );
      setAuthMode('sign-in');
    } catch (error) {
      showError(error);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      await refreshAuth();
    } catch (error) {
      showError(error);
    }
  }

  async function handleTap(type: 'resist' | 'yield') {
    try {
      await createTap({ type, category: 'mobile' });
      await refreshTaps();
    } catch (error) {
      showError(error);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator />
          <Text style={styles.muted}>Connecting to {API_URL}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.h1}>ShieldTap Mobile</Text>
          <Text style={styles.muted}>API: {API_URL}</Text>

          <View style={styles.card}>
            <Text style={styles.h2}>{title}</Text>

            {authMode === 'sign-up' ? (
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                autoCapitalize="words"
                onChangeText={setName}
              />
            ) : null}

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              secureTextEntry
              onChangeText={setPassword}
            />

            {authMode === 'sign-in' ? (
              <Button title="Sign in" onPress={handleSignIn} />
            ) : (
              <Button title="Create account" onPress={handleSignUp} />
            )}

            <View style={styles.spacer} />

            {authMode === 'sign-in' ? (
              <Button title="Need an account?" onPress={() => setAuthMode('sign-up')} />
            ) : (
              <Button title="Have an account?" onPress={() => setAuthMode('sign-in')} />
            )}
          </View>
        </ScrollView>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>Welcome</Text>
        <Text style={styles.muted}>{user.email}</Text>

        <View style={styles.row}>
          <Button title="Resist" onPress={() => void handleTap('resist')} />
          <Button title="Yield" onPress={() => void handleTap('yield')} />
        </View>

        <View style={styles.row}>
          <Button title="Refresh" onPress={() => void refreshTaps()} />
          <Button title="Sign out" onPress={() => void handleSignOut()} />
        </View>

        <View style={styles.card}>
          <Text style={styles.h2}>Recent taps</Text>
          {taps.length === 0 ? <Text style={styles.muted}>No taps yet</Text> : null}
          {taps.map((tap) => (
            <View key={tap.id} style={styles.tapRow}>
              <Text style={styles.tapType}>{tap.type.toUpperCase()}</Text>
              <Text style={styles.muted}>
                {new Date(tap.timestamp * 1000).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

function showError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  Alert.alert('Error', message);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700',
  },
  h2: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  muted: {
    color: '#555',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 10,
  },
  spacer: {
    height: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  tapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  tapType: {
    fontWeight: '700',
  },
});
