import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface TapCircleProps {
  onTap: (type: 'resist' | 'yield') => void;
  loading: boolean;
}

export function TapCircle({ onTap, loading }: TapCircleProps) {
  const [lastTapTime, setLastTapTime] = useState(0);
  const [tapTimeout, setTapTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

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
      triggerTapAnimation('yield');
      setTimeout(() => runOnJS(onTap)('yield'), 150);
    } else {
      const timeout = setTimeout(() => {
        triggerTapAnimation('resist');
        setTimeout(() => runOnJS(onTap)('resist'), 150);
      }, 300);
      setTapTimeout(timeout);
    }

    setLastTapTime(now);
  }

  function triggerTapAnimation(type: 'resist' | 'yield') {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100, easing: Easing.ease }),
      withTiming(1, { duration: 100, easing: Easing.ease })
    );

    glowOpacity.value = withSequence(
      withTiming(1, { duration: 100, easing: Easing.ease }),
      withTiming(0, { duration: 200, easing: Easing.ease })
    );
  }

  return (
    <Animated.View style={styles.container}>
      <Animated.View style={[styles.glow, glowStyle]} />
      <Animated.View style={[styles.circle, animatedStyle]}>
        <Ionicons name="hand-right" size={64} color="#FFFFFF" />
        {loading && <ActivityIndicator style={styles.loading} color="#FFFFFF" />}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 160,
    height: 160,
  },
  glow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 100,
    backgroundColor: '#D4AF37',
    opacity: 0,
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#262626',
    borderWidth: 3,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    position: 'absolute',
  },
});
