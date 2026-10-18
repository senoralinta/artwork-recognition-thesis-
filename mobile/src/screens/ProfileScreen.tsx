import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import PrimaryButton from "../components/PrimaryButton";
import { useI18n, type Language } from "../i18n";
import { BLOOM_COLORS, MAX_STAGE, POT_COLORS, PlantSpecies, SPECIES } from "../plant/catalog";
import { usePlant } from "../plant/PlantContext";
import PlantView from "../plant/PlantView";
import { colors, fonts, radius, spacing } from "../theme";

type ServerState = "checking" | "ok" | "fail";

export default function ProfileScreen() {
  const { t, lang, setLang } = useI18n();
  const { user, logout } = useAuth();
  const plant = usePlant();
  const [server, setServer] = useState<ServerState>("checking");
  const [previewFull, setPreviewFull] = useState(true);

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
  const dotColor =
    server === "ok" ? colors.success : server === "fail" ? colors.error : colors.frame;
  const initial = (user?.name ?? "").trim().charAt(0).toLocaleUpperCase();
  const shownStage = previewFull ? MAX_STAGE : plant.stage;

  function LanguageOption({ value, label }: { value: Language; label: string }) {
    const selected = lang === value;
    return (
      <Pressable
        onPress={() => setLang(value)}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        style={[styles.option, selected && styles.optionSelected]}
      >
        <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
      </Pressable>
    );
  }

  function SpeciesOption({ value }: { value: PlantSpecies }) {
    const selected = plant.config.species === value;
    return (
      <Pressable
        onPress={() => plant.setConfig({ species: value })}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        style={[styles.chip, selected && styles.optionSelected]}
      >
        <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
          {t.plant.species[value]}
        </Text>
      </Pressable>
    );
  }

  function Swatch({ id, hex, selected, onPress }: { id: string; hex: string; selected: boolean; onPress: () => void }) {
    const label = t.plant.colors[id as keyof typeof t.plant.colors];
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected }}
        style={[styles.swatchRing, selected && styles.swatchRingSelected]}
      >
        <View style={[styles.swatch, { backgroundColor: hex }]} />
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{initial}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.plant.customize}</Text>
          <View style={styles.preview}>
            <PlantView config={plant.config} stage={shownStage} size={170} />
          </View>
          <PrimaryButton
            title={previewFull ? t.plant.previewCurrent : t.plant.previewFull}
            onPress={() => setPreviewFull((value) => !value)}
            variant="text"
          />

          <View style={styles.chips}>
            {SPECIES.map((value) => (
              <SpeciesOption key={value} value={value} />
            ))}
          </View>

          <Text style={styles.subLabel}>{t.plant.bloomColor}</Text>
          <View style={styles.swatches}>
            {BLOOM_COLORS.map((option) => (
              <Swatch
                key={option.id}
                id={option.id}
                hex={option.hex}
                selected={plant.config.bloom === option.id}
                onPress={() => plant.setConfig({ bloom: option.id })}
              />
            ))}
          </View>

          <Text style={styles.subLabel}>{t.plant.potColor}</Text>
          <View style={styles.swatches}>
            {POT_COLORS.map((option) => (
              <Swatch
                key={option.id}
                id={option.id}
                hex={option.hex}
                selected={plant.config.pot === option.id}
                onPress={() => plant.setConfig({ pot: option.id })}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile.language}</Text>
          <View style={styles.options}>
            <LanguageOption value="tr" label={t.profile.langTurkish} />
            <LanguageOption value="en" label={t.profile.langEnglish} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.home.serverStatus}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
          <PrimaryButton title={t.home.checkAgain} onPress={checkServer} variant="text" />
        </View>

        <View style={styles.logout}>
          <PrimaryButton title={t.home.logout} onPress={logout} variant="secondary" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  identity: { alignItems: "center", marginTop: spacing.md, marginBottom: spacing.lg },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { fontFamily: fonts.title, fontSize: 40, color: colors.onPrimary },
  name: { fontFamily: fonts.title, fontSize: 26, color: colors.text, marginTop: spacing.md },
  email: { color: colors.muted, fontSize: 15, marginTop: spacing.xs },
  section: {
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  sectionTitle: { fontFamily: fonts.title, fontSize: 20, color: colors.text, marginBottom: spacing.sm },
  subLabel: { color: colors.muted, fontSize: 14, marginTop: spacing.md, marginBottom: spacing.sm },
  preview: { alignItems: "center", backgroundColor: colors.mat, borderRadius: radius.md, paddingTop: spacing.md },
  chips: { flexDirection: "row", flexWrap: "wrap", marginTop: spacing.sm },
  chip: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    marginRight: spacing.sm,
    marginTop: spacing.sm,
  },
  swatches: { flexDirection: "row", flexWrap: "wrap" },
  swatchRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  swatchRingSelected: { borderColor: colors.primary },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: "#00000022" },
  options: { flexDirection: "row" },
  option: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginRight: spacing.sm,
    borderRadius: radius.md,
  },
  optionSelected: { backgroundColor: colors.primary },
  optionLabel: { color: colors.primary, fontSize: 16, fontWeight: "600" },
  optionLabelSelected: { color: colors.onPrimary },
  statusRow: { flexDirection: "row", alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  statusText: { fontSize: 16, color: colors.text },
  logout: { marginTop: spacing.lg },
});
