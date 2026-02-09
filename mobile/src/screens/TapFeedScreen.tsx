import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { BarChart2 } from 'react-native-feather';
import { theme } from '../theme';
import { TapCircle } from '../components/TapCircle';

interface TapFeedScreenProps {
  navigation: any;
  onTap: (type: 'resist' | 'yield') => Promise<void>;
}

export function TapFeedScreen({ navigation, onTap }: TapFeedScreenProps) {
  const [isRecording, setIsRecording] = useState(false);

  async function handleTap(type: 'resist' | 'yield') {
    setIsRecording(true);
    try {
      await onTap(type);
    } catch (error) {
      console.error('Tap error:', error);
    } finally {
      setIsRecording(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tap.Talk.Pray</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Stats')}>
          <BarChart2 stroke={theme.colors.text} strokeWidth={1.5} width={22} height={22} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TapCircle onTap={handleTap} loading={isRecording} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.hint}>double tap to yield</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  footer: {
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
  },
  hint: {
    fontFamily: theme.fonts.serif,
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
    letterSpacing: 1,
  },
});
