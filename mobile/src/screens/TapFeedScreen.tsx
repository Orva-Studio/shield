import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { TapCircle } from '../components/TapCircle';
import type { Tap } from '../api';

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
        <Text style={styles.title}>ShieldTap</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Stats')}>
          <Ionicons name="bar-chart" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TapCircle onTap={handleTap} loading={isRecording} />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});
