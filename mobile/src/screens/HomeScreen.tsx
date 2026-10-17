import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiRequest } from "../api/client";
import { errorMessage } from "../api/errors";
import { buildUploadForm, prepareUpload } from "../api/recognize";
import type { RecognitionResponse } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import PrimaryButton from "../components/PrimaryButton";
import { useI18n } from "../i18n";
import type { RootStackParamList } from "../navigation/types";
import { colors, spacing } from "../theme";

type ServerState = "checking" | "ok" | "fail";

export default function HomeScreen() {
  const { t, lang, setLang } = useI18n();
  const { user, logout, request } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [server, setServer] = useState<ServerState>("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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

  async function identify(asset: ImagePicker.ImagePickerAsset) {
    setBusy(true);
    setError("");
    try {
      const uploadUri = await prepareUpload(asset.uri, asset.width, asset.height);
      const result = await request<RecognitionResponse>("/recognize", {
        method: "POST",
        body: buildUploadForm(uploadUri),
        timeoutMs: 60000,
      });
      navigation.navigate("Result", { result, photoUri: asset.uri });
    } catch (e) {
      setError(errorMessage(e, t));
    } finally {
      setBusy(false);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t.identify.cameraDenied);
      return;
    }
    const picked = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 1 });
    if (!picked.canceled && picked.assets.length > 0) {
      await identify(picked.assets[0]);
    }
  }

  async function chooseFromGallery() {
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1 });
    if (!picked.canceled && picked.assets.length > 0) {
      await identify(picked.assets[0]);
    }
  }

  const statusText =
    server === "ok" ? t.home.serverOk : server === "fail" ? t.home.serverFail : "...";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.appName}>{t.appName}</Text>
        <Text style={styles.title}>{t.home.hello(user?.name ?? "")}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.identify.title}</Text>
          <Text style={styles.cardText}>{t.identify.subtitle}</Text>
          <View style={styles.spacer} />
          <PrimaryButton title={t.identify.takePhoto} onPress={takePhoto} disabled={busy} />
          <View style={styles.spacerSmall} />
          <PrimaryButton
            title={t.identify.chooseGallery}
            onPress={chooseFromGallery}
            disabled={busy}
            variant="secondary"
          />
          {busy ? (
            <View style={styles.busy}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.busyText}>{t.identify.analyzing}</Text>
            </View>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>{t.home.serverStatus}:</Text>
          <Text style={[styles.statusValue, server === "ok" && styles.ok, server === "fail" && styles.fail]}>
            {statusText}
          </Text>
        </View>

        <View style={styles.spacerSmall} />
        <PrimaryButton title={t.home.checkAgain} onPress={checkServer} variant="secondary" />
        <View style={styles.spacerSmall} />
        <PrimaryButton
          title={lang === "tr" ? "English" : "Türkçe"}
          onPress={() => setLang(lang === "tr" ? "en" : "tr")}
          variant="secondary"
        />
        <View style={styles.spacerSmall} />
        <PrimaryButton title={t.home.logout} onPress={logout} variant="secondary" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  appName: { fontSize: 14, color: colors.primary, fontWeight: "700", letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: "700", color: colors.text, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
  cardText: { fontSize: 15, color: colors.muted, marginTop: spacing.xs },
  busy: { flexDirection: "row", alignItems: "center", marginTop: spacing.md },
  busyText: { marginLeft: spacing.sm, color: colors.muted },
  error: { color: colors.error, marginTop: spacing.md },
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusLabel: { color: colors.muted, fontSize: 14 },
  statusValue: { marginLeft: spacing.xs, fontSize: 14, fontWeight: "600", color: colors.text },
  ok: { color: colors.success },
  fail: { color: colors.error },
  spacer: { height: spacing.md },
  spacerSmall: { height: spacing.sm },
});
