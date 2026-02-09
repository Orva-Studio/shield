import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { User } from 'react-native-feather';
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
          <User stroke={theme.colors.textSecondary} strokeWidth={1.5} width={48} height={48} />
        </View>

        {user?.name && <Text style={styles.name}>{user.name}</Text>}
        <Text style={styles.email}>{user?.email}</Text>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>SIGN OUT</Text>
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
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontFamily: theme.fonts.serif,
    fontSize: theme.fontSize.h1,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.card,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  name: {
    fontFamily: theme.fonts.serif,
    fontSize: 28,
    color: theme.colors.text,
  },
  email: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
  },
  signOutButton: {
    borderWidth: 0.5,
    borderColor: theme.colors.danger,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xxl,
  },
  signOutText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.caption,
    letterSpacing: 2,
    fontWeight: '500',
  },
});
