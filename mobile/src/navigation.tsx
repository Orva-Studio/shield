import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Target, MessageCircle, Heart, User } from 'react-native-feather';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from './theme';
import { TapFeedScreen } from './screens/TapFeedScreen';
import { StatsScreen } from './screens/StatsScreen';
import { TalkScreen } from './screens/TalkScreen';
import { PrayScreen } from './screens/PrayScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import type { AuthUser } from './api';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

interface AppNavigatorProps {
  user: AuthUser | null;
  onTap: (type: 'resist' | 'yield') => Promise<void>;
  onSignOut: () => Promise<void>;
}

function TapStack({ onTap }: { onTap: (type: 'resist' | 'yield') => Promise<void> }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TapFeed">
        {(props) => <TapFeedScreen {...props} onTap={onTap} />}
      </Stack.Screen>
      <Stack.Screen name="Stats" component={StatsScreen} options={{ headerShown: true, headerTintColor: theme.colors.text, headerStyle: { backgroundColor: theme.colors.background } }} />
    </Stack.Navigator>
  );
}

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {label.toUpperCase()}
    </Text>
  );
}

export function AppNavigator({ user, onTap, onSignOut }: AppNavigatorProps) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          const strokeWidth = 1.5;
          const size = 22;

          if (route.name === 'Tap') {
            return <Target stroke={color} strokeWidth={strokeWidth} width={size} height={size} />;
          } else if (route.name === 'Talk') {
            return <MessageCircle stroke={color} strokeWidth={strokeWidth} width={size} height={size} />;
          } else if (route.name === 'Pray') {
            return <Heart stroke={color} strokeWidth={strokeWidth} width={size} height={size} />;
          } else if (route.name === 'Profile') {
            return <User stroke={color} strokeWidth={strokeWidth} width={size} height={size} />;
          }

          return null;
        },
        tabBarLabel: ({ focused }) => (
          <TabLabel label={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: 0.5,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Tap">
        {(props) => <TapStack {...props} onTap={onTap} />}
      </Tab.Screen>
      <Tab.Screen name="Talk" component={TalkScreen} />
      <Tab.Screen name="Pray" component={PrayScreen} />
      <Tab.Screen name="Profile">
        {(props) => <ProfileScreen {...props} user={user} onSignOut={onSignOut} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontFamily: theme.fonts.serif,
    fontSize: theme.fontSize.caption,
    letterSpacing: 1.5,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  tabLabelActive: {
    color: theme.colors.text,
  },
});
