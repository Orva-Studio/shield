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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit() {
    if (loading) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'sign-in') {
        await onSignIn(email, password);
      } else {
        await onSignUp(name, email, password);
        setSuccess('Account created! Sign in to continue.');
        setMode('sign-in');
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      setError(friendlyError(raw));
    } finally {
      setLoading(false);
    }
  }

  function friendlyError(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('invalid') || lower.includes('credentials') || lower.includes('unauthorized') || lower.includes('401')) {
      return 'Invalid email or password';
    }
    if (lower.includes('network') || lower.includes('fetch')) {
      return 'Unable to connect. Please check your internet connection.';
    }
    if (lower.includes('not found') || lower.includes('404')) {
      return 'Account not found';
    }
    if (lower.includes('already exists') || lower.includes('conflict') || lower.includes('409')) {
      return 'An account with this email already exists';
    }
    // Hide technical errors
    if (lower.includes('is not a function') || lower.includes('undefined') || lower.includes('null')) {
      return 'Something went wrong. Please try again.';
    }
    return message;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.heroSection}>
          <Text style={styles.logo}>Tap.Talk.Pray</Text>
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

          {success !== '' && <Text style={styles.success}>{success}</Text>}
          {error !== '' && <Text style={styles.error}>{error}</Text>}

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
  success: {
    color: theme.colors.accentGold,
    fontSize: theme.fontSize.small,
    textAlign: 'center',
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.small,
    textAlign: 'center',
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
