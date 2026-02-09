import { StyleSheet, Text, View } from 'react-native';
import { MessageCircle } from 'react-native-feather';
import { theme } from '../theme';

export function TalkScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Talk</Text>
      </View>

      <View style={styles.content}>
        <MessageCircle stroke={theme.colors.textSecondary} strokeWidth={1} width={48} height={48} />
        <Text style={styles.comingSoon}>Coming Soon</Text>
        <Text style={styles.subtitle}>connect with your community</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  comingSoon: {
    fontFamily: theme.fonts.serif,
    fontSize: theme.fontSize.h2,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
    letterSpacing: 1,
  },
});
