import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { theme } from '../theme';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFFFFF" />
      <Text style={styles.text}>Connecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  text: {
    color: theme.colors.text,
    fontSize: theme.fontSize.body,
  },
});
