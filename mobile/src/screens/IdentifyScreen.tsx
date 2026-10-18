import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { errorMessage } from "../api/errors";
import { buildUploadForm, prepareUpload } from "../api/recognize";
import type { RecognitionResponse } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import PrimaryButton from "../components/PrimaryButton";
import { useI18n } from "../i18n";
import type { RootStackParamList } from "../navigation/types";
import { colors, fonts, spacing } from "../theme";

const CORNER = 34;
const CORNER_WIDTH = 4;

export default function IdentifyScreen() {
  const { t } = useI18n();
  const { request } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t.identify.title}</Text>
        <Text style={styles.subtitle}>{t.identify.subtitle}</Text>

        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          {busy ? (
            <View style={styles.inside}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.hint}>{t.identify.analyzing}</Text>
            </View>
          ) : (
            <View style={styles.inside}>
              <Ionicons name="image-outline" size={44} color={colors.frame} />
              <Text style={styles.hint}>{t.identify.frameHint}</Text>
            </View>
          )}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <Pressable
            onPress={takePhoto}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={t.identify.takePhoto}
            style={({ pressed }) => [styles.shutter, (pressed || busy) && styles.dimmed]}
          >
            <Ionicons name="camera" size={34} color={colors.onPrimary} />
          </Pressable>
          <Text style={styles.shutterLabel}>{t.identify.takePhoto}</Text>
          <View style={styles.gallery}>
            <PrimaryButton
              title={t.identify.chooseGallery}
              onPress={chooseFromGallery}
              disabled={busy}
              variant="text"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const cornerBase = { borderColor: colors.primary, width: CORNER, height: CORNER, position: "absolute" } as const;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  title: { fontFamily: fonts.title, fontSize: 32, lineHeight: 38, color: colors.text },
  subtitle: {
    fontFamily: fonts.italic,
    fontSize: 17,
    lineHeight: 24,
    color: colors.muted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  viewfinder: {
    aspectRatio: 0.9,
    width: "100%",
    backgroundColor: colors.mat,
    alignItems: "center",
    justifyContent: "center",
  },
  inside: { alignItems: "center", paddingHorizontal: spacing.xl },
  hint: { color: colors.muted, textAlign: "center", marginTop: spacing.sm, fontSize: 15 },
  corner: cornerBase,
  topLeft: { top: spacing.md, left: spacing.md, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH },
  topRight: { top: spacing.md, right: spacing.md, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH },
  bottomLeft: { bottom: spacing.md, left: spacing.md, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH },
  bottomRight: { bottom: spacing.md, right: spacing.md, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH },
  error: { color: colors.error, marginTop: spacing.md, textAlign: "center" },
  actions: { alignItems: "center", marginTop: spacing.lg },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.background,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  dimmed: { opacity: 0.55 },
  shutterLabel: { color: colors.text, fontSize: 15, fontWeight: "600", marginTop: spacing.sm },
  gallery: { marginTop: spacing.sm },
});
