import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import type { AuthUser } from '../api';

interface ProfileScreenProps {
  user: AuthUser | null;
  onSignOut: () => Promise<void>;
}

export function ProfileScreen({ user, onSignOut }: ProfileScreenProps) {
  async function handleSignOut() {
    try {
      await onSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={64} color={theme.colors.textSecondary} />
        </View>

        {user?.name && <Text style={styles.name}>{user.name}</Text>}
        <Text style={styles.email}>{user?.email}</Text>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  email: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textSecondary,
  },
  signOutButton: {
    backgroundColor: theme.colors.danger,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl * 2,
  },
  signOutText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.body,
    fontWeight: '600',
  },
});
