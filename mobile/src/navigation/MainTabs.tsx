import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useI18n } from "../i18n";
import DiscoverScreen from "../screens/DiscoverScreen";
import HistoryScreen from "../screens/HistoryScreen";
import IdentifyScreen from "../screens/IdentifyScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../theme";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

const icons = {
  Discover: ["images-outline", "images"],
  Identify: ["scan-outline", "scan"],
  History: ["time-outline", "time"],
  Profile: ["person-outline", "person"],
} as const;

export default function MainTabs() {
  const { t } = useI18n();

  return (
    <Tab.Navigator
      initialRouteName="Discover"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? icons[route.name][1] : icons[route.name][0]}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} options={{ title: t.tabs.discover }} />
      <Tab.Screen name="Identify" component={IdentifyScreen} options={{ title: t.tabs.identify }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: t.tabs.history }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t.tabs.profile }} />
    </Tab.Navigator>
  );
}
