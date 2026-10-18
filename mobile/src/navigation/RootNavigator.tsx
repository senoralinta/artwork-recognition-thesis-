import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n";
import ArtworkDetailScreen from "../screens/ArtworkDetailScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ResultScreen from "../screens/ResultScreen";
import { colors, fonts } from "../theme";
import MainTabs from "./MainTabs";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { token, loading } = useAuth();
  const { t } = useI18n();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const detailOptions = {
    headerShown: true,
    headerTintColor: colors.primary,
    headerTitleStyle: { fontFamily: fonts.title, color: colors.text },
    headerStyle: { backgroundColor: colors.background },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.background },
  } as const;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="Result"
            component={ResultScreen}
            options={{ ...detailOptions, title: t.result.title }}
          />
          <Stack.Screen
            name="ArtworkDetail"
            component={ArtworkDetailScreen}
            options={{ ...detailOptions, title: t.history.detailTitle }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
