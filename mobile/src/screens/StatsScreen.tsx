import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '../theme';
import { getStats, type TapStats } from '../api';

interface StatsScreenProps {
  navigation: any;
}

export function StatsScreen({ navigation }: StatsScreenProps) {
  const [stats, setStats] = useState<TapStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const response = await getStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Stats</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading stats...</Text>
        </View>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Stats</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <Text style={styles.emptyText}>No stats available</Text>
        </View>
      </View>
    );
  }

  const total = stats.total_resists + stats.total_yields;
  const resistRatio = total > 0 ? (stats.total_resists / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Stats</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(0)} style={styles.totalContainer}>
          <Text style={styles.totalNumber}>{total}</Text>
          <Text style={styles.totalLabel}>Total Taps</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150)} style={styles.statRow}>
          <View style={[styles.statCard, styles.resistCard]}>
            <Text style={styles.statNumber}>{stats.total_resists}</Text>
            <Text style={styles.statLabel}>Resist</Text>
          </View>
          <View style={[styles.statCard, styles.yieldCard]}>
            <Text style={styles.statNumber}>{stats.total_yields}</Text>
            <Text style={styles.statLabel}>Yield</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.ratioCard}>
          <Text style={styles.ratioNumber}>{resistRatio.toFixed(1)}%</Text>
          <Text style={styles.ratioLabel}>Resist Ratio</Text>
        </Animated.View>
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.h2,
    fontWeight: '700',
    color: theme.colors.text,
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  totalNumber: {
    fontSize: 64,
    fontWeight: '700',
    color: theme.colors.text,
  },
  totalLabel: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
  },
  resistCard: {
    borderColor: theme.colors.accentGold,
  },
  yieldCard: {
    borderColor: theme.colors.accentRose,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  ratioCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  ratioNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.text,
  },
  ratioLabel: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.body,
  },
  emptyText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.body,
  },
});
