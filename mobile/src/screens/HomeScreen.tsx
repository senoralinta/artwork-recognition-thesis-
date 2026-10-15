import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import PrimaryButton from "../components/PrimaryButton";
import { useI18n } from "../i18n";
import { colors, spacing } from "../theme";

type ServerState = "checking" | "ok" | "fail";

// Temporary home screen: shows the signed-in user and the backend connection status.
export default function HomeScreen() {
  const { t, lang, setLang } = useI18n();
  const { user, logout } = useAuth();
  const [server, setServer] = useState<ServerState>("checking");

  const checkServer = useCallback(async () => {
    setServer("checking");
    try {
      await apiRequest("/", { timeoutMs: 8000 });
      setServer("ok");
    } catch {
      setServer("fail");
    }
  }, []);

  useEffect(() => {
    checkServer();
  }, [checkServer]);

  const statusText =
    server === "ok" ? t.home.serverOk : server === "fail" ? t.home.serverFail : "...";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.appName}>{t.appName}</Text>
        <Text style={styles.title}>{t.home.hello(user?.name ?? "")}</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t.home.serverStatus}</Text>
          <Text style={[styles.cardValue, server === "fail" && styles.fail, server === "ok" && styles.ok]}>
            {statusText}
          </Text>
        </View>

        <View style={styles.spacer} />
        <PrimaryButton title={t.home.checkAgain} onPress={checkServer} variant="secondary" />
        <View style={styles.spacer} />
        <PrimaryButton
          title={lang === "tr" ? "English" : "Türkçe"}
          onPress={() => setLang(lang === "tr" ? "en" : "tr")}
          variant="secondary"
        />
        <View style={styles.spacer} />
        <PrimaryButton title={t.home.logout} onPress={logout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg, justifyContent: "center" },
  appName: { fontSize: 14, color: colors.primary, fontWeight: "700", letterSpacing: 1 },
  title: { fontSize: 30, fontWeight: "700", color: colors.text, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardLabel: { color: colors.muted, fontSize: 14 },
  cardValue: { fontSize: 20, fontWeight: "600", color: colors.text, marginTop: spacing.xs },
  ok: { color: colors.success },
  fail: { color: colors.error },
  spacer: { height: spacing.md },
});
