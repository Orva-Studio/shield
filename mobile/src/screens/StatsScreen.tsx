import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeft } from 'react-native-feather';
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

  function renderHeader() {
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft stroke={theme.colors.text} strokeWidth={1.5} width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Stats</Text>
        <View style={styles.placeholder} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.content}>
          <Text style={styles.emptyText}>No stats yet</Text>
        </View>
      </View>
    );
  }

  const total = stats.total_resists + stats.total_yields;
  const resistRatio = total > 0 ? (stats.total_resists / total) * 100 : 0;

  return (
    <View style={styles.container}>
      {renderHeader()}

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(0)} style={styles.totalContainer}>
          <Text style={styles.totalNumber}>{total}</Text>
          <Text style={styles.totalLabel}>TOTAL TAPS</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150)} style={styles.statRow}>
          <View style={[styles.statCard, styles.resistCard]}>
            <Text style={styles.statNumber}>{stats.total_resists}</Text>
            <Text style={styles.statLabel}>RESIST</Text>
          </View>
          <View style={[styles.statCard, styles.yieldCard]}>
            <Text style={styles.statNumber}>{stats.total_yields}</Text>
            <Text style={styles.statLabel}>YIELD</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.ratioCard}>
          <Text style={styles.ratioNumber}>{resistRatio.toFixed(1)}%</Text>
          <Text style={styles.ratioLabel}>RESIST RATIO</Text>
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontFamily: theme.fonts.serif,
    fontSize: theme.fontSize.h2,
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
    fontFamily: theme.fonts.serif,
    fontSize: 72,
    color: theme.colors.text,
  },
  totalLabel: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    letterSpacing: 2,
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
    borderWidth: 0.5,
  },
  resistCard: {
    borderColor: theme.colors.accentGold,
  },
  yieldCard: {
    borderColor: theme.colors.accentRose,
  },
  statNumber: {
    fontFamily: theme.fonts.serif,
    fontSize: 40,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    letterSpacing: 2,
  },
  ratioCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  ratioNumber: {
    fontFamily: theme.fonts.serif,
    fontSize: 56,
    color: theme.colors.text,
  },
  ratioLabel: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    letterSpacing: 2,
  },
  loadingText: {
    fontFamily: theme.fonts.serif,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.body,
  },
  emptyText: {
    fontFamily: theme.fonts.serif,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.body,
  },
});
