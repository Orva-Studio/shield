import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { theme } from '../theme';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>ShieldTap</Text>
      <ActivityIndicator size="small" color={theme.colors.accentGold} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontFamily: theme.fonts.serif,
    fontSize: 36,
    color: theme.colors.text,
  },
  spinner: {
    marginTop: theme.spacing.lg,
  },
});
