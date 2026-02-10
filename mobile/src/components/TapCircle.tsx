import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

interface TapCircleProps {
  onTap: (type: 'resist' | 'yield') => void;
  loading: boolean;
}

export function TapCircle({ onTap, loading }: TapCircleProps) {
  const [lastTapTime, setLastTapTime] = useState(0);
  const [tapTimeout, setTapTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastType, setLastType] = useState<'resist' | 'yield' | null>(null);

  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const borderOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    return () => {
      if (tapTimeout) clearTimeout(tapTimeout);
    };
  }, [tapTimeout]);

  function handlePress() {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime;

    if (timeSinceLastTap < 300) {
      if (tapTimeout) clearTimeout(tapTimeout);
      setLastType('yield');
      triggerTapAnimation('yield');
      setTimeout(() => onTap('yield'), 150);
    } else {
      const timeout = setTimeout(() => {
        setLastType('resist');
        triggerTapAnimation('resist');
        setTimeout(() => onTap('resist'), 150);
      }, 300);
      setTapTimeout(timeout);
    }

    setLastTapTime(now);
  }

  function triggerTapAnimation(_type: 'resist' | 'yield') {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 120, easing: Easing.ease, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 200, easing: Easing.ease, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.timing(glowOpacity, { toValue: 0.8, duration: 150, easing: Easing.ease, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0, duration: 400, easing: Easing.ease, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.timing(borderOpacity, { toValue: 1, duration: 100, easing: Easing.ease, useNativeDriver: true }),
      Animated.timing(borderOpacity, { toValue: 0.6, duration: 300, easing: Easing.ease, useNativeDriver: true }),
    ]).start();
  }

  function getLabel(): string {
    if (lastType === 'resist') return 'resisted';
    if (lastType === 'yield') return 'yielded';
    return 'tap to resist';
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
      <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.borderOverlay, { opacity: borderOpacity }]}
        />
        <View style={styles.innerContent} onTouchEnd={handlePress}>
          <View style={styles.dot} />
          {loading && <ActivityIndicator style={styles.loading} color={theme.colors.text} />}
        </View>
      </Animated.View>
      <Text style={styles.label}>{getLabel()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 200,
  },
  glow: {
    position: 'absolute',
    top: -24,
    left: -24,
    right: -24,
    bottom: 0,
    borderRadius: 124,
    backgroundColor: theme.colors.accentGold,
    opacity: 0,
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  borderOverlay: {
    borderRadius: 80,
    borderWidth: 1,
    borderColor: theme.colors.accentGold,
  },
  innerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accentGold,
  },
  loading: {
    position: 'absolute',
  },
  label: {
    fontFamily: theme.fonts.serif,
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
