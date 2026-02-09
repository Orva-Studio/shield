import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
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

export function AppNavigator({ user, onTap, onSignOut }: AppNavigatorProps) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Tap') {
            iconName = focused ? 'hand-right' : 'hand-right-outline';
          } else if (route.name === 'Talk') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Pray') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.accentBlue,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          height: 60,
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
