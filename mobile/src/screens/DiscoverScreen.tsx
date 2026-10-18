import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { errorMessage } from "../api/errors";
import { mediaUrl } from "../api/media";
import type { DailyResponse } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import ArtFrame from "../components/ArtFrame";
import PrimaryButton from "../components/PrimaryButton";
import ScoreBar from "../components/ScoreBar";
import TicketCard from "../components/TicketCard";
import { useI18n } from "../i18n";
import type { RootStackParamList } from "../navigation/types";
import { nextThreshold, STAGE_THRESHOLDS } from "../plant/catalog";
import { usePlant } from "../plant/PlantContext";
import PlantView from "../plant/PlantView";
import { colors, fonts, radius, spacing } from "../theme";

function localDateString(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function DiscoverScreen() {
  const { t, lang } = useI18n();
  const { request, user } = useAuth();
  const plant = usePlant();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [daily, setDaily] = useState<DailyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const { refresh: refreshPlant } = plant;

  const load = useCallback(
    async (pullToRefresh = false) => {
      if (pullToRefresh) {
        setRefreshing(true);
      }
      setError("");
      try {
        const [data] = await Promise.all([
          request<DailyResponse>(`/daily?day=${localDateString()}`),
          refreshPlant(),
        ]);
        setDaily(data);
      } catch (e) {
        setError(errorMessage(e, t));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [request, refreshPlant, t]
  );

  // Reload when the tab comes into focus, so new discoveries grow the plant.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const stageName = t.plant.stages[plant.stage];
  const next = nextThreshold(plant.stage);
  const previous = STAGE_THRESHOLDS[plant.stage];
  const progress = next === null ? 1 : (plant.count - previous) / (next - previous);
  const fact = daily ? (lang === "tr" ? daily.fact_tr : daily.fact_en) : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
      >
        <Text style={styles.greeting}>{t.home.hello(user?.name ?? "")}</Text>

        <View style={styles.plantArea}>
          {plant.grew ? (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>{t.plant.grew(stageName)}</Text>
              <PrimaryButton title={t.plant.dismiss} onPress={plant.dismissGrowth} variant="text" />
            </View>
          ) : null}
          <PlantView config={plant.config} stage={plant.stage} size={190} />
          <View style={styles.shelf} />
          <Text style={styles.stageName}>{stageName}</Text>
          <Text style={styles.count}>
            {plant.count === 0 ? t.plant.seedHint : t.plant.discovered(plant.count)}
          </Text>
          <View style={styles.progress}>
            {next === null ? (
              <Text style={styles.maxText}>{t.plant.maxStage}</Text>
            ) : (
              <ScoreBar
                label={t.plant.nextStage}
                score={progress}
                valueText={`${plant.count}/${next}`}
              />
            )}
          </View>
        </View>

        {error ? (
          <View>
            <Text style={styles.error}>{error}</Text>
            <PrimaryButton title={t.discover.retry} onPress={() => load()} variant="secondary" />
          </View>
        ) : null}

        {daily && fact ? (
          <View style={styles.section}>
            <TicketCard title={t.discover.factTitle} text={fact} />
          </View>
        ) : null}

        {daily ? (
          <Pressable
            style={styles.section}
            onPress={() => navigation.navigate("ArtworkDetail", { artworkId: daily.artwork.id })}
          >
            <Text style={styles.sectionTitle}>{t.discover.todayTitle}</Text>
            <ArtFrame uri={mediaUrl(daily.artwork.image_url)} ratio={1.1} inset={12} lifted />
            <Text style={styles.artTitle}>{daily.artwork.title}</Text>
            {daily.artwork.artist ? <Text style={styles.artArtist}>{daily.artwork.artist}</Text> : null}
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  greeting: { color: colors.muted, fontSize: 15 },
  plantArea: { alignItems: "center", marginTop: spacing.md, marginBottom: spacing.lg },
  banner: {
    alignSelf: "stretch",
    alignItems: "center",
    backgroundColor: colors.ticket,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  bannerText: { fontFamily: fonts.title, fontSize: 18, color: colors.text, textAlign: "center" },
  shelf: {
    alignSelf: "stretch",
    height: 8,
    borderRadius: 2,
    backgroundColor: "#B79F7F",
    marginTop: -6,
  },
  stageName: { fontFamily: fonts.title, fontSize: 26, color: colors.text, marginTop: spacing.md },
  count: { color: colors.muted, fontSize: 15, marginTop: spacing.xs, textAlign: "center" },
  progress: { alignSelf: "stretch", marginTop: spacing.md },
  maxText: { fontFamily: fonts.italic, fontSize: 16, color: colors.success, textAlign: "center" },
  error: { color: colors.error, marginBottom: spacing.sm, textAlign: "center" },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: fonts.title,
    fontSize: 24,
    lineHeight: 30,
    color: colors.text,
    marginBottom: spacing.md,
  },
  artTitle: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: colors.text,
    marginTop: spacing.md,
  },
  artArtist: { fontFamily: fonts.italic, fontSize: 16, color: colors.muted, marginTop: spacing.xs },
});
