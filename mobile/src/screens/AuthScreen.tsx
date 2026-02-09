import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';
import type { AuthUser } from '../api';

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
  setUser: (user: AuthUser) => void;
}

export function AuthScreen({ onSignIn, onSignUp, setUser }: AuthScreenProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (loading) return;
    setLoading(true);

    try {
      if (mode === 'sign-in') {
        await onSignIn(email, password);
      } else {
        await onSignUp(name, email, password);
        setMode('sign-in');
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.heroSection}>
          <Text style={styles.logo}>ShieldTap</Text>
          <Text style={styles.tagline}>spiritual discipline, daily</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>
            {mode === 'sign-in' ? 'Welcome Back' : 'Create Account'}
          </Text>

          {mode === 'sign-up' && (
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor={theme.colors.textSecondary}
              value={name}
              autoCapitalize="words"
              onChangeText={setName}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={theme.colors.textSecondary}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={theme.colors.textSecondary}
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : mode === 'sign-in' ? 'Sign In' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggle}
            onPress={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
          >
            <Text style={styles.toggleText}>
              {mode === 'sign-in' ? "Don't have an account? " : 'Have an account? '}
              <Text style={styles.toggleHighlight}>
                {mode === 'sign-in' ? 'Sign Up' : 'Sign In'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    fontFamily: theme.fonts.serif,
    fontSize: 44,
    color: theme.colors.text,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: theme.fonts.serif,
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
  form: {
    gap: theme.spacing.md,
  },
  title: {
    fontFamily: theme.fonts.serif,
    fontSize: theme.fontSize.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSize.body,
  },
  button: {
    backgroundColor: theme.colors.accentGold,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.body,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  toggle: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  toggleText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.small,
  },
  toggleHighlight: {
    color: theme.colors.text,
    fontWeight: '500',
  },
});
